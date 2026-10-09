---
title: "复杂度守恒定律"
description: "Tesler 定律的原始表述，以及从 1993 到 2016 年间 20 余位来自不同领域的作者对这条定律的引用与诠释。"
date: "2026-10-09"
type: "writing"
kind: "essay"
tags: ["设计哲学", "系统架构", "复杂度", "Tesler"]
draft: false
---

一条在软件、设计、系统领域被反复提起的定律。1984 年前后由 Larry Tesler 提出，原文短到只有两句话。此后三十多年里，从对象数据库、设计模式、业务流程到营销、机器人，各领域的作者以各自的方式重新陈述过这条定律。

## The Law of Conservation of Complexity

原始表述约 1984 年。

> “Every application has an inherent amount of irreducible complexity. The only question is who will have to deal with it—user, application developer, or platform developer.”

中文大意。每个应用都有固有的不可消除的复杂性。问题在于谁承担这份复杂度。用户、应用开发者，还是平台开发者。

想进一步讨论，可参见 Dan Saffer 的访谈。以下是各个视角。

## 各个视角

**对象数据库视角**

> “在这里，对象引用在磁盘间移动时的管理复杂度，从程序员手里被移交给了系统。复杂度并没有被消除，只是被移动到了别处，这样程序员就能把精力集中在应用本身的问题上。”
>
> Tim Andrews 著《Object Databases in Action · Technology and Application》。Richard Y. Wang 主编，*Information Technology in Action · Trends and Perspectives* 第四章，第 63-82 页，1993 年 2 月。

**模式设计视角**

> “复杂度守恒定律是对‘模式祭司’（Pattern Priesthood）的一种平衡。挑选模式时，要选那些有足够实质、值得下本钱的，同时不能复杂到只有少数精英才看得懂。”
>
> Linda Rising 著 *The Patterns Handbook · Techniques, Strategies, and Applications*，第 350 页，1998 年 6 月 28 日。

**用户体验视角**

> “既然我们要不断降低暴露给用户的复杂度占比，那可以预期我们自己任务里的难度和复杂度，会随着时间推移只增不减。”
>
> Bruce Tognazzini 博客文章，1998 年 9 月。

**应用开发平台视角**

> “SAP CAF 的目标，就是把开发复合应用时的复杂度，尽可能从程序员那边转移到工具本身。”
>
> Dan Woods 与 Jeffrey Word 著 *SAP NetWeaver For Dummies*，第 267 页，2004 年 5 月 7 日。

**产品形态视角**

> “从自适应帆配置（transition rig，一种可自适应的帆船结构）来看，复杂度已经从产品使用环节转移到了设计与制造环节。在很多情况下，这是一个值得做的取舍，尤其对成熟产品而言，不管是软件界面、物理操控，还是网站本身。”
>
> David Bishop 博客文章，2005 年 1 月 27 日。Peter Lucas、Joe Ballay 与 Mickey McManus 著 *Trillions · Thriving in the Emerging Information Ecology*，第 149 页，2012 年 8 月 29 日。

**业务流程视角**

> “业务流程的复杂度就像能量，无法被创造也无法被消灭，只能从一个地方被转移到另一个地方。”
>
> Sean McGrath 在 ITworld 发表的文章，2005 年 5 月 19 日。

**交互设计视角**

> “用 The Who 在 1966 年的那首《Substitute》唱的那句。你看到的简单事情，实际上全都是复杂的。”
>
> Dan Saffer 著 *Designing for Interaction · Creating Smart Applications and Clever Devices*，第 55 页，2006 年 7 月 28 日。

**软件集成视角**

> “概括起来，尤其是在人机交互的语境下，似乎存在一个复杂度守恒的原则。数字化表示与计算中的复杂，只能在牺牲显式表示的前提下被简化。”
>
> Kay Hammer 与 Tina Timmerman 著 *Fundamentals of Software Integration*，第 112 页，2007 年 12 月 11 日。这一条是对该定律的独立提出。另见第 270-271 页。

**讨论方式视角**

