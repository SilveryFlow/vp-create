# Vue3 + Vite+ Monorepo

从机房产品成熟工程提取通用结构：catalog 统一版本、workspace 包边界、构建产物消费、共享 Vite/UnoCSS 配置、依赖任务图、质量检查与版本记录。模板不包含站点、登录权限、UE、视频、Three.js 或现场部署配置。

## 开发

需要 Node.js 24.22.1、Vite+ 1.4.0、pnpm 11.17.0。

```powershell
vp install --frozen-lockfile
vp run dev
vp run admin:dev
vp run dev:shared
```

web 端口 5173，admin 端口 5174。dev 与 admin:dev 会先构建选中应用的依赖，再启动该应用；dev:shared 会先构建，然后同时监听 UI、工具库和 web。不要同时运行多个写入同一共享库的监听进程。

## 目录

- apps/web、apps/admin：应用入口、路由、Pinia 和页面。
- packages/ui：共享 Vue 组件，vp build 生成 JS/CSS，vp pack 生成公开声明。
- packages/utils：框架无关工具库，vp pack 生成 JS 和声明。
- packages/vite-config：应用、Vue 库、TS 库的插件和任务约定；源码直接导出。
- packages/uno-config：公共 UnoCSS 预设；源码直接导出。
- e2e：构建后启动预览，验证页面操作与路由。
- docs：包边界和新建应用说明。

## 验证

```powershell
vp run build
vp run verify
vp exec playwright install chromium
vp run test:e2e
```

verify 顺序执行类型、单元测试、Stylelint、Oxlint 和格式检查。共享库通过 exports 公开 dist，禁止从别的包私有 src 导入。UI 的 uno-source 是显式公开的扫描入口，不用于运行时源码引用。bare vp build 不执行依赖图，日常构建使用 vp run build。

## 工程检查与提交链路

| 能力     | 入口                                | 规则与触发位置                                                            |
| -------- | ----------------------------------- | ------------------------------------------------------------------------- |
| 代码检查 | vp run lint / lint:fix              | 根 vite.config.ts 的 Oxlint、TS 类型感知、Vue、Vitest 和 VP 导入规则      |
| 格式     | vp run format / format:check        | 根 fmt；包含 TS、Vue、CSS、SCSS、HTML、JSON、YAML、Markdown               |
| 样式     | vp run stylelint / stylelint:fix    | 根 stylelint.config.mjs；Vue、CSS、SCSS                                   |
| 类型     | vp run type-check                   | 根配置用 tsc，TS 包用 tsc，Vue 包和应用用 vue-tsc；声明消费按依赖图先构建 |
| 暂存检查 | vp run staged                       | 根 staged；脚本类全局 lint，暂存文件格式检查和样式检查                    |
| Hooks    | vp run hooks:status / hooks:install | prepare 自动配置；pre-commit、commit-msg、pre-push 三个脚本               |
| 提交     | vp run commit                       | Commitizen + cz-git 中文交互；commitlint 校验类型、范围和说明             |
| 单测     | vp run test / test:watch            | 工具库、共享 Vue 组件和两个应用的状态测试                                 |
| 浏览器   | vp run test:e2e                     | 构建预览下的按钮操作、路由切换和刷新                                      |
| 总检查   | vp run verify                       | 类型、测试、样式、vp check 顺序执行                                       |

生成器默认不初始化 Git。需要提交时，先 git init，再 vp install；prepare 会安装 VP hooks。已经安装依赖后才 git init 的工程，手动执行 vp run hooks:install。只有本地安装过 hooks 的克隆才会触发；CI 独立执行 verify。

pre-commit 先 staged（vp check），再检查全工作区类型；不会在每次提交时运行全量测试。commit-msg 拦截不规范信息；pre-push 执行完整 verify（含测试）。所有检查都采用拒绝错误的方式，不会静默修改暂存代码。

vp run verify:hooks 仅用于**临时生成、尚未初始化 Git 的验证工程**：它会初始化本地 Git 并制造合法与错误提交，检查 lint、格式、样式、类型、提交信息和测试是否生效。不要在自己的业务工程中运行。创建器压缩包回归会自动运行它。

vp run changeset 记录版本变化，vp run release:version 更新版本；包默认私有，未配置自动发布。

根 .github/workflows/ci.yml 冻结安装、构建、verify 和浏览器验证。代理通过应用 .env.local 的 VITE_API_TARGET 显式设置，默认不连接任何后端。

模板唯一源码位于创建器内；创建方式见创建器 README。

## VP 检查边界

check 使用 VP 原生 Oxfmt 和 Oxlint，不安装独立 ESLint。包的公开入口由 package.json 的 exports 定义，不额外维护自定义跨包边界插件。

当前 VP 1.4.0 的 TS-Go 会对 Vue SFC 导入报告 TS2307，因此显式保留 typeAware，关闭 typeCheck；完整 TS/Vue 类型由 type-check 和 vue-tsc 负责，不添加宽泛 Vue 模块声明。JS 插件当前不支持 Vue 自定义解析器，不能把 Vue 脚本规则描述成完整模板 lint。

check 只先构建依赖库；应用 type-check 和 test 同样只构建依赖，不强制应用自身打包。verify 顺序执行 type-check、test、stylelint、check。staged 使用无文件参数的 vp check 统一检查，避免 Windows 命令长度限制，保持 format/lint 同一入口。

构建缓存保留自动读写追踪并显式保留生成的 components.d.ts。删除产物后的缓存命中、恢复及修改源文件失效应一起验证，不能只以构建退出码判断缓存正确。

## Vitest 配置位置

测试配置统一放在 Vite+ 配置的 test 字段，不另建 vitest.config.ts。测试 API 从 vite-plus/test 导入。

| 测试对象       | 配置位置                                                                  | 环境与入口                                       |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| web/admin 应用 | packages/vite-config/src/vue-app.ts，由 apps/*/vite.config.ts 调用        | jsdom；src/**/**tests**/*.test.ts；maxWorkers: 2 |
| UI 组件        | packages/ui/vite.config.ts，合并 packages/vite-config/src/vue-library.ts  | jsdom；运行组件点击和禁用行为测试                |
| 工具库         | packages/utils/vite.config.ts 调用 packages/vite-config/src/ts-library.ts | 默认 node，可通过 environment 参数改为 jsdom     |

根 vp run test 按任务图执行各包 vp test run。vp run test:watch 启动各测试包的持续监听；指定单包可运行 vp run @starter/ui#test 或 vp run @starter/utils#test。Playwright 配置位于根 playwright.config.ts，与 Vitest 单测分开运行。
