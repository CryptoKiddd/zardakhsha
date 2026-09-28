import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // `_name` = intentionally unused (e.g. stripping props before spreading).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
      // Architecture guardrails: see CLAUDE.md → "Import rules".
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/models/*", "!@/models/Product"],
              message: "Import models from '@/models' (server-only barrel).",
            },
            { group: ["mongoose"], importNames: ["default"], message: "Use connectDb/readDb from '@/lib/db'." },
          ],
        },
      ],
    },
  },
  {
    // The seed script and the models themselves may import model files directly.
    files: ["scripts/**", "src/models/**", "src/lib/db.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
