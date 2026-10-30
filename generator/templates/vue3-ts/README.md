# Vue3 + TypeScript + Vite+ 单页应用模板

保留 Vue Router、Pinia、Element Plus、UnoCSS、自动导入、SCSS、ECharts 和工具函数。Vite+ 统一开发、构建、测试、Oxlint 和 Oxfmt；ESLint 补充 Vue 和 UnoCSS 规则。

需要 Node.js >=22.18 和全局 vp（验证版本 1.4.0），使用 pnpm 11.17.0。

```powershell
vp install
vp dev
vp run build
vp run type-check
vp run lint
vp run test
vp run format:check
```

测试配置位于 vite.config.ts；.oxlintrc.json 和 .oxfmtrc.json 分别维护检查与格式规则。单页模板目前无业务测试，因此允许空测试集。

本目录是创建器内置模板的唯一源码。创建命令见 ../../../../README.md。已有 .env 配置保留，使用前按项目检查代理地址。
