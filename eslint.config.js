import { defineScTsConfig } from "@shiftcode/eslint-config-recommended";

export default [
  ...defineScTsConfig({
    languageOptions: { parserOptions: { project: ["./tsconfig.lint.json"] } },
  }),
  {
    files: ["**/*.{ts,mts,cts,js,mjs,cjs}"],
    rules: {
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-array-constructor": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/require-await": "off",
      "simple-import-sort/exports": "off",
      "simple-import-sort/imports": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "off",
      "@typescript-eslint/member-ordering": "off",
    },
  },
  {
    files: ["**/*.{ts,mts,cts,js,mjs,cjs}"],
    ignores: [
      "src/**/*", // ignore all files inside src/
      "!src/**/*.{spec,test}.ts", // un-ignore test files
    ],
    rules: {
      "unused-imports/no-unused-vars": "off",
    },
  },
];
