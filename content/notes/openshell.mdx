---
title: "NVIDIA OpenShell：给自主 agent 装一个带策略的沙箱"
description: "开源项目 NVIDIA/OpenShell 的技术选型笔记。原理、架构、四层防御、部署路径、agent 生态集成，以及 alpha 阶段的坑点与适用场景。"
date: "2026-08-27"
type: "notes"
kind: "resource"
resourceType: "github"
resourceUrl: "https://github.com/NVIDIA/OpenShell"
github: "NVIDIA/OpenShell"
tags:
  - AI
  - Agent
  - 安全
  - 沙箱
  - NVIDIA
draft: false
---

<GitHubRepoCard repo="NVIDIA/OpenShell" />

[NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell) 是 NVIDIA 在 2026 年 2 月开源的一个项目，Apache-2.0 协议，Rust 写，当前 8388 个 star。它给自己的定位一句话就够，是 autonomous AI agents 的 safe, private runtime，给 agent 提供一个带策略边界的沙箱执行环境。

读它的源代码和文档，最有意思的是它背后对 agent 这件事的判断。当一个 agent 能拿凭证、能跑命令、能访问网络，能调用模型 API，它就不再是一个安静的助手，而是一个有自主行为能力的实体。过去一年的工程经验告诉我们，让 agent 在宿主机或裸容器里直接跑，风险不是零星的，是系统性的。OpenShell 想解决的，就是这一层系统性的风险。

<Callout tone="info">截至撰写，仓库 README 顶部挂的是 Project Status: alpha 徽章，源码里 workspace 和 Helm chart 的版本仍是 0.0.0。以下分析把 OpenShell 当作一个快速演进中的早期项目来评估。</Callout>

## 它是什么

OpenShell 不是 agent framework，不是 coding agent，不是 orchestrator。它是 agent 的受控执行环境。

具体来说，OpenShell 把 agent 放进一个带策略边界的 sandbox 里执行。沙箱里有四层控制，文件系统、网络、进程、推理。agent 能不能读某个路径、能不能访问某个外网地址、能不能做特权升级、能不能调用模型 API，都不是由 agent 自己决定，由声明式的 YAML policy 决定，由沙箱内的策略引擎在运行时执行。

它解决的几个具体问题很明确。

第一，凭证不再落在 sandbox 文件系统里。API key、token、service account 由 Gateway 或 credential driver 保管，只在需要时通过环境注入或请求时解析。agent 看不到它们，工具链读不到它们。

第二，出站网络默认拒绝。沙箱启动时 outbound access 是 minimal 的，curl 一个外网地址会得到 proxy 返回的 403。只有 policy 显式 allow 之后，特定进程、特定目的地的特定 HTTP 方法和路径才被放行。

第三，推理调用被受控后端接管。agent 想调模型 API，不会直接打到公网，而是走到一个特殊域名 `https://inference.local`。沙箱内的 proxy 在这里终止 TLS，剥离调用方带上的凭证，再用 Gateway 下发的受控凭证转发到目标后端。

第四，文件系统和进程是创建时锁定的。Landlock 限制读写路径，非 root user 加 reduced capabilities 加 seccomp 限制进程。这些控制在 agent 子进程启动前就固定了，运行时不能随便改。

## 架构四件套

OpenShell 的架构可以拆成两类边界，控制面在 Gateway，数据面在 Sandbox。Policy Engine 和 Privacy Router 贯穿两端，但每请求的实时决策主要发生在沙箱内部。

Gateway 是控制平面。它负责 gRPC 和 HTTP 的 API、平台状态的持久化、客户端和沙箱的认证授权、provider 凭证解析、inference 配置、sandbox 生命周期编排。关键设计是 Gateway 不主动连进沙箱网络，而是由沙箱内的 supervisor 主动 outbound connect 到 Gateway，建立长期 session。这个 supervisor-initiated connection 让 Gateway 不需要反向打进沙箱，减少了攻击面。

