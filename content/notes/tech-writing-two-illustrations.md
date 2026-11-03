---
title: "配图"
description: "插图不是装饰：什么情况下需要图、截图还是示意图、怎么给图配说明。"
date: "2026-11-03"
type: "notes"
kind: "note"
series: "Google 技术写作"
order: 17
tags:
  - 技术写作
  - Google 技术写作
draft: false
---
还记得老师给你布置了一大章要读吗？你飞快地翻过教材中指定的那一段，拼命期盼着……没错，就是图片！看插图比读文字有趣多了。事实上，在阅读技术材料这件事上，绝大多数成年人仍然是小孩子——依然渴望着图片而不是文字。

![三个孩子一边读书一边指着图片。](https://developers.google.com/static/tech-writing/two/images/book_readers.jpg)

**图 1. 好的图形能以文字无法做到的方式吸引读者。**
[Nirmal Dulal \[CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0)\]](https://commons.wikimedia.org/wiki/File:Nepalese_Children.JPG "Nirmal Dulal [CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0)], via Wikimedia Commons")

根据 [Sung 和 Mayer（2012）](https://www.sciencedirect.com/science/article/pii/S0747563212000921) 的研究，提供任何图形——无论好坏——都会让读者更喜欢文档；然而，只有*有教学意义*的图形才能帮助读者学习。本单元提供一些方法，帮助你创作真正"一图胜千言"的图。

## 先写图注

先写图注，再创作插图，往往很有帮助。然后，创作最能体现该图注的插图。这个过程帮助你检验插图是否符合目标。

好的图注具有以下特征：

- 它们**简短**。通常，一条图注只有寥寥几个词。
- 它们点明**要义**。*看完这张图，读者应该记住什么？*
- 它们**聚焦**读者的注意力。当照片或示意图包含大量细节时，聚焦尤为重要。

> **注意：** 按照惯例，图注总是放在图的下方。

### 练习

目标读者：修读"数据结构导论"课程的计算机科学本科生。

请考虑下面三张图，它们使用了同一条图注。

![彩色链条](https://developers.google.com/static/tech-writing/two/images/caption_exercise_chain_a.svg)

**图注 A. 单向链表节点存储内容以及对下一节点的引用。**

![由三个箭头连接起来的四个方框](https://developers.google.com/static/tech-writing/two/images/caption_exercise_drawing_b.png)

**图注 B. 单向链表节点存储内容以及对下一节点的引用。**

![四个方框（每个都有内容和一个指针），由三个箭头连接。](https://developers.google.com/static/tech-writing/two/images/caption_exercise_drawing_c.svg)

**图注 C. 单向链表节点存储内容以及对下一节点的引用。**

上面三张图中，哪一张最能体现它的图注？

#### 点击图标查看答案。

- 图 A 不好。链条漂亮，但毫无信息。链条还错误地暗示单向链表既向前又向后指向。
- 图 B 尚可。这张图帮助学生意识到第一项指向第二项，第二项指向第三项，依此类推。不过，虽然图注提到了*内容*和*指针*，这张图展示了指针却没有展示内容。
- 图 C 是最好、最有教学意义的选择。这张图清晰地勾勒出每个节点的内容部分与指针部分。

## 限制单张图中的信息量

很少有哪种智力活动能像细细品味一幅名画那样有回报——一层层揭开洞察与意义的层面。人们愿意花大价钱，在世界的各大美术馆里做这件事。

![文森特·梵高的《唐吉老爹》肖像——罗丹美术馆，公有领域，https://commons.wikimedia.org/w/index.php?curid=119599](https://developers.google.com/static/tech-writing/two/images/van_gogh.png)

**图 2. 你会愿意细细研究这幅梵高画作。**

[唐吉老爹肖像，文森特·梵高——罗丹美术馆 \[公有领域\]](https://commons.wikimedia.org/wiki/File:Van_Gogh_-_Portrait_of_Pere_Tanguy_1887-8.JPG "Vincent van Gogh [Public domain], via Wikimedia Commons")

相比之下，像下面这样高度复杂的技术插图往往会吓退大多数读者：

![一张充满线条和小字的示意图](https://developers.google.com/static/tech-writing/two/images/overly_complex_diagram.svg)

**图 3. 复杂的框图会压垮读者。**

正如你避免过长的句子一样，也要努力避免视觉上的"冗长句"。作为经验法则，不要在单张图中塞入超过一段话的信息量。（另一种经验法则是：避免需要超过五个无序列表项才能解释清楚的插图。）我能听到你说："但现实中的技术系统可能比图 3 所示复杂得多。"你说得对，但你大概也不觉得有必要用一段话来解释现实中的复杂系统。

把视觉杂乱转化为连贯有用的东西，其诀窍在于把复杂系统组织成子系统，如下面这张图所示：

![三个方框，每个都有一个简单的标签](https://developers.google.com/static/tech-writing/two/images/subsystems.svg)

**图 4. 一个组织成三个子系统的复杂系统。**

在展示"全景图"之后，再分别提供每个子系统的插图。

![图 4 中放大的一小段，细节稍多](https://developers.google.com/static/tech-writing/two/images/subsystems_zoomed.svg)

**图 5. 复杂系统中一个子系统的放大细节。**

或者，从一幅简单的"全景图"开始，然后在后续每张插图中逐步扩展细节。

## 聚焦读者的注意力

面对下面这样复杂的截图时，读者很难判断哪些内容相关：

![6 个看似同样重要的菜单项截图](https://developers.google.com/static/tech-writing/two/images/unfocused_screenshot.png)

**图 6. 读者不知道要看哪里。**

加入一个视觉线索，例如下图中红色的椭圆，能帮助读者聚焦截图中相关的部分：

![同一张截图，但一个菜单项被红色椭圆圈出](https://developers.google.com/static/tech-writing/two/images/focused_screenshot.png)

**图 7. 读者会聚焦在打破规律的形状上。**

**标注（callout）** 提供了另一种聚焦读者注意力的方式。对于照片和线条画，标注能帮助我们的眼睛恰好落在正确的位置。图片中的标注往往比用一整段来解释图片更好，因为标注把读者的注意力聚焦到图片最重要的方面。然后，在你的解释里，你可以直接聚焦到示意图的相关部分，而不必花时间描述你正在谈论图片的哪一部分。

在示例图片中，标注和箭头迅速把读者引向目的所在。

![箭头指向火卫一上的一个拟议着陆点](https://developers.google.com/static/tech-writing/two/images/moon_with_callout.svg)

**图 8. 标注引导读者的视线。**

[NASA / JPL-Caltech / 亚利桑那大学 \[公有领域\]](https://commons.wikimedia.org/wiki/File:Phobos_colour_2008.jpg "NASA / JPL-Caltech / University of Arizona [Public domain], via Wikimedia Commons")

## 配图就是反复配图

和写作一样，插图的第一稿很少足够好。请修改你的插图以澄清内容。修改时，问自己以下问题：

- 我如何能简化这张插图？
- 我是否应该把这张图拆成两张或更多更简单的插图？
- 图中的文字容易阅读吗？文字与背景的对比度足够吗？
- 要义是什么？

例如，请想一想 [伦敦地铁地图的演变](https://wikipedia.org/wiki/Tube_map#History)。1931 年之前，伦敦地铁图是按比例绘制的，还带上了地面道路和随轨道弯曲的地铁线路。

![1908 年伦敦地铁的复杂地图，包含地面道路](https://developers.google.com/static/tech-writing/two/images/tube_1908.jpg)

**图 9. 1908 年按比例绘制的伦敦地铁图，含地面道路。**

[\[公有领域\]](https://commons.wikimedia.org/wiki/File:Tube_map_1908.jpg "London Tube Map 1908 [Public domain], via Wikimedia Commons")

1931 年，Harry Beck 开创了一种新型公共交通地图，通过去除地面标记和比例尺来简化旧地图。他的设计转而聚焦使用地图的人们真正关心的东西：从 A 站到 B 站。即便 1931 年的地图大获成功，Beck 仍然花了多年时间反复迭代这张图，以简化和澄清它。现在请看一看[现代地铁图](https://www.google.com/search?tbm=isch&q=london+tube+map)，尽管新的线路和车站已经出现，它们仍然贴近 Beck 的设计。

### 练习

请考虑下面这张原始插图：

![一张复杂的递归视觉图，使用了难以辨认的颜色和令人困惑的箭头](https://developers.google.com/static/tech-writing/two/images/recursion1.svg)

**图 10. 一张复杂的图。**

上面这张图的要义应当是：
> 对于递归解法，在 return 语句中调用函数自身，
> 直到到达一个基础解（base case）。

图的复杂性在哪些方面掩盖了要义？你会如何解决这些问题？

#### 点击图标查看答案。

这张图可能存在的一些问题包括：

- **问题**：明亮的颜色把读者的注意力从图的其他方面拉走了。
  **解决办法**：仔细选择颜色，使它们不会压过整张图。
- **问题**：图的颜色对比度不足。这让一些低视力者或某些类型的色盲读者难以辨认。
  **解决办法**：去掉不必要的颜色使用，并确保颜色符合[标准的颜色对比度建议](https://material.io/design/color/text-legibility.html#legibility-standards)。
- **问题**：箭头双向指向，让人分不清图的走向。
  **解决办法**：把箭头分成两组，一组表示调用函数，另一组表示从函数返回。
这里还有图中未被识别出来的其他问题。

这是一张改进后的插图：

![改进后的前一张图，简化了颜色并给箭头加了标签](https://developers.google.com/static/tech-writing/two/images/recursion2.svg)

**图 11. 前一张图的简化版本。**

你在改进后的插图中看到了哪些缺陷？

#### 点击图标查看答案。

这里仍然存在两个缺陷：

- 这张图仍然太复杂。解释这张图需要远超一段话的篇幅。想一想，去掉多余信息或添加澄清标签，能否简化理解。
- 虽然分开箭头有助于展示函数何时相互调用或返回数据，但返回箭头或许需要一些标签，告诉读者返回值是什么。

## 配图工具

创建示意图有很多选择。三个免费或提供免费选项的工具包括：

- [Google 绘图](https://drawings.google.com)
- [diagrams.net](https://diagrams.net)
- [LucidChart](https://www.lucidchart.com/pages/)

从这些工具导出图以便在文档中使用时，通常最好将文件导出为[可缩放矢量图形](https://wikipedia.org/wiki/Scalable_Vector_Graphics)（SVG）。SVG 格式可以根据空间约束轻松缩放示意图，因此无论尺寸如何，你都能得到高质量的图像。
