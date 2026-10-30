import { defineConfig } from 'vite-plus'
export default defineConfig({ create: { templates: [{ name: 'starter', description: 'Vue3 TS 单页或 VP Monorepo', template: './generator' }] } })
