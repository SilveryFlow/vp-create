# 参与维护

使用 .node-version 中的 Node.js 版本和 package.json 固定的包管理器，运行 vp install --frozen-lockfile。

修改生成器后运行 vp run check。修改文件过滤、打包逻辑或模板后，再运行 vp run build 和 vp run test:package。新增模板时同时补充选择列表、打包验证矩阵和文档；不要维护额外的模板副本。

测试说明与新增代码注释使用中文。生成器测试应覆盖用户能看到的行为，例如目录覆盖保护、默认配置保留、开发文件过滤和失败退出，不需要断言内部实现结构。

提交使用 Conventional Commits，说明可使用中文。Git hooks 是本地反馈，GitHub CI 是独立验证。涉及依赖更新，更新对应锁文件并确认 frozen-lockfile 安装通过。

发布前检查 tgz：内含 bin、src、模板和必要配置，不含 node_modules、构建目录、Git 元数据或私密环境文件。确定 npm 包名、许可证及仓库地址后，再单独配置发布流程。