> “谈论一件事简单，却不去看那些不可避免的复杂最终由谁承担，就等于直接跳进泥坑里。”
>
> Bill de hOra 博客文章，2008 年 8 月 15 日。

**产品成功背后的原理**

> “如果我们去看历史上那些最成功的应用，就会发现背后站着 Tesler 定律。”
>
> Mark Mzyk 博客文章，2008 年 8 月 17 日。

**组织与工程分工视角**

> “能量永不会损失。同理，一个系统为实现目标所必需的最小复杂度也无法被削减，它只能被移动位置。”
>
> Eachan Fletcher 博客文章，2008 年 8 月 25 日。
>
> “这也是组织结构里的一个因素。如果有人，或某个部门，做得少了，就一定有人要多做，否则结果不会出现。”
>
> Eachan Fletcher 博客文章，2008 年 9 月 3 日。

**架构分层视角**

> “软件系统中的总复杂度始终守恒，可以在不同层级之间移动。把它放在哪里，是一个架构选择。”
>
> Dino Esposito 与 Andrea Saltarello 著 *Microsoft® .NET · Architecting Applications for the Enterprise*，第 368 页，2008 年 10 月 15 日。这一条是对该定律的独立提出。

**认知工作分析视角**

> “这种复杂度的转移在自动路径规划中就能看到。最优路线的计算由计算机而不是人类用户来承担。”
>
> Daniel P. Jenkins、Neville A. Stanton、Paul M. Salmon 与 Guy H. Walker 著 *Cognitive Work Analysis · Coping with Complexity*，第 8 页，2009 年 1 月 1 日。

**健康信息系统视角**

> “软件厂商把所有技术复杂度都留给了用户。要真正达到理想的可用性水平，唯一的办法是设计反映用户工作流程（workflow）的软件，以及反映用户心智模型（concepts）的术语。”
>
> Alan R. Shark 与 Sylviane Toporkoff 著 *eHealth · A Global Perspective*，第 125 页，2010 年 3 月 17 日。

**学习设计视角**

> “那些机械照搬 Cognitive Load 原则来设计工作培训项目的人，大概相信自己把学习的‘不可消除的复杂性’承担了下来，其实他们可能只是在推迟学习本身的困难。学习没法替别人完成，正如没法替别人吃饭或喝水。”
>
> Bunchberry & Fern 博客文章（已归档），2010 年 3 月 25 日。

**用户体验设计视角**

> “创造简洁用户体验的秘诀，是把复杂度放到合适的位置，让每一刻都感觉简单。”
>
> Giles Colborne 著 *Simple and Usable Web, Mobile, and Interaction Design*，第 180 页，2010 年 9 月 26 日。

**日常技术视角**

> “汽车和它的车载计算机系统每年都在变得更复杂，但这种隐藏的复杂度改变了驾驶员的任务，把它变得更简单，也更安全。”
>
> Donald Norman 著 *Living with Complexity*，第 224 页，2010 年 10 月 29 日。

**设计教学视角**

> “随着系统呈现出来的复杂度被减轻，设计师自己任务里的复杂度必然要增加来填补这个空缺。对于愿意迎接这项挑战的设计师，以及今天在校园里学习交互设计的学生而言，这是好消息。”
>
> Robert Blinn 对 Norman 那本书的评述，2011 年 2 月 1 日。

**微交互视角**

> “先定位核心复杂度在哪里，然后决定用户希望在整体流程的哪个环节接触到其中的哪一部分。”
>
> Dan Saffer 著 *Microinteractions · Designing with Details*，第 67-69 页，2013 年 5 月 20 日。

**营销视角**

> “工程师可能要多花很多个小时，才能为用户每次节省几秒钟，但按 Tesler 的说法，这是合理的取舍。我建议营销领域也用同样的模型。”
>
> John Kuefler 博客文章，2015 年 11 月 4 日。

**机器人工程视角**

> “复杂度因此从物理基础设施转移到了算法层面。”
>
> Raffaello D'Andrea 向 Kyle Chayka（*The New York Times Magazine*）阐述机器人辅助的机场行李方案时总结的话，2016 年 11 月 10 日，第 58 页。
