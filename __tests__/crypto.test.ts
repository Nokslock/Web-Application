/**
 * Tests for lib/crypto.ts — Zero-Knowledge Two-Tier Encryption
 *
 * These tests verify the most critical code in the entire application.
 * If any of these fail, users could lose access to their vaults permanently.
 */

import {
  generateUserSalt,
  deriveMasterKey,
  generateVaultKey,
  wrapVaultKey,
  unwrapVaultKey,
  encryptData,
  decryptData,
} from "@/lib/crypto";

// =============================================================================
// 1. SALT GENERATION
// =============================================================================

describe("generateUserSalt", () => {
  it("returns a non-empty base64 string", () => {
    const salt = generateUserSalt();
    expect(salt).toBeTruthy();
    expect(typeof salt).toBe("string");
    // Base64 of 16 bytes = 24 characters
    expect(salt.length).toBe(24);
  });

  it("generates unique salts each time", () => {
    const salts = new Set(Array.from({ length: 100 }, () => generateUserSalt()));
    // All 100 should be unique (collision is astronomically unlikely)
    expect(salts.size).toBe(100);
  });

  it("produces valid base64 that can be decoded", () => {
    const salt = generateUserSalt();
    const decoded = atob(salt);
    // 16 bytes = 16 characters in binary string
    expect(decoded.length).toBe(16);
  });
});

// =============================================================================
// 2. MASTER KEY DERIVATION
// =============================================================================

describe("deriveMasterKey", () => {
  it("derives a CryptoKey from password + salt", async () => {
    const salt = generateUserSalt();
    const key = await deriveMasterKey("test-password-123", salt);

    expect(key).toBeDefined();
    expect(key.type).toBe("secret");
    expect(key.algorithm).toMatchObject({ name: "AES-GCM", length: 256 });
    expect(key.usages).toContain("wrapKey");
    expect(key.usages).toContain("unwrapKey");
  });

  it("produces the same key for the same password + salt", async () => {
    const salt = generateUserSalt();
    const key1 = await deriveMasterKey("my-password", salt);
    const key2 = await deriveMasterKey("my-password", salt);

    // deriveMasterKey sets extractable: false, so we can't compare raw bytes.
    // Instead we verify determinism by wrapping with key1, unwrapping with key2.
    // If they're the same derived key, this will succeed.
    const vaultKey = await generateVaultKey();
    const wrapped = await wrapVaultKey(vaultKey, key1);
    const unwrapped = await unwrapVaultKey(wrapped, key2);

    expect(unwrapped).toBeDefined();
    expect(unwrapped.type).toBe("secret");
  });

  it("produces different keys for different passwords", async () => {
    const salt = generateUserSalt();
    const key1 = await deriveMasterKey("password-A", salt);
    const key2 = await deriveMasterKey("password-B", salt);

    // Wrap with key1, try to unwrap with key2 — should fail
    const vaultKey = await generateVaultKey();
    const wrapped = await wrapVaultKey(vaultKey, key1);

    await expect(unwrapVaultKey(wrapped, key2)).rejects.toThrow();
  });

  it("produces different keys for different salts", async () => {
    const salt1 = generateUserSalt();
    const salt2 = generateUserSalt();
    const key1 = await deriveMasterKey("same-password", salt1);
    const key2 = await deriveMasterKey("same-password", salt2);

    const vaultKey = await generateVaultKey();
    const wrapped = await wrapVaultKey(vaultKey, key1);

    await expect(unwrapVaultKey(wrapped, key2)).rejects.toThrow();
  });
});

// =============================================================================
// 3. VAULT KEY GENERATION
// =============================================================================

describe("generateVaultKey", () => {
  it("generates a valid AES-256-GCM key", async () => {
    const key = await generateVaultKey();

    expect(key).toBeDefined();
    expect(key.type).toBe("secret");
    expect(key.algorithm).toMatchObject({ name: "AES-GCM", length: 256 });
    expect(key.extractable).toBe(true);
    expect(key.usages).toContain("encrypt");
    expect(key.usages).toContain("decrypt");
  });

  it("generates unique keys each time", async () => {
    const key1 = await generateVaultKey();
    const key2 = await generateVaultKey();

    const raw1 = new Uint8Array(await crypto.subtle.exportKey("raw", key1));
    const raw2 = new Uint8Array(await crypto.subtle.exportKey("raw", key2));

    // Compare byte arrays — they should be different
    const areEqual = raw1.every((byte, i) => byte === raw2[i]);
    expect(areEqual).toBe(false);
  });
});

