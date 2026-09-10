---
title: "OMA Studio"
description: "基于 Pi RPC 模式搭的本地优先 Agent 平台，Pi 管对话和会话，平台只管元数据和界面，两层各管各的。"
date: "2026-09-10"
status: "Active"
visibility: "Open Source"
stack: ["Python", "FastAPI", "SQLModel", "SQLite", "Alpine.js", "DaisyUI", "Docker", "Pi RPC"]
featured: true
repository: "https://github.com/wyf0931/pi-rpc-pydemo"
---

## Why

Pi 是一个很强的 coding agent，但它本身是命令行工具。想在浏览器里用它，聊天记录怎么存、Agent 怎么配置、生成出来的文件去哪找，这些它都不管。

常见的做法是把这些全部接管过来，平台自己存一份消息副本，自己管会话。这样做的代价是出现两份事实来源。平台里的对话和 Agent 本地的对话对不上，谁也不知道该信哪边。

OMA Studio 换了一种分工。Pi 继续拥有对话内容和会话记录，平台只保存 Agent 定义、聊天元数据这类自己的东西，不复制消息。两边用同一个 UUID 指向同一次会话，省掉一层映射。

## How

整个系统是一个 FastAPI 进程。它托管静态前端和 JSON API，往下通过 `pi --mode rpc` 启动 Pi 子进程，用 JSONL 在 stdin 和 stdout 之间通信，向上把事件转成 SSE 推给浏览器。每次发消息或取历史，都是一次短生命周期的 Pi 进程。

前端没有构建步骤，静态 HTML 加 Alpine.js 和 DaisyUI。助手消息用 marked 渲染，DOMPurify 消毒，代码高亮和 Mermaid 图表按需加载。模型输出永远不直接注入页面。

存储是 SQLModel 加 SQLite，只放平台元数据。Pi 的会话 JSONL 由 Pi 自己维护，平台不碰。Agent 生成文件放在工作目录，Library 页面负责汇总、搜索和下载。

Agent 的定义是显式的。指令、Provider、Model、内置工具白名单、extensions、skills、MCP server，每一样都要配置了才会生效。发现一个资源不等于启用它。一个聊天绑定一个 Agent，配置在会话开始时固定。

定时任务叫 Autopilots，可以按计划执行一条 Agent 指令，也能手动触发，运行历史和对应的聊天记录连在一起。

部署是单容器方案。FastAPI 应用层和 Pi 及其工具链的进程层放在同一个镜像里，数据、工作目录、日志全部走宿主机挂载。运维入口是 `bin/ops.sh start|stop|restart|status|logs`。日志为 JSONL 格式，带 `X-Request-ID` 做请求追踪。

## What

线上跑着一个实例，studio.ohmyagent.ai。日常在里面做几类事。

- 配置不同的 Agent。现在有 AI 情报专员、数据采集专家、图表设计专家、X 导师等十来个，各自绑定不同的指令和技能
- 每天的 AI 情报汇总由 Autopilot 定时跑，产出直接落在聊天记录里
- 采集网页和批量抓博客，靠 trafilatura、scrapling 这类 skill，产出的文件在 Library 里统一管理
- Marketplace 里浏览和安装 workspace 的 Skills、Extensions 和 MCP Server，也能从 skills.sh 搜索安装

本地跑起来也只需要三步。

```bash
cp .env.example .env
bin/ops.sh start
```

打开 `http://127.0.0.1:8000` 就能用。不用 Docker 的话，`bin/ops.sh start-dev 8000` 直接起一个带热重载的 uvicorn。

状态说明一下。现在是 MVP，单用户，面向 localhost。API、存储和沙箱边界都可能变，执行边界后续计划移到独立的 SandboxRunner 后面。
