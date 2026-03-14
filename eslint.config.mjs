import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Downgrade to warning — too many pre-existing uses of `any` to fix at once.
      // TODO: Fix all `any` types and re-enable as error.
      "@typescript-eslint/no-explicit-any": "warn",
      // Downgrade unescaped entities (apostrophes in JSX) to warning.
      // TODO: Fix all unescaped entities and re-enable as error.
      "react/no-unescaped-entities": "warn",
      // Downgrade setState-in-effect warnings — pre-existing patterns
      // (setMounted in useEffect, etc.) are common in Next.js for hydration.
      // TODO: Refactor affected components and re-enable as error.
      "react-hooks/set-state-in-effect": "warn",
      // Downgrade purity check — Date.now() in useRef initial value is safe.
      // TODO: Refactor to use lazy initialization and re-enable as error.
      "react-hooks/purity": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
