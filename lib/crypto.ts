// =============================================================================
// lib/crypto.ts — Zero-Knowledge Two-Tier Encryption
// All operations use the native Web Crypto API (window.crypto.subtle).
// No keys are ever stored in plaintext — only derived in-memory.
// =============================================================================

// --- Helpers: Encoding ---

/** Convert a string to an ArrayBuffer via UTF-8. */
const str2ab = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

/** ArrayBuffer → Base64 (browser-safe, no btoa chunk-size issues). */
const ab2base64 = (buf: ArrayBuffer | ArrayBufferLike): string => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/** Base64 → ArrayBuffer (browser-safe). */
const base642ab = (b64: string): ArrayBuffer => {
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// =============================================================================
// 1. SALT GENERATION
// =============================================================================

/**
 * Generate a cryptographically random 16-byte salt for a new user.
 * Returns the salt as a Base64 string (for storage in Supabase).
 */
export function generateUserSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return ab2base64(salt.buffer);
}

// =============================================================================
// 2. MASTER KEY DERIVATION (PBKDF2)
// =============================================================================

/**
 * Derive a 256-bit Master Key from the user's password and their unique salt.
 *
 * - KDF: PBKDF2 with SHA-256
 * - Iterations: 600,000
 * - Output: 256-bit CryptoKey usable for AES-GCM wrapping/unwrapping
 *
 * The Master Key is NEVER stored — only held in memory during the session.
 */
export async function deriveMasterKey(
  password: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const salt = base642ab(saltBase64);

  // Import the raw password as key material
  const passwordBytes = str2ab(password);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBytes.buffer as ArrayBuffer,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  // Derive the actual AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // not extractable — stays in WebCrypto
    ["wrapKey", "unwrapKey"],
  );
}

// =============================================================================
// 3. VAULT KEY GENERATION
// =============================================================================

/**
 * Generate a random 256-bit AES-GCM Vault Key.
 * This is the Data Encryption Key (DEK) used to encrypt/decrypt vault items.
 *
 * The raw Vault Key is NEVER stored — it is wrapped by the Master Key before
 * being persisted.
 */
export async function generateVaultKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable — so it can be wrapped/exported
    ["encrypt", "decrypt"],
  );
}

// =============================================================================
// 4. VAULT KEY WRAPPING / UNWRAPPING
// =============================================================================

/**
 * Wrap (encrypt) the Vault Key using the Master Key.
 * Returns a JSON string containing the IV and wrapped key bytes, both Base64.
 *
 * Format: `{ "iv": "<base64>", "wrappedKey": "<base64>" }`
 */
export async function wrapVaultKey(
  vaultKey: CryptoKey,
  masterKey: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const wrappedKeyBuffer = await crypto.subtle.wrapKey(
    "raw",
    vaultKey,
    masterKey,
    { name: "AES-GCM", iv },
  );

  return JSON.stringify({
    iv: ab2base64(iv.buffer),
    wrappedKey: ab2base64(wrappedKeyBuffer),
  });
}

/**
 * Unwrap (decrypt) the Vault Key using the Master Key.
 * Accepts the JSON string produced by `wrapVaultKey()`.
 * Returns a CryptoKey usable for encrypt/decrypt operations.
 */
export async function unwrapVaultKey(
  wrappedString: string,
  masterKey: CryptoKey,
): Promise<CryptoKey> {
  const { iv, wrappedKey } = JSON.parse(wrappedString);

  return crypto.subtle.unwrapKey(
    "raw",
    base642ab(wrappedKey),
    masterKey,
    { name: "AES-GCM", iv: base642ab(iv) },
    { name: "AES-GCM", length: 256 },
    true, // extractable — future-proof for Next of Kin re-wrapping
    ["encrypt", "decrypt"],
  );
}

// =============================================================================
// 5. DATA ENCRYPTION / DECRYPTION (using the Vault Key)
// =============================================================================

/**
 * Encrypt arbitrary data using the unwrapped Vault Key.
 * Uses AES-GCM with a random 12-byte IV per item.
 *
 * @param data   - Any JSON-serializable value.
 * @param vaultKey - The unwrapped CryptoKey from `unwrapVaultKey()` or `generateVaultKey()`.
 * @returns JSON string: `{ "iv": "<base64>", "ciphertext": "<base64>", "v": 2 }`
 */
export async function encryptData(
  data: any,
  vaultKey: CryptoKey,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = str2ab(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    vaultKey,
    encodedData.buffer as ArrayBuffer,
  );

  return JSON.stringify({
    iv: ab2base64(iv.buffer),
    ciphertext: ab2base64(ciphertext),
    v: 2, // version 2 = two-tier architecture
  });
}

/**
 * Decrypt data using the unwrapped Vault Key.
 *
 * @param encryptedString - The JSON string produced by `encryptData()`.
 * @param vaultKey        - The unwrapped CryptoKey.
 * @returns The original JSON-parsed value.
 */
export async function decryptData(
  encryptedString: string,
  vaultKey: CryptoKey,
): Promise<any> {
  const parsed = JSON.parse(encryptedString);

  if (!parsed.iv || !parsed.ciphertext) {
    throw new Error("Invalid encrypted data format.");
  }

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base642ab(parsed.iv) },
    vaultKey,
    base642ab(parsed.ciphertext),
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}
