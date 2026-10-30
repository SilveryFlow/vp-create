import { fileURLToPath } from 'node:url'
import { createVueLibraryConfig } from '@starter/vite-config/vue-library'
export default createVueLibraryConfig(fileURLToPath(new URL('.', import.meta.url)), {
  test: { environment: 'jsdom' },
  run: { tasks: { test: { command: 'vp test run', dependsOn: ['build'] } } },
})
