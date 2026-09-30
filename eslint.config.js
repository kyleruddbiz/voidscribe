import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', 'public/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.base,
  ...svelte.configs.base,
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  prettier,
  {
    files: ['**/*.{js,mjs,ts,astro,svelte}'],
    languageOptions: { globals: globals.browser },
    rules: {
      curly: ['error', 'all'],
      eqeqeq: 'error',
      'no-else-return': 'error',
      'no-nested-ternary': 'error',
      'no-console': 'warn',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
    },
  },
  {
    files: ['src/env.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' },
  },
];
