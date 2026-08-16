---
title: "Needle：把 4500 万参数的模型塞进 14MB，让端侧设备自己做工具调用"
description: "一个端侧专用的 Tool Calling 小模型。它主动放弃对话和推理，只专注一件事，理解指令、选工具、填参数、输出 JSON。"
date: "2026-08-17"
type: "notes"
kind: "note"
tags:
  - Agent
  - 小模型
  - 端侧 AI
  - Tool Calling
---

**Needle** 是一个由 Cactus-Compute 团队在 2026 年 2 月开源的端侧 Tool Calling 小模型，[GitHub 仓库](https://github.com/cactus-compute/needle) 目前已经拿到约 6443 颗 Star，开源协议 MIT。它的定位很克制，不做一个更小的 ChatGPT，而是做一个专门给端侧设备做工具调用的基础模型，4500 万参数，14MB 二进制文件，28MB 内存就能跑完整 session。

让 Needle 值得注意的，不是 14MB 这个数字本身。端侧小模型这个赛道并不新鲜。它真正有意思的地方在于两件事，一是它从架构开始就为 Tool Calling 这件事重新设计，二是它把从 Base 模型到端侧部署的完整训练链路做成了产品级体验。

## 它想解决什么

Agent 场景下大量 Tool Calling 任务并不复杂。"把客厅空调调到 24 度"这样的指令，本质上是意图识别加参数抽取加结构化输出，让几百亿参数的大模型来做是大材小用。云端大模型在这类任务上还带来额外成本，延迟高、调用费高、涉及隐私数据得先出设备，设备还得保持联网。

Needle 想回答的问题是，能不能用一个极小的模型直接在设备本地完成"理解指令、选工具、填参数、调用工具"这一整套动作。这里有个关键的前提，它主动放弃了对话、推理、写报告、开放问答这些大模型常见能力。它只专注一件事，把用户的自然语言指令翻译成一个合法的工具调用 JSON。

这种边界克制是产品设计里的聪明做法。能力边界越窄，模型就越能在目标场景里做到极致。

## 它怎么做到

Needle 走的路径不同，它从架构开始就针对 Tool Calling 重新设计，而不是把一个现成 LLM 量化到 14MB。底层的网络结构叫 Simple Attention Network，简称 SAN，对应论文是 [arXiv:2607.18363](https://arxiv.org/abs/2607.18363)。

SAN 用 Hadamard MLP 代替传统的 FFN 层，用 GQA 注意力，还用了 engram KV 内存和 multi-lane hyper-connections 这些专门为小模型场景设计的机制。权重用 Cactus 自家的 CQ2-bit 压缩方案打包，最终得到 14MB 的 `.cact` 文件，模型参数本身是 45M。在 Cactus 自家硬件上，prefill 大约 6000 tokens 每秒，decode 大约 1200 tokens 每秒。

窗口大小是 256 token 的滑动窗口，tools 被固定为 KV sinks，所以内存开销几乎不随对话长度增长。这意味着一个智能音箱聊了一整晚，模型占用的内存基本保持在 28MB 上下。

## Tool Retrieval Head

在 SAN 之上，Needle 有一个单独的设计叫 Tool Retrieval Head。它的意思是，你可以在模型里声明一个很大的工具目录，模型每轮推理的时候先用检索头筛出 Top 5 个候选工具，然后用 byte-level grammar 约束输出，只在这 5 个工具的 schema 范围内生成合法 JSON。

这个设计的意义在于解耦了"模型大小"和"工具数量"。理论上模型可以处理任意多的工具，只要每轮检索正确就行。从 Agent OS 的视角看，这个检索头已经很接近未来 Agent 系统里的 Tool Router 或者 Skill Router，只是它跑在端侧，跑在几百毫瓦的芯片上。

每个响应还会带一个经过校准的 confidence score。调用方可以设阈值，高于阈值本地直接执行，低于阈值就升级到云端大模型处理。这条 Edge 到 Cloud Handoff 的路径，让端侧小模型不再是能力天花板，而是能力分层的第一道。

## 完整训练路径

Needle 最实用的地方，在于它把训练链路做成了产品。开发者不需要自己去抠 SFT 的细节，只需要按官方文档走一遍流程。

第一步是定义你的工具集，用 Python 装饰器把函数和 schema 写出来。第二步跑 `needle generate-data`，官方脚本会根据你定义的工具自动生成训练数据初稿。第三步用 LoRA 对冻结的 base 模型做 SFT 微调，第四步评测，第五步导出，导出时 adapter 会被合并回 base，最终产物仍然是那个 14MB 的单文件 `.cact`。

这个链路从工具定义一直通到端侧部署，中间没有让人自己去拼接的工具缝隙，体验确实比现在大多数小模型项目完整。

## SFT 数据要点

训练数据格式很简单，JSONL 文件，每行三个字段，query、tools、answers。这里有一个容易踩坑的地方，tools 和 answers 都是 JSON，但它们在 JSONL 里以 JSON-encoded string 保存，不是直接嵌一个 JSON 对象。

数据量的要求也不低。官方建议每个工具至少 120 例，100 条训练、10 条验证、10 条测试。更重要的是覆盖度，不能只教模型"参数抽取"，要教"意图到工具"的泛化。同一个"关灯"指令，用户可能会说"关灯"、"把灯关掉"、"灯关一下"、"卧室灯关了"，还有多工具混淆场景，比如"把客厅灯关掉并把空调调低两度"。这些变体都得覆盖。

这个 SFT 的本质是 Domain-specific Tool Calling Specialization，和给 Llama 做行业知识 SFT 不是一回事。前者教的是"选哪个工具、填什么参数"，后者教的是"这个领域的事实和术语"。

## 实际用起来

开发者接口有两个，一个是 Python SDK，一个是 CLI。SDK 用法很直接，用 `@needle.tool` 装饰器定义工具，`needle.Needle(tools=[...])` 初始化，`agent.run(query)` 跑推理，结果是一个字典，里面带着每个工具调用的参数。

还内置了一个 Playground，`needle playground` 一行命令就能启动本地 Web UI，浏览器打开 127.0.0.1:7860 就能看到交互界面。这层设计让非程序员也能评估模型效果，对团队内部分发很有用。

除了 Tool Calling，Needle 还支持 structured extraction，喂给它一个 Pydantic 模型，它就能从任意文本里提取结构化字段。这个能力和 Tool Calling 共享底层架构，是同一个 SAN 在不同任务上的表现。

权重托管在 [HuggingFace](https://huggingface.co/Cactus-Compute/needle2)，安装方式是 `pip install cactus-needle`，官方文档在 [cactuscompute.com](https://cactuscompute.com)。

## 值得关注的地方

真正值得琢磨的是，Needle 暗示了未来 Agent 系统的一种可能的异构形态。

现在绝大多数 Agent 框架的思路是，一个大模型包打天下，思考、规划、对话、工具调用全都交给同一个 LLM。这种架构简单，但成本和延迟都堆在同一个模型上。Needle 提供了一条不同的路径，大模型负责 Think，负责那些确实需要推理和判断的环节，小模型负责 Act，负责那些"选工具、填参数"这种模式化程度高的动作。

这种异构智能系统不是新概念，但 Needle 给出了一个具体的可行性样本。它的 Tool Retrieval Head 接近未来 Agent OS 的 Tool Router，它的 confidence score 提供了清晰的 Handoff 触发机制，它的完整 SFT 链路证明了"针对某台设备的 Tool Set 做本地微调"是条可走的路。

一句话修正它的定位，与其叫端侧 Tool Calling Model，不如叫可以针对个人或设备的 Tool Set 做本地 SFT 的 Tiny Function Calling Foundation Model。

和 Strix 放在一起看更有意思。Strix 演示的是"Agent 等于 LLM 加循环加工具"，把安全专家的工作流自动化了。Needle 则更底层地说明，Agent 不等于一个巨大的 LLM，未来的智能系统很可能是一堆不同体量的模型分工协作。

## 关联词

- **Needle**，Cactus-Compute 团队 2026 年 2 月开源的端侧 Tool Calling 小模型，45M 参数，14MB，MIT 协议。
- **Simple Attention Network**，Needle 的底层网络架构，用 Hadamard MLP 代替 FFN，对应论文 arXiv:2607.18363。
- **CQ2-bit**，Cactus 自研的权重压缩方案，把 45M 参数压到 14MB。
- **Tool Retrieval Head**，每轮从大工具目录里筛出 Top 5 候选，再在这 5 个 schema 上做语法约束生成。
- **Edge → Cloud Handoff**，依赖 confidence score 做阈值判断，端侧处理不了的请求升级到云端大模型。
- **Structured Extraction**，同架构下的另一条任务路径，喂 Pydantic 模型从文本里提取结构化字段。
- **Cactus-Compute**，Cactus 官方的模型团队，Needle 的维护者。

## 小结

Needle 做的事情，本质上是把"理解指令、选工具、填参数、输出 JSON"这条动作，从一个需要大模型的工程问题，变成一个能跑在端侧芯片上的工程问题。它放弃了很多，也因此在目标场景里做到了极致。从更宽的视角看，它给"大模型思考、小模型行动"的异构 Agent 架构提供了一个具体的、已经可跑的样本，这一点比 14MB 这个数字本身更值得持续关注。

## 参考资料

- [GitHub: cactus-compute/needle](https://github.com/cactus-compute/needle)
- [Cactus Compute 官网](https://cactuscompute.com)
- [HuggingFace 权重页](https://huggingface.co/Cactus-Compute/needle2)
- [SAN 论文 arXiv:2607.18363](https://arxiv.org/abs/2607.18363)
