# 开发约定

使用 Vue3 Composition API、script setup 和 TypeScript；新增注释与测试说明使用中文。修改前阅读对应包清单和配置。

模板只有一份源码，按 package exports 引用公共 API，不跨包访问私有 src。配置共享放 vite-config/uno-config，应用差异放 app。版本放 catalog，内部依赖使用 workspace:*。

构建和检查从根用 vp run 执行。提交前运行 vp run build 和 vp run verify；影响界面时再运行 test:e2e。GitHub CI 未实际运行时不得声称远程通过。
