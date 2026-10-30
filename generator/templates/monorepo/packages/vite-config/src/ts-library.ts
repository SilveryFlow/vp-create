import { buildCache } from './internal/tasks.ts'
import { defineConfig } from 'vite-plus'

interface TsLibraryOptions {
  /** 多入口库显式列出公开构建入口。 */
  entry?: string[]
  /** 涉及浏览器 API 的测试使用 jsdom。 */
  environment?: 'node' | 'jsdom'
}

/** TypeScript 库共用构建、声明、监听和任务约定。 */
export function createTsLibraryConfig(options: TsLibraryOptions = {}) {
  return defineConfig({
    test: {
      fsModuleCachePath: 'node_modules/.vite/vitest-modules',
      environment: options.environment ?? 'node',
      maxWorkers: 4,
    },
    pack: {
      report: { summary: true, gzip: false },
      // 保留当前依赖子路径解析行为，避免配置收敛改变产物。
      deps: { resolveDepSubpath: true },
      entry: options.entry ?? ['src/index.ts'],
      format: ['esm'],
      dts: true,
      clean: true,
    },
    run: {
      tasks: {
        dev: { command: 'vp pack --watch --no-clean', cache: false },
        'type-check': {
          command: 'tsc --noEmit',
          cache: true,
          dependsOn: [{ task: 'build', from: ['dependencies', 'devDependencies'] }],
        },
        'test:watch': { command: 'vp test', cache: false },
        test: {
          command: 'vp test run',
          cache: true,
          dependsOn: [{ task: 'build', from: ['dependencies', 'devDependencies'] }],
        },
        // 集中监听使用有限构建任务，保留正在被 app 引用的产物。
        'build:dev': {
          command: 'vp pack --no-clean',
          cache: buildCache,
          dependsOn: [{ task: 'build:dev', from: ['dependencies', 'devDependencies'] }],
        },
        build: {
          command: 'vp pack',
          cache: buildCache,
          dependsOn: [{ task: 'build', from: ['dependencies', 'devDependencies'] }],
        },
      },
    },
  })
}
