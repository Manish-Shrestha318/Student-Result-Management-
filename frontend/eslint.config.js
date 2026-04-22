import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow `any` types — common in data-heavy React projects
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused variables prefixed with _ (e.g. catch (_err))
      '@typescript-eslint/no-unused-vars': ['warn', { 
        varsIgnorePattern: '^_', 
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-unused-vars': 'off',
      // Allow empty block statements e.g. catch {}
      'no-empty': 'off',
    },
  },
])
