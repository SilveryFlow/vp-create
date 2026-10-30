# Vite+ Vue 工程创建器

创建 Vue3 + TypeScript 单页应用或 Vite+ monorepo。两套模板直接维护在 generator/templates，每种模板只有一份源码。

## 开始使用

开发环境固定为 Node.js 24.22.1、Vite+ 1.4.0、pnpm 11.17.0。安装全局 vp 后，在仓库根目录执行：

```powershell
vp install --frozen-lockfile
vp create starter --no-interactive --no-agent --no-editor --no-hooks -- --template vue3-ts --directory D:/Code/Learn/my-app
vp create starter --no-interactive --no-agent --no-editor --no-hooks -- --template monorepo --directory D:/Code/Learn/my-workspace
```

这两个命令创建工程；进入对应工程后执行 vp install 和 vp run dev。目标目录必须为空或不存在，不能与内置模板目录重叠。

## 目录职责

```text
generator/
  bin/create.mjs       CLI 参数、帮助与退出状态
  src/create.mjs       工程创建和文件过滤
  templates/vue3-ts/   单页模板唯一源码
  templates/monorepo/  工作区模板唯一源码
tests/                生成行为和 CLI 测试
scripts/pack.mjs      清理开发产物并构建 tgz
scripts/smoke.mjs     从 tgz 创建真实工程并验证
.github/workflows/    GitHub Actions
```

模板不加入创建器的 pnpm 工作区，各自维护依赖与锁文件。模板验证从压缩包生成到独立临时目录，避免父工作区的工具配置影响结果。修改模板会立即影响下次创建。生成器过滤 Git 元数据、依赖、构建产物、缓存和 *.local；保留默认 .env 配置。生成工程不依赖创建器。

## 本地质量检查

| 命令                         | 用途                                       |
| ---------------------------- | ------------------------------------------ |
| vp run check                 | Oxlint、格式、严格 JS 类型检查和生成器测试 |
| vp run format                | 格式化创建器源码和配置                     |
| vp run test:watch            | 持续运行生成器测试                         |
| vp run build                 | 生成 .artifacts/create-vp-starter.tgz      |
| vp run test:package          | 从压缩包验证两套模板                       |
| vp run test:package vue3-ts  | 只验证单页模板                             |
| vp run test:package monorepo | 只验证工作区模板                           |
| vp run ci                    | 完整执行上述本地 CI 流程                   |

打包验证会在系统临时目录解包，创建工程，冻结安装依赖，并执行 build、type-check、lint、test、format:check；结束后清理临时目录。打包文件是自动生成产物，不是需要维护的模板副本。锁文件和 .gitignore 在打包目录临时换名，生成时恢复，避开 npm 的默认排除规则。

创建器格式检查不跨入模板；模板格式与检查规则由各模板维护，打包验证单独执行。单页模板目前没有业务测试，test 允许空测试集；创建器的行为测试独立运行，不会把空测试集当作创建器测试成功。

## 提交与 CI

vp install 的 prepare 安装 Vite+ Git hooks：pre-commit 执行 vp run check；commit-msg 用 commitlint 校验 Conventional Commits。示例：feat(generator): 支持新的模板选项。不要把私密配置写入模板默认环境文件。

GitHub Actions 在 main 推送、PR 和手动触发时运行：

- Windows/Linux 检查创建器并打包，上传 tgz 产物。
- Windows/Linux 分别验证单页和 monorepo 压缩包生成的工程。
- 使用锁文件冻结安装，工作流只申请 contents: read 权限。

本地 Windows 验证与 GitHub 上的实际运行是两个结果；推送到 GitHub 后才能确认远程 CI。当前未配置自动发布、仓库地址或 npm scope。Dependabot 每周检查 Actions 和三套独立依赖清单。

原 Vue3 模板历史仅保存在本机 .git/legacy-vue3-ts.git，不属于创建器发布包，也不会随克隆分发。
