---
title: "Docusaurus 笔记"
description: "Meta 家那个文档站点生成器，2017 年开源，到今天 6.6 万星。文章从仓库结构、Monorepo 拆分和官方插件生态写它当前的真实形态，同时说清几个常被搞混的边界。"
date: "2026-09-22"
type: "writing"
kind: "essay"
tags: ["Docusaurus", "Meta", "Documentation", "Static Site Generator", "React"]
github: "facebook/docusaurus"
draft: false
---

Meta 家那个文档站点生成器，2017 年 6 月开源到今天整整九年了。仓库现在有 6.6 万星、1 万 fork，主分支最新打的是 3.10.2，2026 年 7 月 10 号发布的。九年间没死，也没变成一堆没人维护的老代码。我把它翻了一遍，从仓库结构、Monorepo 拆分和官方插件生态聊一下它现在的真实形态。

<GithubRepoCard repo="facebook/docusaurus" />

## 从 Meta 内部工具走出来的

Docusaurus 的初衷很朴素，Meta 内部有几十个开源项目，每个都要维护一个文档站，重复造轮子的成本压不住。官方 README 里写得很直白，"We've released Docusaurus because it helps us better scale and supports the many OSS projects at Meta."

这个出发点决定了它的产品定位。Docusaurus 不追求做万能的网站生成器，它只服务一类内容，需要清晰分类、频繁检索、版本迭代的技术文档和知识库。项目本身自带 docs、blog、pages 三块，一个仓库就能把首页、文档、博客一起跑起来。你去看 React Native、Jest、React 的文档站，底层都是它。

## 仓库长什么样

打开 packages 目录，一共 39 个官方包。这个项目走的是 lerna + pnpm workspace 的 Monorepo 拆法，拆得比较彻底。核心包有几个，`@docusaurus/core` 管站点框架，`@docusaurus/theme-classic` 出默认主题，内容侧的三个 plugin 分头负责文档、博客和普通页面。

这种拆法有个直接的好处，业务方只需要引入自己用的部分。只用文档不用博客，就把 blog 相关的包卸掉；反过来只做博客也行。项目本身用 TypeScript 写，Node 版本锁在 v22。

## 官方插件已经比想象中厚

社区讨论 Docusaurus 时经常停留在"React 写的文档站生成器"这个层面，其实官方 packages 目录里已经有一批功能包，直接可用。举几个我注意到的。

`@docusaurus/theme-mermaid` 让 Mermaid 图直接在文档里渲染，不用再拉一堆前端组件。`@docusaurus/theme-live-codeblock` 提供可交互的 live code 组件，写算法教程时能直接跑代码。`@docusaurus/theme-search-algolia` 是官方唯一的搜索主题，接 Algolia DocSearch。`@docusaurus/plugin-client-redirects` 做 URL 重写，老文档跳转不再需要手动配 301。`@docusaurus/plugin-pwa` 出离线版。`@docusaurus/plugin-google-gtag` 和 `@docusaurus/plugin-vercel-analytics` 覆盖统计。`@docusaurus/remark-plugin-npm2yarn` 在文档里同时给出 npm 和 yarn 的安装命令。

再单独说一下 `@docusaurus/faster`。这个包版本号已经在 4.0.0，是官方明确标了 experimental 的加速包，用来暴露一批现代构建依赖。它存在的意义在于，Docusaurus 现在的默认构建速度还能再挤一挤，Meta 团队自己在试。

## 搜索这块的边界

写文章的时候最容易被社区文档带偏的一点是搜索。Algolia DocSearch 是官方原生的，网站公开就能申请，免费，秒级检索、拼写纠错、相关度排序，体验非常好。

但离线搜索不是官方能力。搜 "docusaurus 本地搜索"，结果里冒出来的 `docusaurus-search-local`、`instantsearch-theme` 之类，作者都是社区个人，不在 facebook/docusaurus 这个仓库里。想给内网文档站配本地搜索，可以接这些第三方插件，但要清楚它们是社区方案，不是 Meta 团队维护的，出问题没人兜底。

