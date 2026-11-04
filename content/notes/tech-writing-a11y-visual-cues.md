---
title: "为写作添加无障碍视觉"
description: "颜色、图标与高亮要同时提供非视觉线索，让色盲与读屏用户也能理解。"
date: "2026-11-03"
type: "notes"
kind: "note"
series: "Google 技术写作"
tags:
  - 无障碍
  - Google 技术写作
draft: true
---
在本单元中，你将学习如何创建结合文本与视觉元素的无障碍视觉内容，而不是仅依靠视觉线索来传达信息。

## 为什么视觉线索不够

颜色、形状和图案等视觉线索是传达信息的有效工具。然而，为确保内容对广泛受众无障碍，不要只依赖视觉元素，例如：

- 颜色
- 图案
- 图片
- 字体样式
- 方向词（例如"右上角"）

相反，应把这些视觉元素与描述性文字结合起来传达信息。使用图片、示意图或其他图表时，提供文字描述或替代文本也很重要。

有视觉障碍的用户（包括色盲）可能无法完全感知某些视觉线索。把视觉元素与描述性文字结合起来，有助于确保无论用户感知视觉的能力如何，想要表达的含义都能传达给每个人。这种方法还能帮助消除因颜色或形状的含义或用途对所有人不清楚而可能产生的歧义。

## 示例

下面的示例说明为什么不能只靠颜色传达信息，以及如何用文字、颜色和符号来增强视觉内容的无障碍性。

### 不要只依赖颜色

下面这个逗号用法示例改编自 [Google 开发者文档风格指南](https://developers.google.com/style/commas#commas-separating-two-independent-clauses)，它只靠颜色（红色和绿色）传达重要信息，因此排除了色盲或其他视觉障碍人群。
在这个示例中，红色句子逗号使用错误，绿色句子逗号使用正确：

- The libraries make feed creation easier, and they ensure that only valid feeds are produced.
- The libraries make feed creation easier and they ensure that only valid feeds are produced.
- Type your ID and click OK.
- Type your ID, and click OK.

一些色盲用户无法区分红色文字和绿色文字，所以单看上面的示例，他们无法判断哪个是正确的。这个示例中唯一的区分因素是颜色，因此既看不到文字也无法区分颜色的人，就分辨不出哪个是正确的示例。

### 使用文字、颜色和符号增强无障碍性

下面的示例在文字之外，还使用了红色的"踩（thumbs down）"和绿色的"赞（thumbs up）"符号。这一改动让即使去掉所有颜色和其他视觉线索，文字依然清晰。

推荐：The libraries make feed creation easier, and they ensure that only valid feeds are produced.

不推荐：The libraries make feed creation easier and they ensure that only valid feeds are produced.

推荐：Type your ID and click **OK**.

不推荐：Type your ID, and click **OK**.

对于能看到的人，红色踩和绿色赞与颜色的搭配是有用的视觉参照。对于看不到或无法区分这些视觉线索的人，提供描述性文字（这里即"不推荐"和"推荐"）会很有帮助。

## 练习：修复一个示意图

接下来，思考一下你会如何编辑下面的示意图，让它更无障碍。

![示例示意图，由黄色、蓝色、紫色和绿色矩形通过箭头连接。](https://developers.google.com/static/tech-writing/accessibility/self-study/images/visual-cues-exercise.png)

这个示意图用不同颜色的矩形表示类别。由于它只靠颜色区分类别，带来了无障碍挑战。为了让示意图更无障碍，考虑加入不同形状、线宽、图案或文字标签等设计元素，以清晰区分各类别。

#### 点击图标查看一个可能的答案。

可能的答案：
![示例示意图，有一个黄色梯形标注为 A、一个蓝色圆形标注为 B、一个紫色三角形标注为 C、一个绿色矩形标注为 D。](https://developers.google.com/static/tech-writing/accessibility/self-study/images/visual-cues-solution.png)

这个版本的示意图不再只靠颜色传达信息，而是结合文字标签、颜色和形状来增强无障碍性。每个类别都有独特的形状（梯形、圆形、三角形、矩形）和文字标签（A、B、C、D）。
