import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', 'public/'] },
  tseslint.configs.base,
  ...astro.configs.base,
  ...svelte.configs.base,
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  prettier,
  {
    files: ['**/*.{js,mjs,ts,astro,svelte}'],
    rules: { curly: ['error', 'all'] },
  },
];
