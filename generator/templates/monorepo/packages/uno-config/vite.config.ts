import { defineConfig } from 'vite-plus'
export default defineConfig({ run: { tasks: { 'type-check': { command: 'tsc --noEmit' } } } })
