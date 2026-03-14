/**
 * Tests for lib/emergency-key.ts — Emergency Key Generation & Vault Key Wrapping
 *
 * The emergency key is used in the Dead Man's Switch flow.
 * If this code breaks, NOKs lose access to inherited vaults permanently.
 */

import {
  generateEmergencyKey,
  wrapMasterVaultKey,
  unwrapMasterVaultKey,
} from "@/lib/emergency-key";
import { generateVaultKey } from "@/lib/crypto";

// =============================================================================
// 1. EMERGENCY KEY GENERATION
// =============================================================================

describe("generateEmergencyKey", () => {
  it("returns a 16-word phrase", () => {
    const key = generateEmergencyKey();
    const words = key.split(" ");

    expect(words.length).toBe(16);
  });

  it("contains only lowercase alphabetic words", () => {
    const key = generateEmergencyKey();
    const words = key.split(" ");

    words.forEach((word) => {
      expect(word).toMatch(/^[a-z]+$/);
    });
  });

  it("generates unique keys each time", () => {
    const keys = new Set(Array.from({ length: 50 }, () => generateEmergencyKey()));
    // All 50 should be unique (collision is astronomically unlikely with 128-bit entropy)
    expect(keys.size).toBe(50);
  });

  it("uses words from the expected wordlist (3-6 chars each)", () => {
    const key = generateEmergencyKey();
    const words = key.split(" ");

    words.forEach((word) => {
      expect(word.length).toBeGreaterThanOrEqual(3);
      expect(word.length).toBeLessThanOrEqual(6);
    });
  });
});

// =============================================================================
// 2. VAULT KEY WRAPPING WITH EMERGENCY KEY
// =============================================================================

