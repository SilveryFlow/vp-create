import { defineConfig } from 'vite-plus'

export default defineConfig({
  create: {
    templates: [
      { name: 'starter', description: 'Vue3 TS 单页或 VP Monorepo', template: './generator' },
    ],
  },
  test: { include: ['tests/**/*.test.mjs'], environment: 'node' },
  lint: {
    plugins: ['eslint', 'typescript', 'unicorn', 'oxc'],
    categories: { correctness: 'error' },
    env: { node: true },
    ignorePatterns: ['generator/templates/**', '.artifacts/**'],
  },
  fmt: {
    singleQuote: true,
    semi: false,
    printWidth: 100,
    ignorePatterns: ['generator/templates/**', '.artifacts/**', 'pnpm-lock.yaml'],
  },
  staged: { '*.{mjs,cjs,ts,json,md,yaml,yml}': 'vp fmt --check' },
})
