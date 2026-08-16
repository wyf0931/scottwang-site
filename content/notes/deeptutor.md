---
title: "DeepTutor：不是 AI 家教 App，而是一套学习场景的 Agent Runtime"
description: "35,000 颗 Star，把 RAG、Memory、Agent Loop、Tool、Skill、MCP、Sub-Agent 统一到一套长期学习 Runtime 里。它最值得学的，是那个三级文件 Memory。"
date: "2026-08-17"
type: "notes"
kind: "note"
tags:
  - Agent
  - Agent OS
  - RAG
  - Memory
  - 学习
---

**DeepTutor** 是 HKUDS 在 2025 年 12 月开源的一个学习场景 Agent Runtime，[GitHub 仓库](https://github.com/HKUDS/DeepTutor) 目前已经拿到约 35,000 颗 Star，开源协议是 Apache 2.0。它把自己形容为 Lifelong Personalized Tutoring，字面翻译是终身个性化辅导。这个标签不算抢眼，它的价值其实不在标签上。值得注意的，是它把 RAG、Memory、Agent Loop、Tool、Skill、MCP、Sub-Agent 和多阶段 Workflow 统一到同一套 Runtime 里，跑在一个人身上、一段时间上，而不是跑在单次会话里。

让 DeepTutor 值得注意的，不是它能把题解出来、把论文查出来、把知识点讲出来。这些功能单独的任何一个，市面上类似的 AI 学习产品都已经做到了。它有意思的地方在于，它把这些功能组织成了一个完整的 Agent 系统，而且这个系统是有长期记忆的、有层级分工的、可以持续跟着一个学习者走很久的那种。

## 它想解决什么

市面上做 AI 学习的工具不少，但它们大多有一个共同的问题，不同功能之间的记忆是割裂的。

你用它的 Chat 功能问了三个问题，Chat 记录在 Chat 的历史里。你去做一套 Quiz，Quiz 有 Quiz 的做题记录。你扔给它一篇论文做 RAG，RAG 检索了这篇论文的语料库。三者之间互不相干。同一个学习者在不同模块里，像是不同的用户。

DeepTutor 想回答的问题是，能不能让所有这些 Agent 共享同一个 learner state，把"这个学习者学到了什么、哪里卡住、喜欢什么、不喜欢什么"凝成一个系统级的事实，不再散落在各个模块各自的历史里。

这种边界克制是产品设计里的聪明做法。它不试图做一个更聪明的解题器，而是试图把"学习"这件事的底层数据面做通。

## 把功能从 Feature 变成 Capability

传统 AI 学习工具的实现方式，通常是一堆并列的函数，`chat()`、`solve()`、`quiz()`、`research()`，各自负责一个功能，互不干涉。DeepTutor 的做法不同，它把这个结构拆成了两层。

第一层是 Tools，也就是单次动作。RAG、web_search、paper_search、read_memory、write_memory、exec、code_execution、read_skill、github、cron、ask_user，都是工具。一个工具是一次动作，"帮我搜索一下这篇论文"，动作做完就回来了。

第二层是 Capabilities，也就是完整的多阶段任务。chat、mastery_path、deep_solve、deep_question、deep_research、visualize、math_animator，这些都是能力。一个 Capability 是一段任务，"帮我完整研究这个主题并形成报告"，需要多个步骤、多个工具协作才能完成。

这层区分的意义在于，Agent 系统的组织方式是把任务拆到合适的颗粒度，让工具和能力各归各位。一个 Agent 调用一个 Capability 的时候，它实际上是在调度一组 Tools 的组合，而不是直接调用另一个 Feature。

配套还有一套 ToolMountFlags。系统在运行时会根据上下文决定挂载哪些 Tool，有 KB 才挂载 RAG，有附件才挂载 read_source，有沙箱才挂载 exec。不是把所有 Tool 的 schema 一股脑塞进 context 里。这个做法节省上下文、降低误调用率，是 Agent 工程里一个非常正确但又容易被忽略的原则。

## 把学习状态做成基础设施

DeepTutor 最值得学的地方，是它的 Memory 设计。

它没有用常规的 vector store 做法，而是做成了三级文件 Memory，刻意追求可读、可管理、可审计。这个选择本身就说明它想解决的是一次性检索之外的问题，也就是长期跟踪。

L1 是 Raw Traces，每次 interaction 的原始记录，按 surface 和日期存成 jsonl。surface 包括 chat、notebook、quiz、kb、research 这些不同的交互面。

L2 是 Surface Facts，从 L1 里提炼出来的结构化事实，按 surface 存成 md 文件。一个 surface 的零散对话记录，在这里被压成了这个 surface 里真正有用的知识点、误区、进度。

L3 是 Cross-surface Synthesis，跨所有 surface 综合出来的一份全局画像，包括 profile.md、recent.md、scope.md、preferences.md 这类文件。一个学习者的整体画像、最近状态、关注范围、偏好，都从这里读。

三级之间是可向下追溯的。L3 里的一条结论，可以追到 L2 里的某个 fact，再追到 L1 里的原始 jsonl 记录。这套设计可比"Conversation 直接 Embedding 塞进 Vector DB"那套做法走得远，Memory 从黑盒变成了可以审计的结构化资产。

## 可扩展的 Agent Platform

DeepTutor 不是把能力都硬编码的，它支持 Built-in Tool、MCP、CLI Apps、Skills、RAG、Sub-Agent、Coding Agent、Memory、Search、Sandbox，多种接入方式。

Skills 用的是开放的 Agent-Skills 格式，就是 SKILL.md 加 reference files 那一套，不是 DeepTutor 专属。这个格式在多个 Agent 框架之间已经是事实标准，选择开放格式意味着生态兼容性。

MCP 这边支持 45 个 curated hosted MCP servers，也支持 OAuth 2.1 认证和自定义 Remote MCP。也就是说它能直接对接现有的 MCP 生态，不需要自己再造一套协议。

再往外一层，DeepTutor 通过 consult_subagent 调用外部 Coding Agent，Claude Code、Codex、Gemini CLI、Kimi CLI 这些都可以接入。到这里已经非常接近"Agent 调 Agent"的形态了，一个学习 Agent 在自己的 workflow 里，把编码任务委派给专业 Coding Agent 去做，做完再回到学习上下文里继续。

## 关键架构事实

系统的统一入口是 ChatOrchestrator，它的职责是把用户请求转成 UnifiedContext，然后选择走哪个 Capability，按 ToolMountFlags 决定挂载哪些 Tools，最后执行。核心源码集中在 orchestrator.py、registry、builtin_capabilities.py、stream.py 和 stream_bus.py 这几个文件里。

Agent Loop 是 think-act-observe，ReAct 之上再叠一层 Planning、Memory、RAG、Stage、Capability、Subagent、Personalization。这套循环本身不新鲜，是把社区成熟的模式在垂直场景里重新组合了一遍。

RAG 侧支持 Multi-RAG，LlamaIndex、PageIndex、GraphRAG、LightRAG、Obsidian、Tencent IMA 都能用，Parser 层还有 MinerU、Docling、markitdown、PyMuPDF4LLM、LiteParse 这些插件。这个多引擎选择空间是认真做了的。

DeepTutor 没有自己的 Base Model。它是 Runtime，不是 Model 项目。支持 OpenAI、Anthropic、DashScope、Ollama、LM Studio、llama.cpp、vLLM、Lemonade 等等，凡是 OpenAI-compatible 端点都能接。要 SFT 的话得自己用 LLaMA-Factory 或者 TRL 微调，再把模型通过 API 喂给 DeepTutor。

## 实际用起来

命令行层面，`deeptutor run chat "..."` 是日常对话，`deeptutor run deep_solve "..."` 是深度解题，`deeptutor kb create xxx --doc xxx.pdf` 是把文档加进 KB，`deeptutor memory show` 是把当前 learner state 打印出来看一下。

部署方面支持 Docker 生产环境，前端是 Next.js 跑在 3782 端口，后端是 FastAPI 跑在 8001 端口。官方站点在 deeptutor.info，可以在线试玩。

## 值得关注的地方

把 Strix、Needle、DeepTutor 三篇放在一起看，正好是 Agent 架构的三个侧面。

Strix 演示的是 Agent 等于 LLM 加循环加工具，把安全专家的工作流程自动化了。Needle 演示的是 Agent 不等于一个巨大的 LLM，小模型可以负责 Act。DeepTutor 演示的是一个垂直领域如何把 Capability、Runtime、Memory、RAG、Tool、Skill、MCP 组装成一个完整的学习场景 Agent OS。

三者互补。Strix 是 Agent 在工作流程自动化这一侧，Needle 是 Agent 在模型层这一侧，DeepTutor 是 Agent 在系统架构这一侧。把它们串起来，基本能画出当前 Agent 架构的全景轮廓。

## 关联词

- **DeepTutor**，HKUDS 团队 2025 年 12 月开源的学习场景 Agent Runtime，Apache 2.0 协议，GitHub 35,000+ Star。
- **Learner State**，跨所有模块共享的学习者状态，是 DeepTutor 区别于普通 AI 学习工具的核心设计。
- **三级文件 Memory**，L1 Raw Traces、L2 Surface Facts、L3 Cross-surface Synthesis，可读、可管理、可审计。
- **Tool vs Capability**，Tool 是单次动作，Capability 是多阶段任务，两者分层调度。
- **ToolMountFlags**，系统根据上下文动态决定挂载哪些 Tool，避免把所有 schema 都塞进 context。
- **Multi-RAG**，LlamaIndex、GraphRAG、LightRAG、Obsidian 等多个 RAG 引擎可选，Parser 层也支持多插件。
- **consult_subagent**，把编码任务委派给 Claude Code、Codex、Gemini CLI 等外部 Coding Agent 的机制。
- **ChatOrchestrator**，系统统一入口，负责 UnifiedContext、Capability 选择、Tool 挂载和最终执行。

## 小结

DeepTutor 做的事情，本质上是把"一个人一段时间内的学习过程"这件事，从一堆并列的孤立功能，重构成了一套有共享状态、有层级分工、有长期记忆的 Agent 系统。它最有价值的地方在于它展示了 Runtime 层面该如何组织 Memory、Tool、Capability、RAG、Sub-Agent 这些组件，而不是单看它能解得多快的题。从更宽的视角看，DeepTutor 是一个已经跑起来的 Learning-oriented Agent OS 的真实工程样本，扒它的源码去理解 Agent 架构，比读一篇架构博客更直接。

## 参考资料

- [GitHub: HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor)
- [DeepTutor 官网](https://deeptutor.info/)
- [Strix 笔记](/notes/strix/)
- [Needle 笔记](/notes/needle/)
