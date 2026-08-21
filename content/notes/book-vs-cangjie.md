---
title: "book-to-skill 与 Cangjie：两个 Book to Skill 项目，两种成熟度"
description: "同一赛道，两种路线。book-to-skill 是软件工具，Cangjie 是 Prompt 工程。判断开源项目的技术含量，要看代码，不看 README。"
date: "2026-08-17"
type: "notes"
kind: "note"
tags:
  - Agent
  - Skill
  - 开源项目
  - 对比
---

把书变成 Agent 可执行的 Skill，这两个项目回答的是同一个问题。**book-to-skill** 由 virgiliojr94 在 2026 年 5 月开源，[GitHub 仓库](https://github.com/virgiliojr94/book-to-skill) 目前 22,149 Star，MIT 协议。**Cangjie** 由 kangarooking 在 2026 年 4 月开源，[GitHub 仓库](https://github.com/kangarooking/cangjie-skill) 目前 8,083 Star，AGPL-3.0 协议。两个仓库的 README 都写得很漂亮，但把它们放在同一技术等级上是不合适的，一个是真正的软件工具，另一个本质是 Prompt 加工作流规范加模板。

## 把 Cangjie 的名词拆掉

Cangjie 的自我描述是一条很顺的流水线，Adler Analysis 分析阅读，5 Agent Parallel Extraction 五个并行提取器，Triple Verification 三重验证，RIA++ 拆书结构，Zettelkasten 知识卡片，Stress Test 压力测试。这一串名词连起来，像一套 multi-agent knowledge distillation system。

打开仓库结构看一下，里面是 `SKILL.md`、`methodology/`、`extractors/`、`templates/`、`scripts/` 这五层。没有 Python package 的目录组织，没有测试套件，没有模型编排引擎，也没有进程间通信的代码。README 自己也承认，`extractors/` 里面是五个并行提取器的 prompt 定义，不是并行 Agent 的 runtime。

Triple Verification 这一段，要求 LLM 自己判断候选知识是否满足跨域佐证、预测力、独特性三个标准。它确实叫验证，但执行验证的是同一个大模型，输入是候选知识，输出是一个 pass/fail 判断。这在工程上更准确的叫法是 LLM self-evaluation rubric，和真正有多 evaluator、有 ground truth、有 ablation 的 verification pipeline 不是一回事。

README 里还有"25% 到 50% 通过率"这样的数字。一个数字要站得住，需要数据集、样本量、evaluator、重复实验、benchmark、人工复核这些条件。这套实验条件在仓库里都找不到。它更像是对自己流程的主观估计，甚至是 README 的修辞手段，不是可复现的实验结果。

## book-to-skill 更工程

book-to-skill 的"24 到 51 倍 token 下降"也不该直接信，但它的数字至少放在了一个工程语境里。仓库里有 `docs/performance.md` 记录每本书的 token 数据，有 `tools/discovery_tax.py` 做自动发现，有 `book_to_skill/` Python 包，有 `tests/` pytest 套件，有 skill validator，有 CLI，有 dependency probing，有 release history。

它的核心架构并不复杂，甚至非常朴素。不同格式的文档，比如 PDF、EPUB、DOCX、HTML、RTF，交给 Python 的确定性提取器处理，pypdf、pdfminer、docling、pdftotext、OCR detection 都在里面。提取器把文档转成干净文本和结构，再交给 LLM 按 SKILL.md 的规范工作，最终产出 `SKILL.md`、`chapters/`、`patterns.md`、`glossary.md`、`cheatsheet.md` 这一套 Skill 文件。

这条链路的每一步都能被写进测试、被独立复现、被增量更新。真正的软件创新谈不上大，本质是 document parsing 加 prompt-driven transformation 加 skill packaging。但它没有把所有东西包装成一套新的 AI 科学，解决的是一个具体的工程问题，不同格式的文档如何稳定转成 Agent 可消费的 Skill。

归类的话，book-to-skill 是小而实用的 AI tooling，Cangjie 是 Prompt Engineering 项目。

## 时间线

Cangjie 创建时间更早，2026 年 4 月 16 日。book-to-skill 5 月 1 日创建，稍晚半个月。但传播节奏上，book-to-skill 在 5 月 23 日就上了 Trendshift 榜单，5 月 31 日已经有外部文章介绍它。Cangjie 的官方 v1.0.0 对应 6 月 3 日的仓库状态，明确写了"把一本书蒸馏成一组可执行 AI Skills"。

Cangjie 的仓库把 book-to-skill 设成了 GitHub topic，这个词可能指通用类别也可能指具体项目，不构成借鉴证据。Cangjie 也明确写了自己的思想来源是 nuwa-skill，以及 Adler 分析阅读法、赵周 RIA 拆书法、Zettelkasten。

公开可验证的时间证据偏向 book-to-skill 更早被传播，但距离证明 Cangjie 是从它衍生出来，还差一截。

## 为什么它们看起来这么像

两个项目的核心产品假设确实高度同构。

| 维度 | book-to-skill | Cangjie |
|------|---------------|---------|
| 输入 | 书籍、文档 | 书籍延伸到视频、播客、访谈 |
| 问题 | 读过但无法持续使用 | 看过听过但无法实际调用 |
| 传统方案 | PDF 搜索、RAG、笔记 | 摘要、笔记、字幕整理 |
| 核心思想 | 结构化不等于总结 | 蒸馏不等于摘要 |
| 输出 | Agent Skill | Agent Skills |
| 最终目的 | 让作者知识进入工作流 | 让方法论进入真实决策 |

Product framing、输入、输出、知识单元定义（frameworks、principles、techniques、anti-patterns）这四个层面几乎逐项对齐。这不是普通的"都做 AI"级别的相似。

但 Book 到 Skill 这个想法在 2026 年 Agent Skills 爆发后是非常自然的延伸。nuwa-skill 把个人方法蒸馏成 Skill 之后，把书蒸馏成 Skill 是顺理成章的下一步。单凭 idea 不能判定借鉴。真正有鉴别力的是 wording、file schema、knowledge taxonomy、prompt structure、execution sequence 和具体的 design decisions，这些需要在仓库代码和 prompt 文本层面逐条比对。

## 两条路已经分叉

book-to-skill 走的是 Knowledge Compiler 路线，越做越工程化。146 个 commits，完整的包结构、测试、工具、文档。它解决的问题是，怎么可靠、高效、低 token 地把大量文档编译成 Agent 可消费的知识资产。

Cangjie 走到了另一个方向，从内容走到方法论再走到验证过的 Skill Graph。五个专项提取器分别负责 framework、principle、case、anti-pattern、terminology。RIA++ 的 Skill 结构拆成 R 原文、I Interpretation、A1 书中案例、A2 触发场景、E Execution、B Boundary。Zettelkasten Skill Graph 用 depends、contrast、combine 三个关系把 Skill 连起来。Stress Test 用诱饵题测 Skill 是否误触发。

它研究的问题是，什么知识有资格成为一个 Skill，以及蒸馏完之后能不能真的用。

| 维度 | book-to-skill | Cangjie |
|------|---------------|---------|
| 软件工程 | 高 | 低 |
| 文档解析 | 扎实 | 弱 |
| Prompt 工程 | 中等 | 强 |
| Workflow 设计 | 中等 | 强 |
| 方法论包装 | 朴素 | 完整 |
| 可复现性 | 强 | 一般 |
| 实际易用性 | 强 | 中等 |

Cangjie 的价值类型和 README 给人的第一感觉有落差。它真正优秀的地方，是把复杂的 LLM 知识提炼流程产品化、结构化、命名化，把复杂 Agent 系统的发明留给了别人。

## 借鉴的结论

目前证据不足以判定抄袭。仓库里没有代码复制，prompt 文本里没有大段雷同，README 结构也不相同，知识单元的文件 schema 也有明显差异。最稳妥的判断是赛道趋同，Agent Skill 出现以后，把长文本结构化成 Skill 本身是非常自然的方向。

真正值得研究的问题，是哪些东西有技术价值可以拿过来用。book-to-skill 的工程底座，文档解析、格式适配、chunk 和 chapter detection、CLI、validator、tests，是一套可以独立复用的 Knowledge Compiler 骨架。Cangjie 的 Prompt workflow，framework extraction、anti-pattern extraction、boundary、application scenario、cross-skill relation，是 Skill 结构设计上的具体思路。两者各取所长，能组装出更严谨的 Knowledge 到 Skill 的编译管线。

## 关联词

- **book-to-skill**，virgiliojr94 2026 年 5 月开源的书籍到 Agent Skill 编译工具，22,149 Star，MIT 协议，本质是 document parsing 加 prompt-driven transformation 加 skill packaging。
- **Cangjie**，kangarooking 2026 年 4 月开源的书、视频、播客蒸馏工具，8,083 Star，AGPL-3.0 协议，本质是 Prompt 加工作流规范加模板。
- **Knowledge Compiler**，book-to-skill 代表的路线，关注怎么把知识编译进去，核心能力是格式解析、chunk detection、validator、CLI。
- **Methodology Distiller**，Cangjie 代表的路线，关注什么知识值得蒸馏进去以及蒸馏完能不能用，核心能力是 framework 提取、anti-pattern 提取、boundary、cross-skill relation。
- **RIA++**，Cangjie 定义的 Skill 结构，拆成 R 原文、I Interpretation、A1 书中案例、A2 触发场景、E Execution、B Boundary 六段。
- **Zettelkasten Skill Graph**，Cangjie 用 depends、contrast、combine 三个关系把 Skill 之间连成网络的结构。

## 小结

两个项目回答同一个问题，但成熟度不在一个量级。book-to-skill 是朴素但扎实的工程实现，Cangjie 是命名完整但工程薄弱的 Prompt 项目。一个能跑、能测、能改、能复用，另一个能提供一套知识蒸馏的思维方式，但落到执行层面还需要自己补齐大部分代码。把它们放到一起看，价值不在比较谁更厉害，而在把各自的强项挑出来，组装成更严谨的 Knowledge 到 Skill 的编译管线。

## 参考资料

- [GitHub: virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill)
- [GitHub: kangarooking/cangjie-skill](https://github.com/kangarooking/cangjie-skill)
