---
title: "Agent2Agent (A2A) 协议"
description: "Agent2Agent (A2A) 协议 — 一个开放标准，使不同框架、不同厂商构建的 AI Agent 能够发现彼此、协商交互、安全协作，无需暴露内部状态。"
date: "2026-08-14"
type: "notes"
kind: "resource"
resourceType: "github"
resourceUrl: "https://github.com/a2aproject/A2A"
github: "a2aproject/A2A"
tags:
  - A2A
  - Agent
  - 多智能体
  - 协议
  - AI
  - 互操作
draft: false
---

[Agent2Agent (A2A) 协议](https://github.com/a2aproject/A2A) 面向一个具体的工程问题：不同团队用不同框架构建 Agent 后，怎样在不暴露内部实现的情况下互相调用。它定义了发现、任务交互和结果传递的约定，适合需要跨团队、跨框架协作的 Agent 系统。

[协议官网](https://a2a-protocol.org/latest/specification/) 提供完整的技术规范、教程和 SDK。

<GithubRepoCard repo="a2aproject/A2A" />

### 核心能力

A2A 使 Agent 能够：

- **发现彼此能力** — 通过 "Agent Card" 了解其他 Agent 的功能
- **协商交互方式** — 支持文本、表单、媒体等多种模态
- **安全协作长任务** — 处理可能需要人工介入的长时间任务
- **保持状态私密** — 无需暴露内部状态、记忆或工具

### 为什么需要 A2A

| 目标 | 说明 |
|---|---|
| **打破孤岛** | 连接不同生态系统的 Agent |
| **复杂协作** | 让专业 Agent 协同处理单一 Agent 无法完成的复杂任务 |
| **开放标准** | 促进社区驱动的 Agent 通信，鼓励创新和广泛采用 |
| **保护隐私** | Agent 协作时不需共享内部记忆、专有逻辑或工具实现 |

### 关键特性

- **标准化通信** — JSON-RPC 2.0 over HTTP(S)
- **Agent 发现** — 通过 "Agent Card" 获取能力和连接信息
- **灵活交互** — 同步请求/响应、流式（SSE）、异步推送通知
- **丰富数据交换** — 支持文本、文件、结构化 JSON 数据
- **企业就绪** — 考虑安全、认证和可观测性

### 协议分层

| 层级 | 内容 |
|---|---|
| **Layer 1 — 数据模型** | 核心数据结构（Task、Message、AgentCard、Part、Artifact、Extension），以 Protocol Buffer 定义 |
| **Layer 2 — 抽象操作** | 基本能力：Send Message、Send Streaming Message、Get Task、List Tasks、Cancel Task、Get Agent Card |
| **Layer 3 — 协议绑定** | 具体协议映射：JSON-RPC、gRPC、HTTP/REST |

### 设计原则

- **Simple** — 复用已知标准（HTTP、JSON-RPC 2.0、SSE）
- **Enterprise Ready** — 支持认证、授权、安全、隐私、追踪、监控
- **Async First** — 原生支持长时间任务和人在回路（Human-in-the-loop）
- **Modality Agnostic** — 支持文本、音视频（文件引用）、结构化数据/表单
- **Opaque Execution** — 基于声明的能力和交换信息协作，不共享内部思考或工具

### SDK

| 语言 | SDK |
| :--- | :--- |
| **Python** | `pip install a2a-sdk` |
| **Go** | `go get github.com/a2aproject/a2a-go` |
| **JavaScript** | `npm install @a2a-js/sdk` |
| **Java** | Maven 依赖 |
| **.NET** | `dotnet add package A2A` |
| **Rust** | `cargo add a2a-lf` |