describe("wrapMasterVaultKey / unwrapMasterVaultKey", () => {
  // Helper: export a vault key to base64 (same as exportVaultKeyMaterial)
  async function exportKeyToBase64(key: CryptoKey): Promise<string> {
    const rawBytes = await crypto.subtle.exportKey("raw", key);
    const bytes = new Uint8Array(rawBytes);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  it("wraps and unwraps a vault key successfully", async () => {
    const emergencyKey = generateEmergencyKey();
    const vaultKey = await generateVaultKey();
    const vaultKeyBase64 = await exportKeyToBase64(vaultKey);

    // Wrap
    const wrapped = await wrapMasterVaultKey(emergencyKey, vaultKeyBase64);
    expect(typeof wrapped).toBe("string");

    // Unwrap
    const unwrappedBase64 = await unwrapMasterVaultKey(wrapped, emergencyKey);
    expect(unwrappedBase64).toBe(vaultKeyBase64);
  });

  it("produces colon-delimited format (salt:iv:ciphertext)", async () => {
    const emergencyKey = generateEmergencyKey();
    const vaultKey = await generateVaultKey();
    const vaultKeyBase64 = await exportKeyToBase64(vaultKey);

    const wrapped = await wrapMasterVaultKey(emergencyKey, vaultKeyBase64);
    const parts = wrapped.split(":");

    expect(parts.length).toBe(3);
    // Each part should be valid base64
    parts.forEach((part) => {
      expect(() => atob(part)).not.toThrow();
    });
  });

  it("fails to unwrap with wrong emergency key", async () => {
    const correctKey = generateEmergencyKey();
    const wrongKey = generateEmergencyKey();
    const vaultKey = await generateVaultKey();
    const vaultKeyBase64 = await exportKeyToBase64(vaultKey);

    const wrapped = await wrapMasterVaultKey(correctKey, vaultKeyBase64);

    // Wrong key should cause AES-GCM to throw (authentication failure)
    await expect(
      unwrapMasterVaultKey(wrapped, wrongKey)
    ).rejects.toThrow();
  });

  it("fails to unwrap tampered data", async () => {
    const emergencyKey = generateEmergencyKey();
    const vaultKey = await generateVaultKey();
    const vaultKeyBase64 = await exportKeyToBase64(vaultKey);

    const wrapped = await wrapMasterVaultKey(emergencyKey, vaultKeyBase64);
    const parts = wrapped.split(":");

    // Tamper with the ciphertext portion
    const tampered = [parts[0], parts[1], "AAAA" + parts[2].slice(4)].join(":");

    await expect(
      unwrapMasterVaultKey(tampered, emergencyKey)
    ).rejects.toThrow();
  });

  it("rejects malformed wrapped string (wrong number of parts)", async () => {
    const emergencyKey = generateEmergencyKey();

    await expect(
      unwrapMasterVaultKey("onlyone", emergencyKey)
    ).rejects.toThrow("Invalid wrapped vault key format");

    await expect(
      unwrapMasterVaultKey("two:parts", emergencyKey)
    ).rejects.toThrow("Invalid wrapped vault key format");
  });

  it("produces different wrapped output each time (unique salt + IV)", async () => {
    const emergencyKey = generateEmergencyKey();
    const vaultKey = await generateVaultKey();
    const vaultKeyBase64 = await exportKeyToBase64(vaultKey);

    const wrapped1 = await wrapMasterVaultKey(emergencyKey, vaultKeyBase64);
    const wrapped2 = await wrapMasterVaultKey(emergencyKey, vaultKeyBase64);

    expect(wrapped1).not.toBe(wrapped2);

    // But both should unwrap to the same key
    const unwrapped1 = await unwrapMasterVaultKey(wrapped1, emergencyKey);
    const unwrapped2 = await unwrapMasterVaultKey(wrapped2, emergencyKey);

    expect(unwrapped1).toBe(vaultKeyBase64);
    expect(unwrapped2).toBe(vaultKeyBase64);
  });
});

// =============================================================================
// 3. FULL DEAD MAN'S SWITCH FLOW
// =============================================================================

describe("Full Dead Man's Switch flow", () => {
  async function exportKeyToBase64(key: CryptoKey): Promise<string> {
    const rawBytes = await crypto.subtle.exportKey("raw", key);
    const bytes = new Uint8Array(rawBytes);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  it("simulates: user sets up DMS → NOK claims vault with emergency key", async () => {
    // === USER SETUP ===

    // 1. User has a vault key (already unlocked from login)
    const vaultKey = await generateVaultKey();
    const vaultKeyBase64 = await exportKeyToBase64(vaultKey);

    // 2. User generates an emergency key phrase
    const emergencyKey = generateEmergencyKey();
    expect(emergencyKey.split(" ").length).toBe(16);

    // 3. User encrypts some vault items
    const { encryptData, decryptData } = await import("@/lib/crypto");
    const secretItem = {
      type: "login",
      site: "bank.com",
      username: "dwayne",
      password: "my-banking-password",
    };
    const encryptedItem = await encryptData(secretItem, vaultKey);

    // 4. Client wraps vault key with emergency key
    const wrappedVaultKey = await wrapMasterVaultKey(emergencyKey, vaultKeyBase64);

    // === SERVER STORES: wrappedVaultKey + encryptedItem ===

    // === NOK CLAIM FLOW ===

    // 5. NOK enters the emergency key phrase they were given
    const nokEnteredKey = emergencyKey; // Same phrase the user gave them

    // 6. NOK unwraps the vault key
    const recoveredBase64 = await unwrapMasterVaultKey(wrappedVaultKey, nokEnteredKey);
    expect(recoveredBase64).toBe(vaultKeyBase64);

    // 7. NOK imports the raw key and decrypts items
    const rawBytes = Uint8Array.from(atob(recoveredBase64), (c) => c.charCodeAt(0));
    const recoveredVaultKey = await crypto.subtle.importKey(
      "raw",
      rawBytes.buffer,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const decryptedItem = await decryptData(encryptedItem, recoveredVaultKey);
    expect(decryptedItem).toEqual(secretItem);
  });
});