Sandbox 是 agent 代码真正跑的地方。每个 workload 启动一个 `openshell-sandbox` supervisor。supervisor 以 root 权限准备隔离，然后把 agent 作为一个非特权子进程启动，同时负责 proxy、日志、凭证注入、gateway relay、policy 配置轮询。在 Docker 或 Podman 上，supervisor 会在容器内再创建一个 nested sandbox namespace，真正施加 Landlock、seccomp、capability bounding set、network namespace 等隔离。

Policy Engine 不指单一进程，而是 policy 的定义、校验、分发、执行机制的组合。Gateway 保存并分发 policy，Sandbox 用 in-process 的 OPA engine 做网络和 L7 决策。文件系统与进程则是启动时的静态控制。

Privacy Router 的核心是那个 `https://inference.local` 特殊域名。它把沙箱内的模型 API 调用路由到受控后端，在这个过程里完成凭证的剥离与注入。实现上由 `openshell-router` 这个 crate 选择 upstream 并转发 raw HTTP，认证和授权分别由 `openshell-server` 和 `openshell-sandbox` 负责。

## 四层防御

OpenShell 用 defense in depth 把控制分成四层。

文件系统层用 Landlock 限制读写路径，创建时锁定。

网络层用 network namespace 和 seccomp 强制流量进沙箱内代理，由 proxy 识别 calling binary、比对 trusted identity、匹配 destination 和 L7 规则，无匹配即 deny。网络策略可以在运行时热更新。

进程层用非 root user、reduced capabilities、capability bounding set 清理和 seccomp，阻止特权升级和危险 syscall，创建时锁定。

推理层由 `inference.local` 接管，剥离调用方凭证、注入后端凭证，运行时可热更新。

这里有一个关键区分。文件系统和进程是静态段，只能在 sandbox 创建前生效。网络和推理是动态段，可以用 `openshell policy set` 在运行中的沙箱上热更新，且默认 fail-closed。

## 一个最值得关注的设计

`inference.local` 这条推理路由，是整份架构里最有意思的一处。

它的价值不只是网络策略，而是凭证生命周期的一次重构。在普通部署里，agent 的 API key 要么写在环境变量里，要么躺在配置文件里，要么被工具链读取并传给某个 endpoint。任一条路径都留下了凭证被意外暴露、被错误凭证打错 endpoint、被 agent 擅自换地址的机会。

OpenShell 的做法是，凭证根本不同时存在于 agent 和后端之间。agent 发请求时带上的 credential placeholder 是不透明 token，沙箱内 proxy 在转发前把它解析成真实凭证，解析还有一道授权边界，网络 policy 必须允许这个 binary 加 destination，credential binding 必须包含请求的 host 和 port 和 path。placeholder 过期、格式错、endpoint 不匹配，proxy 直接返回 403 并记一条 denied 事件，不记录 secret 本身。

这相当于把凭证从"长期可见、可能被工具链读取"变成了"每次请求在边界上解析和注入"。对 agent 这种会频繁调用模型 API、会调用各种工具、会产生各种副作用的主体来说，这个设计切中了它最敏感的一条暴露面。

## 怎么部署

OpenShell 本质上是部署 Gateway，CLI 只是 Gateway 的客户端。有三条路径。

单机二进制是推荐起步路径，一行 `install.sh` 装 CLI 加 Gateway，本地起一个监听 17670 端口的 mTLS 服务。个人开发机、单人快速上手、评估阶段走这个。

PyPI 上的 `openshell` 包只提供 Python SDK，不含 CLI，暴露 `SandboxClient`，面向已存在的 Gateway 做编程化编排。适合 CI/CD、自助平台、把 sandbox 生命周期挂到已有的 agent 调度层里。

