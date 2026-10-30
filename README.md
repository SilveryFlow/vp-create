# Vite+ 工程创建器

Vue3 TS 和 VP monorepo 模板直接包含在创建器中，每种模板只有一份源码。修改 templates 下的文件后，下一次 vp create 会立即使用修改后的模板，无需同步或复制副本。

目录：

```text
tools/vp-create/
├─ package.json、pnpm-workspace.yaml、vite.config.ts  # 本地 VP 入口
└─ generator/
   ├─ bin/create.mjs                 # 创建工程、检查目标目录、过滤开发产物
   └─ templates/
      ├─ vue3-ts/                    # Vue3 + TypeScript 单页模板唯一源码
      └─ monorepo/                   # VP monorepo 模板唯一源码
```

模板总目录中的 vue3/vue3-starter 和 monorepo/turborepo-starter 是原有模板，保持独立。原 vue3/vue3-ts-starter 和新建的 monorepo/vp-monorepo-starter 已移动到上述 templates 目录；原工程 Git 历史及本地改动随目录保留。

## 创建工程

需要 Node.js >=22.18、全局 vp（验证版本 1.4.0）。首次在创建器目录运行 vp install。

```powershell
cd D:/Code/Learn/template/tools/vp-create
vp install
vp create starter --no-interactive --no-agent --no-editor --no-hooks -- --template vue3-ts --directory D:/Code/Learn/my-app
vp create starter --no-interactive --no-agent --no-editor --no-hooks -- --template monorepo --directory D:/Code/Learn/my-workspace

cd D:/Code/Learn/my-app
vp install
vp run dev
```

目标目录必须为空或不存在。创建器读取内置 templates，复制工程文件并设置根包名；过滤 Git 历史、node_modules、dist、缓存和本地覆盖配置。创建出的工程独立运行，不依赖创建器。模板 .env 默认配置保留，使用前按项目检查代理地址。

## 维护模板

直接在 generator/templates/vue3-ts 或 generator/templates/monorepo 中编辑、安装依赖、构建与验证。两份模板各有自己的 package.json 和 pnpm-workspace.yaml，未加入创建器工作区；生成时不会携带原地开发的依赖与构建产物。

创建器只维护生成逻辑，模板目录维护工程内容。没有快照、同步脚本或第二份模板源码。尚未发布 npm 包或推送远程仓库。
