---
title: "Building Agent Systems That Compound"
description: "关于 Agent 架构、上下文工程与长期系统能力的一些起点。"
date: "2026-08-02"
type: "writing"
tags: ["AI", "Agent", "Architecture"]
featured: true
draft: false
---

Agent 系统的价值，不只是回答一次问题，而是让经验、工具与反馈可以持续复利。

## 从一次调用到一个系统

一个可靠的 Agent 系统需要清晰的边界：目标、上下文、工具、状态和评估。我们会从这些边界开始，逐步讨论如何把想法落到工程实践。

```ts
type AgentLoop = {
  goal: string;
  context: string[];
  tools: string[];
};
```
