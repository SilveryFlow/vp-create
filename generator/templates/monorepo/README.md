# Vite+ Vue3 Monorepo 模板

apps/web 为 Vue 单页应用；packages/ui 为共享 Vue 组件；packages/utils 为纯 TypeScript 工具；packages/config 提供共享 Vite 配置。

共享包以源码导出，应用构建直接编译，无需提前构建共享包。私有包默认不发布；如需对外发布库，另加 vp pack、类型声明和 exports 产物入口。

```powershell
vp install
vp run dev
vp run build
vp run type-check
vp run test
vp run lint
vp run format:check
```

使用 Node.js >=22.18、vp 1.4.0 和 pnpm 11.17.0。任务由 vp run 管理，无 Turbo 依赖。本目录是创建器内置模板的唯一源码。创建命令见 ../../../../README.md。
