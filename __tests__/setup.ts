/**
 * Jest Setup File
 *
 * Makes browser-like APIs available in the Node.js test environment
 * so our crypto code (which uses Web Crypto API) works correctly.
 */

import { webcrypto } from "node:crypto";

// Polyfill the global `crypto` object to match the browser API
// Node 20+ has this built-in, but Jest's environment may not expose it
if (!globalThis.crypto) {
  // @ts-expect-error — Node's webcrypto is compatible with the browser API
  globalThis.crypto = webcrypto;
}

// Polyfill TextEncoder/TextDecoder (usually available, but just in case)
if (!globalThis.TextEncoder) {
  const { TextEncoder, TextDecoder } = require("util");
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

// Polyfill btoa/atob for base64 encoding (available in Node 16+, but ensure it)
if (!globalThis.btoa) {
  globalThis.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
  globalThis.atob = (b64: string) => Buffer.from(b64, "base64").toString("binary");
}
