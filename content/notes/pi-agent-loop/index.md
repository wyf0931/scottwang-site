---
title: "pi 的 Agent loop 怎么实现"
description: "从 pi-agent-core 源码看 pi 的 Agent loop，理解它怎样处理模型响应、工具调用、工具结果和后续轮次。"
date: "2026-08-24"
type: "notes"
kind: "note"
tags: ["pi", "Agent", "Agent loop", "Tool Calling", "ReAct"]
draft: false
---

pi 的 agent loop 本质上是一个“LLM tool-calling loop”。它可以看作 ReAct 的工程化变体，不过没有采用经典的 `Thought`、`Action`、`Observation` 文本格式。

核心代码在 [`packages/agent/src/agent-loop.ts`](https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts)。这个文件负责把模型响应、工具执行和下一轮模型调用串起来。

## 最小循环

可以把它压缩成下面这段伪代码。

```text
context.messages += user_prompt

while true:
    assistant_message = LLM(context)
    context.messages += assistant_message

    if assistant_message.stopReason 是 error 或 aborted:
        结束

    tool_calls = assistant_message 中的 toolCall

    if tool_calls 为空:
        如果有 follow-up message:
            context.messages += follow-up
            继续
        否则:
            结束

    tool_results = 执行所有 tool_calls
    context.messages += tool_results

    如果工具结果没有要求 terminate:
        继续调用 LLM
```

一次典型过程是

```text
User
  "读取 config.json"

LLM
  toolCall("read_file", { path: "config.json" })

pi
  执行 read_file
  得到 toolResult("...文件内容...")

LLM
  根据 toolResult 继续回答，或再次调用工具
```

模型每次只需要决定当前响应。工具结果回到消息上下文以后，下一轮模型会重新看到此前的用户消息、assistant 消息和 toolResult。

## ReAct 对应关系

如果把 ReAct 拆成三个部分，pi 的结构化消息可以这样对应

```text
Thought      = assistant 的文本或 thinking block，可选
Action       = assistant message 中的 toolCall
Observation  = toolResult message
```

因此，pi 的 loop 在行为上属于 ReAct。它没有要求模型输出下面这种文本

```text
Thought: 我需要先读取配置
Action: read_file
Observation: 配置文件内容
```

pi 直接使用 provider 返回的结构化 tool call，并把工具结果构造成 `toolResult` 消息。模型是否输出可见文本或 thinking block，都不影响这个控制过程继续运行。

更准确地说，pi 实现的是结构化 tool-calling 版的 ReAct，控制过程由结构化消息驱动，不依靠文本解析。

## 一轮怎样运行

`runLoop()` 有内外两层循环。

内层循环处理 assistant 响应、工具调用和 steering message。只要上一条 assistant message 产生了工具调用，或者队列里还有需要注入的消息，内层就会继续。

```text
while 有工具调用 或 有 steering message:
    注入待处理消息
    请求 assistant response
    执行 tool calls
    写入 tool results
    触发 turn_end
```

外层循环负责 follow-up message。Agent 原本已经没有工具调用、准备结束时，`getFollowUpMessages()` 仍然可能返回新的消息。此时消息会被放进内层循环，触发新的模型轮次。

这两个队列解决的是两种不同的交互需求

- steering message 在 Agent 工作期间插入，等待当前 assistant turn 和工具调用完成后进入下一轮
- follow-up message 等 Agent 原本要结束时再处理

## 工具调用怎样执行

模型返回 tool call 后，pi 会先做准备，再决定执行方式。

```text
for tool_call in assistant_message:
    找到工具
    预处理参数
    校验参数
    调用 beforeToolCall

    if 被阻止:
        生成错误 toolResult
    else:
        执行工具
        收集执行过程中的 update
        调用 afterToolCall
        生成最终 toolResult
```

工具不存在、参数校验失败、工具抛出异常和运行被中断，都会被转换成错误的 tool result。这样模型仍然能在下一轮看到失败原因，并决定是否修正参数或换一条路径。

同一条 assistant message 可以包含多个 tool call。pi 默认允许这些工具并行执行，也支持全局配置为串行执行。只要其中一个工具声明了 `executionMode: "sequential"`，整批调用就会按顺序执行。

并行模式下，工具完成事件可以按照实际完成顺序发出，但写入上下文的 toolResult 会恢复成 assistant 原始调用顺序。这样既保留并行执行的速度，也让消息历史保持稳定。

## 循环什么时候结束

下面几种情况会结束当前 agent run

- assistant 响应的 `stopReason` 是 `error` 或 `aborted`
- assistant 没有产生 tool call，且没有 follow-up message
- `shouldStopAfterTurn()` 要求在当前轮结束
- 工具结果通过 `terminate` 表示不需要继续请求模型

`terminate` 不是单个工具随意结束整批调用的开关。并行或串行批次里，只有所有已经完成的工具结果都设置了 `terminate: true`，这一批才会跳过下一轮模型请求。

如果模型响应因为输出长度达到上限而被截断，pi 不会直接执行其中可能不完整的工具参数。它会为这些工具调用生成错误结果，让模型在下一轮重新发起完整调用。

## Agent 类和底层 loop

`agent-loop.ts` 是低层循环，`agent.ts` 的 `Agent` 类负责把它包装成一个有状态的对象。

`Agent` 主要管理这些内容

- 当前消息历史
- 当前模型和工具列表
- steering 与 follow-up 队列
- abort signal
- `agent_start`、`turn_start`、`message_update`、`tool_execution_end` 等生命周期事件

真正请求模型前，pi 还会经过两层消息转换

```text
AgentMessage[]
    ↓ transformContext，可选
AgentMessage[]
    ↓ convertToLlm
Message[]
    ↓ streamFunction
LLM
```

`transformContext` 可以做上下文裁剪或注入外部信息。`convertToLlm` 则把 Agent 内部消息转换成 provider 能理解的 user、assistant 和 toolResult 消息，也可以过滤 UI 专用消息。

## pi 目前没有内置什么

pi 的基础 loop 提供了结构化工具调用和稳定的消息状态，但没有内置下面这些更复杂的 Agent 模式

- 独立 Planner
- 显式 Plan 对象
- 多路径搜索
- Reflexion memory
- MCTS 或 Tree Search

所以模型通常自己决定下一步调用什么工具。pi 负责保存状态、执行工具、传回结果和控制轮次，规划能力主要来自模型本身以及上层应用提供的 prompt 和 hook。

如果要在 pi 上增加更复杂的模式，可以从现有扩展点开始

- 用 `prepareNextTurn` 改变下一轮的模型或上下文
- 用 `transformContext` 做上下文裁剪和外部信息注入
- 用 `shouldStopAfterTurn` 控制一轮结束后的停机时机
- 用自定义消息和工具结果保存计划、反思和评估信息

所以，pi 现在提供的是一条清楚、可扩展的基础循环。要做 Plan-and-Execute，需要在外层增加规划状态和执行器。要做 Reflexion，需要增加失败评估与记忆。要做 Tree of Thoughts 或 LATS，还需要增加候选状态、评分和搜索策略。

## 小结

pi 的核心过程可以缩成一句话

```text
模型产生 toolCall
    → pi 执行工具
    → 结果写回 toolResult
    → 模型继续决策
```

当模型不再产生工具调用，或者系统判断需要停止时，loop 结束。它在行为上属于 ReAct，在实现上采用 provider 原生的结构化 tool calling。

## 来源

- [pi agent loop 源码](https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts)
- [pi agent core README](https://github.com/earendil-works/pi/tree/main/packages/agent)
- [ReAct 原论文](https://arxiv.org/abs/2210.03629)
