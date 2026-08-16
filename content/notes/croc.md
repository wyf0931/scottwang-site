---
title: "croc：两个设备，一个口令，文件就到了"
description: "39,000 颗 Star 的文件传输工具。真正漂亮的地方不是传文件，而是把 relay、PAKE、端到端加密装进两条命令。"
date: "2026-08-17"
type: "notes"
kind: "note"
tags:
  - 工具
  - 网络安全
  - 文件传输
  - Go
---

**croc** 是一个由 schollz 维护的命令行文件传输工具，[GitHub 仓库](https://github.com/schollz/croc) 目前已经拿到约 39,823 颗 Star，开源协议 MIT。项目 2017 年 10 月开源，到 2026 年已经走了快 9 年，最新版本是 2026 年 8 月 15 日发布的 v11.1.1。它做的事情看起来简单，两个设备，一个口令，文件就到了，但把它能做到这个体验背后的设计摊开看，会发现它承载了一整套扎实的网络和加密工程。

前面几篇笔记写的都是 Agent 项目，那些项目大抵是下面一层很轻，上面一层很重，Prompt 和框架包装得很多。croc 是反过来的，下面承载的东西很重，包括网络协议、密码学、relay server、跨平台和 WebAssembly，上面故意做得很轻，用户最终只需要两条命令。这种复杂性下沉到系统设计的做法，是它值得单独写一注的原因。

## 它想解决什么

在两台设备之间跨互联网安全地传文件，常见的三条路各有各的不舒服。SCP 和 rsync 要求有一台有公网 IP 或者开了内网穿透，普通设备在 NAT 后面根本走不通。网盘要先把文件完整上传到云存储，再在另一头下载，速度受网盘带宽限制，还带着隐私顾虑。AirDrop 体验最好，但它被锁在苹果生态里，跨平台用不了。

croc 想做到的是 AirDrop 级的体验，跨平台，并且不需要任何一方有公网 IP。它把需要用户去理解的网络、端口、服务器和密钥交换的问题，全部压成了两条命令。复杂的问题并没有消失，只是被好的系统设计藏起来了。

## 三个核心设计

croc 的核心由三件事组成，relay、PAKE 和端到端加密。三件事分开理解，每一件事负责一个不同的问题。

Relay 负责解决怎么找到彼此。两台设备都在 NAT 后面，互联网按私有 IP 找不到对方。croc 让发送方和接收方都主动去连一个公网 relay 服务器，双方都不需要开放公网端口。这里的关键在于，relay 只负责建立连接和转发数据，不理解文件内容，也不保存文件。它和普通网盘把文件完整上传到云存储的机制根本不同。

PAKE 负责解决短口令怎么安全地建立共享密钥。croc 给出的口令像 `purple-tiger-alaska`，只有三个词，本身强度很低，如果直接当 AES 密码用，被截获以后暴力猜口令成本很低。PAKE 的作用是让双方证明彼此知道同一个秘密，并在此基础上协商出一个强的 session key。这个机制的价值在于，即使攻击者拿到了通信信息，也无法高效地离线暴力猜测口令，因为 PAKE 协议在密钥交换过程中做了防离线字典攻击的设计。

项目作者单独维护了 Go 实现的 PAKE 库 [schollz/pake](https://github.com/schollz/pake)，协议源于 Boneh 和 Shoup 写的密码学教材里的 PAKE2 协议。这不是 README 里编出来的架构名字，是确实落在代码里的密码学实现。

端到端加密负责让 relay 看不到文件。Session key 协商完成后，文件以加密块的形式通过 relay 传输，接收方在本地用 session key 解密。再叠加哈希校验做完整性验证，传输过程中数据被篡改的话可以立刻发现。

把三件事放在一起看，relay 负责连接，PAKE 负责建立信任，加密层负责保护数据。三条职责清晰分开，是这套设计能同时做到简单和安全的关键。

## 完整工作流程

Sender 端跑 `croc send file.zip`，工具生成了一个 code phrase，比如 `purple-tiger-alaska`。Sender 接着向 relay 注册，告诉 relay 它在等待这个 code 对应的 peer。Receiver 端跑 `croc purple-tiger-alaska`，也去连同一个 relay，向它找同一间 room。relay 把两边对接上，双方通过 relay 建立 channel。接下来跑 PAKE 协商 session key。session key 就绪后，文件以 E2E 加密的形式传输。最后做哈希完整性验证，全部走完，文件到达。

## 工程复杂度

croc 已经处理了很多真实工程问题，包括文件夹、多文件、断点续传、哈希校验、代理和 Tor、IPv6 和 IPv4、stdin 和 stdout 管道、纯文本、二维码、自建 relay、Docker relay、Web 客户端、Android 和 Desktop 社区客户端。这些不是 README 里堆出来的功能清单，是 9 年迭代磨出来的工程复杂度。

它很典型地继承了 Unix 工具的传统用法。`cat database.dump | croc send` 可以把任意程序输出通过管道喂给 croc，另一边再接上 `croc ... | gzip` 之类的下游程序。这意味着任意程序输出可以通过 croc 走一遍互联网再回到另一个程序输入，这种 pipe 友好的设计让它的可组合性高了很多。

v11 新增了 `croc send --store` 模式。经典 croc 要求发送方和接收方同时在线，send 端不退出，receiver 端连上来才能传。`--store` 允许发送方本地加密成 Encrypted Blob，上传到 relay 的临时存储，然后下线。接收方稍后上线，从 relay 下载密文，在自己本地解密。这里有一个漂亮的 Web 安全设计，URL 长这样，`https://host/s/ID#decryption-key`，井号后面的 fragment 不会被浏览器发往 HTTP 服务器，所以服务器只拿到 ID，拿不到解密 key。这是一个很小但很正确的 Web 安全细节。

## 安全工程细节

croc 在安全工程上还有更细的考量。Linux 和 macOS 下 secret 推荐使用环境变量 `CROC_SECRET=xxx croc`，而不是直接把口令当命令行参数 `croc xxx` 传。原因是命令行的参数会被写进进程名和进程列表里，`ps aux` 就能翻到，等于 secret 暴露在系统上。用一个环境变量，secret 就不会出现在进程名里。

安全不是一个清单式的判断，把 AES、PAKE、SHA 勾完就说安全了。真正的攻击面要把密码学、协议、网络、命令行、进程环境、剪贴板、日志、relay 和存储全部一起看。任何一层泄漏了 secret，都可能破坏整个设计。

## 也要客观

croc 的 GitHub Security 页面没有 SECURITY.md，也没有 Published Security Advisories。对一个把"secure file transfer"当核心卖点的软件来说，缺乏正式的漏洞披露流程，是工程治理上的一笔减分。

真实的 Issues 里出现过协议和连接相关的回归。比如 v10.4.6 和 v10.4.7 时期自建 relay 用户遇到过 `could not secure channel` 的问题。这类 edge case 的出现本身就是真实工程的特征，网络协议叠加多平台、多 relay 模式和 LAN 自动发现，出现边界情况并不意外。croc 的 9 年迭代正是在处理这些边界情况里走过来的。

## 和前几篇的对照

Strix、Needle、DeepTutor、book-to-skill、Cangjie 都是 AI 或者 Agent 项目，下面一层往往是 Prompt 工程或者 RAG 拼装。croc 是完全不同类型的东西，它是真正的网络协议、密码学、CLI、relay server、跨平台和 WebAssembly 组成的软件工程项目。

这些项目放在一起，恰好展示了两种不同的复杂度组织方式。Agent 项目大抵是下面轻、上面重，能力靠堆 Prompt 和框架。croc 是下面重、上面轻，能力靠系统设计把复杂问题藏进两条命令里。两种做法各有价值，但它们说明的是同一个道理，好的工程是把复杂度放在它该在的地方。

## 关联词

- **croc**，schollz 维护的命令行文件传输工具，Go 实现，MIT 协议，约 39,823 颗 Star。
- **PAKE**，密码学协议，让两个持有弱共享秘密的双方安全地协商出一个强的 session key。
- **PAKE2**，Boneh 和 Shoup 密码学教材里的协议，croc 的 PAKE 实现基于此。
- **Relay**，croc 的中间节点，负责连接和转发，不理解、不保存文件内容。
- **`croc send --store`**，v11 新增的加密临时存储模式，发送方可以下线，接收方稍后下载解密。
- **CROC_SECRET**，Linux 和 macOS 下推荐用环境变量传 secret，避免口令出现在进程列表里。

## 小结

croc 做的事情，本质上是把两台设备跨互联网安全传文件这件事，从一个需要懂网络、端口、服务器和密钥交换的工程问题，压缩成两条命令和一个短口令。它值得被单独写一注，因为真正有价值的是背后的设计，复杂性没有消失，只是被好的系统设计藏起来了。

## 参考资料

- [GitHub: schollz/croc](https://github.com/schollz/croc)
- [GitHub: schollz/pake](https://github.com/schollz/pake)
- [Strix 笔记](/notes/strix/)
- [Needle 笔记](/notes/needle/)
- [DeepTutor 笔记](/notes/deeptutor/)