Helm on K8s 是文档明确标注 experimental 的路径，适合团队共享集群、多云、需要 RBAC 和 OIDC 的场景。要额外安装 Kubernetes SIG 的 Agent Sandbox CRD 和 controller，Kubernetes 版本至少 1.29。

平台覆盖上，Linux amd64 和 arm64、macOS Apple Silicon 都是 Supported，Windows WSL 2 是 Experimental。底层 compute driver 支持 Docker、Podman、Kubernetes、MicroVM，Gateway 默认 auto-detect，想钉死用 `compute_drivers` 配置。

最短上手是一行命令。

```bash
curl -LsSf https://raw.githubusercontent.com/NVIDIA/OpenShell/main/install.sh | sh
openshell sandbox create -- claude
```

`-- claude` 是 canonical main process，OpenShell 拉起这个命令并 attach 终端。不传 trailing command 默认起 `/bin/bash -l`。base 镜像预装了 Claude Code、OpenCode、Codex、Copilot，加上 python 3.14、node 22、gh、git、vim、ping、dig 等工具。

## 和 agent 生态怎么接

官方支持的 agent 分三类。

第一类是 base 镜像开箱即用，Claude Code、OpenCode、Codex、Copilot CLI 直接在 base 里预装，`openshell sandbox create -- claude` 一行搞定。

第二类是 community catalog，通过 `--from` 参数拉独立的社区镜像，比如 Ollama、Pi、Gemini。

