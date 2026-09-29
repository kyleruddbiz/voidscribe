export default {
  extends: ['stylelint-config-recommended'],
  ignoreFiles: ['dist/**', '.astro/**', 'public/**'],
  overrides: [
    {
      files: ['**/*.{svelte,astro}'],
      extends: ['stylelint-config-html'],
    },
  ],
  rules: {
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],
  },
};
