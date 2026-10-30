import { buildCache, dependencyBuilds } from './internal/tasks.ts'

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, lazyPlugins, mergeConfig, type UserConfig } from 'vite-plus'

/** Vue 库统一任务；具有项目引用的库仅覆盖类型检查命令。 */
export const vueLibraryTasks: NonNullable<NonNullable<UserConfig['run']>['tasks']> = {
  dev: {
    command: 'vp build --watch --emptyOutDir false',
    cache: false,
  },
  // 仅在联调公开类型时显式启动，避免每个 Vue 包都常驻一个类型构建进程。
  'dev:types': {
    command: 'vp pack --watch --no-clean',
    cache: false,
  },
  // 集中监听复用有限任务，不清理应用正在读取的输出目录。
  'build:dev': {
    command: 'vp build --emptyOutDir false && vp pack --no-clean',
    cache: buildCache,
    dependsOn: [{ task: 'build:dev', from: ['dependencies', 'devDependencies'] }],
  },
  build: {
    command: 'vp build && vp pack',
    cache: buildCache,
    dependsOn: [{ task: 'build', from: ['dependencies', 'devDependencies'] }],
  },
  'test:watch': { command: 'vp test', cache: false },
  'type-check': {
    command: 'vue-tsc --noEmit',
    cache: true,
    dependsOn: dependencyBuilds,
  },
}

/** Vue 组件库共用构建、样式引用和声明任务；差异使用原生配置合并。 */
export function createVueLibraryConfig(root: string, overrides: UserConfig = {}) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  }
  const externalPackages = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies })
  const defaults = defineConfig({
    root,

    plugins: lazyPlugins(async () => {
      const [{ default: vue }, { libInjectCss }] = await Promise.all([
        import('@vitejs/plugin-vue'),
        import('vite-plugin-lib-inject-css'),
      ])
      return [vue(), libInjectCss()]
    }),
    test: { fsModuleCachePath: 'node_modules/.vite/vitest-modules' },
    pack: {
      report: { summary: true, gzip: false },
      entry: { index: resolve(root, 'src/index.ts') },
      platform: 'neutral',
      format: ['esm'],
      tsconfig: resolve(root, 'tsconfig.json'),
      outDir: resolve(root, 'dist/types'),
      deps: { neverBundle: externalPackages },
      dts: { vue: true, emitDtsOnly: true, compilerOptions: { noCheck: false } },
      clean: true,
    },
    build: {
      reportCompressedSize: false,
      cssCodeSplit: true,
      lib: {
        entry: resolve(root, 'src/index.ts'),
        formats: ['es'],
        fileName: 'index',
        cssFileName: 'style',
      },
      rolldownOptions: {
        external: (id: string) =>
          externalPackages.some(name => id === name || id.startsWith(`${name}/`)),
      },
    },
    run: { tasks: vueLibraryTasks },
  })
  return mergeConfig(defaults, overrides)
}
