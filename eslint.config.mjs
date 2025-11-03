import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src/lib/**/*.ts',
    'coverage/*'
  ]),
  {
    "rules": {
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars" : "off",
      "react-hooks/exhaustive-deps" : "off"
    }
  }
  
];

export default eslintConfig;
