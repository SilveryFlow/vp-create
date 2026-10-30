# 新建应用

复制 apps/web 到 apps/新名称，修改 package.json 的 name、.env 的标题与独立端口、页面及根开发命令。保留 workspace 依赖和共享 createVueAppConfig，不复制 node_modules、dist 或 .env.local。

运行 vp install 更新锁文件，再运行 vp run --filter @starter/新名称^... build 和 vp run @starter/新名称#dev。后端代理只通过 VITE_API_TARGET 配置，不把服务地址硬编码进公共 Vite 配置。

应用业务不同后按各自功能组织 views 和模块组件，保持 App.vue 为薄入口；示例 Pinia 用于跨路由状态，单页局部状态不必移入 store。
