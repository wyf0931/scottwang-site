---
title: "Anthropic 发布 MHS，把 agent 的手伸进实验室"
description: "2026-08-27，Anthropic 联合 HHMI Janelia 发布 Model Hardware Standard（MHS）research preview。这是一个把 MCP 的思路延伸到物理设备的标准，让 AI agent 直接操作显微镜、机械臂、激光校准仪。文章梳理它的机制、案例与我的判断。"
date: "2026-08-30"
type: "writing"
kind: "essay"
tags: ["Anthropic", "Agent", "MCP", "MHS", "Physical AI", "AI 基础设施"]
draft: false
---

上周翻 Anthropic 的公告，看到他们联合 HHMI Janelia 发布了一个叫 Model Hardware Standard（MHS）的 research preview。这个名字起得比实际做的事更克制，因为它解决的其实是硬件世界里一个非常老的问题，仪器之间不通。

我比较在意的是它跟 MCP 的关系。MCP 把软件工具的调用接口标准化，agent 连上 MCP server 就能调用工具。MHS 做了一件结构上类似的事，把硬件设备的操作接口标准化，agent 直接控制显微镜、机械臂、激光校准仪这类东西。两个合起来，才把 agent 的感知-决策-执行这条链路真正闭合。

## 硬件里的集成税

实验室和工厂里最烦的一件事，就是集成。一台液体处理仪、一台机械臂、一台分光光度计、一台显微镜，每个设备厂家都有自己的编程接口，互相不通。想让它俩协同，就得找专人写翻译程序，一个对一对接，一次搞几周甚至几个月。

Anthropic 在公告里给的数字，传统集成流程要几周到几个月，MHS 把它压到几小时甚至几分钟。数字是 partner 侧汇报的，样本还小，但这个方向是清楚的。

更麻烦的不是集成本身。集成完之后，agent 也缺一套通用的方式去跟这些设备打交道。设备之间不共享状态，agent 也没有安全可控的操作通道。每接入一个新设备，几乎都要重做一次集成。

## MHS 的做法

MHS 的思路很朴素，它把 driver 这一层标准化了。driver 是 OS 和设备之间的翻译层，过去每个设备都有自己的一套 driver，互不相干。MHS 给这层定义了一套极小的 primitive，`read`（读温度）、`write`（设温度），加上 `discover`（让设备以统一格式在网络里被发现）。agent 和设备跨网络直接对话，中间不需要 bespoke 翻译程序。

driver 里还有一层自然语言 tags，用来补充代码无法表达的东西。比如机械臂的自重，这决定了它能不能安全被驱动。这类信息传统上藏在纸质手册里、研究员电脑里，或者根本没写下来，靠口口相传。MHS 允许用户直接把这段话写成 tags，也可以反过来让 agent 面试用户，问清楚设备的配置。这些 tags 会被编译成一份 reference file，告诉 agent 这台设备能测什么、能调什么、有哪些安全限值会被强制执行。

控制走三条通道，MCP、CLI、代码文件（API）。任何 agent harness 都能通过标准协议接入，model-agnostic。

这里最关键的一个设计选择，安全限值放在 driver 里，而不是 prompt 里。

过去 agent 操作物理设备，安全是这么写的。prompt 里加一句"请谨慎操作，注意温度上限"，然后祈祷模型听话。MHS 把安全约束放到硬件层的 driver，agent 想要读温度上限之外的值，请求直接失败。这是一个硬件层强制的边界，不依赖模型有没有听话。

## 探索之后固化成脚本

Anthropic 在公告里给了一个有意思的观察，Claude 在跟硬件交互时表现得很像科学家。它调整激光，通过摄像头观察结果，评估调整方向，然后再调一次。这一串探索跑通之后，Claude 会把它学到的东西打包成一份确定性的 Python 脚本，以后要重复这个动作，直接跑脚本就行，不用每一步都在线推理。

这个"探索然后固化"的循环很重要。物理设备的操作速度往往比模型的推理速度还快，agent 不可能在每一次读值、每一次设参都跑一轮 LLM。把稳定的部分固化成脚本，把需要判断的部分留给 agent，是目前最合理的分工。

## 实际案例

Anthropic 挑了六个 partner 分享进展，样本小，但数字比较具体。

