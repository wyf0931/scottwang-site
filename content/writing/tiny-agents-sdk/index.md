---
title: "Hugging Face 新推出 Agent SDK"
description: "huggingface-hub 新增了 Agent 和 MCPClient 两个类，用不到 200 行代码搭出一个能调用 MCP 工具的 reasoning agent。文章从代码层面对这两个类做一次快速拆解。"
date: "2026-08-17"
type: "writing"
kind: "essay"
tags: ["Hugging Face", "Agent", "MCP", "Python"]
draft: false
---

前几天翻 huggingface-hub 的源码，顺手看到它新暴露了一个 `Agent` 类。这个类的文档写得很克制，只说了一句，实现了一个 simple agent，本质就是一个 while 循环，建在 `MCPClient` 之上。

我比较在意的是它到底把这件事简化到了什么程度。今天用大约半天把这两个类翻了一遍，结论是，HF 想做的其实不大，他们把 MCP 协议的三层连接、工具注册、tool_call 分发、流式响应拼回消息，全部压进一个 SDK 里，然后在外层套了一个不到 60 行的 while 循环当 agent。代码量很小，但把 agent 的骨架做完整了。

## 为什么现在做这件事

HF 一直在做 inference 的统一入口。模型在 Hub 上，providers 有十几个，本地也有部署好的 endpoint，他们早就有了 `InferenceClient` 和 `AsyncInferenceClient`。但只把推理包好还不够，模型要真做事，得能调用工具。

MCP 已经成了事实标准。一个 agent 能调用什么，取决于它连上了多少个 MCP server。HF 自己的 inference 系统、社区的各种 tool server、甚至你自己的本地脚本，都可以用 MCP 协议暴露。HF 把这层接好，等于把整个生态的推理入口统一到了同一个 SDK。

他们做这件事的时机也刚好。之前用 HF 的模型做 agent，你要自己写 MCP 客户端，自己处理流式响应的 chunk 拼装，自己决定什么时候停。这个 SDK 把这层胶水代码写好了，开发者可以直接 import 一个类开始用。

## 它怎么工作的

先看类图。`Agent` 继承自 `MCPClient`，里面维护了三个核心状态。`AsyncInferenceClient` 负责真正调用模型，`sessions` 字典把工具名映射到对应的 MCP session，`available_tools` 列表则把工具描述组装成 OpenAI 兼容的 schema 格式。

```python
# MCPClient 的三个核心状态
self.client = AsyncInferenceClient(model=model, provider=provider, ...)
self.sessions: dict[ToolName, ClientSession] = {}
self.available_tools: list[ChatCompletionInputTool] = []
```

连接 MCP server 用的是 `add_mcp_server`。这个方法接受 `type` 参数，支持 stdio、sse、streamablehttp 三种。内部走的是标准的 `mcp` 库的 `stdio_client`、`sse_client`、`streamablehttp_client`，用 `AsyncExitStack` 管理生命周期。连接建立后会调 `session.list_tools()` 把工具全拉回来，如果传了 `allowed_tools` 参数就做白名单过滤。这一步做完，这个 server 上的所有工具就注册进了 agent 的可用工具列表。

`process_single_turn_with_tools` 是整个 SDK 最核心的一步。它把 model 的流式响应 chunk 拼接成一个完整的 assistant 消息，如果这个消息里有 `tool_calls`，就按顺序拿到对应的 session，调 `session.call_tool()` 执行，把结果以 `role: "tool"` 的格式追加回 messages。这个过程是 async generator，一边 yield chunk 给上层看流式输出，一边在末尾把 tool call 的结果拼回来。

`Agent` 类在这上面套了一个 while 循环。它把 `EXIT_LOOP_TOOLS`（只有 `task_complete` 和 `ask_question` 两个虚拟工具）传给底层，让模型在需要结束的时候调用它们。循环退出条件有三个，收到了 `task_complete` 或 `ask_question`，达到了 `MAX_NUM_TURNS`（默认 10），或者连续两轮没有 tool call。

```python
async def run(self, user_input: str, *, abort_event=None):
    self.messages.append({"role": "user", "content": user_input})
    while True:
        async for item in self.process_single_turn_with_tools(
            self.messages,
            exit_loop_tools=EXIT_LOOP_TOOLS,
            exit_if_first_chunk_no_tool=(num_turns > 0 and next_turn_should_call_tools),
        ):
            yield item
        # 检查退出条件...
```

整个 agent 的逻辑就这几行。没有 state machine，没有 planner，没有 memory，没有反思。它是一个最朴素的 LLM + tool 调用循环。

## 怎么用

SDK 的 API 也很简单。导入 `Agent`，传入模型、MCP server 配置和 provider，调 `load_tools` 连上 server，然后 `run` 就能跑。

```python
from huggingface_hub import Agent
import asyncio

async def main():
    agent = Agent(
        model="Qwen/Qwen2.5-32B-Instruct",
        provider="hf-inference",
        servers=[
            {
                "type": "stdio",
                "command": "uvx",
                "args": ["mcp-server-e2b"],
            },
            {
                "type": "sse",
                "url": "https://some-tool-server.example.com/sse",
            },
        ],
    )
    await agent.load_tools()

    async for chunk in agent.run("帮我查一下今天的天气并做个简单分析"):
        print(chunk)

asyncio.run(main())
```

`provider` 参数支持十几个值，`hf-inference`、`openai`、`groq`、`together` 都行，也支持 `base_url` 接本地部署。`servers` 列表里的每个元素是一个 `ServerConfig`，`type` 是 `stdio`、`sse` 或 `http`，剩下的是对应协议的参数。

几个实际使用的细节。`Agent` 标注为 experimental，文档明确说未来会有 breaking changes。`run` 是 async generator，返回的是 streaming chunks 加上 tool 调用的消息对象，如果你只需要最终结果，得自己过滤。系统 prompt 默认已经写好，会告诉模型"keep going until the user's query is completely resolved"，一般不需要改。

## 它的边界

这个 SDK 做的事情刚好够一个能用的 agent，但也只到这一步。

没有规划能力。它不会把用户请求拆成子任务，`task_complete` 之前全靠模型自己判断什么时候能答。对于复杂的多步任务，模型可能一轮内就做不完，也可能空转很多轮后才停。

没有记忆。`messages` 列表在同一个 agent 实例内会一直累积，跨实例之间没有共享。如果你需要会话级的记忆或者长期 memory，得自己在外面包装。

没有错误恢复。tool call 失败会生成一条 error 消息回到 messages，但不会重试，模型是否会根据错误调整策略完全取决于模型本身。

这些边界是它想做的事情本身就很小。HF 把 MCP 连接、工具注册、流式响应处理这三块最繁琐的底层工作做完了，上面那层逻辑用 60 行代码补上，足够作为你 own agent 框架的起点。想加规划、加 memory、加反思，都在这个骨架上叠，不需要自己写 MCP 客户端。

## 小结

`huggingface-hub` 1.27.0 新增的 `Agent` 和 `MCPClient` 把 HF 模型、MCP 工具、providers 三件事接成了完整链条。代码量不大，但 agent 的骨架是完整的。如果你现在就想用 HF 上的模型搭一个能调用工具的 agent，又不想自己写 MCP 客户端，这个 SDK 是最短的路径。

---

**来源**
- huggingface-hub 1.27.0 源码 `inference/_mcp/agent.py`
- huggingface-hub 官方 API 文档