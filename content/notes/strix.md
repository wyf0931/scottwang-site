---
title: "Strix：把 AI 变成渗透测试员，而不是更聪明的漏洞扫描器"
description: "一个开源的 AI 渗透测试 Agent，53,000 颗 GitHub Star，自动化的是渗透测试人员的工作流程，而不是规则检查。"
date: "2026-08-17"
type: "notes"
kind: "note"
tags:
  - Agent
  - 网络安全
  - 渗透测试
  - 工具
---

**Strix** 是一个开源的 AI 渗透测试 Agent，由 usestrix 在 2025 年 8 月发布，开源协议是 Apache 2.0，托管在 [GitHub](https://github.com/usestrix/strix)。截至 2026 年 8 月中旬，仓库已经拿到超过 53,000 颗 Star。它做的事情不算新奇，至少从概念上说。让它值得注意的，是它把 Agent Loop 这条思路真正落到了一个有明确职业参照系的工作流里，渗透测试工程师的工作流程，而且把验证和 PoC 一并做了。

## 它想解决什么

传统软件安全检测有两条主流路线，各有自己的问题。

一条是静态扫描，SAST、漏洞扫描器、规则引擎这一类。它们扫代码或者扫系统，输出一堆告警，"这里可能存在 SQL 注入"，"那里可能存在越权访问"。问题在于"可能存在"和"真的能被利用"是两回事，误报率高，安全团队每天要做大量人工复核。

另一条是人工渗透测试。真正的安全工程师走完整流程，先做信息收集，再找攻击面，接着尝试攻击，发现可利用的漏洞以后构造 exploit 去验证，最后写报告。这一步一步下来产出的漏洞质量高，但人工成本高，通常只能阶段性地做，没法持续跟得上开发节奏。

Strix 想回答的问题是，能不能让 AI Agent 承担一部分"真正的黑客工作"，而不只是做一个更聪明的规则检查器。它的核心承诺是 verified vulnerabilities，每一条漏洞都经过实际验证，附带可工作的 PoC 和复现步骤。

## 它怎么做到

Strix 的做法不是 LLM 加漏洞数据库。它把 LLM 放到一个完整的 Agent 循环里，再给它配一整套接近渗透测试工程师日常使用的工具。

Agent 能调用的东西包括 HTTP 拦截代理、浏览器自动化、Shell、Python 沙箱、OSINT 和侦察工具、静态代码分析、动态代码分析。它的工作方式是循环，先观察目标应用，再分析攻击面，然后制定攻击计划，调用工具执行测试，观察执行结果，调整攻击策略，再次测试，直到确认漏洞存在，并构造出可工作的 PoC。这就是 ReAct Loop 在网络安全领域的一个具体落地。

沙箱环境在这里是基础，Agent 所有的攻击动作都在隔离环境里跑，既保证测试有效，也避免把真实攻击打到生产系统。

## 一个 Agent 不够，Strix 是一群 Agent

Strix 不是单一 Agent 独自循环，它的结构是 Graph of Agents，不同 Agent 承担不同角色。

Recon Agent 做信息收集，去摸清目标应用的技术栈、暴露面、第三方依赖。Web Agent 专注 Web 攻击面，浏览器自动化、请求篡改、会话劫持这类操作。Code Agent 走代码分析路线，读源码、找危险调用、拼接数据流。Exploit Agent 负责最后的临门一脚，把前三个 Agent 的发现串起来，构造可执行的 exploit，跑一遍验证漏洞确实存在。

这些 Agent 之间紧密协作，它们共享发现，串联漏洞链路，甚至可以并行工作。官方把这套体系形容为"协作的 AI Red Team"。最终所有 Agent 的输出汇总成一份安全报告，报告里既列出告警，也附带从发现到 PoC 到复现步骤到修复建议的完整链路。

## 实际用起来

Strix 的产品形态是一个 CLI 工具和一个云平台 app.strix.ai。

CLI 安装方式比较直接，一行命令即可，`curl -sSL https://strix.ai/install | bash`。使用方式也简单，目标可以是一个本地应用目录、一个 GitHub 仓库、或者一个线上 URL，分别对应白盒、灰盒和黑盒三种测试模式。

在 CI/CD 里，它可以集成 GitHub Actions，在 PR 阶段自动触发扫描，把安全问题挡在合并之前。

云平台额外提供的能力包括一键 autofix，AI 生成安全补丁作为 PR 提交；持续渗透测试，扫描不跑一次就停，会跟着应用一起迭代；以及 DevSecOps 集成，覆盖 GitHub、GitLab、Bitbucket、Slack、Jira、Linear 和常见 CI/CD 工具链。

Strix 给 Claude Code、Cursor、Codex 这些 Coding Agent 提供了 skills，通过 `npx skills add usestrix/strix` 安装，这一点值得单独说。这层设计的意思是，你的代码 Agent 在写完代码以后可以直接调用 Strix 做一次渗透测试，发现问题以后 Strix 还能反过来生成修复代码，再重新扫描一遍。这是一个典型的 Agent 调用专业 Agent 的架构。

## 值得关注的地方

真正值得琢磨的是 Strix 怎么把"Agent 的价值"这件事演示得很清楚。

Agent 的价值不在于 LLM 比人更懂安全知识，大模型再强也只是会回答问题。真正的差异在于，Agent 能规划任务，操作真实工具，读取环境反馈，然后基于反馈继续行动。这种"规划、操作、观察、继续行动"的闭环，才是 Agent 区别于聊天助手的部分。

Strix 把这条闭环套在了一个有明确职业参照系的工作流上，渗透测试工程师的日常工作。它有具体的工具、具体的输出、具体的质量标准和验收方式，不是泛泛地"用 AI 做安全"。这也是它在半年多时间里拿到五万三千颗 Star 的原因之一。

从 Agent OS 的视角看，Strix 是一个适合拆架构的典型样本，它的 Agent Loop、工具调用、沙箱环境、Multi-Agent 协作，每一项都可以在别的 Agent 产品里找到对应设计。

## 关联词

- **Strix**，由 usestrix 开源的 AI 渗透测试 Agent，Apache 2.0 协议，GitHub 53,000+ Star，主打 verified vulnerability 加可工作的 PoC。
- **Agent Loop**，Agent 循环工作的方式，观察环境、制定计划、调用工具、观察反馈、调整策略，再回到观察环节继续迭代。
- **ReAct Loop**，Reasoning and Acting 的缩写，Agent 领域里最常见的循环范式之一，Strix 就是这条思路在网络安全场景的落地。
- **Graph of Agents**，多 Agent 协同的组织方式，不同 Agent 承担不同角色，共享发现，串联成完整工作流。
- **PoC**，Proof of Concept 的缩写，概念验证，这里指的是一个可以实际运行的漏洞利用样本，用来证明漏洞真的能被利用。
- **DevSecOps**，把安全实践嵌入开发和运维流程的理念，Strix 通过 CI/CD 集成和 autofix 能力参与这一环节。

## 小结

Strix 做的事情，本质上是把渗透测试工程师的工作流程拆解成一个个 Agent 可以执行的环节，再把这些环节用工具链和循环逻辑串起来。它自动化的是"规划、操作、观察、验证"这条完整链路，自动化的对象和传统扫描器完全不同。传统扫描器在自动化规则检查，Strix 在自动化整个测试流程，两者的差别不在程度，而在种类。从更宽的视角看，Strix 是当前 Agent 浪潮里少数几个把 Agent Loop 真正落地到有明确业务闭环的产品之一，值得持续关注。

## 参考资料

- [GitHub: usestrix/strix](https://github.com/usestrix/strix)
- [Strix 官网](https://strix.ai)
- [Strix 官方文档](https://docs.strix.ai)
