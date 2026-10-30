import type { App, Directive } from 'vue'

type DirectiveModule = {
  default?: Directive
} & Record<string, Directive | undefined>

// 自动扫描当前目录下所有指令文件并立即导入
const modules: Record<string, DirectiveModule> = import.meta.glob('./*.ts', { eager: true })

export default {
  install(app: App) {
    for (const [path, module] of Object.entries(modules)) {
      if (path.includes('index.ts')) continue // 跳过 index.ts

      // 指令名取文件名去掉后缀
      const fileName = path.split('/').pop()
      if (!fileName) continue
      const name = fileName.replace('.ts', '')
      // 支持默认导出或命名导出 vName 或 name
      const directive = module.default ?? module[`v${capitalize(name)}`] ?? module[name]

      if (!directive) continue

      app.directive(name, directive)
    }
  },
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
