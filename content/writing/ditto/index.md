---
title: "ditto：461 行的自建 coding agent 骨架"
description: "读 ditto 源码：一个用 461 行 Python 写成的自构建 coding agent，agent 运行时就是一个 Flask 服务，agent 把代码写进 routes/ 再热加载自己。工具集缺了执行环节，这就是它只能偶尔做成的地方。"
date: "2026-10-20"
type: "writing"
kind: "essay"
tags: ["Agent", "Python", "LLM", "Architecture", "LiteLLM"]
draft: false
---

461 行 Python，一个 main.py，1067 个 star。GitHub 上有个叫 ditto 的仓库，作者是 Yohei Nakajima，README 第一句就把它介绍成 "the simplest self-building coding agent"。项目很小，小到整个 repo 只有一行代码量级的东西。

我把它读完，是因为它小到能一眼看清一个 agent 的骨架长什么样。读完以后我又想再看一遍它为什么只能偶尔做成一个 Flask app。作者在 README 里自己写了那句坦白话，"(occasionally) turning your ideas into functional web applications (or at least trying and getting close)"，这个 occasionally 加得有分寸，也点到了它卡住的地方。

## 整个骨架就是这一个 Flask 服务

Ditto 的目录结构长这样，没有第二个 Python 文件。

```
ditto/
├── main.py         # 461 行，全部逻辑
├── requirements.txt
├── README.md
└── .devcontainer.json
```

Agent 的运行时本身就是一个 Flask 服务。你打开 http://localhost:8080，看到一个空白的 form，让你输入一句自然语言描述，比如"做一个记账的小网站"。提交以后，agent 在一个后台线程里跑循环，每次调用 LLM 让它决定用哪个工具，工具调用会往 routes/ 目录里写 Python 文件。

这里的巧劲在于，Agent 生成的东西直接是这个正在跑的 Flask 服务自己的代码。

```python
def load_routes():
    for filename in os.listdir(ROUTES_DIR):
        if filename.endswith('.py') and filename != '__init__.py':
            module_path = f'routes.{module_name}'
            if module_path in sys.modules:
                importlib.reload(sys.modules[module_path])
            else:
                importlib.import_module(module_path)
            module = sys.modules.get(module_path)
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if isinstance(attr, Blueprint):
                    app.register_blueprint(attr)
```

Agent 写下一个 route 文件，Flask 通过 `importlib.reload` 把它读进来，扫出里面的 Blueprint 对象，注册到正在运行的 app 上。不需要重启，不需要脚手架重新生成，写完就能接住请求。

这和大多数 agent scaffold 有本质区别。脚手架是骨架，跑一次就扔，agent 在里面生成的是应用。Ditto 反过来，骨架是运行时，agent 在里面生成的是骨架自己的下一层。整个架构只有一个动作，写完路由，服务就变成新的样子。

这个设计很漂亮，也很脆。

`app.register_blueprint(attr)` 没有判重，同一个 Blueprint 被注册两次会直接抛 RuntimeError 崩掉整个 app。`Blueprint` 检测靠 `isinstance`，agent 生成的文件里如果没写 Blueprint 对象，这一行就被静默跳过，没有警告也没有反馈。动态加载的灵活性换来了两条隐藏的死路，代码里没有一处提到它们。

## 五个工具，其实只有三个

作者把工具集定义得相当克制，一共五个。

```python
available_functions = {
    "create_directory": create_directory,
    "create_file": create_file,
    "update_file": update_file,
    "fetch_code": fetch_code,
    "task_completed": task_completed
}
```

create_directory 建目录，create_file 写文件，update_file 改文件，fetch_code 读文件，task_completed 是终止信号。三个文件操作加一个终止标记，这就是全部工具。create_file 本身已经支持 overwrite，`except FileExistsError` 走覆盖分支，update_file 完全是多余的，同一个东西被写了两次。

值得看的是它缺了什么。

没有 shell，没有 python -c，没有 curl，没有 pytest。Agent 无法执行它写下的任何一行代码。

```python
def fetch_code(file_path):
    try:
        with open(file_path, 'r') as f:
            code = f.read()
        return code
    except Exception as e:
        return f"Error fetching code from {file_path}: {e}"
```

fetch_code 是这个 agent 唯一能"看"自己产物的方式。LLM 写下一个 routes/users.py，它可以再调 fetch_code 把这个文件读回来，看看自己写得对不对。但它没有第二种看的方法，它永远看不到"这个 Flask app 起没起来""这个 endpoint 返回什么""这个模板有没有渲染报错"。

System prompt 里作者写得很急，让模型用 fetch_code review 自己写的代码，内部消化错误、自行解决后再往下走。但没有执行环境，errors 只能来自文件写入失败，不来自代码逻辑。Agent 没有机会碰到运行时错误，除非文件根本写不下去。

这是 occasionally 的出处。作者在 README 里加这个词的时候，可能还没意识到问题这么彻底。

## 循环本身很朴素

