# 包边界与构建约定

实现放 src，测试放 src/**/**tests**，包详细文档放 docs。包根仅保留清单、README 和工程配置。应用负责页面与环境，ui 不依赖路由或业务状态，utils 不依赖 Vue。配置包可以直接提供源码 exports，业务库对外提供 dist。

依赖使用 workspace:*，共享第三方版本使用 catalog:。新增依赖先更新根 catalog，再在使用它的包中声明，不依赖根目录的隐式提升。

依赖图：web/admin -> ui、utils；各工作区包 -> vite-config -> uno-config。类型与测试依赖对应构建任务；build 输出 dist，开发 watch 不清空已有产物。

修改 UI 后使用 dev:shared 监听 JS/CSS，只有调试公开类型时额外运行 vp run @starter/ui#dev:types。新增库可复用 createVueLibraryConfig 或 createTsLibraryConfig，保证 exports 指向实际构建产物。
