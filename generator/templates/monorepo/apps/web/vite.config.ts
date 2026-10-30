import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite-plus'
import { createVueAppConfig } from '@starter/vite-config/vue-app'
const root = fileURLToPath(new URL('.', import.meta.url))
export default defineConfig(env =>
  createVueAppConfig(root, env, { unoSourcePackages: ['@starter/ui'] }),
)
