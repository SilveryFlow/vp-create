# 新建共享包

## TypeScript 库

参考 packages/utils。新建 packages/名称/package.json，使用唯一 name、version、private: true、type: module、files: ["dist"]，将 exports 的 types 指向 dist/index.d.mts、default 指向 dist/index.mjs。devDependencies 声明 @starter/vite-config: workspace:*、vite-plus: catalog:、typescript: catalog:。

入口放 src/index.ts，测试放 src/**tests**/_.test.ts。vite.config.ts 导入 @starter/vite-config/ts-library 的 createTsLibraryConfig 并导出其调用结果；tsconfig 继承 ../../tsconfig.base.json，包含 src/\*\*/_.ts 与 vite.config.ts。

## Vue 组件库

参考 packages/ui。公开入口提供 dist/index.js、dist/types/index.d.ts，保留 CSS sideEffects 和 style.css 出口；Vue 声明为 peerDependency。配置通过 createVueLibraryConfig(packageRoot) 复用 JS/CSS 构建与声明生成。测试需要 jsdom、@vue/test-utils、vue-tsc，以及 @vue/tsconfig。

如果应用需要扫描库里的 UnoCSS 类名，额外公开 ./uno-source: ./src/index.ts，再由应用的 unoSourcePackages 显式填写包名；没有扫描需求就不加。应用消费运行时公开入口，不从私有 src 导入。

## 接入清单

1. 第三方共享版本先加入根 catalog，使用包再声明 catalog:；内部依赖用 workspace:*。
2. 把新包 tsconfig 加到根 tsconfig.json 的 references。
3. 在消费者 package.json 声明依赖，安装更新锁文件。
4. 执行 vp run build:dependencies、vp run 新包名#type-check、vp run 新包名#test、vp run verify。
5. 需要版本记录时新增 changeset；不要复制 node_modules、dist 或本地配置。

根 check 构建 packages/* 中的库，不依赖某个示例应用名称。包任务的 dependsOn 决定其构建拓扑；源码配置包没有无意义的 build 任务。
