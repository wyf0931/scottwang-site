---
title: "多 agent 协作到底在协作什么"
description: "从 CrewAI 和 OpenAI Agents SDK 的实现里，拆解任务流水线、动态委派、handoff 与 Agent as a tool 这几种多 agent 协作模式。"
date: "2026-09-08"
type: "writing"
kind: "essay"
tags: ["Agent", "Multi-Agent", "CrewAI", "OpenAI Agents SDK", "Architecture"]
series: "Agent Architecture"
draft: false
---

最近在看多 agent 系统，我反复碰到一个容易混在一起的问题。几个 Agent 同时出现在一个项目里，究竟怎样才算协作。

我把 CrewAI 和 OpenAI Agents SDK 的官方文档、开源仓库和运行模型对了一遍。两套框架都能让多个 Agent 一起完成任务，可它们把协作放在了不同的位置。CrewAI 从团队、任务和流程开始设计，OpenAI Agents SDK 则从 Agent 的运行循环和组合原语开始设计。

这个区别会影响系统怎么拆，谁拥有最终答案，任务状态放在哪里，以及出了问题以后能不能找到责任所在。

## CrewAI 先把团队组织起来

CrewAI 的基本对象有 Agent、Task、Crew 和 Process。Agent 是带角色、目标、工具和记忆的执行者，Task 是一项具体工作，Crew 把成员和任务放到同一组里，Process 决定任务怎样推进。

最容易理解的是 Sequential。假设有一项技术调研任务，流程可能这样走。

```text
Researcher 执行研究任务
        ↓
TaskOutput 传给 Writer
        ↓
Writer 生成初稿
        ↓
TaskOutput 传给 Reviewer
        ↓
Reviewer 检查结果
```

这里的 Agent 并没有持续聊天。调度器先运行研究任务，把结果封装成 `TaskOutput`，再把结果作为下一个 Task 的 `context`。Writer 看到的是研究结果，Reviewer 看到的是初稿。协作发生在任务输出的传递里。

这是一条固定的任务链。它的好处是容易解释，也容易重跑。只要输入、任务定义和模型配置相同，系统的执行路径大体可预测。代价是动态性有限，运行过程中很难临时改变分工。

## Hierarchical 把 Manager 放进运行循环

当任务无法提前拆得很细时，CrewAI 提供 Hierarchical Process。这个模式需要一个 `manager_llm` 或自定义的 `manager_agent`。

```text
                 Manager
                /       \
       Researcher       Writer
                \       /
                 Reviewer
```

Manager 负责理解总任务、安排工作、检查结果和决定下一步。Worker Agent 只负责自己的专业工作。任务也可以不预先绑定某个 Agent，由 Manager 根据角色和能力在运行时进行分配。官方文档把这个过程概括为规划、委派和验证。

它的技术原理很朴素。`allow_delegation=True` 的 Agent 会得到协作工具，其中一个工具用于把工作交给同事，另一个工具用于向同事提问。于是模型产生一个工具调用，CrewAI 再把这个工具调用翻译成另一个 Agent 的执行。

```text
Manager LLM
    ↓ tool call
delegate_work(task, context, coworker)
    ↓
Worker Agent 执行
    ↓
结果返回 Manager
    ↓
Manager 继续判断
```

所以 CrewAI 的 delegation 更像一次子任务调用。Worker 完成工作以后，结果会回到委派者那里。委派者仍然负责后面的判断和最终输出。

CrewAI 还允许一个普通 Agent 在自己的任务里询问其他 Agent。这个能力不一定依赖 Hierarchical Process，前提是 Agent 开启 delegation。这样做很灵活，但也容易出现来回委派和无休止追问。官方建议让协调者可以委派，让专业 Agent 保持职责边界。

## Flow 负责更大的流程

CrewAI 还有一个容易被忽略的抽象，叫 Flow。Crew 处理一组 Agent 在一个任务集合里的合作，Flow 处理多个步骤、分支、循环、状态和恢复。

```text
开始
  ↓
收集输入
  ↓
Research Crew
  ↓
路由判断
  ├── 质量合格 → Writer Crew
  └── 质量不足 → Research Crew 重试
```

Flow 使用 `@start()`、`@listen()` 和路由装饰器连接步骤。每次运行都有自己的状态，可以在状态里保存输入、阶段结果和执行标识。这样一来，代码负责流程的确定性，Crew 负责某个阶段里的自主决策。

我现在更愿意把 CrewAI 看成两层结构。外层是 Flow，适合写清楚业务步骤和恢复规则。内层是 Crew，适合把一项开放任务交给几个有明确角色的 Agent。所谓 hybrid，更多是这两层的组合，不是又增加了一种神秘的 Agent 对话协议。

## OpenAI Agents SDK 把协作拆成两个原语

OpenAI Agents SDK 没有要求所有多 agent 系统都采用固定的团队流程。它主要围绕 Agent 和 Runner 工作。Agent 带有指令、工具、guardrails 和可选的 handoffs，Runner 驱动一次运行，处理模型调用、工具调用、状态和结束条件。

SDK 官方反复强调两种组合方式。一个是 handoff，另一个是 agents as tools。

## Handoff 是控制权交接

Handoff 最适合客服分流或专业 Agent 接管对话。

```text
用户
 ↓
Triage Agent
 ├── transfer_to_booking_agent
 ├── transfer_to_refund_agent
 └── transfer_to_faq_agent
```