```python
while iteration < max_iterations:
    response = completion(model=MODEL_NAME, messages=messages, tools=tools, tool_choice="auto")
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls
    if tool_calls:
        # 执行工具
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_to_call = available_functions.get(function_name)
            function_args = json.loads(tool_call.function.arguments)
            function_response = function_to_call(**function_args)
            messages.append({"tool_call_id": tool_call.id, "role": "tool",
                             "name": function_name, "content": function_response})
            if function_name == "task_completed":
                return
        # 再调一次 LLM，不带 tools，把 tool 结果当对话内容接上
        second_response = completion(model=MODEL_NAME, messages=messages)
        messages.append(second_response.choices[0].message)
    else:
        messages.append(response_message)
    iteration += 1
```

这就是全部循环。没有 ReAct 的显式 Thought，没有 Plan-and-Execute 的分阶段，就是"调 LLM，有 tool call 就执行，把结果加回 messages，继续"。max_iterations 硬编码 50，防止失控。

这里有个设计味道很明显的地方，工具执行完之后又调了一次不带 tools 的 LLM。这一次调用没有意义，OpenAI 的 function calling 协议本身要求 assistant 消息和 tool 消息配对出现，直接把工具结果加入 messages 下一轮继续就行。这次额外调用既没用也没省，浪费了一次 LLM 往返，还多拉了一次上下文。我猜作者是照着一份早期教程写的，或者是为了让 LLM 对每次工具调用都给一句确认话，好让前端 progress 输出更"像那么回事"。

## 和 ReAct 比，缺了半个循环

上一篇写过 ReAct、Plan-and-Execute 这些经典 agent 循环。ReAct 的核心是 Thought、Action、Observation 三个环节的交替，Observation 是让 Agent 拿到环境真实反馈的关键。

Ditto 的循环可以对应进去。Thought 和 Action 被合并成一次 LLM 调用（tool_choice="auto" 让模型直接决定用什么工具），Observation 就是工具函数的返回值，然后这个返回值塞回 messages 数组，下一轮继续。

看起来和 ReAct 一模一样。但差的那半个循环在这里。

ReAct 的 Observation 是环境对 Agent 真实做出的反应。Agent 调用工具，世界发生变化，工具把这个变化如实报回来。Ditto 的 Observation 是"文件已写入""目录已创建"，Agent 永远拿不到"这个 Flask app 起没起来""这个 endpoint 返回什么""这个模板有没有渲染报错"。工具调用本身没有改变环境，它只是让 agent 把文件写进目录，环境没有真的接收这个文件并运行它。

Ditto 的循环里，Observation 只有写文件的路径和状态字符串，代码执行的结果一次也拿不到。Agent 能读到自己写的东西（fetch_code），但读回来的内容和写出去的东西是同一个东西，它看不到这个代码在世界里产生了什么效应。

这是工具集的设计边界，不是 bug。作者给了 agent 文件系统权限，没给执行权限。Agent 就只能在这个权限里打转，反复读自己刚写下的字，判断它看起来对不对，然后继续写下一段。

## 一年之后的同一个作者

2024 年 10 月 15 日，Yohei Nakajima 开源了 Ditto。这一年多前，2023 年 10 月 30 日，同一个人在 GitHub 上开源了 BabyAGI。BabyAGI 是我印象里最早一批把"agent loop + 记忆 + task 队列"这套骨架跑通的项目之一。

README 结尾作者自己交代了这段渊源。

> "I'm basically going to try to bake this into the new BabyAGI framework, but give it the ability to store and save functions from the database. If this sounds like a fun challenge and you get it working, definitely let me know"

> "This is a quick exploration, so I have no plans to work on this further."

Ditto 是 BabyAGI 一年后的一个快速实验。作者打算把这个 agent 的思路合回 BabyAGI，重点在让 agent 把生成的函数存进数据库，后续任务可以复用。这个方向比写文件更进一步，写进数据库的东西可以被下一个任务直接调，而不是像 Flask 路由那样被 importlib.reload 一次性装完就完了。

作者没继续。项目停在 2024 年那批代码上，最近一次更新是几天前的一次小改。整个 repo 1067 个 star，MIT 许可，没有活跃维护，也没有 issue 讨论。作者说得很清楚，quick exploration，不打算再弄了。

## 差的那一步

Ditto 的价值不在它做了一个多厉害的 agent。整个代码库就一个 main.py，作者自己也说这是 quick exploration。它值得读，是因为 461 行里塞了一个 agent 该有的所有东西，也暴露了一个 agent 最容易漏掉的那一步。

Tool 集合的边界就是 Agent 能观察世界的边界。给它文件系统，它就能反复读自己写的东西；不给它执行环境，它就永远不知道这些代码在世界里能变成什么。这个边界一旦定下，无论 prompt 写得多恳切，无论 system message 里让模型 Review and Refine 几次，agent 都出不来。它能做的最勤奋的事，就是对自己刚写下的一行行字反复 fetch_code，希望这一次读出来比上一次看起来更像对的样子。

这个模式我在别的 agent 里也见过。骨架搭得再干净，工具集里没有执行权限的地方，永远补不上。
