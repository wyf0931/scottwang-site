---
title: "RAGFlow：把 RAG 的瓶颈从 LLM 移回到文档本身"
description: "88,000 颗 Star 的开源 RAG 引擎。真正有价值的是 Document Understanding 和检索管线，不是又一个 Chat UI。"
date: "2026-08-17"
type: "notes"
kind: "note"
tags:
  - RAG
  - 知识库
  - Agent
  - 企业
---

**RAGFlow** 是 infiniflow 维护的一个开源 RAG 引擎，[GitHub 仓库](https://github.com/infiniflow/ragflow) 目前已经拿到约 88,596 颗 Star，开源协议 Apache-2.0。项目 2023 年 12 月 12 日开源，最新 release 是 2026 年 7 月 7 日的 v0.26.4。官方的一句话描述是 "RAG engine that fuses RAG with Agent capabilities to create a superior context layer for LLMs"。

市面上做 RAG 的框架已经很多，再写一个"又一个 RAG 框架"没有意义。RAGFlow 值得单独写一注的原因，在于它把关注点拉回了 RAG 真正卡住的地方，也就是文档如何被理解、切分、索引和召回。一句话，RAG 的瓶颈很多时候不在 LLM，而在文档。

## 传统 RAG 的问题

最传统的 RAG 流水线是 PDF 或 Word 先做文本提取，然后按固定长度切成 Chunk，再过 Embedding 落到 Vector DB。用户查一句，跑一次 Vector Search，挑 Top-K Chunks，塞给 LLM 生成答案。

用 LangChain 或 LlamaIndex 加一个 Milvus、Qdrant 或 Elasticsearch，Demo 阶段搭起来很容易。问题在于真到了企业文档，流水线就开始碎。一份 120 页的企业申报材料，里面有表格、扫描件、证书、图片、附件、目录、页眉页脚、跨页表格。粗暴 PDF extraction 加固定 chunk_size 会把表格结构、跨段落关系全部打碎，语义结构被破坏。

问题可以拆成四层。

| 层 | 典型问题 |
|---|---|
| Document Parsing | PDF、Word、表格、图片解析错误 |
| Chunking | 机械切块破坏语义 |
| Retrieval | Vector Search 找不到真正相关证据 |
| Generation | LLM 根据错误 Context 一本正经回答 |

很多人遇到回答不准，第一反应是换更强的模型。实际上垃圾解析加上垃圾 Chunk 再加垃圾 Retrieval，喂给再强的 LLM 也只会得到垃圾答案。RAGFlow 最值得理解的设计思想，是把 RAG 当成数据工程和信息检索工程来做，而不是简单的 LLM Prompt 工程。

## 核心能力一，Document Understanding

RAGFlow 最初建立差异化优势的地方在这里。它走 Document 到 Layout Analysis 到 Document Structure 再到 Text、Table、Image，最后聚合到 Semantic Blocks 这条路线。它做的是理解"这个东西在文档里是什么"，而不只是"这里有哪些字符"。

这件事对政策文件、标准、论文、报告、招投标材料、企业申报材料尤其重要。这些文档的价值不在文字本身，而在文字的组织结构。一份标准里的表格对应条款、附录对应正文、图片对应说明，结构被打破以后语义就跟着散了。

RAGFlow 现在也不只是跑自己的解析路线，已经逐步接入了 MinerU、Docling 和多模态模型解析等方案。2025 年以后这部分一直在扩展。

## 核心能力二，Chunking 不是简单切字符

普通 RAG 项目里 RecursiveCharacterTextSplitter 配一个 chunk_size 和 overlap，能跑起来，但会破坏语义结构。RAGFlow 更希望从 Document Structure 得到 Semantic Units，再把它们切成 Chunks。现在这个能力已经发展成 Parent-child chunking、PageIndex、RAPTOR、Dataset-level RAPTOR、Metadata、Table 和 image 的 context window、自动 metadata generation。2026 年的 Ψ-RAG 和 AHC 模式进一步把 RAPTOR 的语义组织从 document level 扩到 dataset level。

研究的问题已经从"怎么切 PDF"变成了"如何把非结构化知识转化成适合机器检索的知识结构"。

## 核心能力三，Retrieval 不只有 Vector Search

语义相似不等于答案相关。现代 RAG 一般做 Dense Search 加 Keyword 混合检索，再做一次 Rerank。RAGFlow 在 retrieval 这层已经做得比较完整。

但检索越复杂不代表一定越好。Issues 里已经有人报告开启 keyword 和 reranker 之后 retrieval latency 明显增加。最终还是要看 Recall、Precision、Latency、Cost 之间的取舍。

## 核心能力四，正在变成 Context Engine

RAGFlow 现在的定位已经从早期"企业知识库"明显向 Context Engine 和 Agent 平台扩张。2025 到 2026 陆续加入了 Agent workflow、MCP、Code Executor、Memory、Sandbox、Browser、Agent templates、Data Analytics Agent。2026 年还官宣支持 RAGFlow Dataset 到 OpenClaw Skill，Agent 可以把 RAGFlow 当成外部 Context Infrastructure 来用。

从"RAG 平台"这个标签已经不够准确，更值得关注的是它正在成为 AI 的 Context Infrastructure。

## 实际能干什么

第一件事是企业知识库。内部文档进来，变成 Knowledge Base，再供 Chat 用。制度库、技术文档库、产品资料、标准法规、FAQ、研究资料，都是这类场景。

第二件事是 Document QA。上传一份标准，比如 GB/T、ISO、欧盟法规或企业报告，问一句"这个标准对产品标签有什么要求"，系统返回 Answer 加 Citation。这是政策合规、法务、质量这类岗位最日常的需求。

第三件事是 Agent 的知识基础设施。Agent 用 Web Search、Browser、Python、MCP 做能力扩展，RAGFlow 负责从 Knowledge 到 Context，Agent 负责从 Context 到 Reasoning 再到 Action。两边职责划分比较合理。

## 技术栈和部署门槛

RAGFlow 是比较重的系统，不是 pip install 一个 Python 包。核心组件有 Python 后端、Web 前端、MySQL 或 OceanBase、Redis、Elasticsearch 或 Infinity、MinIO 或 S3 对象存储、Docker Compose、Kubernetes 和 Helm，再加各种 LLM、Embedding、Rerank Provider。

Demo 阶段 docker compose up 可以跑通，但 Production RAGFlow 完全是另一回事。实际要维护的是 RAGFlow 加数据库加 Redis 加搜索引擎加对象存储加 Embedding 模型加 Reranker 加 LLM 加 Document Parsing Workers 这一整套。Issues 里已经能看到真实工程问题，大批量 PDF 和 DOCX 的解析性能、memory consumption、task executor concurrency、embedding timeout、GPU contention、reranker compatibility、Elasticsearch 和 Infinity 的运维。

试起来简单，真正生产化并不轻。

## 和 Dify、FastGPT、LangChain 的关系

| 项目 | 真正擅长的问题 |
|------|---------------|
| LangChain | LLM Application Programming Framework |
| LlamaIndex | Data 和 Retrieval Framework |
| Dify | LLM App、Workflow、Agent Platform |
| FastGPT | 知识库加 Workflow 应用平台 |
| RAGFlow | Document 到 Retrieval 到 Context 的基础设施加 Agent |

边界正在快速模糊。RAGFlow 加入 Agent、MCP、Memory、Browser、Sandbox 之后和 Dify 已经有明显的功能重叠。准确看项目基因，Dify 核心出发点是"怎么快速构建 AI Application"，RAGFlow 核心出发点是"怎么给 AI 提供高质量 Context"。

## 批判性判断

第一，RAGFlow 最有价值的不是 Chat UI 也不是 Agent Builder，这些市场上太多。真正形成技术辨识度的是 Document Intelligence 加 Retrieval Pipeline。把这些拿掉，只剩 workflow 和 agent builder，不可替代性不强。

第二，Deep Document Understanding 有价值但不必神化。真实企业文档里的扫描 PDF、复杂表格、盖章文件、低质量图片、双栏论文、跨页表格、奇怪的 Word 和 Excel，没有 parser 能做到百分百理解。真正生产化需要 Parser、Quality Evaluation、Chunk Inspection、Retrieval Evaluation、Human Feedback 这一条完整链路。

第三，功能正在快速膨胀，从 RAG Engine 一路扩到 RAG 加 Knowledge Base 加 Data Connectors 加 Ingestion Pipeline 加 Agent 加 Workflow 加 Memory 加 MCP 加 Sandbox 加 Browser 加 Data Analytics。边界开始变宽，未来是专注做最好的 Context Engine，还是变成 All-in-one AI Platform，值得观察。

## 关联词

- **RAGFlow**，infiniflow 维护的开源 RAG 引擎，Go 实现，Apache-2.0 协议，GitHub 约 88,596 颗 Star。
- **Document Understanding**，从文档的 Layout、Structure 反推 Text、Table、Image 的语义角色，而不只是字符提取。
- **Semantic Blocks**，RAGFlow 内部的最小语义单元，从 Structure 推导而来，再聚合为 Chunk。
- **RAPTOR**，Recursive Abstractive Processing for Tree-Organized Retrieval，用树形结构对检索内容做层级组织。
- **Context Engine**，RAGFlow 2025 年之后的新定位，为 Agent 和 LLM 提供高质量外部上下文。
- **RAGFlow Dataset → OpenClaw Skill**，2026 年官宣的集成，让 OpenClaw 可以直接把 RAGFlow 当作外部知识源。

## 小结

RAGFlow 做的事情，本质上是把 RAG 的注意力从"换一个更强的 LLM"拉回到"把文档理解清楚"。它最有价值的地方在于 Document Intelligence 和 Retrieval Pipeline 这套底层工程，而不是又堆了一个 Chat UI 或 Agent Builder。从更宽的视角看，RAGFlow 值得作为 RAG 工程化的一次真实样本被认真读过，尤其是它处理 Document Understanding 和 Chunking 的方式，是理解现代 RAG 系统该怎么落地的重要参考。

## 参考资料

- [GitHub: infiniflow/ragflow](https://github.com/infiniflow/ragflow)
- [RAGFlow 官方文档](https://ragflow.io/docs)