Genentech 把 MHS 用来自动化 BCA 蛋白定量实验。Claude 自己设计了一系列液体转移试验，用 RMSE 给自己的结果打分，最后收敛到两个流速参数，水约 140 µL/s（0.016 RMSE），粘性 BSA 约 10 µL/s（0.181 RMSE）。专家确认这两个值合理。

QuEra Computing 的数据最扎眼。他们之前让四个人组了几个月做一个激光重锁脚本，成功率 58%，每次尝试约 150 秒。同样这个问题交给 MHS，四角色 agent loop 一夜跑到天亮，最终生成一份确定性 Python 脚本，700 次里成功 695 次，99.3%。最难的情况 10 到 14 秒搞定，人类专家要 5 到 10 分钟。伺服控制的残差误差也从专家的 15.7 mV 降到 1.55 mV。19 小时连续运行，Claude 的 tune 一次都没失锁，专家版本大约每小时失锁 1.6 次。

CMU 那边做剂量响应曲线，跨 3 台电脑、多台不兼容的仪器，其中一台连程序化接口都没有。从写 driver 到跑出一条完整曲线，包括 agent 检测到 R² 小于 0.9 自主重跑一次，总共约 8 小时。传统 vendor 集成要几周。6 种人为注入的故障场景，全部在设备动作前被拦截。

华盛顿大学 Baker 和 Pinglay 实验室，一个 PhD 学生不到一周把 6 台仪器接好，driver 编写包含在内。HHMI Janelia 那边，一套显微镜装置过去要按固定顺序启动 7 个程序，现在一个 dashboard 一次点击。Tetsuwan Scientific 把 MHS 和自家 ResearchOS 平台结合，跑 qPCR 做污染画像。

## 我怎么看这件事

方向本身没争议。MCP 走的是把工具标准化的路，MHS 走的是把执行器标准化的路，两条线合起来才是完整 agent。

但落地难度也高得多。MCP 出错的代价通常是一个 API 调用失败，一次 tool call 重试就好。MHS 出错的代价是一管试剂被打翻，一次激光校准把镜子烧了。所以安全边界必须在硬件层，agent 只能在这个边界里面活动。driver 层的强约束加上事后固化成脚本，是目前最合理的工程折衷。

我想重点看三个信号。

第一，MHS 到底会不会开源。Anthropic 在公告里说了 roadmap 里 planned open source，还没公开时间线。MCP 之所以成为事实标准，靠的是开源生态把它卷起来。MHS 如果走同样路径，价值会被放大一个数量级。

第二，QuEra 的数字能不能在其他硬件栈上复现。现在只有 6 家 partner，其中 QuEra 和 Genentech 的场景最极端，前者是量子激光校准，后者是自动化生化实验。这两个都能跑通，说明方法可行，但也可能说明它们的仪器恰好最适合 MHS 的抽象。真正的考验是能不能推广到中小型实验室，那才是数量级更大的市场。

第三，会不会长出硬件版的 npm。driver 生态能不能自组织、标准化、复用，决定 MHS 最终是"一套 spec"还是"一个生态"。这个得看时间。

Anthropic 自己也提醒，Claude 的物理推理还有明显缺口，现阶段需要人工监督。这一点在公告里写得比预期诚实。研究 preview 阶段，先做安全评估和最佳实践，再谈开源，这个顺序是对的。

一个技术里程碑，通常从第二家、第三家独立实现开始出现那一刻才算真正开始。功能展示只是起点。MCP 已经走了三年多，才走到今天的位置。MHS 刚起步，能看清的还只是轮廓。

我倾向认为它会成为一个真正的里程碑。但也承认，现在下这个判断的依据很有限。

## 参考

- [Anthropic 官方公告 · Previewing the Model Hardware Standard](https://www.anthropic.com/news/model-hardware-standard-research-preview)
- [MarkTechPost · Anthropic Opens a Research Preview of the Model Hardware Standard](https://www.marktechpost.com/2026/08/29/anthropic-opens-a-research-preview-of-the-model-hardware-standard-mhs-a-shared-specification-for-ai-agents-to-safely-operate-physical-devices/)
- [CNBC · Anthropic pushes into physical world with standard to help AI agents operate machines](https://www.cnbc.com/2026/08/27/anthropic-pushes-into-physical-world-with-new-standard-to-help-ai-agents-operate-machines.html)
- [Ars Technica · Anthropic's new hardware standard lets AI agents control the physical world](https://arstechnica.com/ai/2026/08/anthropics-new-hardware-standard-lets-ai-agents-control-the-physical-world/)
