---
title: "Hermes Agent 演进路线图"
description: "从 2026 年初到 v0.22，Hermes Agent 用八个多月从单机 CLI 长成跨平台消息网关加桌面应用加多云生态的 Agent 框架。这篇按时间和版本轴梳理它的演进脉络，只挑 Agent 骨架的关键节点，不看 bug 修复。"
date: "2026-11-02"
kind: "note"
tags: [AI, Agent, 开源项目, Hermes]
---

Hermes Agent 是 Nous Research 的开源 Agent 框架，2026 年初起步，到 10 月下旬已经迭代到 v0.22.5。八个多月里它从单个命令行对话工具，长成了跨平台消息网关、桌面应用、多云生态齐备的完整 Agent 框架。这篇按时间和版本轴梳理它的演进，只挑 Agent 骨架的关键节点，bug 修复和纯内部重构不展开。

## 版本轴总览

| 版本 | 时间 | 关键节点 |
|------|------|---------|
| v0.1-v0.3 | 2026.2-3.12 | CLI 骨架、消息网关、内存与会话存储、Skills Hub、**子任务委派** |
| v0.4-v0.6 | 2026.3 | 配置替换、网关自动重连、MCP 管理 CLI、插件生命周期钩子 |
| v0.7-v0.9 | 2026.4 | 可插拔内存 provider、ACP MCP 集成、自优化 prompt、大陆 provider |
| v0.10-v0.12 | 2026.4末 | Tool Gateway、Dashboard 插件与主题系统、技能策展 |
| v0.13-v0.15 | 2026.5 | QQ 与 Google Chat、osint 技能、X 搜索、MCP 并行调用 |
| v0.16 | 2026.6 | **桌面应用发布**、i18n 简中、远程网关 |
| v0.17-v0.19 | 2026.6-7 | MCP 审批路由、Vertex AI、子代理继承工具集 |
| v0.20 | 2026.8 | 大版本聚合，桌面与插件生态成熟 |
| v0.21-v0.22 | 2026.9-10 | **可插拔委派后端**、MCP 成本限额、Nous 登录重做 |

## 演进清单

### 奠基期，v0.1-v0.3（2026 年 2 月到 3 月上旬）

这三个月把 Agent 的地基打完了。CLI 交互骨架配上 ANSI 渲染，消息网关跨平台收发打通，持久内存和 SQLite 会话存储落地，Skills Hub 让技能从在线注册表安装，长对话的上下文压缩也有了。最关键的节点是 2 月 20 日，**子任务委派 `delegate_task` 首次实现**，Hermes 从第一天就把子 Agent 当成核心能力，而不是后来的插件。

### 框架成长期，v0.4-v0.6（2026 年 3 月）

这个月是可靠性加固加平台铺开。配置文件支持环境变量替换，网关平台断线自动重连带指数退避，MCP 服务器管理进了 CLI 并且走 OAuth 2.1 PKCE 认证，插件系统有了生命周期钩子，技能目录能挂载到远程后端。Slack 多工作区、Matrix 原生语音这些平台能力也在这个窗口进来。

### 内存与多模型期，v0.7-v0.9（2026 年 4 月）

内存从内置走向可插拔，Honcho 作为 provider 接入，内存按 profile 隔离。ACP 客户端能把自己注册的 MCP 服务器转成 Agent 工具，工具使用的 prompt 引导开始自我优化，cron 任务能追踪投递失败。为大陆用户加了 kimi-coding-cn provider，多模型路线开始清晰。

### 可视化前奏，v0.10-v0.12（2026 年 4 月下旬）

Tool Gateway 解锁，按订阅加 per-tool 选择。Dashboard 出现，带插件系统和主题系统，Web UI 开始能扩展。curator 技能策展上线，能看技能的使用频率和归档。消息网关原生支持多图发送。

### 平台扩展期，v0.13-v0.15（2026 年 5 月）

QQ 机器人平台和 Google Chat 插件进来，osint-investigation 技能进技能库，X 搜索工具带 OAuth 或 API key 认证。MCP 服务器支持并行工具调用声明，工具错误字符串在进入模型上下文前消毒。5 月下旬模型线更新到 claude-opus-4.8。

### 桌面化，v0.16（2026 年 6 月）The Surface Release

这是从纯 CLI 到桌面端的关键一跳。桌面应用端到端做出来，安装、自更新、远程网关连接、多 profile 会话、聊天 UX、状态栏一条龙，一个社区贡献者做了 52 个 PR 包下这摊子。这版还带 i18n 简中支持、per-profile 远程网关、Dashboard 认证。整个窗口 170 个社区贡献者，是生态规模的一个显式信号。

### 深水区，v0.17-v0.19（2026 年 6 月到 7 月）

MCP 有 elicitation 处理器，审批走网关感知路由。Google Vertex AI provider 进来，走 Gemini 的 OAuth2。子代理的行为收敛到明确规则，**移除 toolsets 参数，子代理总是继承父 Agent 的工具集**，上下文一致性从此有保证。桌面端 TTS 设置内联，模型选择器按 provider 过滤。

### 生态成熟，v0.20（2026 年 8 月）

一个大版本聚合，桌面端、Dashboard、插件生态在这个窗口完成一轮集中打磨。之后项目把版本号切换到 v0.22 线，用 GitHub Release 承载发布说明，迭代节奏变成高频小步。

### 委派后端期，v0.21-v0.22（2026 年 9 月到 10 月）

这期的核心是**可插拔委派后端**。`delegation.backends` 配置项让委派策略变成可替换的插件，一个 session 能中途切换委派后端，每个后端有自己的路由和服务层级，结果会报告子 Agent 实际跑在哪个后端上。委派从单一实现升级成一套可插拔体系。同期 MCP 有了每工具成本声明和每聊天支出限额，Nous 登录重做成统一的设备登录。

## delegate_task 的演进轨迹

子任务委派是 Hermes 骨架里值得单独看的一条线，它从第一天就有，而且一路在长。关键节点是这样。

1. **v0.1-v0.3（2026-02-20）**，首次实现 subagent delegation，子 Agent 带独立上下文
2. **2026-02-25**，子 Agent 认证传播父 Agent 的 API key
3. **2026-03-01**，网关暴露子 Agent 的工具调用和思考给用户
4. **2026-03-11**，子 Agent 的 provider 和 model 可配置，凭证完整解析
5. **v0.18.0（2026-07-01）**，移除 toolsets 参数，子 Agent 继承父工具集
6. **v0.21-v0.22（2026 年 9 到 10 月）**，可插拔委派后端上线，路由、服务层级、后端切换齐全

到 v0.22，`delegate_task` 支持一次最多 10 个并发子 Agent（可配置）、结构化输出 schema 校验、图片转发、运行中实时纠偏和终止、嵌套编排。子 Agent 完全隔离于父会话历史，一切上下文靠调用方显式传入，这是它和进程级多 Agent 编排最本质的区别。

## 小结

Hermes 的演进不是功能堆砌，是骨架分层。先有 Agent 循环和消息网关的地基，再长内存可插拔和多 provider，然后 Web 与桌面端冒出来，最后把委派做成可插拔后端。子任务委派从 2 月 20 日第一次提交起就是核心能力，到 10 月演进出路由和服务层级，是这条线上最值得关注的结构化演进。

## 参考资料

- [Hermes Agent GitHub 仓库](https://github.com/NousResearch/hermes-agent)
- [Hermes Agent Releases 页面](https://github.com/NousResearch/hermes-agent/releases)
- [Subagent Delegation 官方文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation)
