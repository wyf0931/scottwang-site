---
title: "Colima：给 macOS 一个真正轻量的容器运行时"
description: "30,000 多颗 Star 的开源项目，通过 Lima 在 macOS 上跑轻量 Linux VM 承载 Docker，是 Docker Desktop 的免费开源替代。用黄金圈法则拆开看它为什么存在、怎么做、做什么。"
date: "2026-08-29"
type: "notes"
kind: "note"
tags:
  - 容器
  - 工具
  - 基础设施
  - 开源项目
---

在 macOS 上跑 Docker，长期只有两个选项。一个是有商业许可的 Docker Desktop，一个是各种命令行替代方案。Colima 是后者里 Star 数最高的一个，[abiosoft/colima 仓库](https://github.com/abiosoft/colima) 到 2026 年 8 月 29 日累计 30,551 颗 Star，2021 年 9 月开源，最近一次 push 就在 8 月 24 日，活跃度仍然很高。

它想做的事情很直接，给 macOS 上已经在命令行工作的开发者一个开源、轻量、免费、没有商业限制的容器运行时。为什么值得单独写一注，是因为它把这个问题解得很干净，一个几十行的 CLI 控制层，加一层轻量 VM，跑起来就是完整的 Docker 体验。

## 为什么需要一个 Docker Desktop 的替代

Docker Desktop 是 macOS 上事实上的默认容器运行时，但对已经习惯命令行工作流的开发者，它的四个摩擦一直在那里。安装包 500MB 左右，常驻内存默认 2GB，企业用户需要付费许可，还有一个必须打开的 GUI 窗口。这些都不是致命问题，但每一台 MacBook 上要跑一整个 Docker Desktop，成本就是真实的。

HN 上 2025 年 10 月一篇帖子《From Docker Desktop (300% CPU) to Colima and Portainer (0.2%) on macOS》把这件事讲得最直白，标题本身就是对比。2023 年 5 月 Colima 在 HN 首发讨论时，maxmouchet 也写过同样方向的观察，(co)lima 在可靠性和后台资源占用上已经比 Docker Desktop 更好。ishaanbahal 提到 Colima 运行时很轻，不主动弹更新提示，也不自动开机启动。这些反馈指向同一个诉求，想要一个不占资源、不弹提示、开机不带进来的 Docker。

Docker 官方自己也是这个方向。Docker Desktop 从 v4.34 起对大型组织收紧免费许可，Docker CLI 和 Engine 都是开源的，缺的是 macOS 和 Windows 上的一个 VM 层。Colima 正好卡在这个缺口上，它补的是那个 VM，Docker 引擎本身没换。

## 它是怎么做的

Colima 本身只有一个 Go 写的 CLI，代码量很小。真正干重活的是底层的 **Lima**，一个在 macOS 上启动轻量 Linux VM 的开源项目，官方叫它 Linux virtual Machines。Colima 把 Lima 当作 VM 提供层，把 Docker、containerd、Incus 这些运行时装进 VM，然后把 macOS 侧的 `docker` CLI 通过 socket 转发到 VM 里。

架构分层大致是这样，从上到下四层。

```text
macOS 用户空间
├── docker CLI / docker compose
├── docker context  (默认指向 colima 的 socket)
└── Colima CLI (Go, ~50MB 安装)
        │  socket 转发
        ▼
Lima VM (Apple Silicon 用 virtiofs 挂载)
└── Docker daemon / containerd / Incus
        │
        ▼
Container / Kubernetes (K3s 可选)
```

这个分层解释了 Colima 后面所有的能力。**Lima** 负责 VM，所以 Colima 轻量，因为虚拟机层是开源的，且 VM 默认只给 2 核 2GiB 内存 100GiB 磁盘。Colima 本身不绑死 Docker，它只管拉起 VM 和在 VM 里装 runtime，所以同时支持 Docker、containerd、Incus 三种运行时，切换只是换个参数。K3s 是一键开关，`--kubernetes` 加一下 VM 里就多出一个 K3s 集群，和 Minikube、Kind、K3d 都是同一个接口。

从 v0.3.0 起，Colima 支持通过 **Docker Context** 和 Docker Desktop 共存。context 是 Docker CLI 的官方机制，`docker context use colima` 切一次，docker 命令就走 Colima 的 socket，不用卸载 Docker Desktop。这是它和企业环境能并存的前提。

Apple Silicon 的挂载是另一个细节。Colima 在 Apple Silicon 上默认用 VirtioFS，比 Docker Desktop 走的 osxfs 更快，文件读写密集的工作负载上会有感知差异。

v0.10.0 是一个明显的方向调整，引入了 **krunkit** VM type，`colima start --vm-type krunkit` 加 `colima model run gemma3` 就能跑本地大模型。krunkit 是一个给 AI 容器用的 VM 方案，Colima 把它当作可切换的底层 VM 类型接进来。这一步让 Colima 从「跑 Docker 的轻量 VM」扩展到「跑 AI 容器的轻量 VM」，也是它最近一段时间 Star 增长的原因之一。

## 常用命令

核心命令很少，装完 `brew install colima docker docker-compose` 之后，日常就这几条。

```bash
# 启动一个默认 VM (2 CPU / 2GiB / 100GiB)
colima start

# 指定资源启动
colima start --cpu 4 --memory 8 --disk 100

# 状态、停止、重启
colima status
colima stop
colima restart

# 多实例，dev 是 profile 名
colima start dev --cpu 2 --memory 4
colima list
colima stop dev

# 本地 K8s
colima start --kubernetes

# 切 docker context，让 docker CLI 走 colima
docker context use colima

# 重置
colima delete
colima start

# AI 模型 (v0.10.0+)
colima start --runtime docker --vm-type krunkit
colima model run gemma3
```

`colima ssh` 能直接进 VM 里，调试问题时很有用。整个工具体验是纯 CLI，没有 GUI 窗口，符合它面向命令行用户的定位。

## 和其他方案怎么选

| 维度 | Colima | Docker Desktop | OrbStack | Podman | Lima |
|---|---|---|---|---|---|
| 定位 | macOS / Linux VM 层 | 完整 IDE + VM | macOS VM + GUI | 容器引擎 (daemonless) | VM 层 |
| 底层 VM | Lima | 自研 | 自研 | podman machine | 自己 |
| Docker 兼容 | 通过 CLI 转发 | 原生 | 原生 | 兼容 CLI | 需要接 Docker |
| 免费许可 | MIT | 企业收费 | 免费版 | Apache-2.0 | Apache-2.0 |
| GUI | 无 | 有 | 有 | 无 | 无 |
| 典型场景 | 命令行用户、K3s、CI | 需要 GUI 的用户 | 追求速度和 GUI | Linux 原生 | 已有 Lima 用户 |

几种典型场景可以这样落。纯命令行开发，主力跑 Docker 或者 docker compose，选 Colima，它最轻，K3s 集成也顺。企业里 Docker Desktop 和 Colima 需要共存，靠 Docker Context 切换，不用卸载任何一个。追求开箱即用的速度，愿意为体验付费，OrbStack 值得看。Linux 原生环境，直接跑 Podman，Colima 用不上。已经用了 Lima 做别的开发机，直接用 Lima 就够，Colima 只是 Lima 上的一个应用层。

真实反馈里有一点值得注意。silent-but-taco 在 HN 说过，Podman 和其他工具链集成起来很麻烦。Podman 走 rootless、libpod，Docker 生态里 devcontainer、Docker Compose 文件、K8s 相关工具默认都是为 Docker socket 设计的。Colima 走的是标准 Docker socket 转发，这些工具可以直接用，这是它在工程上赢过 Podman 的地方。

## 局限

Issues 里几个常见痛点可以说明它现在的成熟度。**#689** 是 `--dns` 只在首次启动生效的 bug，改 DNS 要 delete 再 start。**#517** 是 qemu 环境下 `--mount-type` 被忽略。**#365** 是自定义 Docker socket 路径的增强请求，12 条评论的高热度 issue，说明不少用户想把它嵌进自动化流水线。**#262** 是缺失 daemon，Colima 每次命令都要通过 lima 找 VM，没有常驻进程。**#74** 是 launchd 自动启动，个人用户想要开机自启得自己写 launchd plist。**#573** 是自定义网络地址段，12 条评论，涉及多 VM 场景下的 IP 规划。

这些都是真实工程的问题，不构成否定，但需要知道边界在哪里。

## 关联词

- **Colima**，abiosoft/colima 仓库的容器运行时 CLI，Go 实现，MIT 协议，约 30,551 颗 Star，2021 年 9 月开源。
- **Lima**，lima-vm/lima 仓库，macOS 上启动轻量 Linux VM 的开源项目，Colima 的底层 VM 提供层。
- **Docker Context**，Docker CLI 的官方多环境切换机制，Colima 和 Docker Desktop 共存的基础。
- **containerd**，Docker 底下的容器运行时，Colima 支持它作为可切换的 runtime。
- **Incus**，LXD 的 fork，Colima 支持的第三个 runtime。
- **krunkit**，AI 容器用的 VM 方案，v0.10.0 引入，用于跑本地大模型。
- **VirtioFS**，Linux 内核文件共享机制，Apple Silicon 下比 osxfs 更快。

## 小结

Colima 的存在感，是 Docker Desktop 在 macOS 上留出的一个具体缺口，一个开源、轻量、免费、命令行友好的容器运行时。它通过 Lima 做 VM 层，把 Docker 引擎塞进 VM，用 Docker socket 转发和 macOS 侧的 CLI 打通。这个分层结构让它同时具备四个能力，轻量、免费、兼容 Docker、可扩展到 K3s 和 AI 容器。它不是要替代 Docker 或者替代 Lima，它是在 Lima 之上给 Docker 生态做的一个薄封装。

在 macOS 上跑容器的选择，正在从「只有 Docker Desktop 一个答案」转向「有清晰的分层选型」，Lima 做 VM，Colima 做控制层，Docker、containerd、Incus 做 runtime。Colima 在这个新分层里占了最顺手的那一层。

## 参考资料

- [GitHub: abiosoft/colima](https://github.com/abiosoft/colima)
- [Colima 官方站点](https://colima.run)
- [GitHub: lima-vm/lima](https://github.com/lima-vm/lima)
- [Docker Engine 官方文档](https://docs.docker.com/engine/)
- [HN 讨论 (2023-05-18)](https://news.ycombinator.com/item?id=35983349)
- [Podman vs Portainer 笔记](/notes/podman-vs-portainer/)
- [黄金圈法则](/notes/golden-circle/)
