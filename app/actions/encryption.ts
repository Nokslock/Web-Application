"use server";

export async function getEncryptionKey() {
  const key =
    process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("Encryption key not found in environment variables");
  }
  return key;
}
