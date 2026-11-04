---
title: "使用足够的对比度"
description: "文字与背景之间要有足够对比度，否则低视力用户和强光下的用户都看不清。"
date: "2026-11-03"
type: "notes"
kind: "note"
series: "Google 技术写作"
tags:
  - 无障碍
  - Google 技术写作
draft: true
---
更高的对比度让每个人读文本和图片都更容易。对比度低时，每个人看内容都会困难。

色盲影响全球超过 3 亿人：每 12 名男性中 1 人，每 200 名女性中 1 人。

更高的对比度有助于色盲和低视力人群，以及任何在强烈阳光下看屏幕的人。

访问 [Colour Blind Awareness](https://www.colourblindawareness.org/colour-blindness/types-of-colour-blindness/) 了解有关色盲影响的更多信息。

[WCAG](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html) 建议以下最低对比度：

- 小号文字 4.5:1
- 大号文字 3:1（至少 14 pt 粗体 / 18 pt 常规）

考虑下面的对比度示例：

- 对比度差
- 对比度较好
- 对比度最佳

## 练习：选择对比度足够的颜色

完成下面的练习，练习测量足够的颜色对比度：

1. 在另一个浏览器窗口中，打开 Web Accessibility In Mind（WebAIM）的[对比度检查器](http://webaim.org/resources/contrastchecker)。
2. 在对比度检查器中输入以下十六进制颜色，找出哪些前景-背景比值满足对比度要求。把对比度记录在便签或单独文档中，以便与[可能的答案](https://developers.google.com/tech-writing/accessibility/self-study/sufficient-contrast#answers)对比。

![](https://developers.google.com/static/tech-writing/images/contrast-exercise.png)

1. 第一个矩形：
   - 前景色：#148695
   - 背景色：#FD9C32
2. 第二个矩形：
   - 前景色：#EBFF33
   - 背景色：#667E8B
3. 第三个矩形：
   - 前景色：#128697
   - 背景色：#EAEAEA

**点击图标查看预期答案。**

1. 第一个矩形：FAIL
   - 前景色：#148695
   - 背景色：#FD9C32
2. 第二个矩形：FAIL
   - 前景色：#EBFF33
   - 背景色：#667E8B
3. 第三个矩形：FAIL
   - 前景色：#128697
   - 背景色：#EAEAEA

尽管有些颜色对*看起来*对比度更高，但实际上没有一对满足 WCAG 标准。遗憾的是，"光靠目测是不够的"——最好使用对比度检查器。

使用最低对比度指南，确保每个人都能看清你的内容。
