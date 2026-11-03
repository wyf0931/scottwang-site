---
title: "Hermes Agent 插件开发示例"
description: "Hermes 的插件系统是它可扩展性的核心。这篇记录一个最简单的插件开发示例，一个自定义委派后端，同时把扩展点全景理一遍。代码用伪代码，去掉错误处理和细节，保留骨架。"
date: "2026-11-02"
kind: "note"
tags: [AI, Agent, 开源项目, Hermes, 插件]
---

Hermes 的插件系统是它可扩展性的核心。这篇记录一个最简单的插件开发示例，一个自定义委派后端，也就是 Delegation Provider，同时把扩展点全景理一遍。代码用伪代码，去掉错误处理和细节，保留骨架。

## 先回答一个问题，支持自定义 Delegation Provider 吗

支持，而且是官方一等公民。Hermes core 保留整个子 agent 生命周期，生成、隔离、深度限制、并发、结果组装、schema 校验全在 core 里。一个委派后端只回答一个问题，这个任务走哪条路由。内置的 default 策略本身就是这样一个插件，源码里的 plugins/delegation/default/ 是它的最小完整示例，也是官方文档推荐的起点。

## 扩展点全景

register(ctx) 拿到一个 PluginContext，这是插件的注册面。主要注册方法有这些。

| 方法 | 作用 |
|------|------|
| register_tool | 注册一个模型可调用的工具 |
| register_hook | 订阅生命周期事件 |
| register_command | 注册 session 内斜杠命令 |
| register_cli_command | 注册 hermes 子命令 |
| register_delegation_provider | 注册委派后端 |
| register_memory_provider | 注册内存后端 |
| register_context_engine | 注册上下文压缩引擎 |
| register_platform | 注册网关平台适配器 |
| register_system_prompt_section | 往系统提示注入内容 |
| register_redaction_patterns | 注册脱敏规则 |
| register_auxiliary_task | 注册辅助任务 |
| dispatch_tool | 用父 agent 上下文调用其他工具 |

除通用插件面外还有一批专项 provider 接口，模型后端、平台适配器、内存后端、上下文引擎、图像生成、视频生成、web 搜索、浏览器后端、计算机操作驱动、secret 源、委派后端。每个都有自己的注册方法和文档页。

## 生命周期 Hook，27 个事件

插件能注册 27 个生命周期事件，分三类。

| 类别 | 事件 |
|------|------|
| 指令控制类 | pre_tool_call（可拦截或审批工具）、pre_llm_call（可注入上下文）、pre_verify、pre_gateway_dispatch |
| 变换类 | transform_tool_result、transform_terminal_output、transform_llm_output、pre_transcription |
| 观察者类 | post_tool_call、post_llm_call、pre_api_request、post_api_request、api_request_error、on_session_start、on_session_end、on_session_finalize、on_session_reset、post_compaction、subagent_start、subagent_stop、kanban_task_claimed 等 |

回调签名按事件不同，但有一条统一规则，**回调收关键字参数，永远接受 kwargs** 以便向前兼容。回调抛异常会被记日志跳过，不会崩掉 agent。只有 pre_llm_call 能注入上下文、pre_tool_call 能返回拦截或审批指令，其余大部分是只读观察者。

## Delegation Provider 开发示例（伪代码）

做一个委派后端，继承 DelegationProvider 基类，实现 name 和 route_task，然后在 register(ctx) 里注册。

```python
# plugin.yaml
# name: delegation-tiers
# version: 1.0.0
# description: Pick a model tier per subagent.

# delegation-tiers/__init__.py
from agent.delegation_provider import DelegationProvider, DelegationRouteError

class Tiers(DelegationProvider):
    @property
    def name(self):
        return "tiers"   # 对应 delegation.backend: tiers

    def task_parameters(self, config):
        # 给 delegate_task 的 schema 加一个 tier 参数，模型每个任务选一次
        tiers = self.settings(config).get("tiers") or []
        return {"tier": {"type": "string", "enum": [t["name"] for t in tiers],
                         "description": "; ".join(f"{t['name']}: {t['description']}"
                                                  for t in tiers)}}

    def description(self, config):
        return "Set tier per task to pick the model that fits it."

    def route_task(self, task, config):
        for t in self.settings(config).get("tiers") or []:
            if t["name"] == task.get("tier"):
                return {"provider": t["provider"], "model": t["model"],
                        "label": t["name"]}
        if task.get("tier"):
            raise DelegationRouteError(f"Unknown tier {task['tier']!r}.")
        return dict(config)   # 没选 tier 就走默认路由

def register(ctx):
    ctx.register_delegation_provider(Tiers())
```

配置放 `delegation.backends.<name>` 下。

```yaml
delegation:
  backend: tiers
  backends:
    tiers:
      tiers:
        - {name: quick, description: Lookups and summaries, provider: openrouter, model: google/gemini-3-flash-preview}
        - {name: deep, description: Hard debugging and design work, provider: anthropic, model: claude-opus-5}
```

启用用一行命令。

```bash
hermes plugins enable delegation-tiers
```

route_task 返回的 route dict 决定这条任务走哪，可选字段有 model、provider、base_url、api_key、api_mode、request_overrides、reasoning_effort、fallback_providers、service_tier、profile、label。返回空 dict 继承父路由。model 永远只看到你在 task_parameters 里给的选项名和描述，看不到原始 provider、model、key。

## 生命周期 Hook 示例（伪代码）

同一个插件里可以同时注册 hook。比如记录每次工具调用。

```python
def _on_post_tool_call(tool_name, args, result, task_id, duration_ms, **kwargs):
    log.info("tool %s in session %s took %sms", tool_name, task_id, duration_ms)

def register(ctx):
    ctx.register_hook("post_tool_call", _on_post_tool_call)
    ctx.register_delegation_provider(Tiers())
```

## 验证

`hermes plugins doctor <路径> --ci` 用 Hermes 自己那套目录发现、manifest 解析、命名空间导入、register 调用、hook 注册表、工具注册表跑一遍，能报告非法 hook 名、不接受 kwargs 的回调、注册失败、声明与注册不一致。这个命令当发布前自检很合适。

## 小结

Hermes 插件系统分两层，通用插件面（工具、hook、命令、技能）加一批专项 provider 接口（委派、内存、平台、上下文压缩、图像生成等）。自定义委派后端是其中文档最完整、示例最干净的一个，继承一个基类、实现两个方法、注册一下就能用。要深挖，官方 Build a Hermes Plugin 指南和 Delegation Provider Plugins 文档是起点。

## 参考资料

- [Build a Hermes Plugin](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins)
- [Delegation Provider Plugins](https://hermes-agent.nousresearch.com/docs/developer-guide/delegation-provider-plugin)
- [Event Hooks](https://hermes-agent.nousresearch.com/docs/user-guide/features/hooks)
- [Subagent Delegation](https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation)
