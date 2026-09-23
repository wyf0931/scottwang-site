---
title: "读 OpenDesign，看它怎么把 CLI 变成设计引擎"
description: "一个 5 个月拿到 97k star 的项目。它不重新实现 agent，把本机已经装好的编码 CLI 变成设计引擎。"
date: "2026-09-23"
type: "writing"
kind: "essay"
tags: ["OpenDesign", "Agent", "Design System", "Architecture"]
draft: false
---

Claude Design 让一条完整的 agent loop 第一次跑通，从需求澄清一路走到交付，全程在一个产品里。问题是它关着门，而且只认 Anthropic 的模型。

OpenDesign 的 README 第一句就把这件事点出来了。它自称 Claude Design 的开源替代品，读下去会发现，它替代的是那条 loop 的封闭性。

我 clone 下来翻了一遍仓库。项目 2026 年 4 月底创建，到 9 月 23 日拿 97,703 star 和 11,336 fork，Apache-2.0 协议。5 个月这个增速配得上一个具体判断，也值得花时间搞清楚它到底做了什么。

## 编码 agent 缺一个交付的位置

现在的编码 agent 写代码够用，产出物落地一直别扭。做个 landing page，agent 在终端里吐一堆 HTML，你自己开浏览器看。要做 deck、图片、短视频，工具链自己凑。

OpenDesign 想占这个位置。怎么生成它不管，管的是生成出来长什么样、在哪预览、怎么导出成 HTML、PDF、PPTX、MP4。

README 里一句话讲清了这件事，你的 CLI 变成设计引擎，笔记本变成工作室，团队的 DESIGN.md 变成品牌契约。三句话把 CLI 该干什么、产出物该去哪讲清楚了。

## 不重新实现 agent

这是整个项目最关键的决定，也是它和大多数 AI 设计产品分得最开的地方。

最重的一块在 apps/daemon，一个本地特权进程，对外暴露 `od` 命令行。它拥有 HTTP API、agent 进程管理、skills、design systems、artifacts、静态服务、SQLite 和 MCP server，摆在一起像个完整平台。

翻进 apps/daemon/src 会发现里面没有 agent loop。它 spawn 的是你本机已经装好的 CLI。README 列了 26 个受支持的本地可执行文件，Claude Code、Codex、Cursor、Hermes、Kimi、OpenCode、Antigravity 都在里面。DeepSeek Harness 通过官方 dsh CLI 是一等公民运行时，支持结构化流、模型发现、取消和 session resume。

接入走 MCP，`od mcp install claude` 一行装好。agent 通过 MCP 读仓库里的 skill 和 design system，写文件到 artifact 目录，daemon 用沙箱 iframe 预览，最后导出。

一个 CLI 都没装也有兜底。BYOK proxy 走 `POST /api/proxy/{anthropic,openai,azure,google,ollama,senseaudio}/stream`，贴 baseUrl、apiKey 和 model 就能跑，不 spawn 进程。daemon 边缘做 SSRF 防护，拦内网 IP、link-local 和 CGNAT。

docs/architecture.md 里有段历史说明，明确否定了第一版草稿里的 WebSocket session.generate 消息、内存 session bus、history.jsonl 和 three-root watched skill registry。实现落到了 HTTP/SSE、SQLite 持久化、request-time registry 和 packaged sidecar 上，旧方案被直接标成不是当前部署模式或兼容性承诺。

5 个月的项目，架构迭代过一次，旧账摊开写在文档里。这比只画一张架构图诚实。

## 内容比引擎重

我把仓库里的几个数字拉出来比了一下。

apps 层是五个子应用加十几个 package，代码量不小。项目形态由三个内容目录决定。skills/ 有 165 个，design-systems/ 有 154 个，design-templates/ 有 115 个，规模明显超过引擎代码。

skill 复用的是 Claude Code 的 Agent Skills 格式，一个目录加一个 SKILL.md，frontmatter 写 name、description、triggers 和 od 元数据，body 是自由 Markdown。OD 读它，不改它。docs/skills-protocol.md 里有一句兼容性承诺，带 SKILL.md 的 bundle 仍然能被任何支持 Agent Skills 格式的 agent 读取。

design-systems/ 里躺着一份份品牌设计系统，stripe、vercel、notion、linear、apple、airbnb、wechat、figma、claude 都在。它们是 DESIGN.md 文件，可版本管理，可以直接进你的 git 仓库。README 里说的品牌契约具体就是这些东西。

craft/ 目录放品牌无关的通用规则，skill 通过 `od.craft.requires` opt in。这套分层挺干净，品牌和技法解耦。

## 两个工程细节

mocks/ 目录让我停了一下。它是从匿名 Langfuse trace 构建的 replay-based mock CLI，覆盖 opencode、claude、codex、gemini、cursor-agent、deepseek、qwen、grok，还有 ACP 家族的 devin、hermes、kilo、kimi、kiro、vibe，以及 AMR 的 vela。用法是 PATH-overlay drop-in，丢进 PATH 就替换掉真实 CLI，跑测试和自检用。

支持 26 个 CLI 不是把名字列上就完事，每个 agent 的行为得可预测。mocks/ 干的就是这个。

CONTEXT.md 里是术语表，每个术语配一条 Avoid 清单。Project 不要叫 repo、folder 或 session。数据模型是 Project 包含若干 Normal Artifact，每个 Normal Artifact 由一个 Artifact Entry File 和一份 Artifact Manifest sidecar 元数据组成。Live Artifact 单独一类，是可刷新的输出，带 source data 和 preview state。MCP 调用不指定 target 时默认走 Active Project，也就是用户最近交互过的那个。

这套命名约束看着麻烦，但要被很多 agent 消费的协议必须这样。

## 判断

生成模型和设计编辑器它都没动，它占的是 agent 产出物落地的位置。

三个数字说明重心，165 skills、154 design-systems、115 templates。增长的动力在内容这一侧。Anthropic 的 loop 是产品，OpenDesign 的 loop 是文件系统，这是两者最根本的区别。

风险也清楚。0.23.1 的版本号加 5 个月历史，架构契约还在快速变动。核心体验要么依赖你自己有 agent CLI，要么付费上 AMR Cloud。97k star 对一个年轻项目是极高热度，社区治理压力只会越来越大。
