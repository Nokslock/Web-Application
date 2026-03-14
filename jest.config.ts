import type { Config } from "jest";

const config: Config = {
  // Use ts-jest to run TypeScript tests directly
  preset: "ts-jest",

  // Node environment — gives us access to Web Crypto API (Node 20+)
  testEnvironment: "node",

  // Where to find tests
  roots: ["<rootDir>/__tests__"],

  // Path aliases matching your tsconfig.json
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Only run .test.ts files
  testMatch: ["**/__tests__/**/*.test.ts"],

  // Don't transform node_modules
  transformIgnorePatterns: ["/node_modules/"],

  // Make Web Crypto API available globally (same as browser)
  globals: {},

  // Setup file to polyfill browser APIs for crypto tests
  setupFiles: ["<rootDir>/__tests__/setup.ts"],
};

export default config;
