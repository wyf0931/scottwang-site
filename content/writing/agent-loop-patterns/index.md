---
title: "经典 Agent loop 模式总结"
description: "从 ReAct、Plan-and-Execute 到 Tree of Thoughts 和 LATS，梳理几种经典 Agent loop 的控制方式，以及它们和 pi 当前实现的关系。"
date: "2026-08-24"
type: "writing"
kind: "essay"
tags: ["Agent", "Agent loop", "ReAct", "Planning", "LLM"]
draft: false
---

可以。按控制循环来分，经典 Agent loop 大致有这些模式。

这里说的 loop，指的是 Agent 怎样在一次任务里安排模型、工具、环境反馈和下一步决策。模型调用工具以后，结果怎样回到上下文，计划什么时候生成，失败以后是否重试，这些选择会直接决定 Agent 的行为。

## 1. ReAct

论文是 [ReAct，Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)。

ReAct 把推理和行动交替进行。模型先判断当前需要做什么，再调用工具，拿到外部结果后继续判断。

```text
while not done:
    thought = LLM(reasoning + history)
    action = LLM(select_tool(thought))
    observation = execute(action)
    history += thought + action + observation
```

它适合信息不完整、环境会变化的任务。每一步都根据最新观察决定下一步，模型不必一开始就把整条路径想完。代价也很直接，工具调用越多，LLM 调用次数通常越多，重复传入上下文的 token 也会增加。

ReAct 早期常用文本里的 `Action` 和 `Observation` 表示动作与观察。现在的模型通常直接输出结构化 tool call，控制方式仍然相近。

## 2. Plan-and-Execute

Plan-and-Execute 通常指一类架构，并不对应一篇唯一的论文。它的做法是先生成一份多步计划，再交给执行器逐步完成。

```text
plan = PlannerLLM(goal)

for step in plan:
    result = Executor(step)
    if result.failed or environment_changed:
        plan = PlannerLLM(goal, completed_steps, result)
```

它和 ReAct 的差别在于决策节奏。

```text
ReAct
    做一步 → 观察 → 决定下一步

Plan-and-Execute
    先生成多步计划 → 执行计划 → 必要时重规划
```

这种方式适合步骤相对稳定的长任务。执行器可以使用更快、更便宜的模型，规划器只在开始和需要修正时调用。问题在于，早期计划如果建立在错误假设上，后面的执行会连续偏离，系统必须设计好重规划条件。

