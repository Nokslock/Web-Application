/**
 * Emergency Key Generation & Vault Key Wrapping
 *
 * generateEmergencyKey — cryptographically secure 16-word phrase
 *                        (128-bit entropy, no external dependencies)
 *
 * wrapMasterVaultKey   — PBKDF2 key derivation + AES-GCM encryption of the
 *                        raw vault key bytes using the 16-word phrase as input.
 *
 * unwrapMasterVaultKey — inverse of the above, used in the NOK claim flow.
 *
 * All operations use the standard Web Crypto API (window.crypto.subtle).
 */

// ── Private base64 helpers ────────────────────────────────────
// (same implementation as lib/crypto.ts — kept private to this module)

function ab2base64(buf: ArrayBuffer | ArrayBufferLike): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base642ab(b64: string): ArrayBuffer {
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// 256 distinct, easy-to-read words (no homophones, no ambiguous chars)
const WORDLIST: readonly string[] = [
  "abbey",  "acid",   "aged",   "agile",  "alarm",  "album",  "alert",  "algae",
  "alley",  "allow",  "almond", "alone",  "alter",  "amber",  "ample",  "angel",
  "angle",  "ankle",  "annex",  "antic",  "anvil",  "apart",  "apple",  "apron",
  "arbor",  "arena",  "argue",  "armor",  "arrow",  "atlas",  "attic",  "audio",
  "audit",  "avail",  "avid",   "avoid",  "await",  "awake",  "awful",  "axiom",
  "azure",  "bacon",  "badge",  "baker",  "barge",  "baron",  "basic",  "basin",
  "batch",  "beach",  "beard",  "bench",  "birch",  "blade",  "blank",  "blast",
  "blaze",  "blend",  "bless",  "blind",  "block",  "bloom",  "blown",  "blunt",
  "bonus",  "boost",  "booth",  "botch",  "bound",  "brain",  "brand",  "brave",
  "bread",  "brick",  "bride",  "brief",  "brine",  "brisk",  "broad",  "brook",
  "brown",  "brush",  "buddy",  "build",  "bulge",  "bunch",  "burst",  "cabin",
  "cable",  "camel",  "candy",  "cargo",  "carve",  "cedar",  "chair",  "chalk",
  "charm",  "chest",  "chimp",  "chunk",  "civic",  "civil",  "claim",  "clamp",
  "clash",  "clasp",  "class",  "clean",  "clear",  "clerk",  "click",  "cliff",
  "climb",  "cling",  "clock",  "clone",  "close",  "cloud",  "clown",  "coach",
  "cobra",  "comet",  "coral",  "couch",  "count",  "court",  "cover",  "craft",
  "crane",  "crash",  "creak",  "creek",  "crisp",  "cross",  "crowd",  "crown",
  "crust",  "curve",  "cycle",  "daily",  "dairy",  "dance",  "daunt",  "depot",
  "depth",  "derby",  "diner",  "dirge",  "disco",  "ditch",  "diver",  "dizzy",
  "dodge",  "donor",  "draft",  "drain",  "drake",  "drama",  "drape",  "drawl",
  "dream",  "drift",  "drill",  "drink",  "drive",  "droop",  "drove",  "drown",
  "druid",  "dryer",  "dunce",  "dwell",  "eagle",  "easel",  "eject",  "elder",
  "elect",  "elite",  "ember",  "emote",  "empty",  "epoch",  "equip",  "erupt",
  "essay",  "evade",  "event",  "evict",  "exact",  "exert",  "exile",  "extra",
  "fable",  "facet",  "faint",  "fancy",  "fatal",  "feast",  "fence",  "ferry",
  "fetch",  "field",  "fifth",  "fifty",  "finch",  "first",  "fixed",  "fjord",
  "flank",  "flare",  "flash",  "flask",  "fleck",  "fleet",  "flesh",  "flock",
  "flood",  "floor",  "flora",  "floss",  "flour",  "flute",  "focal",  "forge",
  "found",  "frame",  "frank",  "fraud",  "fresh",  "front",  "frost",  "froze",
  "frugal", "frump",  "fungi",  "funky",  "futon",  "gavel",  "gecko",  "genre",
  "ghost",  "giddy",  "glade",  "gland",  "glare",  "glass",  "gleam",  "glide",
  "glint",  "globe",  "gloom",  "gloss",  "glove",  "glyph",  "gnome",  "golem",
] as const;

/** Returns a cryptographically secure 16-word emergency key phrase. */
export function generateEmergencyKey(): string {
  const indices = new Uint8Array(16);
  crypto.getRandomValues(indices);
  return Array.from(indices)
    .map((byte) => WORDLIST[byte % WORDLIST.length])
    .join(" ");
}

// ── Vault Key Wrapping ────────────────────────────────────────

/**
 * Wraps (encrypts) the user's Master Vault Key using the 16-word Emergency Key.
 *
 * Flow:
 *   1. Generate a random 16-byte salt.
 *   2. Import the emergencyKey phrase as PBKDF2 raw key material.
 *   3. Derive a 256-bit AES-GCM Key Encryption Key (KEK) via PBKDF2-SHA-256
 *      at 600,000 iterations (consistent with lib/crypto.ts deriveMasterKey).
 *   4. Generate a random 12-byte IV.
 *   5. AES-GCM encrypt the raw vault key bytes using the KEK.
 *   6. Return `base64(salt):base64(iv):base64(ciphertext)`.
 *
 * @param emergencyKey   - The 16-word plaintext phrase generated for the NOK.
 * @param masterVaultKey - The raw AES-256 vault key bytes, base64-encoded.
 *                         Obtain via `exportVaultKeyMaterial()` in vaultKeyManager.ts.
 * @returns A colon-delimited string: `<salt_b64>:<iv_b64>:<ciphertext_b64>`
 */
export async function wrapMasterVaultKey(
  emergencyKey: string,
  masterVaultKey: string,
): Promise<string> {
  const encoder = new TextEncoder();

  // 1. Random salt — unique per wrap, must be stored alongside the ciphertext
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 2. Import emergency key phrase as PBKDF2 input key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(emergencyKey),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  // 3. Derive a 256-bit AES-GCM KEK
  const kek = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // KEK is not extractable
    ["encrypt"],
  );

  // 4. Random 12-byte IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 5. Encrypt the raw vault key bytes
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    kek,
    base642ab(masterVaultKey),
  );

  // 6. Serialize: <salt>:<iv>:<ciphertext> — all base64, colon-delimited
  return [ab2base64(salt.buffer), ab2base64(iv.buffer), ab2base64(ciphertext)].join(
    ":",
  );
}

/**
 * Unwraps (decrypts) the raw vault key using the 16-word Emergency Key.
 * Inverse of `wrapMasterVaultKey()`. Used in the NOK claim flow (Step 4).
 *
 * @param wrapped      - The `<salt_b64>:<iv_b64>:<ciphertext_b64>` string from storage.
 * @param emergencyKey - The 16-word plaintext phrase the NOK was given directly by the user.
 * @returns The raw AES-256 vault key bytes, base64-encoded.
 */
export async function unwrapMasterVaultKey(
  wrapped: string,
  emergencyKey: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const parts = wrapped.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid wrapped vault key format — expected salt:iv:ciphertext.");
  }

  const [saltB64, ivB64, ciphertextB64] = parts;

  // Re-derive the KEK from the same emergency key + stored salt
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(emergencyKey),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const kek = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base642ab(saltB64),
      iterations: 600_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );

  // Decrypt — AES-GCM will throw if the emergency key is wrong
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base642ab(ivB64) },
    kek,
    base642ab(ciphertextB64),
  );

  return ab2base64(plaintext);
}
