import { getEncryptionKey } from "@/app/actions/encryption";
import CryptoJS from "crypto-js";

// Cache the CryptoKey to avoid repeated server fetching/derivation
let cachedKey: CryptoKey | null = null;
let legacyKey: string | null = null;

// Helper: Convert string to ArrayBuffer
const str2ab = (str: string) => {
  const enc = new TextEncoder();
  return enc.encode(str);
};

// Helper: ArrayBuffer to Base64 (Browser Safe)
const ab2str = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper: Base64 to ArrayBuffer (Browser Safe)
const str2ab64 = (str: string) => {
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

async function getWebCryptoKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const rawKey = await getEncryptionKey();
  if (!legacyKey) legacyKey = rawKey; // Store for fallback

  // Derive a 256-bit key from the passphrase using SHA-256
  const keyMaterial = await crypto.subtle.digest("SHA-256", str2ab(rawKey));

  cachedKey = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );

  return cachedKey;
}

export const encryptData = async (data: any): Promise<string> => {
  const key = await getWebCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = str2ab(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedData.buffer,
  );

  // Return formatted JSON string
  return JSON.stringify({
    iv: ab2str(iv),
    ciphertext: ab2str(ciphertext),
    v: 1, // versioning for future proofing
  });
};

export const decryptData = async (encryptedString: string): Promise<any> => {
  try {
    // 1. Try to parse as JSON (New Web Crypto Format)
    let parsed: any;
    try {
      parsed = JSON.parse(encryptedString);
    } catch (e) {
      // Not JSON -> Legacy Format
      parsed = null;
    }

    if (parsed && parsed.iv && parsed.ciphertext && parsed.v === 1) {
      const key = await getWebCryptoKey();
      const iv = str2ab64(parsed.iv);
      const ciphertext = str2ab64(parsed.ciphertext);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        ciphertext,
      );

      const dec = new TextDecoder();
      return JSON.parse(dec.decode(decrypted));
    }

    // 2. Fallback to Legacy (CryptoJS)
    // We need the raw key for this.
    // If getWebCryptoKey was called, legacyKey is set.
    // If not, we fetch it.
    if (!legacyKey) {
      legacyKey = await getEncryptionKey();
    }

    // Try legacy decryption
    const bytes = CryptoJS.AES.decrypt(encryptedString, legacyKey);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedStr) throw new Error("Decryption failed");
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data.");
  }
};
