/**
 * Supabase Edge Function: deliver-nok-email
 *
 * Triggered by pg_net webhook from the process_expired_switches() cron job.
 * Receives a { switch_id, user_id } payload, decrypts the escrowed NOK email
 * and emergency key, then delivers the "Surprise Inheritance" email via Resend.
 *
 * Environment variables required (set in Supabase Dashboard → Edge Functions → Secrets):
 *   SUPABASE_URL            — automatically injected by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — automatically injected by Supabase
 *   SERVER_ESCROW_KEY       — 64-char hex string (same key used by the Next.js server action)
 *   RESEND_API_KEY          — from resend.com dashboard
 *   NOKSLOCK_FROM_EMAIL     — verified sender address in Resend (e.g. "noreply@yourdomain.com")
 *   NOKSLOCK_CLAIM_URL      — claim portal URL (e.g. "https://yourdomain.com/claim")
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ─────────────────────────────────────────────────────

interface WebhookPayload {
  switch_id: string;
  user_id: string;
}

interface SwitchRow {
  id: string;
  user_id: string;
  status: string;
  nok_email_escrowed: string;
  emergency_key_escrowed: string;
  inactivity_threshold_days: number;
}

// ── Decryption Helper (AES-256-CBC, Web Crypto API) ───────────
//
// Mirrors the escrowEncrypt() function in lib/dead-man-actions.ts.
// The encrypted format stored in the DB is: "<iv_hex>:<ciphertext_hex>"
// The SERVER_ESCROW_KEY is a 64-character hex string (32 raw bytes).

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string length.");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function escrowDecrypt(escrowed: string): Promise<string> {
  const escrowKeyHex = Deno.env.get("SERVER_ESCROW_KEY");
  if (!escrowKeyHex || escrowKeyHex.length !== 64) {
    throw new Error(
      "SERVER_ESCROW_KEY is missing or malformed. Expected 64-char hex string."
    );
  }

  const parts = escrowed.split(":");
  if (parts.length !== 2) {
    throw new Error(
      "Malformed escrowed value — expected '<iv_hex>:<ciphertext_hex>'."
    );
  }

  const [ivHex, ciphertextHex] = parts;
  const rawKey = hexToBytes(escrowKeyHex);
  const iv = hexToBytes(ivHex);
  const ciphertext = hexToBytes(ciphertextHex);

  // Import the raw key bytes as an AES-CBC CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  // Decrypt — will throw DOMException if key or IV is wrong
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
}

// ── Email Builder ─────────────────────────────────────────────

function buildNokEmail(
  ownerEmail: string,
  emergencyKey: string,
  claimUrl: string
): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Important: You have been left a digital inheritance";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: #0f172a; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 20px; margin: 0; letter-spacing: -0.3px; }
    .header p { color: #94a3b8; font-size: 13px; margin: 6px 0 0; }
    .body { padding: 32px; }
    .body p { color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .owner-tag { display: inline-block; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 2px 8px; font-family: 'Courier New', Courier, monospace; font-size: 14px; color: #0f172a; }
    .key-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .key-box p { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px; }
    .key-box code { display: block; font-family: 'Courier New', Courier, monospace; font-size: 15px; color: #0f172a; line-height: 1.8; word-break: break-all; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { display: inline-block; background: #0f172a; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; }
    .warning { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
    .warning p { color: #92400e; font-size: 13px; margin: 0; }
    .footer { padding: 24px 32px; border-top: 1px solid #f3f4f6; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Nokslock</h1>
      <p>Digital Inheritance Notification</p>
    </div>
    <div class="body">
      <p>You are receiving this message because <span class="owner-tag">${ownerEmail}</span> trusted you enough to name you as their <strong>Next of Kin recovery contact</strong> on Nokslock — a secure digital vault service.</p>
      <p>Our system has detected that this person has been unreachable for an extended period of time. As their designated contact, you are now authorised to access their digital vault using the <strong>Emergency Recovery Key</strong> below.</p>

      <div class="key-box">
        <p>Your Emergency Recovery Key</p>
        <code>${emergencyKey}</code>
      </div>

      <div class="warning">
        <p><strong>Keep this key private.</strong> Anyone who possesses this key can access the vault. Do not share it over email or messaging apps. Store it somewhere safe before proceeding.</p>
      </div>

      <p>To claim the inheritance and access the vault, visit the secure claim portal. When prompted for the vault owner's email, enter <span class="owner-tag">${ownerEmail}</span>:</p>

      <div class="cta">
        <a href="${claimUrl}">Access the Claim Portal →</a>
      </div>

      <p>If you were not expecting this message, or if you believe it was sent in error, you can safely ignore it. The key above is meaningless without also accessing the claim portal.</p>
    </div>
    <div class="footer">
      <p>This is an automated message from Nokslock. The person who designated you did so voluntarily as part of their digital estate planning. For questions, visit ${claimUrl} or contact our support team.</p>
    </div>
  </div>
</body>
</html>
`.trim();

  const text = `
NOKSLOCK — DIGITAL INHERITANCE NOTIFICATION
============================================

You are receiving this message because ${ownerEmail} trusted you enough to name you as their Next of Kin recovery contact on Nokslock.

Our system has detected that this person has been unreachable for an extended period. You are now authorised to access their digital vault.

YOUR EMERGENCY RECOVERY KEY
----------------------------
${emergencyKey}

Keep this key private. Do not share it.

To access the vault, visit the claim portal and enter ${ownerEmail} as the vault owner's email when prompted:
${claimUrl}

If you were not expecting this message, you can safely ignore it.

— Nokslock
`.trim();

  return { subject, html, text };
}

// ── Main Handler ──────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // ── 1. Parse and validate the incoming webhook payload ─────

  let payload: WebhookPayload;

  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { switch_id, user_id } = payload;

  if (!switch_id || !user_id) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: switch_id, user_id." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 2. Initialise Supabase admin client ────────────────────

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // ── 3. Fetch the switch row and verify its status ──────────
  //
  // We re-check status === 'triggered' here as a second safety
  // layer. If the row was somehow reset between the cron UPDATE
  // and this webhook firing, we abort rather than spam the NOK.

  let switchRow: SwitchRow;

  try {
    const { data, error } = await supabase
      .from("dead_man_switches")
      .select(
        "id, user_id, status, nok_email_escrowed, emergency_key_escrowed, inactivity_threshold_days"
      )
      .eq("id", switch_id)
      .eq("user_id", user_id)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Switch row not found.");
    }

    switchRow = data as SwitchRow;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown DB error.";
    console.error("[deliver-nok-email] DB fetch failed:", message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch switch record.", detail: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Guard: only proceed if the cron job already set status to 'triggered'
  if (switchRow.status !== "triggered") {
    console.warn(
      `[deliver-nok-email] Switch ${switch_id} has status '${switchRow.status}' — expected 'triggered'. Aborting.`
    );
    return new Response(
      JSON.stringify({ error: `Switch status is '${switchRow.status}', not 'triggered'. Delivery aborted.` }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 4. Fetch the vault owner's email via auth admin ────────

  let ownerEmail: string;

  try {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      switchRow.user_id
    );

    if (userError || !userData?.user?.email) {
      throw new Error(userError?.message ?? "Owner email not found.");
    }

    ownerEmail = userData.user.email;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown user lookup error.";
    console.error("[deliver-nok-email] Owner email lookup failed:", message);
    return new Response(
      JSON.stringify({ error: "Failed to resolve vault owner identity.", detail: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 5. Decrypt the escrowed values ────────────────────────

  let nokEmail: string;
  let emergencyKey: string;

  try {
    nokEmail = await escrowDecrypt(switchRow.nok_email_escrowed);
    emergencyKey = await escrowDecrypt(switchRow.emergency_key_escrowed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown decryption error.";
    console.error("[deliver-nok-email] Decryption failed:", message);
    return new Response(
      JSON.stringify({ error: "Failed to decrypt escrowed data.", detail: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 6. Send the email via Resend ───────────────────────────

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("NOKSLOCK_FROM_EMAIL") ?? "noreply@yourdomain.com";
  const claimUrl = Deno.env.get("NOKSLOCK_CLAIM_URL") ?? "https://yourdomain.com/claim";

  if (!resendApiKey) {
    console.error("[deliver-nok-email] RESEND_API_KEY is not set.");
    return new Response(
      JSON.stringify({ error: "Email service is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { subject, html, text } = buildNokEmail(ownerEmail, emergencyKey, claimUrl);

  let resendResponse: Response;

  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [nokEmail],
        subject,
        html,
        text,
      }),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error.";
    console.error("[deliver-nok-email] Resend fetch failed:", message);
    return new Response(
      JSON.stringify({ error: "Failed to reach email service.", detail: message }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!resendResponse.ok) {
    const body = await resendResponse.text();
    console.error(
      `[deliver-nok-email] Resend returned ${resendResponse.status}:`, body
    );
    return new Response(
      JSON.stringify({
        error: "Email delivery failed.",
        status: resendResponse.status,
        detail: body,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 7. Log delivery and return success ─────────────────────
  //
  // We intentionally do NOT log the NOK email address, the owner
  // email, or the emergency key — only the switch ID is safe to log.

  console.log(
    `[deliver-nok-email] Switch ${switch_id} — NOK email delivered successfully.`
  );

  return new Response(
    JSON.stringify({ success: true, switch_id }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
