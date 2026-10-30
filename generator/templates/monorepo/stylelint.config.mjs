export default {
  extends: ['stylelint-config-recess-order'],
  overrides: [
    {
      files: ['**/*.vue'],
      extends: ['stylelint-config-recommended-vue/scss'],
      customSyntax: 'postcss-html',
      rules: {
        'scss/operator-no-unspaced': null,
        'scss/load-partial-extension': null,
      },
    },
    {
      files: ['**/*.scss'],
      extends: ['stylelint-config-recommended-scss'],
      customSyntax: 'postcss-scss',
      rules: {
        'scss/operator-no-unspaced': null,
        'scss/load-partial-extension': null,
      },
    },
    {
      files: ['**/*.css'],
      extends: ['stylelint-config-recommended'],
    },
  ],
  ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/public/**'],
  rules: {
    'no-empty-source': null,
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'custom-property-pattern': null,
    'declaration-block-no-duplicate-properties': [
      true,
      { ignore: ['consecutive-duplicates-with-different-values'] },
    ],
  },
}
