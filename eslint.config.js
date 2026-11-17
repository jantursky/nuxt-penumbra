import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.vercel/**',
      '**/.blume/**',
      '**/.size/**',
      '**/test-results/**',
      '**/playwright-report/**',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true, allowBoolean: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-undef': 'off',
    },
  },

  {
    // Only the module package has a tsconfig the type-aware rules can use; the apps are linted without type information.
    files: ['apps/**/*.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { parserOptions: { projectService: false, project: false } },
  },

  {
    // Single-file components get the syntactic TypeScript rules; the type-aware ones need vue-tsc's view of a .vue file.
    files: ['**/*.vue'],
    extends: [tseslint.configs.strict, tseslint.configs.stylistic, vue.configs['flat/recommended']],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-undef': 'off',
      // Nuxt names app.vue and the pages by convention.
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    files: ['**/test/**/*.ts', '**/e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      // The tests run the generated head script with `new Function`.
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },

  prettier,
)
