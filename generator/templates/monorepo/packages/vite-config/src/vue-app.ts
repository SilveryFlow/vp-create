import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { lazyPlugins, loadEnv, mergeConfig, type ConfigEnv, type UserConfig } from 'vite-plus'
import unoConfig from '@starter/uno-config'
import { buildCache, dependencyBuilds } from './internal/tasks.ts'

/** 应用共用插件与任务；只由应用声明自己的差异。 */
export function createVueAppConfig(root: string, env: ConfigEnv, overrides: UserConfig = {}) {
  const variables = loadEnv(env.mode, root)
  const requireFromApp = createRequire(resolve(root, 'package.json'))
  const uiSource = dirname(requireFromApp.resolve('@starter/ui/uno-source'))
  return mergeConfig(
    {
      root,
      envDir: root,
      resolve: { alias: { '@': resolve(root, 'src') }, dedupe: ['vue', 'pinia', 'vue-router'] },
      plugins: lazyPlugins(async () => {
        const [
          { default: vue },
          { default: UnoCSS },
          { default: Components },
          { ElementPlusResolver },
        ] = await Promise.all([
          import('@vitejs/plugin-vue'),
          import('unocss/vite'),
          import('unplugin-vue-components/vite'),
          import('unplugin-vue-components/resolvers'),
        ])
        return [
          vue(),
          Components({
            dts: resolve(root, 'src/components.d.ts'),
            resolvers: [ElementPlusResolver()],
          }),
          UnoCSS({
            inspector: false,
            ...unoConfig,
            content: {
              filesystem: [
                resolve(root, 'src/**/*.{vue,ts}'),
                resolve(uiSource, '**/*.{vue,ts}'),
              ].map(file => file.replaceAll('\\', '/')),
            },
          }),
        ]
      }),
      server: {
        host: '127.0.0.1',
        port: Number(variables.VITE_PORT) || 5173,
        strictPort: true,
        open: false,
        proxy: variables.VITE_API_TARGET
          ? { '/api': { target: variables.VITE_API_TARGET, changeOrigin: true } }
          : {},
      },
      test: { environment: 'jsdom', include: ['src/**/__tests__/*.test.ts'], maxWorkers: 2 },
      run: {
        tasks: {
          dev: { command: 'vp dev', cache: false },
          preview: { command: 'vp preview', cache: false },
          build: {
            command: 'vp build',
            cache: buildCache,
            dependsOn: [{ task: 'build', from: ['dependencies', 'devDependencies'] }],
          },
          'type-check': { command: 'vue-tsc --noEmit', dependsOn: dependencyBuilds },
          test: { command: 'vp test run', dependsOn: dependencyBuilds },
          'test:watch': { command: 'vp test', cache: false },
        },
      },
    },
    overrides,
  )
}
