import CryptoJS from "crypto-js";

// IMPORTANT: Add NEXT_PUBLIC_ENCRYPTION_KEY="some-very-long-secret-key" to your .env file
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "fallback-dev-key";

export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string): any => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};