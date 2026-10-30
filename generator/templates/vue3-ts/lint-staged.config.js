export default {
  '*.{js,ts,vue,jsx,tsx}': ['vp lint --fix', 'eslint --fix', 'vp fmt'],
  '*.{css,scss,html,json,md,yaml,yml}': ['vp fmt'],
}
