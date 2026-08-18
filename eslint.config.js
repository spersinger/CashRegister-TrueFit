import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin-ts';
import importX from 'eslint-plugin-import-x';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@stylistic': stylistic,
      'import-x': importX,
    },
    rules: {
      // Enforce semicolons (auto-fixable)
      '@stylistic/semi': ['error', 'always'],

      // Enforce no .ts extensions on relative imports (auto-fixable)
      'import-x/extensions': ['error', 'ignorePackages', {
        ts: 'never',
        tsx: 'never',
      }],
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
