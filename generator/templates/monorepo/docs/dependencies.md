# 依赖维护

生成工程独立启用 Dependabot，分别更新本工程的 npm 清单与 GitHub Actions；创建器自己的更新配置不会替代它。

安装使用锁定的 pnpm 11.17.0，CI 使用 frozen-lockfile。strictDepBuilds 保持开启；当前 allowBuilds 为空，因为已核实的安装没有待批准生命周期脚本。添加依赖后运行 vp run deps:approve，只批准已审核且确有必要的包，提交 pnpm-workspace.yaml 与对应锁文件；不要放开所有脚本或照搬业务项目白名单。

vp run deps:outdated 查看版本差异，vp run audit 执行审计。镜像 registry 若未实现审计接口，命令失败不代表无漏洞，可运行 vp run audit:official 使用官方接口复查，不需修改全局 registry。保存审计原始 JSON，区分生产依赖、开发工具和网络失败，不把退出码非零全部视为漏洞。

更新顺序：检查公告与兼容性，更新相关 catalog 和锁文件，冻结安装，build、verify、双应用 test:e2e，再提交。VP 和其 vite 别名必须一起评估；只添加有明确来源与影响说明的 overrides/patches。

本次官方接口审计发现 4 条 high 告警（ini、dot-prop、ansi-regex 的两个受影响主版本分支），依赖链涉及提交工具、样式和测试工具。已按实际版本范围设置同主版本 overrides，不沿用机房业务清单。官方接口入口为 vp run audit:official；原始 JSON 不提交到源码。