在实现上，handoff 会以工具的形式暴露给模型。模型调用 `transfer_to_refund_agent` 后，Runner 把当前活动 Agent 换成 Refund Agent。目标 Agent 接着处理同一轮运行，并且默认可以看到完整的对话历史。

这就是 handoff 和普通子任务调用的分界。当前 Agent 不再等专家返回一段材料再继续说，目标 Agent 接过后续对话。

SDK 允许开发者改变交接时的上下文。`inputFilter` 可以裁剪传给目标 Agent 的历史，`inputType` 可以让模型附带原因、语言或优先级之类的结构化信息，`onHandoff` 则可以在交接发生时执行回调。

这里有一个工程上的提醒。`inputType` 是 handoff 工具参数，不是应用状态容器。用户身份、权限和其他已有依赖应放在 `RunContext` 中。两者混用以后，路由元数据和业务状态很容易纠缠在一起。

## Agents as tools 是专家子调用

另一种方式是把完整的 Agent 包装成一个工具。

```text
Manager Agent
 ├── research_agent(input)
 ├── summarize_agent(input)
 └── critic_agent(input)
```

Manager 调用 `research_agent` 时，SDK 会为子 Agent 启动一个嵌套 Runner。子 Agent 完成自己的输入以后，把最后一条消息或提取出的结构化结果返回给 Manager。Manager 再结合多个专家的结果生成最终答案。

```text
Manager
    ↓ function call
Research Agent
    ↓ result
Manager 继续运行
    ↓
最终答案
```

这个模式适合研究、摘要、批评和数据分析。专家可以很专一，Manager 可以统一处理用户交流、输出格式和 guardrails。OpenAI 文档给出的判断也很清楚。专家要直接面对用户时使用 handoff，专家只提供局部意见时把 Agent 当作工具。

## 代码编排仍然很重要

OpenAI Agents SDK 并不要求所有路由都交给模型。应用可以先让一个 Agent 输出结构化分类，再由代码选择下一个 Agent，也可以直接把多个 Agent 串成固定流程。

```text
Research Agent
    ↓
Outline Agent
    ↓
Writer Agent
    ↓
Critic Agent
```

这种方式在速度、成本和执行路径上更稳定。模型负责局部判断，程序负责边界和顺序。对于权限、审批、付费动作和外部副作用，我会优先选择代码编排，再把开放式思考放进某一个 Agent 运行里。

## 两套框架的分界

可以用一句话区分它们。

CrewAI 先问任务怎样组织，OpenAI Agents SDK 先问当前哪个 Agent 在运行。

| 问题 | CrewAI | OpenAI Agents SDK |
| --- | --- | --- |
| 主要单位 | Crew 和 Task | Agent Run |
| 固定流程 | Sequential、Flow | 代码串联多个 Runner |
| 动态分工 | Hierarchical Manager | Handoff 或 Agent as a tool |
| 结果传递 | TaskOutput 和 context | 对话历史、工具结果、RunContext |
| 最终答案 | Crew 或 Manager 汇总 | 当前活动 Agent，或 Manager |
| 协作语义 | 任务委派和上下文传递 | 控制权交接和嵌套子运行 |

它们都可以表达同一类业务。比如研究、写作、审查这条链，CrewAI 可以用 Sequential，OpenAI SDK 可以用代码串联三个 Agent。一个 Manager 调三个专家，CrewAI 可以用 Hierarchical，OpenAI SDK 可以把三个 Agent 暴露成工具。

差别在于默认理解方式。CrewAI 的代码里通常先出现角色和任务，OpenAI SDK 的代码里通常先出现 Agent、工具和 Runner。

## 对自己的 Agent 平台有什么启发

如果要设计一个自己的多 agent runtime，我会先把三种动作分开命名。

第一种是 `workflow_step`。程序知道下一步是谁，前一步结果按约定传给后一步。

第二种是 `subtask`。当前 Agent 调用另一个 Agent 完成局部工作，结果返回给当前 Agent。

第三种是 `handoff`。当前 Agent 把会话控制权交给另一个 Agent，后续由新 Agent 继续运行。

这三个词对应三种不同的状态转移。

```text
workflow_step
    A 完成 → B 开始

subtask
    A 调用 B → B 返回结果 → A 继续

handoff
    A 调用 B → B 成为活动 Agent
```

如果把它们都叫成 delegation，日志、权限和用户体验都会变得含糊。系统至少还需要记录当前活动 Agent、父子运行关系、传入的上下文范围、返回结果的结构，以及谁对最终输出负责。

我觉得这比先设计一个漂亮的 Agent 通信协议更要紧。多数多 agent 协作并不需要 Agent 之间自由聊天，真正需要的是清楚地传递任务、结果、状态和控制权。

## 参考资料

- [CrewAI Processes](https://docs.crewai.com/en/concepts/processes)
- [CrewAI Tasks](https://docs.crewai.com/en/concepts/tasks)
- [CrewAI Collaboration](https://docs.crewai.com/v1.15.20/en/concepts/collaboration)
- [CrewAI Flows](https://docs.crewai.com/en/concepts/flows)
- [OpenAI Agents SDK Agent Orchestration](https://openai.github.io/openai-agents-js/guides/multi-agent/)
- [OpenAI Agents SDK Handoffs](https://openai.github.io/openai-agents-js/guides/handoffs/)
- [OpenAI Agents SDK Tools](https://openai.github.io/openai-agents-js/guides/tools/)
- [OpenAI Agents SDK Python Repository](https://github.com/openai/openai-agents-python)
