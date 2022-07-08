# hfs-dump-class

一款利用好分数弱智 bug 进行全班成绩粗略计算的工具。

## 使用方法

1. 确保你拥有 Nodejs 环境，且 Node 包管理器正常
2. Clone 这个仓库
3. 在仓库根目录下运行 `npm install` 安装依赖包
4. 运行 `node index.js`，根据提示进行操作即可

## 原理

hfs 到现在都还有一个极其弱智的 bug 没有修，就是你可以直接向服务器发送负数个卡券购买数量来刷分（针灸 UI 验证数据合法性？），本工具利用了这个 bug，并结合了 `成绩 PK` 功能中的进度条的值来大致估算全班的成绩。

因为是估算的，所以除账号持有人之外的分数有偏差是正常的。并且如果有人比较留心眼关掉了允许 PK 成绩的话，那么是不能估算 TA 的成绩的。