和这个方向相关的工作包括 [Plan-and-Solve Prompting](https://arxiv.org/abs/2305.04091)，以及把自然语言转换成 PDDL、再交给经典规划器求解的 [LLM+P](https://arxiv.org/abs/2304.11477)。后者更接近 LLM 和外部规划器的组合。

## 3. ReWOO

[ReWOO，Decoupling Reasoning from Observations for Efficient Augmented Language Models](https://arxiv.org/abs/2305.18323) 关注的是工具调用过程中的重复推理成本。

普通的交替式 Agent 可能每调用一次工具，就把越来越长的上下文重新交给 LLM。ReWOO 尝试先生成工具计划，再执行计划，最后统一整理观察结果。

```text
plan = LLM("""
  目标：...
  请生成工具调用计划：
  1. search(...)
  2. lookup(result_of_1)
  3. calculate(result_of_2)
""")

observations = execute_all(plan)

answer = LLM(goal, plan, observations)
```

它可以表达工具之间的数据依赖，也能减少中途的模型调用。代价是计划更早固定。环境在执行期间发生变化，或者某个工具返回了意外结果时，系统需要额外的修复和重规划逻辑。

ReWOO 可以看作 Plan-and-Execute 家族里更强调效率的一种实现。

## 4. Reflexion

论文是 [Reflexion，Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366)。

Reflexion 把失败后的总结单独做成一步。Agent 执行任务失败后，模型分析失败原因，把文字形式的经验写进记忆，再开始下一轮尝试。

```text
for trial in range(max_trials):
    result = run_agent(goal)

    if success(result):
        return result

    reflection = LLM("""
      任务执行失败。
      请分析失败原因，并提出下一次应该避免的问题。
    """)

    memory += reflection
```

下一轮执行时，Agent 会同时看到任务和之前的反思。

```text
agent(goal, previous_reflections)
```

这种方式适合代码修复、网页操作和需要多次尝试的任务。它不更新模型参数，经验主要存在当前任务的记忆里。外部反馈越可靠，反思越有用。只有一句“这次做得不好”，通常不能给下一轮提供足够信息。

## 5. Self-Refine

论文是 [Self-Refine，Iterative Refinement with Self-Feedback](https://arxiv.org/abs/2303.17651)。

Self-Refine 更偏向结果优化。模型先生成一个初稿，再批评初稿，最后根据批评修改输出。

```text
draft = LLM(input)

while not good_enough:
    feedback = LLM(critique_prompt + draft)
    draft = LLM(refine_prompt + draft + feedback)

return draft
```

它可以用于代码生成后的测试和修复，也可以用于文档审校、计划检查和工具参数纠错。Self-Refine 关注当前结果怎样变好，Reflexion 关注失败经验怎样影响下一轮完整执行。两者可以组合使用。

## 6. Tree of Thoughts

论文是 [Tree of Thoughts，Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601)。

普通的 Chain-of-Thought 往往沿着一条推理路径继续生成。Tree of Thoughts 会生成多个候选分支，评估它们，再选择、扩展或回溯。

```text
root = initial_state
frontier = [root]

for depth in range(max_depth):
    candidates = expand(frontier)
    scored = evaluate(candidates)
    frontier = select_best(scored)

return best(frontier)
```

它适合规划、数学和组合搜索等需要回头试另一条路的任务。常见实现会使用 BFS、DFS 或 Beam Search。搜索带来的收益伴随着更高的模型调用次数，因此需要限制深度、分支数量和评估预算。

## 7. LATS

论文是 [Language Agent Tree Search](https://arxiv.org/abs/2310.04406)。

LATS 把 Agent 行动、环境反馈、自我反思和树搜索放进同一个循环里。它借鉴 Monte Carlo Tree Search，让模型探索多条行动路径，并用模型评分或环境结果决定哪些路径值得继续。

```text
root = initial_state

while budget_not_exhausted:
    node = select_promising_node(root)
    action = LLM.propose_action(node)
    observation = execute(action)

    value = LLM.evaluate(node, action, observation)

    if failed(observation):
        reflection = LLM.reflect(node, observation)

    expand_tree(node, action, observation, value)
    backup_value_to_ancestors()

return best_path(root)
```

LATS 适合代码、网页导航和复杂决策。它比普通 ReAct 更愿意探索和回溯，代价是需要维护状态树、评分函数和搜索预算，工程复杂度与运行成本都会上升。

## 简单对比

| 模式 | 核心策略 | 是否逐步观察 | 是否搜索多路径 | 主要成本 |
|---|---|---|---|---|
| ReAct | 推理和行动交替 | 是 | 否 | LLM 调用次数 |
| Plan-and-Execute | 先计划，再执行 | 通常是 | 通常否 | 计划失效后的重规划 |
| ReWOO | 先生成工具计划 | 延迟观察 | 否 | 计划错误 |
| Reflexion | 失败后总结并重试 | 是 | 跨轮次 | 额外反思调用 |
| Self-Refine | 批评并修改结果 | 不一定 | 否 | 多轮生成 |
| Tree of Thoughts | 搜索多条思路 | 可选 | 是 | 大量 LLM 调用 |
| LATS | 树搜索式 Agent | 是 | 是 | 实现和运行成本都高 |

从演化关系看，可以粗略理解为

```text
单次 Tool Calling
        ↓
ReAct
        ↓
Plan-and-Execute / ReWOO
        ↓
Reflexion / Self-Refine
        ↓
Tree of Thoughts / LATS
```

这不是严格的时间线，也不是谁替代谁。它更像几组不同的设计取舍。Agent 越往后增加规划、反馈、反思和搜索，能够处理的任务范围可能变大，状态管理和调用成本也会跟着变重。

## pi 当前属于哪一种

pi 的基础实现可以概括为

```text
结构化 Tool Calling + ReAct 式循环
```

它本身没有内置以下能力

- 独立 Planner
- 显式 Plan 对象
- 多路径搜索
- Reflexion memory
- MCTS 或 Tree Search

pi 的核心循环是模型返回 `toolCall`，运行时执行工具，把结果作为 `toolResult` 放回上下文，然后再次调用模型。模型不再返回工具调用时，循环结束。这正是结构化 tool-calling 版的 ReAct。

更复杂的模式可以建立在这个骨架上。`prepareNextTurn` 可以改变下一轮使用的模型或上下文，`transformContext` 可以做上下文裁剪和外部信息注入，`shouldStopAfterTurn` 可以控制一轮结束后的停机时机，自定义消息和工具结果则可以承载计划、反思和评估信息。

因此，pi 现在提供的是一条足够清楚的基础循环。要做 Plan-and-Execute，需要在外层增加规划状态和执行器。要做 Reflexion，需要增加失败评估与记忆。要做 ToT 或 LATS，则还要增加候选状态、评分和搜索策略。

## 来源

- [ReAct 原论文](https://arxiv.org/abs/2210.03629)
- [Plan-and-Solve Prompting 原论文](https://arxiv.org/abs/2305.04091)
- [LLM+P 原论文](https://arxiv.org/abs/2304.11477)
- [ReWOO 原论文](https://arxiv.org/abs/2305.18323)
- [Reflexion 原论文](https://arxiv.org/abs/2303.11366)
- [Self-Refine 原论文](https://arxiv.org/abs/2303.17651)
- [Tree of Thoughts 原论文](https://arxiv.org/abs/2305.10601)
- [LATS 原论文](https://arxiv.org/abs/2310.04406)
