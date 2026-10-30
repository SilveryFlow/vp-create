import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    singleQuote: true,
    semi: false,
    arrowParens: 'avoid',
    printWidth: 100,
    ignorePatterns: [
      '**/dist/**',
      '**/coverage/**',
      '.artifacts/**',
      '**/components.d.ts',
      'pnpm-lock.yaml',
    ],
  },
  lint: {
    plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'vue', 'vitest'],
    jsPlugins: [
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      './lint/workspace.mjs',
    ],
    // TS-Go 尚不能解析本模板的 Vue SFC 导入；完整类型检查由 tsc/vue-tsc 执行。
    options: { typeAware: true, typeCheck: false },
    categories: { correctness: 'error' },
    env: { browser: true, node: true },
    ignorePatterns: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/components.d.ts',
      '.artifacts/**',
    ],
    rules: {
      'typescript/no-explicit-any': 'error',
      'typescript/ban-ts-comment': 'error',
      'typescript/no-empty-object-type': 'error',
      'typescript/no-unsafe-function-type': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/valid-expect': 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
      'workspace/no-private-imports': 'error',
    },
  },
  staged: {
    '**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,vue,json,yaml,yml,md,css,scss,html}': () => 'vp check',
    '{apps,packages}/**/src/**/*.{vue,css,scss}': 'stylelint --allow-empty-input',
  },
  run: {
    tasks: {
      'type-check:config': { command: 'tsc -p tsconfig.node.json --noEmit' },
      verify: {
        command: ['vp run type-check', 'vp run test', 'vp run stylelint', 'vp run check'],
        cache: false,
      },
    },
  },
})
