"use server";

import crypto from "node:crypto";
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
