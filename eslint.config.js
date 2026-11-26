import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier/flat'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores(['dist/', 'dist-snippets/', 'coverage/', 'node_modules/']),
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.jest.json', './snippets/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'max-classes-per-file': 'error',
      'no-duplicate-imports': ['error', { allowSeparateTypeImports: true }],
      'no-extra-bind': 'error',
      // 'no-restricted-imports': ['error', { paths: ['aws-sdk'], patterns: ['aws-sdk/*'] }],
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: [
            'public-static-field',
            'private-static-field',
            'public-instance-field',
            'private-instance-field',
            'public-static-method',
            'private-static-method',
            'constructor',
            'public-instance-method',
            'private-instance-method',
          ],
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    files: ['snippets/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  {
    files: ['test/**/*.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-class-instance-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-unassigned-vars': 'off',
      'no-constructor': 'off',
      'max-classes-per-file': 'off',
    },
  },

  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [eslint.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  // must be last: disables all rules conflicting with prettier
  prettierConfig,
)
