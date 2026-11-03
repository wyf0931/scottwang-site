---
title: "写出有用的替代文本"
description: "替代文本是给读屏用户看的图像描述：怎么写出真正有信息量的 alt text。"
date: "2026-11-03"
type: "notes"
kind: "note"
series: "Google 技术写作"
order: 40
tags:
  - 无障碍
  - Google 技术写作
draft: false
---
*替代文本*（alt text）是一段简短、描述性的文字，用来替代页面上的视觉元素。最常见的用途是描述图片。

替代文本从以下方面帮助读者：

- 读屏软件为失明或低视力的人朗读替代文本。
- 描述性的替代文本还有助于[改善图片的搜索结果](https://developers.google.com/search/docs/appearance/google-images)。

## 写出有用的替代文本

对无法查看图片的读者来说，替代文本充当图片的功能等价物。以下小节介绍写出有用替代文本的最佳实践。

### 结合上下文解释图片

要结合正文来解释图片。例如，下面这张照片展示的是一只停歇在覆雪树枝上的黑顶山雀：

![](https://developers.google.com/static/tech-writing/accessibility/self-study/images/alt-text-chickadee.jpg)

在周围正文的语境下，你可以选择在描述中强调或略去图片的某些方面。考虑下面两段文字：

片段 1：
> 混合物种群是由不同鸟类组成的、一起行动的鸟群。在北方温带地区，山雀和丛山雀通常会带领其他小型鸣禽组成混合群。山雀和丛山雀的叫声会提醒其他物种附近有食物或威胁。

在这个片段的语境下，这张图片的目的是展示一个带领混合群的鸟类物种的例子。对于这个目的而言，季节、山雀的具体种类或山雀外观的细节并不重要。能识别出鸟类物种的替代文本就足够了。

    alt="一只停在树枝上的山雀。"

片段 2：
> 黑顶山雀会储藏食物，并且能记住存放地点长达 28 天。冬天，它们会在夜间降低体温以保存能量。它们还会蓬松羽毛来留住暖空气，这些暖空气层能抵御寒冷。

这个片段特别提到了黑顶山雀及其在寒冷天气里蓬松的羽毛。在这种语境下，山雀的种类和它在冬天的外观是相关的，因此替代文本描述应包含图片的这些方面：

    alt="一只停在覆雪树枝上、羽毛蓬松的黑顶山雀。"

下面这个 Google Chrome Developers 视频探讨了语境如何影响你描述图片的其他例子：
[视频](https://www.youtube.com/watch?v=flf2vS0IoRs)

### 简要概括图片的用途

使用一个简短的短语或一两句话。过长的描述会打断读屏用户的阅读节奏。

- 不要包含"图片"或"照片"之类的多余词语。
- 首词首字母大写，并以句号结尾。
- 必要时使用其他标点。

读屏软件通常会在句号和某些其他标点处停顿。虽然结尾句号在技术上并非必需，但它能在图片描述和紧随其后的正文之间提供听觉上的分隔。

Web Accessibility in Mind 网站提供了设计兼容读屏软件内容的指南，其中包括一份关于[读屏软件如何朗读内容](https://webaim.org/techniques/screenreader/#how)的总结。

如果你无法用一两句话传达图片的含义，就在文档正文中描述图片的含义。请参阅[在文档中描述复杂图片](https://developers.google.com/tech-writing/accessibility/self-study/write-alt-text#complex-images)。

### 避免重复周围的正文

如果去掉图片后文档含义不变，就给图片加上空的替代文本属性（`alt=""`）。辅助技术会忽略空属性。

在以下情况使用空的替代文本：

- 图片是装饰性的（非信息性的），例如页面末尾作为视觉边框的一条水平线。

  考虑把装饰性图片做成 CSS 背景图，因为读屏软件总是忽略背景图。
- 图片重复了页面上已用文字表达的信息。

如果你不给图片加替代文本，读屏软件会大声朗读文件名而不是忽略图片。读屏用户得不到任何线索来判断图片是否包含有用信息。

### 在文档中描述复杂图片

流程图、图表或地图这类复杂图片中的信息，很难用几句简短的话说清楚。在这种情况下，在替代文本中给出图片的简短描述，并在文档正文中或你链接到的单独页面上提供更长的文字描述。

- 对于图表，可以在同一页或单独一页上提供数据表格。
- 对于流程图和示意图，在文档正文中解释图片中的流程或各个部分。

例如，[软件供应链威胁](https://cloud.google.com/software-supply-chain-security/docs/attack-vectors)页面有一个示意图，展示了软件开发的各个阶段以及漏洞和软件攻击的潜在入口点。

- 该示意图的替代文本是`一个展示软件供应链攻击入口点的示意图。`
- 正文先介绍图片，解释图片图例的用法，然后结合上下文逐一解释示意图的各个部分。

在图片与详细描述不相邻的情况下，要在替代文本中说明详细描述的位置。下面这个替代文本示例包含了详细描述的章节标题。

    alt="路线图，标注了休息站位置。休息站位置列在“骑行途中休息”条目下。"

> **注意：** 避免使用 `longdesc` 属性来描述复杂图片。读屏软件对 `longdesc` 属性支持不佳。该属性在 HTML 现行标准（HTML Living Standard）中也是[已废弃特性](https://html.spec.whatwg.org/multipage/obsolete.html)。

### 仅在必要时包含人口统计信息

描述人物时，只有在人物特征对图片的主旨至关重要时才应包含人口统计信息。否则，使用*人*或其他能提供关键背景的词语来描述人物在图片中的活动或角色，例如*音乐家*、*篮球运动员*、*教师*或*医生*。

关于如何用恰当的语言描述人物，请参阅 Google 开发者文档风格指南中的[包容性文档](https://developers.google.com/style/inclusive-documentation)。

### 其他考虑

- 对重复出现的图片，使用一致的替代文本。
- 避免全大写。
  - 全大写的单词总呈矩形，而常规大小写的单词有不同形状。一些有视觉或认知障碍的人更依赖单词的形状来阅读。
  - 读屏软件可能把全大写单词误读为首字母缩略词。
- 在正文中介绍图表，而不是在替代文本中介绍。

## 示例

下面的示例应用了写出有用替代文本的原则。

逐一审视每个示例的替代文本选项。最恰当的选项应能简洁地提供与图片相关的上下文。

### 示例 1

![](https://developers.google.com/static/tech-writing/accessibility/self-study/images/alt-text-waffles.jpg)

考虑这些替代文本选项：

- 过于简短：`alt="华夫饼。"`
- 过于冗长：`alt="一张圆形白色盘子，上面有 17 片红色草莓，围绕着一摞三块金棕色华夫饼，顶部有两颗完整红草莓，带叶子。"`
- 刚好合适：`alt="盘子里一摞华夫饼，配草莓。"`

### 示例 2

Go 吉祥物（Go gopher）是 Go 编程语言的吉祥物。

![](https://developers.google.com/static/tech-writing/accessibility/self-study/images/alt-text-gopher.png)

考虑这些替代文本选项：

- 过于简短：`alt="Go 吉祥物。"`
- 过于冗长：`alt="蓝色 Go 吉祥物绘图，大圆眼、黄色小爪子、一颗白色牙齿、粉色帽子带小流苏，正吹着橙黄条纹的玩具喇叭。"`
- 刚好合适：`alt="带着玩具喇叭和 10 周年派对帽的 Go 吉祥物。"`

## 练习

通过写一些替代文本，练习你所学的内容。

对每张图片：

1. 为图片设想一个语境。
2. 写出与你选择的语境相符的替代文本。

### 练习 1

![](https://developers.google.com/static/tech-writing/accessibility/self-study/images/alt-text-cardboard.jpg)

你的替代文本

#### 点击图标查看可能的答案。

可能的答案：

- 过于简短：`alt="Google Cardboard 用户。"`
- 过于冗长：`alt="穿着灰白条纹衬衫、袖口橙色的人，把 Google Cardboard 观看器举在眼前，露出牙齿。"`
- 刚好合适：`alt="正在看 Google Cardboard 观看器并微笑的人。"`

### 练习 2

![](https://developers.google.com/static/tech-writing/accessibility/self-study/images/alt-text-graph.png)

图片来源：[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:United_States_per_capita_energy_use_1650-2010.png)

你的替代文本

#### 点击图标查看可能的答案。

可能的答案：

- 过于简短：`alt="美国人均能源使用量。"`
- 过于冗长：`alt="折线图，展示 1650 年至 2000 年美国人均能源使用量，1900 年后大幅上升，1970 至 1980 年间达到峰值。"`
- 刚好合适：`alt="美国人均能源使用量在 1900 年后急剧上升，约在 1975 年达到峰值。"`

### 了解更多

- 阅读 Google 开发者文档风格指南中关于[无障碍](https://developers.google.com/style/accessibility)和[替代文本](https://developers.google.com/style/images#alt-text)的指南
- 阅读 [W3C 图片教程](https://www.w3.org/WAI/tutorials/images/)
- 阅读 [Web Accessibility in Mind 替代文本指南](https://webaim.org/techniques/alttext/)
