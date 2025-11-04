可复用流程: Git 强制覆盖远端 main
- 初始化仓库并创建 main 分支
- 绑定/更新 origin 到目标仓库
- 全量快照提交，信息含时间戳
- 先执行 push --dry-run -f 作为试推
- 再执行 push -f 完成强推
- 以 ls-remote 与本地 log 校验结果