// =============================================================================
// 4. VAULT KEY WRAPPING / UNWRAPPING
// =============================================================================

describe("wrapVaultKey / unwrapVaultKey", () => {
  it("wraps and unwraps the vault key successfully", async () => {
    const salt = generateUserSalt();
    const masterKey = await deriveMasterKey("test-password", salt);
    const originalVaultKey = await generateVaultKey();

    // Wrap
    const wrapped = await wrapVaultKey(originalVaultKey, masterKey);
    expect(typeof wrapped).toBe("string");

    // Verify it's valid JSON with expected fields
    const parsed = JSON.parse(wrapped);
    expect(parsed).toHaveProperty("iv");
    expect(parsed).toHaveProperty("wrappedKey");

    // Unwrap
    const unwrappedKey = await unwrapVaultKey(wrapped, masterKey);
    expect(unwrappedKey).toBeDefined();
    expect(unwrappedKey.type).toBe("secret");

    // Verify the unwrapped key matches the original
    const originalRaw = new Uint8Array(
      await crypto.subtle.exportKey("raw", originalVaultKey)
    );
    const unwrappedRaw = new Uint8Array(
      await crypto.subtle.exportKey("raw", unwrappedKey)
    );

    expect(unwrappedRaw).toEqual(originalRaw);
  });

  it("fails to unwrap with wrong master key", async () => {
    const salt = generateUserSalt();
    const correctMasterKey = await deriveMasterKey("correct-password", salt);
    const wrongMasterKey = await deriveMasterKey("wrong-password", salt);
    const vaultKey = await generateVaultKey();

    const wrapped = await wrapVaultKey(vaultKey, correctMasterKey);

    // Unwrapping with wrong key should throw
    await expect(unwrapVaultKey(wrapped, wrongMasterKey)).rejects.toThrow();
  });

  it("produces different wrapped output each time (unique IV)", async () => {
    const salt = generateUserSalt();
    const masterKey = await deriveMasterKey("test-password", salt);
    const vaultKey = await generateVaultKey();

    const wrapped1 = await wrapVaultKey(vaultKey, masterKey);
    const wrapped2 = await wrapVaultKey(vaultKey, masterKey);

    // Same key, but wrapped output should differ due to random IV
    expect(wrapped1).not.toBe(wrapped2);

    // But both should unwrap to the same key
    const unwrapped1 = await unwrapVaultKey(wrapped1, masterKey);
    const unwrapped2 = await unwrapVaultKey(wrapped2, masterKey);

    const raw1 = new Uint8Array(await crypto.subtle.exportKey("raw", unwrapped1));
    const raw2 = new Uint8Array(await crypto.subtle.exportKey("raw", unwrapped2));

    expect(raw1).toEqual(raw2);
  });
});

// =============================================================================
// 5. DATA ENCRYPTION / DECRYPTION
// =============================================================================

