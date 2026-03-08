"use server";

import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// ── Helpers ───────────────────────────────────────────────────

const ALGORITHM = "aes-256-cbc" as const;

function getEscrowKey(): Buffer {
  const hex = process.env.SERVER_ESCROW_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "SERVER_ESCROW_KEY must be a 64-character hex string (32 bytes). " +
        "Generate one with: openssl rand -hex 32"
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts `plaintext` with AES-256-CBC using a unique IV per call.
 * Returns a string formatted as `<iv_hex>:<ciphertext_hex>`.
 */
function escrowEncrypt(plaintext: string): string {
  const key = getEscrowKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// ── Server Action ─────────────────────────────────────────────

export type SetupDeadManSwitchPayload = {
  /** Plaintext NOK email — encrypted server-side before storage. */
  nokEmail: string;
  /** Plaintext 16-word emergency key — encrypted server-side before storage. */
  emergencyKey: string;
  /** Master Vault Key wrapped with the emergencyKey by the client. */
  wrappedVaultKey: string;
  /** Days of inactivity before the switch triggers. */
  inactivityThresholdDays: number;
};

export type SetupDeadManSwitchResult =
  | { success: true }
  | { success: false; error: string };

export async function setupDeadManSwitch(
  payload: SetupDeadManSwitchPayload
): Promise<SetupDeadManSwitchResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Validate inputs before touching crypto
  if (!payload.nokEmail || !payload.emergencyKey || !payload.wrappedVaultKey) {
    return { success: false, error: "Missing required fields" };
  }
  if (
    payload.inactivityThresholdDays < 1 ||
    payload.inactivityThresholdDays > 365
  ) {
    return { success: false, error: "Invalid inactivity threshold" };
  }

  let nokEmailEscrowed: string;
  let emergencyKeyEscrowed: string;

  try {
    nokEmailEscrowed = escrowEncrypt(payload.nokEmail);
    emergencyKeyEscrowed = escrowEncrypt(payload.emergencyKey);
  } catch (err: any) {
    console.error("[Dead Man Switch] Escrow encryption failed:", err.message);
    return { success: false, error: "Server configuration error" };
  }

  const { error } = await (supabase.from("dead_man_switches") as any).upsert(
    {
      user_id: user.id,
      owner_email: user.email ?? null,
      nok_email_escrowed: nokEmailEscrowed,
      emergency_key_escrowed: emergencyKeyEscrowed,
      wrapped_vault_key: payload.wrappedVaultKey,
      inactivity_threshold_days: payload.inactivityThresholdDays,
      last_active_at: new Date().toISOString(),
      status: "active",
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[Dead Man Switch] DB upsert failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ── Claim Portal: Fetch Triggered Vault ───────────────────────

export interface FetchedVaultItem {
  id: string;
  type: string;
  name: string;
  ciphertext: string;
}

export type FetchTriggeredVaultResult =
  | { success: true; switch_id: string; wrappedVaultKey: string; items: FetchedVaultItem[] }
  | { success: false; error: string };

/**
 * Service-role client used exclusively by unauthenticated server actions
 * (the NOK claim flow). Never exposed to the browser.
 */
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service-role credentials.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Called from the NOK claim portal. Takes the vault owner's email,
 * verifies their switch is in 'triggered' state, and returns the
 * PBKDF2-wrapped vault key plus all share_with_nok vault items.
 *
 * Security guarantees:
 *  - Uses service role to bypass RLS (no auth cookie needed).
 *  - Returns a generic error whether the email is unknown OR the switch
 *    is not triggered — prevents email enumeration.
 *  - The wrapped vault key and ciphertexts are useless without the
 *    16-word emergency key, which is never returned from the server.
 */
export async function fetchTriggeredVault(
  ownerEmail: string
): Promise<FetchTriggeredVaultResult> {
  if (!ownerEmail || !ownerEmail.includes("@")) {
    return { success: false, error: "A valid email address is required." };
  }

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch (err: unknown) {
    console.error("[fetchTriggeredVault] Admin client init failed:", err);
    return { success: false, error: "Service unavailable. Please try again." };
  }

  // Find the triggered switch by the owner's email (lowercase match)
  const { data: switchData, error: switchError } = await (
    adminClient.from("dead_man_switches") as any
  )
    .select("id, user_id, wrapped_vault_key")
    .eq("status", "triggered")
    .ilike("owner_email", ownerEmail.trim())
    .single();

  if (switchError || !switchData) {
    // Generic message — do not reveal whether the email exists
    return {
      success: false,
      error:
        "No active inheritance claim found for this email address. " +
        "Please verify the vault owner's email and ensure the switch has triggered.",
    };
  }

  // Fetch vault items marked for NOK inheritance
  const { data: items, error: itemsError } = await (
    adminClient.from("vault_items") as any
  )
    .select("id, type, name, ciphertext")
    .eq("user_id", switchData.user_id)
    .eq("share_with_nok", true);

  if (itemsError) {
    console.error(
      "[fetchTriggeredVault] Vault items fetch failed:",
      itemsError.message
    );
    return {
      success: false,
      error: "Failed to retrieve vault data. Please try again.",
    };
  }

  return {
    success: true,
    switch_id: switchData.id,
    wrappedVaultKey: switchData.wrapped_vault_key,
    items: (items ?? []) as FetchedVaultItem[],
  };
}