第三类是 NemoClaw 桥接，OpenClaw 和 Hermes Agent 都是 blueprint-managed，走 NVIDIA 的 [NemoClaw](https://github.com/NVIDIA/NemoClaw) 把它们封装进 OpenShell 认可的沙箱。文档里 OpenClaw 也明确指引用 NemoClaw。

对 Hermes Agent 这类框架，有三条路可选。短期可以 `--from pi` 或用 BYOC 把 Hermes CLI 打进自定义镜像。中期走 NemoClaw blueprint，和 OpenClaw 同路线。长期可以用 PyPI SDK 的 `SandboxClient` 把 sandbox 生命周期挂到 Hermes 调度层，用 label selector 做多租户。

凭证管理走 Provider 这个一等概念。所有 API key 一律进 provider，不要走 `--env`，后者值会被沙箱里的 agent 直接读到。需要续期的走 Gateway 托管的 refresh，支持 OAuth2、Google service account JWT、AWS STS `AssumeRole`。

## 选型视角的坑点

这个项目现在还是 alpha，几个地方要如实说。

版本号是 0.0.0，Helm chart 也是 0.0.0，由 CI 在发布前打 patch。生产必须 pin 到已发布 tag，不要用 `main` 或 `0.0.0-dev`。RFC 0014 里 Experimental API 甚至在 patch release 里可以无通知改动，凡是标 Experimental 的能力，都要假设随时会变。

明确标 Experimental 的能力包括 GPU passthrough、Kubernetes/Helm 部署路径、Windows WSL 2、VM/VFIO。GPU 不只是加一个 flag 的事，链路里有 NVIDIA drivers、NVIDIA Container Toolkit、CDI、镜像内 CUDA 库、VM 场景还要 VFIO 和 IOMMU 和 root 权限，任何一个组合都可能在 staging 才暴露。K8s 路线的坑不在 OpenShell 单点，而在 cluster-side 的 CRD、命名空间信任模型、RBAC、OpenShift SCC 等周边。

文件系统策略是创建时锁定的。agent 中途要访问新路径、写新 artifact、切到新 workspace，如果不在初始 Landlock allowlist 里，就不能只 `policy set`，得销毁重建 sandbox。很多自动拉代码、跨项目切换的场景要因此改成"创建前预授权"。

Landlock 默认 `compatibility: best_effort`。在旧 kernel 或异常镜像上，沙箱能"成功启动"但缺文件系统限制，只发一条 High-severity 的 OCSF DetectionFinding。生产应该显式切到 `hard_requirement`，并监控这条 finding。最低要求是 Ubuntu 22.04 或 Linux kernel 5.13。

`sandbox-limits` 文档里写明这些限制是 safety boundaries，不是容量或兼容性承诺。当前有每个 HTTP body 4 MiB、complete message chain 30s 这类默认值。文档还列出 known gaps，GraphQL、MCP、JSON-RPC 的 body 限制是早期实现，没有共同抽象。agent 或工具链如果发大 payload、长流式、复杂协议，可能会在这些上限内被截断或拒绝。

BYOC 不是任意镜像都能用。必须声明非 root OCI USER、准备可写的 `/sandbox`、装 `iproute2`，不支持 distroless 和 `FROM scratch`。

## 它防什么，不防什么

OpenShell 主要防的是未经授权的读写、外传、危险 syscall 和凭证暴露。它能阻止 agent 主动访问未列出的 host 和 port，能拦截部分 HTTP、GraphQL、WebSocket 的方法和路径，能阻止 loopback、link-local、metadata endpoint 等高风险路径。

它不防的是镜像本身的供应链问题、应用层恶意逻辑、非 HTTP 协议的语义盲区。BYOC 和 community 镜像要自己评估供应链。provider 凭证过的 endpoint 如果走 L4-only 或 TLS skip，需要显式 `allow_uninspected_credentials`，因为 proxy 看不到内容。也就是说，不能说它能完整防止 prompt 或 workspace 内容被智能 agent 用自然语言、编码、图片、multipart、WebSocket 语义外传。

它也不保证容器逃逸、宿主机内核漏洞、宿主管理员失陷。这些是宿主和集群层的责任，OpenShell 是应用和容器层的沙箱。

## 小结

值得从 OpenShell 身上摘出来看的，有三点。

第一是它的产品判断。NVIDIA 没有做又一家 agent framework，而是去补 agent 生态里最缺的那块，受控执行环境。这跟它自己的基础设施背景一致，造工具给别人用，让别人在安全的边界内用。

第二是 `inference.local` 这条推理路由。它把凭证暴露从"长期可见"重构成了"每次请求在边界上解析"，是对 agent 这类高频调用 API 的主体最敏感的一条暴露面的精准处理。这条设计值得所有做 agent 平台的人参考。

第三是它的成熟度。alpha 阶段、Experimental 能力多、文件系统创建时锁定、Landlock best_effort 默认值，这些都意味着现在上生产要谨慎。适合的场景是单机 POC、用内置支持的 agent 做受控工作台、把 network 当作核心资产用 YAML 精细管理。应该观望的场景，是强依赖 GPU 的生产、大规模 K8s 集群、Windows 主力环境、以及要求"完整语义级防 prompt 外泄"的合规场景。

一个值得长期跟踪的信号。OpenShell 本身是"用 agent 驱动开发"的，仓库里自带 `.agents/skills/`，开发流程是 agent 提案、人审批、agent 实现。做 agent 安全工具的公司，自己用 agent 的方式做事，这一点很干净。

## 参考资料

- [NVIDIA/OpenShell 仓库](https://github.com/NVIDIA/OpenShell)
- [OpenShell 官方文档](https://docs.nvidia.com/openshell/latest/index.html)
- [architecture 目录](https://github.com/NVIDIA/OpenShell/tree/main/architecture)
- [RFC 0001 · Core Architecture](https://github.com/NVIDIA/OpenShell/tree/main/rfc/0001-core-architecture)
- [RFC 0014 · Release Stability](https://github.com/NVIDIA/OpenShell/tree/main/rfc/0014-release-stability)
- [OpenShell-Community 沙箱镜像](https://github.com/NVIDIA/OpenShell-Community)
- [NemoClaw blueprint](https://github.com/NVIDIA/NemoClaw)
- [Kubernetes Agent Sandbox](https://agent-sandbox.sigs.k8s.io/)