describe("encryptData / decryptData", () => {
  let vaultKey: CryptoKey;

  beforeEach(async () => {
    vaultKey = await generateVaultKey();
  });

  it("encrypts and decrypts a simple string", async () => {
    const original = "my-super-secret-password";

    const encrypted = await encryptData(original, vaultKey);
    const decrypted = await decryptData(encrypted, vaultKey);

    expect(decrypted).toBe(original);
  });

  it("encrypts and decrypts a complex object", async () => {
    const original = {
      username: "dwayne@example.com",
      password: "hunter2",
      notes: "My bank login",
      tags: ["finance", "important"],
    };

    const encrypted = await encryptData(original, vaultKey);
    const decrypted = await decryptData(encrypted, vaultKey);

    expect(decrypted).toEqual(original);
  });

  it("encrypts and decrypts special characters and unicode", async () => {
    const original = {
      password: "p@$$w0rd!#%^&*()",
      emoji: "🔐🛡️",
      japanese: "パスワード",
      arabic: "كلمة المرور",
    };

    const encrypted = await encryptData(original, vaultKey);
    const decrypted = await decryptData(encrypted, vaultKey);

    expect(decrypted).toEqual(original);
  });

  it("encrypts and decrypts an empty string", async () => {
    const encrypted = await encryptData("", vaultKey);
    const decrypted = await decryptData(encrypted, vaultKey);

    expect(decrypted).toBe("");
  });

  it("encrypts and decrypts null and boolean values", async () => {
    const original = { value: null, active: true, count: 0 };

    const encrypted = await encryptData(original, vaultKey);
    const decrypted = await decryptData(encrypted, vaultKey);

    expect(decrypted).toEqual(original);
  });

  it("produces valid JSON output with expected fields", async () => {
    const encrypted = await encryptData("test", vaultKey);
    const parsed = JSON.parse(encrypted);

    expect(parsed).toHaveProperty("iv");
    expect(parsed).toHaveProperty("ciphertext");
    expect(parsed).toHaveProperty("v", 2); // version 2
  });

  it("produces different ciphertext each time (unique IV)", async () => {
    const data = "same-data-encrypted-twice";

    const encrypted1 = await encryptData(data, vaultKey);
    const encrypted2 = await encryptData(data, vaultKey);

    // Ciphertext should differ due to random IV
    expect(encrypted1).not.toBe(encrypted2);

    // But both should decrypt to the same value
    expect(await decryptData(encrypted1, vaultKey)).toBe(data);
    expect(await decryptData(encrypted2, vaultKey)).toBe(data);
  });

  it("fails to decrypt with wrong vault key", async () => {
    const wrongKey = await generateVaultKey();
    const encrypted = await encryptData("secret", vaultKey);

    await expect(decryptData(encrypted, wrongKey)).rejects.toThrow();
  });

  it("fails to decrypt tampered ciphertext", async () => {
    const encrypted = await encryptData("secret", vaultKey);
    const parsed = JSON.parse(encrypted);

    // Tamper with the ciphertext (flip a character)
    const tamperedCiphertext =
      parsed.ciphertext.charAt(0) === "A"
        ? "B" + parsed.ciphertext.slice(1)
        : "A" + parsed.ciphertext.slice(1);

    const tampered = JSON.stringify({
      ...parsed,
      ciphertext: tamperedCiphertext,
    });

    await expect(decryptData(tampered, vaultKey)).rejects.toThrow();
  });

  it("fails to decrypt with malformed input", async () => {
    await expect(decryptData("{}", vaultKey)).rejects.toThrow(
      "Invalid encrypted data format"
    );

    await expect(decryptData("not-json", vaultKey)).rejects.toThrow();
  });

  it("handles large data payloads", async () => {
    // Simulate a large file/note (~100KB)
    const largeData = "x".repeat(100_000);

    const encrypted = await encryptData(largeData, vaultKey);
    const decrypted = await decryptData(encrypted, vaultKey);

    expect(decrypted).toBe(largeData);
  });
});

// =============================================================================
// 6. FULL FLOW: Registration → Encrypt → Decrypt
// =============================================================================

describe("Full encryption flow (simulates real usage)", () => {
  it("simulates registration: password → salt → master key → vault key → encrypt → decrypt", async () => {
    const password = "MyStr0ng!P@ssword";

    // 1. Registration: generate salt + derive master key
    const salt = generateUserSalt();
    const masterKey = await deriveMasterKey(password, salt);

    // 2. Generate and wrap the vault key
    const vaultKey = await generateVaultKey();
    const wrappedVaultKey = await wrapVaultKey(vaultKey, masterKey);

    // 3. Encrypt some vault items
    const loginItem = {
      type: "login",
      website: "https://gmail.com",
      username: "dwayne@example.com",
      password: "gmail-secret-123",
    };

    const cardItem = {
      type: "card",
      number: "4111111111111111",
      expiry: "12/28",
      cvv: "123",
    };

    const encryptedLogin = await encryptData(loginItem, vaultKey);
    const encryptedCard = await encryptData(cardItem, vaultKey);

    // ---- Simulate closing browser / new session ----

    // 4. Login: re-derive master key from same password + salt
    const masterKey2 = await deriveMasterKey(password, salt);

    // 5. Unwrap the vault key
    const restoredVaultKey = await unwrapVaultKey(wrappedVaultKey, masterKey2);

    // 6. Decrypt all items
    const decryptedLogin = await decryptData(encryptedLogin, restoredVaultKey);
    const decryptedCard = await decryptData(encryptedCard, restoredVaultKey);

    expect(decryptedLogin).toEqual(loginItem);
    expect(decryptedCard).toEqual(cardItem);
  });

  it("simulates wrong password on login: cannot unwrap vault key", async () => {
    const salt = generateUserSalt();
    const masterKey = await deriveMasterKey("correct-password", salt);
    const vaultKey = await generateVaultKey();
    const wrappedVaultKey = await wrapVaultKey(vaultKey, masterKey);

    // Attacker tries with wrong password
    const wrongMasterKey = await deriveMasterKey("wrong-password", salt);

    await expect(
      unwrapVaultKey(wrappedVaultKey, wrongMasterKey)
    ).rejects.toThrow();
  });
});
