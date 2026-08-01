import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // These effects intentionally hydrate state from browser-only storage.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["src/types/**/*.d.ts"],
    rules: { "no-var": "off" },
  },
  globalIgnores([
    ".next/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "node_modules/**",
    "out/**",
  ]),
])