## 视频和音频是原生 HTML 能力

Docusaurus 用 MDX，在 Markdown 里直接写 React 组件或者原生 HTML。贴一段 `<video src="/demo.mp4" controls>` 或 `<audio src="/podcast.mp3" controls>`，浏览器就播，不需要专门插件。B 站、YouTube、网易云给的 iframe 嵌入代码也照样贴。

这块的能力其实完全来自 HTML 和 MDX，不来自 Docusaurus 自己。但正因为 Docusaurus 的 MDX 管道稳，这类嵌入不会踩坑。你写的 `<video>` 不会被当成普通文本转义掉。

## PDF 这件事要分开看

PDF 分两件事，网页里展示 PDF 和整个站点导出 PDF。

网页里展示 PDF，把文件放进 `static/`，正文写个链接让读者点，或者用 `<iframe src="/manual.pdf" width="100%" height="600px">` 让浏览器内嵌显示。这是浏览器原生能力，Docusaurus 只是把资源路径管好。

整个站点导出成一本 PDF 电子书就麻烦了。社区有 `docs-to-pdf` 这种插件，走的是 headless 浏览器打印路线，能出效果，但排版和真实打印有差距。也有走 `prince` 的方案，需要付费 license。这两类都是第三方，官方 packages 里没有对应包。真要交付客户一份 PDF 手册，我更愿意把文档站的 URL 打开放在封面，不折腾整站导出。

## 版本控制的实际样子

Docusaurus 支持版本化文档，v1.0 和 v2.0 的文档可以同时在线上共存，右上角下拉切换。这个能力对 SaaS 产品、SDK 类项目几乎是必需的。

不过实际用起来有一些坑。新版本发布要手动 tag，旧版本要么留在仓库里、要么单独走分支，`current` 之外的每个版本都会额外跑一次构建。仓库越大、版本越多，构建时间明显拉长。我见过一个内部项目维护了 5 个版本，CI 单次跑 12 分钟以上。

多语言是另一个常被一起提的能力。官方接了 Crowdin，走的是标准 i18n 目录结构。翻译质量最终取决于谁在译，工具本身只保证流程。

## 一个常被忽略的对比

同类工具里 VuePress、Nextra、VitePress 都有人用。VuePress 是 Vue 家的老前辈，功能覆盖广；Nextra 是 Vercel 的 Next.js 文档方案，和 Next.js 深度绑定；VitePress 是 Vue 家 2022 年后出的，主打构建快。

Docusaurus 的差别在于它不押宝一个前端框架的独占位置。它自己用 React，但业务方接入的时候，只需要写 Markdown 和 MDX，React 只在自己的组件层出现。文档里想插一个自研组件，写个 React 组件挂在对应插槽就行，不需要理解整个构建管道。

## 我的判断

Docusaurus 九年了还在往前走，v4 的加速包已经开始试，官方插件生态从最初的 docs + blog 扩到了搜索、Mermaid、live code、重定向、PWA、统计这些常用能力。它没有变成一个试图吃下所有场景的通用工具，仍然守着"结构化文档站点"这一件事。

对需要长期维护、有版本、有多语言需求的技术文档，它到现在仍然是最省心的选择。React Native 文档站、Jest 文档站这些标杆还挂着它，说明 Meta 内部还在真用。

对个人博客这个场景我要说清楚，Docusaurus 能做，但没必要。它的默认首页、左侧目录树、右侧大纲这些能力对单作者博客是浪费，构建时间也更长。我现在的博客站用的是 Next.js + shadcn，能覆盖的博客需求都比得上，代码也看得懂。Docusaurus 真正发光的地方是"文档产品"，不是"个人写作"。

## 参考资料

- [facebook/docusaurus GitHub 仓库](https://github.com/facebook/docusaurus)
- [Docusaurus 官方文档](https://docusaurus.io)
- [v3.10.2 发布记录](https://github.com/facebook/docusaurus/releases/tag/v3.10.2)
