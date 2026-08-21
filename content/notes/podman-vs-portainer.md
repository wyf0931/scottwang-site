---
title: "Podman 和 Portainer 不是同一个东西：一个管容器怎么跑，一个管怎么管"
description: "32,000 颗 Star 的 Podman 是容器引擎，对标 Docker；38,000 颗 Star 的 Portainer 是管理平台，可以管理 Podman。它们不在同一层。"
date: "2026-08-17"
type: "notes"
kind: "note"
tags:
  - 容器
  - 基础设施
  - 工具
  - 对比
---

**Podman** 和 **Portainer** 放在一起被拿来比，几乎是容器圈最常见的一种误会。它们根本不在同一个层级。前者 [GitHub 仓库](https://github.com/podman-container-tools/podman) 约 32,593 颗 Star，是容器引擎，对标 Docker Engine。后者 [GitHub 仓库](https://github.com/portainer/portainer) 约 38,256 颗 Star，是容器环境的可视化管理平台，它管理的对象反而可以包括 Podman 本身。两者直接当作 Docker 管理 GUI 来比较，会把 Podman 看窄。

一句话点出，Podman 解决容器怎么跑，Portainer 解决跑起来以后怎么方便地管。两者不是竞争关系，是上下层关系。

## Podman 是什么

全称 POD MANager，核心定位是一个用于运行和管理 OCI Container、OCI Image、Pod 的容器引擎。`podman run`、`podman ps`、`podman images` 这些命令和 Docker 同名命令几乎可以直接替换。Podman 官方明确提供 Docker-compatible CLI 和 Docker-compatible REST API，一个习惯了 Docker 的用户，改到 Podman 几乎不需要重新学习命令。

它 2017 年 11 月开源，主体约 81% Go，仓库累计 28,000+ commits，属于底层基础设施工程，不是上层包装工具。

## 两个核心设计

Podman 的核心设计理念有两件事，daemonless 和 rootless，两件都直接针对 Docker 经典架构的痛点。

Docker 经典架构有一个中心组件 Docker daemon 常驻，CLI 通过 daemon 间接控制容器。Podman 的设计是去掉这个常驻中心 daemon，每个 podman 命令直接拉起容器，进程和容器之间是一对一的。Docker 的调用链是 CLI 到 Docker daemon 到 containerd 再到 runc 再到 Container，Podman 是 CLI 到 libpod 到 OCI runtime 再到 Container。少掉一个常驻 daemon 意味着少一个单点、少一个常驻进程占内存、也少了 daemon 层被攻破后的横向风险。

Rootless 是第二个核心设计。传统上跑容器需要 root 权限，因为容器底层要操作 namespace、cgroup、挂载这些 Linux 内核机制。Podman 通过 user namespace 等技术，让普通用户在不需要提权的情况下运行容器，容器里即使被攻破也不会直接拿到宿主的 root。这是 Linux 服务器安全边界上很实在的一步。

所以 Podman 要回答的问题，从源头就指向了一个完全不同的方向。它的目标是构建一个符合 OCI 标准、兼容 Docker 使用习惯、不依赖常驻中心 daemon、并天然支持 rootless 的容器运行体系。这个定位和 Portainer 完全错开。

## Podman 技术栈分层

Podman 不是一个简单的 CLI wrapper，它背后是一整套容器基础设施。Linux 是原生环境，macOS 和 Windows 通过 podman machine 管理的虚拟机运行。

| 层 | Podman 相关组件 |
|---|---|
| CLI / API | Podman CLI / REST API |
| 容器生命周期管理 | libpod |
| 镜像 | OCI / Docker Image |
| 存储 | containers/storage |
| 网络 | Netavark |
| OCI Runtime | crun / runc |
| Linux 隔离 | namespace / cgroup / SELinux |
| 检查点 | CRIU |
| Rootless | user namespace |
| macOS / Windows | podman machine VM |

这套分层说明，Podman 属于容器基础设施层和容器运行时管理层，不是上层操作便利工具。

## Portainer 在干什么

Portainer 的问题定义完全不同。它不关心容器怎么被运行，它关心的是容器已经跑起来了以后，运维人员怎么在一个界面上看到、启停、看日志、配网络、改配置。官方描述很直白，把管理容器的复杂度藏在一个好用的 UI 后面。

它的典型架构是 Portainer Server 加 Portainer Agents。Server 是中心管理端，Agent 部署到各个节点或集群，一个 Server 可以统一纳管多个 Docker、Swarm、Kubernetes、Podman 环境。十几台服务器甚至几十个 Kubernetes 集群，在 Portainer 里就是一个控制台可以看见。

这是容器管理平台层或者控制平面，不是底层 runtime。它不负责拉起容器，它只是帮人去管已经拉起的容器。

## 核心区别

把两者放在一起对比，维度差异会直接出现。

| 维度 | Podman | Portainer |
|------|--------|-----------|
| 本质 | 容器引擎 | 容器管理平台 |
| 问题定义 | 怎么安全、标准化地运行容器 | 怎么简单地管理大量容器环境 |
| 对标 | Docker Engine | Rancher / Docker GUI / K8s 管理平台 |
| 主要用户 | 开发者、DevOps、Linux 管理员 | 运维、平台管理员、开发团队 |
| 主要入口 | CLI / API | Web UI / API |
| 是否真正运行 Container | 是 | 不是底层 runtime |
| Docker 替代 | 可以 | 不可以 |
| 管理 Podman | 自己就是 Podman | 可以管理 Podman 环境 |
| 架构 | daemonless | Server + Agent |
| Rootless | 核心能力 | 不直接相关 |
| 主要语言 | Go | TypeScript + Go |
| 协议 | Apache-2.0 | zlib |

## 两者可以一起用

一台服务器上，两者并不冲突。Portainer 的 Web UI 在上，Podman 或者 Docker 在中，nginx、postgres、app 这些实际负载在下。Portainer 官方架构资料就把 Podman 列为自己可以管理的 container environment 之一，把 Portainer 装在一台跑 Podman 的机器上，是可以打通的。

需要注意的一点是，Portainer 社区版和企业版对 Podman 的支持范围不完全一样，不能简单理解为所有 Portainer 版本都完整支持 Podman 场景。落地前要先查清楚目标版本的 Podman 兼容性。

## 放进容器技术栈看

整个容器技术栈可以拆成四层。最上面是管理层，Portainer、Rancher、Kubernetes Dashboard 这些都属于这一层，负责给人提供操作入口。往下一层是容器引擎层，Docker、Podman 在这里，负责真正拉起和管理容器生命周期。再往下是 OCI Runtime 层，runc、crun 在这里，负责和内核打交道执行隔离。最底层是 Linux Kernel，namespace、cgroup、security module 都在这里。

Portainer 在最上面一层，Podman 在中间一层，两者中间隔着整整一个管理层。它们之间不是替代关系，是上下协作关系。

## 怎么选

四种典型场景。

第一种，不想装 Docker，看重 Linux 原生、rootless、daemonless、安全边界和 OCI 标准。研究 Podman，它是这个方向上最成熟的开源选择。

第二种，服务器已经跑了一堆容器，不想天天 SSH 加 CLI，希望网页上看日志、启停、管理。用 Portainer，它的价值就是在这层。

第三种，十几台甚至几十台服务器，多个 Kubernetes 和 Docker 环境，希望统一权限和集中治理。Portainer 的价值明显增加，它官方的定位本来就是跨 Docker、Swarm、Podman、Kubernetes 的集中管理平台。

第四种，个人一台 Linux VPS 跑 5 个容器。Podman 本身足够，Portainer 只是便利层，装上也没坏处，但不装也完全能用。

## 研究价值

从源码架构层面深入研究，Podman 更值得。它涉及 OCI、libpod、rootless、namespace 和 cgroup、network、storage、runtime、Docker compatibility 这一整套现代容器技术体系。一个想搞懂现代 Linux 容器怎么运转的工程师，读 Podman 源码比读 Docker Engine 更能看清 OCI 标准落地后的真实样子。

Portainer 更值得从平台产品设计、异构环境管理、权限治理和运维 UX 角度研究。它如何在一个控制台里同时处理 Docker 和 Kubernetes 两种完全不同的抽象，如何设计 Server 和 Agent 的通信，如何在多租户场景下做权限隔离，这些都是平台工程里值得拆解的设计问题。

两者研究价值的方向完全不同。选哪个，取决于自己想补的是运行时层的知识，还是控制面层的知识。

## 关联词

- **Podman**，podman-container-tools/podman 仓库的容器引擎，Go 实现，Apache-2.0 协议，约 32,593 颗 Star。
- **Portainer**，portainer/portainer 仓库的容器管理平台，TypeScript 加 Go，zlib 协议，约 38,256 颗 Star。
- **Daemonless**，Podman 的核心设计理念，去掉常驻 Docker daemon，命令进程和容器一对一。
- **Rootless**，通过 user namespace 让普通用户不获取 root 就能运行容器，降低宿主被攻陷的风险。
- **libpod**，Podman 内部的容器生命周期管理库，是 Podman CLI 和 OCI runtime 之间的核心层。
- **OCI**，Open Container Initiative，统一了镜像格式和运行时接口，Podman 和 Docker 都遵循这一套标准。

## 小结

Podman 和 Portainer 的差异，本质上是容器基础设施层和控制平面层的差异。Podman 回答的是容器怎么安全、标准化地跑起来，Portainer 回答的是容器跑起来以后怎么方便地管。把两者放在同一张对比表里，最大的价值在于帮读者看清楚容器生态本来就是分层架构，每一层解决的是一个不同的问题。理解了这一层，再去看 Docker、containerd、CRI-O、Kubernetes，整张容器技术栈的轮廓会清晰很多。

## 参考资料

- [GitHub: podman-container-tools/podman](https://github.com/podman-container-tools/podman)
- [GitHub: portainer/portainer](https://github.com/portainer/portainer)
- [Strix 笔记](/notes/strix/)
- [Needle 笔记](/notes/needle/)
- [DeepTutor 笔记](/notes/deeptutor/)
