---
title: "Sub2API 笔记"
description: "一个 8 个月拿到 3.7 万星的 Go 项目，把 Claude、OpenAI、Gemini 的订阅额度通过 API 分发出去。从仓库结构和生态状况写写这个项目的轮廓。"
date: "2026-08-17"
type: "writing"
kind: "essay"
tags: ["GitHub", "Go", "API Gateway", "Open Source"]
draft: false
---

Wei-Shaw/sub2api 在 GitHub 上有 3.7 万星。仓库 2025 年 12 月 18 日创建，到今天刚好八个月。8 个月到 3.7 万星的 Go 项目不多，尤其在它做的事情并不特别复杂的情况下。

这个项目做的事情很直接。你有 Claude Pro、ChatGPT Plus、Gemini Advanced 这些订阅，里面带着一堆额度。Sub2API 把这些额度包装成 OpenAI 兼容的 API，通过自己生成的 API Key 分发出去。使用者不用改代码，只换 base URL 和 key。平台负责鉴权、计费、并发控制、请求转发。

## 为什么涨这么快

需求是真实的，而且足够大。这几个订阅月费不低，额度通常用不满。把额度共享出去，对持有者来说等于回收成本，对使用者来说等于低价拿到大模型能力。中间这件事需要一个人来做调度，Sub2API 就填了这个位置。

它踩的时机也刚好。Claude Code、Codex、Gemini CLI 这类工具把 AI 编程推成了日常场景，订阅额度消耗比以前快得多。额度紧张的时候，共享的需求尤其强烈。

项目声明写得很直白。README 顶部一段 Important Notice 明确说使用可能违反 Anthropic 等上游的 ToS，作者不承担账号被封、数据丢失的责任。同时声明项目从未授权任何个人或机构商业化。这两条声明放在 README 最显眼的位置，说明作者对这件事的风险边界很清楚。

## 仓库结构

后端 2372 个 Go 文件，Go 版本 1.26.6，依赖列得很长。框架层是 Gin 做 HTTP，Ent 做 ORM 和 schema migration，配置用 Viper。日志用 zap，token 处理用 tiktoken-go。数据库是 PostgreSQL 15+，缓存和队列用 Redis 7+。

目录按内部模块切得很细，`internal` 下面有 config、domain、handler、middleware、model、payment、platform、repository、securityaudit、server、service、setup、web 这些目录。`cmd` 里有 server 主入口和几个辅助命令，`jwtgen`、`profit-preview`、`cleanup-ingress-reject-logs` 这些名字一看就知道在干什么。`migrations` 目录有 263 个 SQL 文件，schema 从初始化到现在已经演进了很多轮。

前端是 Vue 3.4+，Vite 5+，TailwindCSS。管理后台直接跑在后端进程里，没有独立的前端服务。部署支持一键脚本、Docker Compose、Caddy 反向代理三种方式。

计费层用 `shopspring/decimal` 做精确计算，不走 float。支付接了 EasyPay、支付宝、微信支付、Stripe，这些都在 `internal/payment` 里。上游接入在 `internal/platform` 下，目录名很窄，主要是 OAuth 和 API Key 两类。

架构上没有引入消息队列或事件总线，请求是同步转发的。模型选择层叫 Composite Groups，README 文档单独写了 `COMPOSITE_GROUPS.md`，本质是一层路由配置，把请求模型名解析到具体的 provider。

## 生态状况

README 里 Sponsors 列表很长，我数了一下大概 25 家。这些 sponsor 几乎全是 API 中转商、账号供应商、代理 IP 服务商，没有一家是直接用 Sub2API 做产品研发的公司。README 里每个 sponsor 的推广文案都在强调低价、稳定、不封号、发票、Claude Code 兼容。

活跃在上面的是把开源项目流量转成自己生意的小卖家。作者反复声明不授权商业化，但赞助商列表本身已经成了一个隐形的商业街。

社区项目部分列了几个生态扩展，但活跃度明显不如赞助商列表热闹。项目本身的 2727 个 open issues 和 7716 个 fork 也说明，使用者和想二开的人很多，但真正提 PR 的很少。

## 边界

Sub2API 是一个能用的中转平台，不是可以接进生产系统的组件。

LGPL-3.0 许可证本身没问题，但加上作者明确说不授权商业化，任何把它接入自己产品的想法都站不住。你部署在自己内部用，法律风险由自己扛，README 已经写明了。

从代码角度看，2372 个 Go 文件不算小，但依赖清单里有些东西让人在意。`github.com/refraction-networking/utls` 在依赖里，这个库用来伪造 TLS 指纹，通常是绕过反爬和风控的手段。用它说明项目对上游的反滥用检测是有明确对策的，这本身就说明这件事在灰色地带。

并发控制和限流是配好的，sticky session 也在，但 upstream 的 ToS 风险不是代码能解决的。你的账号能不能用多久，取决于上游什么时候改策略，不取决于你的代码写得怎么样。

---

**来源**
- [Wei-Shaw/sub2api](https://github.com/Wei-Shaw/sub2api) 仓库
- Go module `go.mod`
- README 项目声明与功能描述
- GitHub API 仓库元数据