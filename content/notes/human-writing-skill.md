---
title: "human-writing 让中文写作先像人说话"
description: "分享一个面向中文创作与改稿的 Codex Skill，它先检查材料，再处理结构、节奏和模型腔。"
date: "2026-08-05"
type: "notes"
kind: "resource"
resourceType: "github"
resourceUrl: "https://github.com/KKKKhazix/human-writing"
github: "KKKKhazix/human-writing"
tags:
  - Skill
  - 写作
  - 资源
  - 方法论
draft: false
---

## 为什么值得装

写中文内容时，最容易出问题的地方通常不是语法。真正麻烦的是文章看起来完整，读起来却像一份被拉长的说明书。观点都对，段落也齐，可读者碰不到具体材料，也听不见一个真实的人在说话。

`human-writing` 处理的就是这个问题。它把写作前的第一道门槛放在材料上。现实内容要先确认事实、数字、引语和亲历从哪里来。材料不够时，先研究、追问，或者把题目缩小。这样做会让文章短一点，但也少了很多为了凑篇幅而生出来的空话。

这点对个人站很重要。这里的笔记、资源分享和研究报告，很多会由 Agent 辅助生成。Agent 很擅长整理结构，也很容易把一个普通判断扩成一组漂亮段落。这个 skill 的价值就在于让 Agent 先停一下，看看手里到底有什么。

## 它怎么工作

```mermaid
flowchart LR
    A["判断现实或虚构"] --> B["检查材料或人物行动"]
    B --> C["直接写第一稿"]
    C --> D["按文体修正"]
    D --> E["检查硬规则"]
```

| 现实写作 | 虚构创作 |
| :--- | :--- |
| 材料不够时，先研究、追问或缩短。真人经历、数字和原话都要能说明来路。 | 可以创造现场、对白、心理与结局。每个主要场景仍要有目标、动作或变化。 |

初稿完成后，Skill 会检查段落有没有真正往前走，删除重复解释，处理中文节奏，并清除冒号、破折号、翻案句、商业黑话和常见模型腔。检查脚本只执行已经写明的硬规则，不替作者决定文体。

## 怎么实现的

这是完整的目录结构：
```text
human-writing/
├── SKILL.md
├── VERSION
├── LICENSE
├── agents/
│   └── openai.yaml
├── references/
│   ├── forum-prose.md
│   ├── reality.md
│   ├── fiction.md
│   ├── formats.md
│   └── revision.md
└── scripts/
    └── check_prose.py
```

这个仓库提供的是一个完整的 Skill。入口文件是 `SKILL.md`，里面定义了材料检查、现实与虚构分流、写作流程和交付约束。`references` 目录下面放了不同文体的细则，包括论坛长帖、现实题材、虚构故事、特殊格式和初稿后的修订规则。

| 位置 | 用途 |
| :--- | :--- |
| [`SKILL.md`](./human-writing/SKILL.md) | 入口、材料门槛、现实与虚构分流、写作流程和交付禁令 |
| [`forum-prose.md`](./human-writing/references/forum-prose.md) | 知乎回答、论坛长帖、公众号文章和其他长篇散文写法 |
| [`reality.md`](./human-writing/references/reality.md) | 真人、历史、新闻、数据、评测、教程和个人经历的事实边界 |
| [`fiction.md`](./human-writing/references/fiction.md) | 小说、故事、虚构散文、对白和剧本的创作规则 |
| [`formats.md`](./human-writing/references/formats.md) | 短内容、口播、演讲、教程、评测、对白和诗歌等形式规则 |
| [`revision.md`](./human-writing/references/revision.md) | 初稿完成后的删改、节奏、词语和事实检查 |
| [`check_prose.py`](./human-writing/scripts/check_prose.py) | 检查成稿是否命中明确禁用项 |



它还带了一个 `check_prose.py` 脚本，用来检查成稿是否命中明确禁用项。脚本不替作者决定文体，只负责把那些已经写明不能出现的句式和符号找出来。

我更看重它背后的判断。好的中文内容要让每一段都有来路，有推进，有分寸。对于一个用 Agent 协作维护的个人站，这比多加几个模板更有用。


## 适合谁

如果你经常让 Agent 帮你写知乎回答、博客、公众号文章、产品说明、教程、评测、研究摘要或个人叙事，这个 skill 值得放进工具箱。

它不会替你创造不存在的经历，也不会把资料不足的问题藏起来。它更像一个写作前的质检员，先问材料够不够，再问文章有没有真的往前走。很多时候，这两个问题已经能挡住大部分模型腔。

## 怎么装
把下面这句话发给你的 Agent。

```bash
帮我安装这个skill：https://github.com/KKKKhazix/human-writing
```

Agent 会读取仓库、找到 `human-writing`，并完成安装。安装后显示名为「活人感写作」。

<details>
<summary><strong>当前 Agent 不能直接安装时</strong></summary>

可以从 [Releases](https://github.com/KKKKhazix/human-writing/releases/latest) 下载 `human-writing.skill`，也可以把仓库里的 [`human-writing`](./human-writing) 文件夹完整复制到本机 Skills 目录。文件夹名必须保留为 `human-writing`。

```text
~/.agents/skills/human-writing/
```

</details>

安装后可以这样调用。

```text
使用 $human-writing，把我的材料写成一篇有活人感和中文韵律的作品。
```

## 资源

- [human-writing GitHub 仓库](https://github.com/KKKKhazix/human-writing)
- [human-writing Release](https://github.com/KKKKhazix/human-writing/releases/latest)
