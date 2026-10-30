import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: { plugins: ['eslint', 'typescript', 'vue'], categories: { correctness: 'error' } },
  fmt: { singleQuote: true, semi: false, ignorePatterns: ['**/dist/**', 'pnpm-lock.yaml'] },
})
