---
title: "frontend-slides：把演示稿做成一张会动的网页"
description: "介绍 zarazhangrui/frontend-slides 的设计思路、工作流程和适用边界。"
date: "2026-09-13"
type: "notes"
kind: "resource"
resourceType: "github"
resourceUrl: "https://github.com/zarazhangrui/frontend-slides"
github: "zarazhangrui/frontend-slides"
tags:
  - Skill
  - 演示文稿
  - HTML
  - AI Agent
draft: false
---

很多人让 Agent 做幻灯片时，拿到的是一堆排版整齐的文字。它们能打开，却很难留下印象。`frontend-slides` 试着把问题换个方向处理，把演示稿当成一个固定画布上的网页来设计。

这个项目来自 [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides)，采用 MIT 协议。它的核心产物是一份可以直接在浏览器里运行的 HTML 文件，样式和交互都写在文件内部，不需要 React、构建工具或运行时服务。

## 先让人看到风格

项目把视觉选择放在完整生成之前。Agent 先根据用途、听众、篇幅和内容密度，生成三个真实的标题页预览。用户看过之后选择一个方向，或者混合其中的元素，再进入整套演示稿的制作。

这一步很实用。大多数人说不清自己要什么样的字体和配色，却能很快判断哪张标题页更接近自己的场合。项目附带一组安全的风格预设，也附带一个包含三十四套设计系统的模板包。模板索引先提供氛围、正式程度、内容密度和适用场景，用户选定之后才读取对应的完整设计说明，避免把所有模板一次塞进 Agent 的上下文。

## 用固定舞台承载内容

每一页都在 1920×1080 的舞台上编写，浏览器窗口只是负责把整块舞台等比例缩放。手机端不会重新排列卡片，窄屏只会出现留白或黑边。这样做牺牲了一点网页的响应式灵活性，却换来了演示文稿需要的稳定坐标。

切页由内置的 `SlidePresentation` 控制器处理。它支持方向键、空格、Page Up 和 Page Down，也支持滚轮与触摸滑动。页面切换依靠 `active` 和 `visible` 类控制可见性，动画则使用 CSS 的透明度、位移和延迟。项目还要求提供 `prefers-reduced-motion` 支持，并默认加入浏览器内编辑和 localStorage 保存。

## 生成过程仍然靠 Agent

`frontend-slides` 本身没有图表引擎、SmartArt 组件库或自动排版算法。它提供的是一套写作顺序、设计规则和 HTML 参考结构。Agent 需要先理解材料，再把内容拆成标题页、章节页、数据页、流程页、引用页和收束页，随后用 HTML 元素和 CSS 类把这些页面逐一写出来。

如果选择模板包里的设计系统，Agent 会读取那一套字体、颜色、间距、装饰图形和组件语法，再把它翻译成固定舞台上的坐标。模板决定视觉语言，实际的内容仍然需要重新组织，项目明确要求不要照搬示例页里的文字。

## PPT 转换和交付

项目提供 `extract-pptx.py`，可以提取 PPTX 中的文字、图片和演讲者备注，生成 JSON 和图片资源。之后仍然要经过风格选择和 HTML 重建。导出 PDF 时，脚本会启动本地服务，用 Playwright 按页截图，再合并成 PDF。需要分享时，`deploy.sh` 可以把单个 HTML 或包含资源的目录部署到 Vercel。

这套流程适合网页演讲、产品介绍、设计提案和个人分享。它保留了浏览器里的动画和交互，也方便把结果放到一个链接里。PPT 转换得到的是新的 HTML 表达，PowerPoint 里的原生图表、SmartArt、母版和可视化编辑能力不会原样保留。需要多人继续在 Office 里修改时，仍然应该把 HTML 当成一种发布格式来用。

## 值得记住的边界

这个项目最有价值的地方，是把视觉决策、固定画布和生成后的检查写成了 Agent 能执行的步骤。它能明显改善一份网页演示稿的第一版质量，尤其适合没有专职设计师、又希望摆脱普通模板的人。

它没有替你完成资料研究、事实核验、数据建模和逐页内容审稿。面对研究报告、财务材料或高密度管理层汇报，仍要先建立可靠的大纲和数据来源，再让它负责视觉呈现。把它看成一套网页演示工作流，使用起来会比把它当成自动做 PPT 的按钮更准确。

## 项目资料

- [frontend-slides GitHub 仓库](https://github.com/zarazhangrui/frontend-slides)
- [Frontend Slides Skill 页面](https://www.skills.sh/zarazhangrui/frontend-slides/frontend-slides)

<GithubRepoCard repo="zarazhangrui/frontend-slides" />
