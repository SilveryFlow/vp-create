# 版本与交付

默认是私有应用工作区，不发布 npm 包、不自动部署。应用与共享库各自维护 package.json version；工作区根版本只是工程标识。

共享包或应用发生用户可见功能、修复或不兼容变更时，用 vp run changeset 记录对应包和变更级别。纯文档与不影响产物的工程维护无需虚构包版本。提交时只提交 changeset 文件；维护者合并后运行 release:version，审查版本与 CHANGELOG，提交版本更新后再构建。release:tag 由维护者显式执行，不在 CI 自动打标签。

运行 vp run release:archive 会先按任务图构建，检查所有包 exports 的 JS、声明、CSS 或源码配置入口存在，再为每个应用归档 dist。结果位于 .artifacts/delivery：应用名-版本.tgz、manifest.json 和 SHA256SUMS。manifest 包含提交 SHA、各包版本和每个应用归档哈希；无 Git 的本地生成工程明确记录 unknown，不伪造来源。

归档脚本会解包到系统临时目录并核对全部文件的路径与哈希。文件 SHA-256 用于检验传输完整性，不是来源签名。发布前运行 build、verify、test:e2e、artifacts:check，并确认提交 SHA、版本和工作区状态。解包 tgz 到静态服务器根目录，使用 history 路由的服务须配置回退到 index.html；Nginx、Docker 与现场配置按部署环境另行维护。

GitHub CI 上传构建归档用于下载和验收，不等于生产发布。
