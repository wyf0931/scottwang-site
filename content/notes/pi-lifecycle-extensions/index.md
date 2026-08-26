---
title: "pi 的 lifecycle、event 和 extension 扩展点"
description: "从源码梳理 pi 的 AgentSession 生命周期、事件定义、hook 流转，以及 kernel 和 extension 如何连接起来。"
date: "2026-08-26"
type: "notes"
kind: "note"
tags: ["pi", "Agent", "Lifecycle", "Event", "Extension", "Plugin"]
draft: false
---

pi 的内核可以看成一台由消息和事件驱动的状态机。`Agent` 负责运行模型和工具，`AgentSession` 负责把这次运行接到会话、持久化、重试和上下文压缩上，`ExtensionRunner` 再把 extension 注册的 handler 插到这些生命周期节点里。

相关源码主要集中在 [`agent-session.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/agent-session.ts)、[`extensions/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/types.ts) 和 [`extensions/runner.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/runner.ts)。

## 先看整体状态机

一次普通的用户请求，大致经过下面这些状态。

```text
Idle
  ↓ prompt
Input Preflight
  ↓ input / command / template processing
Before Agent Start
  ↓ before_agent_start
Agent Running
  ↓ agent_start
Turn Running
  ↓ turn_start
LLM Streaming
  ↓ message_update / message_end
Tool Execution
  ↓ tool_call / tool_result
Turn Finished
  ↓ turn_end

有 tool call 或 queued message
  └──────────────→ 下一轮 Turn Running

没有后续工作
  ↓ agent_end
Post Run
  ↓ retry / compaction / queued continuation
Agent Settled
  ↓ agent_settled
Idle
```

这里的状态并没有被实现成一个名为 `StateMachine` 的类。状态分散在 `Agent`、`AgentSession`、队列和运行时对象里，事件把这些对象连接起来。阅读源码时，沿着事件顺序看，比寻找一个集中的状态枚举更容易理解。

## 两个内核对象

### Agent

`@earendil-works/pi-agent-core` 里的 `Agent` 是低层执行器。它持有当前消息、模型、工具和流式响应函数，处理下面这条循环。

```text
prompt
  → assistant response
  → tool execution
  → tool result
  → next assistant response
```

它还管理 steering queue 和 follow-up queue。前者让用户在 Agent 工作期间插入消息，后者让消息等当前任务自然结束后再进入下一轮。

### AgentSession

`AgentSession` 是 coding-agent 的会话内核。它把低层 Agent 接到更大的运行环境里，负责

- 保存 `message_end` 产生的消息到 `SessionManager`
- 将 Agent 事件转发给 extension 和上层 UI
- 执行自动重试
- 在上下文接近上限或发生溢出时压缩并恢复
- 维护当前模型、thinking level 和工具注册表
- 处理 session new、resume、fork、tree navigation 和 reload
- 处理用户输入、slash command、skill 和 prompt template

所以，`Agent` 解决一次模型任务怎样跑完，`AgentSession` 解决这次任务怎样成为一个可恢复、可扩展的产品会话。

## 一次 prompt 怎样进入内核

用户调用 `AgentSession.prompt()` 后，主流程在启动 Agent 以前会经过几次拦截。

```text
用户输入
  ↓
extension command 检查
  ↓
input hook
  ↓
skill command 和 prompt template 展开
  ↓
streaming 时进入 steer 或 follow-up 队列
  ↓
模型、鉴权和 compaction 检查
  ↓
before_agent_start hook
  ↓
加入 user message 和 extension custom message
  ↓
agent.prompt()
```

`input` hook 可以继续处理、改写文本和图片，或者直接把输入标记为 handled。`before_agent_start` 可以追加一条 custom message，也可以修改本轮 system prompt。这个阶段的特点是，模型请求还没有开始，extension 有机会改变输入和启动上下文。

## Agent event 怎样流转

低层 Agent 会产生一组通用事件。最重要的顺序如下。

```text
agent_start
  ↓
turn_start
  ↓
message_start(user)
message_end(user)
  ↓
message_start(assistant)
message_update(...)
message_end(assistant)
  ↓
tool_execution_start
tool_execution_update(...)
tool_execution_end
message_start(toolResult)
message_end(toolResult)
  ↓
turn_end
  ↓
没有 tool call
  ↓
agent_end
```

如果 assistant message 包含 tool call，`turn_end` 之后会再次发出 `turn_start`。如果没有 tool call，内核会先检查 steering 和 follow-up 队列，确认没有后续消息才发出 `agent_end`。

事件有两个用途。一部分事件是给 UI 做流式显示，例如 `message_update` 和 `tool_execution_update`。另一部分事件承载状态边界，例如 `message_end`、`turn_end` 和 `agent_end`。持久化和 compaction 这类工作应当依赖边界事件，而不要依赖某个中间 token 更新。

## AgentSession 怎样接住事件

`AgentSession` 在构造时就订阅了 `Agent`。

```text
Agent
  ↓ subscribe
AgentSession._handleAgentEvent
  ├─ 先转发给 ExtensionRunner
  ├─ 再通知 AgentSession listeners
  └─ 在 message_end 时持久化消息
```

这个顺序很关键。extension 先收到事件，`message_end` handler 可以返回替换后的同角色消息。`AgentSession` 会把替换结果写回 Agent 当前对象，然后再通知 session listener，并用最终消息做持久化和后续判断。

对 assistant message 来说，`message_end` 之后还会参与这些判断。

- 是否记录最近一次 assistant message
- 是否清零成功响应后的 retry 计数
- 是否需要自动 compaction
- `agent_end` 之后是否需要重试

一次 `agent_end` 也不代表整个 session 已经完全空闲。`AgentSession` 还可能继续做 retry、compaction 或 queued continuation。所有这些工作完成后，才会发出 `agent_settled`。

## Extension event 怎样定义

extension 的事件类型统一定义在 [`extensions/types.ts`](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/types.ts) 的 `ExtensionEvent` 联合类型里。可以按作用分成几组。

### Session 生命周期

```text
session_start
session_info_changed
session_before_switch
session_before_fork
session_before_compact
session_compact
session_compact_failed
session_before_tree
session_tree
session_shutdown
```

其中 `session_before_*` 事件可以取消或修改即将发生的动作。例如 `session_before_compact` 可以取消压缩或提供自定义结果，`session_before_switch` 可以阻止切换会话。

### Agent 和 turn 生命周期

```text
before_agent_start
agent_start
agent_end
agent_settled
turn_start
turn_end
message_start
message_update
message_end
```

`agent_end` 表示低层 Agent loop 发出了结束信号，`agent_settled` 表示 session 层的后续工作也已经完成。对扩展来说，这两个事件的语义不同。

### 工具生命周期

```text
tool_call
tool_execution_start
tool_execution_update
tool_execution_end
tool_result
```

`tool_call` 发生在工具实际执行以前，可以阻止执行，也可以原地修改参数。`tool_execution_*` 描述运行过程。`tool_result` 发生在执行完成以后，可以改写内容、details、错误标记和 usage。

### Provider 和上下文

```text
context
before_provider_request
before_provider_headers
after_provider_response
```

`context` 在每次 LLM 请求前处理消息。`before_provider_request` 可以替换发给 provider 的 payload，`before_provider_headers` 用于修改请求头，`after_provider_response` 则在响应到达后、流被消费前通知 extension。

还有 `input`、`user_bash`、`model_select`、`thinking_level_select`、`project_trust` 和 `resources_discover` 等事件，它们分别连接输入、用户主动执行 shell、模型设置、项目安全和资源发现流程。

## hook 和普通 event 的区别

可以用是否能改变主流程来区分。

### 观察型 event

这类事件主要通知发生了什么。

```text
agent_start
turn_start
message_start
message_update
tool_execution_start
tool_execution_update
tool_execution_end
agent_end
agent_settled
```

extension 可以在这些节点更新 UI、记录统计或写日志，通常不返回一个会改变内核状态的结果。

### 变换型 hook

这类 hook 会把结果交给下一个阶段。

```text
input
  → 改写用户文本或图片

context
  → 替换发给 LLM 的消息列表

message_end
  → 替换最终消息，但必须保持原 role

tool_call
  → 阻止工具，或修改工具输入

tool_result
  → 修改工具返回内容和状态

before_agent_start
  → 添加 custom message，或替换 system prompt
```

### 控制型 hook

会话操作的 `session_before_switch`、`session_before_fork`、`session_before_compact` 和 `session_before_tree` 可以取消动作。这些 hook 的返回值会直接影响状态迁移。

## Extension 怎样和 kernel 串起来

extension 不是直接修改 `Agent` 的内部循环。它通过 `ExtensionRunner` 注册 handler，再由 `AgentSession` 在正确的时机调用 runner。

加载过程大致是

```text
发现 extension 文件
  ↓
加载 default factory
  ↓
创建 ExtensionAPI
  ↓
factory(pi) 注册 handler、tool、command 和 UI
  ↓
commit
  ↓
创建 ExtensionRunner
  ↓
AgentSession.bindCore()
  ↓
session_start
```

extension 的 factory 可以是 async。加载期间注册的 provider、flag 和 event bus 订阅会先暂存，factory 成功后统一 commit。factory 失败时，暂存的注册会被丢弃，加载错误会记录到 extension diagnostics。

`bindCore()` 是连接点。`AgentSession` 把发送消息、切换模型、设置工具、compact、abort、session 操作等具体实现交给 runner。extension 通过 `ctx` 访问这些能力，runner 会在调用时检查 context 是否仍然有效。

这也是为什么 session reload 或 session replacement 后，旧的 extension context 不能继续使用。旧 runner 会被 invalidate，新的 session 会创建新的 runner 和 context。扩展如果把旧 `ctx` 保存下来，下一次调用会得到 stale context 错误，而不会悄悄操作新会话。

## 工具是怎样接入的

extension 注册的 tool 会先进入 runner 的注册表，再由 `AgentSession` 刷新工具注册表。

```text
pi.registerTool(tool)
  ↓
Extension.tools
  ↓
AgentSession._refreshToolRegistry()
  ↓
wrapRegisteredTools()
  ↓
Agent.state.tools
  ↓
LLM 可见的 tool schema
```

工具开始执行时，`AgentSession` 给底层 `Agent` 安装了 `beforeToolCall` 和 `afterToolCall`。这两个 callback 再调用 runner 的 `tool_call` 和 `tool_result` handler，所以 extension 注册的工具和内置工具都会经过同一条拦截路径。

这条设计有一个实际好处。权限检查、路径保护、结果清理和审计不需要复制到每个工具 wrapper 里，可以放在统一的 tool hook 上。

## Extension handler 的执行顺序

`ExtensionRunner` 会按照 extension 加载顺序遍历 extension，再按照注册顺序遍历同一个事件的 handler。

```text
extension A
  handler 1 → handler 2
extension B
  handler 1 → handler 2
```

对于 `context`、`input`、`message_end` 和 `tool_result` 这类可变事件，前一个 handler 的结果会成为后一个 handler 看到的输入。多个 extension 因此可以串联处理。

`message_end` 的 replacement 会逐个传递，但必须保持原消息角色。`tool_result` 的字段按返回值覆盖。`before_agent_start` 返回的 system prompt 会沿 extension 顺序继续传递，返回的 custom message 则会累积。

普通通知事件没有这样的 replacement 语义。它们的 handler 可以执行副作用，但返回值不会改变 Agent 的消息或状态。

## EventBus 和 lifecycle event 不是一回事

extension API 还有一个 `pi.events`。它由一个简单的 `EventBus` 实现，提供字符串 channel、`emit` 和 `on`。

```text
extension A
  pi.events.emit("my-channel", data)
        ↓
shared EventBus
        ↓
extension B
  pi.events.on("my-channel", handler)
```

它适合多个 extension 之间传递自定义消息，不会自动进入 `ExtensionEvent` 类型系统，也不会自动触发 AgentSession 的持久化、turn 计数或状态迁移。

所以两者的边界很清楚。

- `ExtensionEvent` 连接 extension 和 pi 内核生命周期
- `EventBus` 连接 extension 和 extension 之间的自定义通信

如果一个动作需要阻止 compaction、改变工具输入或改写模型上下文，应当使用生命周期 hook。普通的 EventBus 消息没有这个能力。

## 这套内核 SOP 的设计取舍

从源码看，pi 的内核 SOP 可以概括成四条规则。

第一，低层执行和高层会话分开。`Agent` 不负责 session 文件、UI 或 extension 发现，`AgentSession` 也不重新实现模型和工具循环。

第二，状态边界通过事件公开。`message_end`、`turn_end`、`agent_end` 和 `agent_settled` 让持久化、UI 和扩展都能找到稳定的接入点。

第三，需要改变数据的地方使用串联 hook。输入、上下文、消息、工具调用和工具结果都可以由前一个处理器交给后一个处理器。

第四，session replacement 会让旧 context 失效。这样可以避免 extension 在切换会话后继续写入旧状态，也让 reload 变成一次运行时替换。

## 一句话总结

pi 的 kernel 不是一个封闭的 while 循环。它把一次 Agent 运行拆成 session、agent、turn、message、tool 和 provider 几层生命周期，再通过类型化事件和可串联 hook 暴露出来。

extension 通过 `ExtensionRunner` 进入这些节点。它可以观察事件、改写输入和结果、阻止工具、取消会话动作、注册新工具，也可以用独立的 `EventBus` 和其他 extension 通信。主流程仍然由 `Agent` 和 `AgentSession` 掌握，extension 负责在明确的边界上参与。

## 来源

- [AgentSession 源码](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/agent-session.ts)
- [Extension 类型定义](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/types.ts)
- [ExtensionRunner 源码](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/runner.ts)
- [Extension loader 源码](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/loader.ts)
- [EventBus 源码](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/event-bus.ts)
- [pi coding-agent 扩展文档](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/docs)
