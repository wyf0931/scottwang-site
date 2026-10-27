---
title: "Awesome Design MD CN"
description: "面向中国互联网产品的可溯源 DESIGN.md 规范与预览集合，让 coding agent 按公开产品的视觉规则生成界面。"
date: "2026-10-21"
status: "Active"
visibility: "Open Source"
stack: ["DESIGN.md", "Design Systems", "Node.js", "HTML"]
featured: true
url: "https://github-html-preview.dohyeon5626.com/?https://github.com/wyf0931/awesome-design-md-cn/blob/main/gallery.html"
repository: "https://github.com/wyf0931/awesome-design-md-cn"
---

## 机器可读的设计规范

让 coding agent 按某个产品的视觉风格做页面，通常只能靠自然语言描述。"参考阿里云百炼的风格"这类说法，agent 只能猜颜色、间距和圆角，结果常常像那么回事但不像。

`DESIGN.md` 把这件事变成可读的机器规范。Google 定义的格式在 YAML front matter 里放机器可读的设计 token，正文记录设计意图和用法。项目里放一份 `DESIGN.md`，agent 就能按确定的值构建界面。

awesome-design-md-cn 做的是中文产品的这一份规范。它整理公开可见的中文互联网产品界面，记录实测值、来源页面、采集条件和不确定项。

## 复制、引用、构建

每个品牌一个 `DESIGN.md`，遵循 Google 的标准章节顺序。Typography 一章做了中文场景的扩展，覆盖中文字体回退、断行、中英文混排和简繁语言差异。上游格式目前标记为 alpha，项目跟进其规范并用官方 linter 校验。

使用方式是把某个品牌的 `DESIGN.md` 复制进自己的项目。

```sh
cp design-md/aliyun-bailian/DESIGN.md ./DESIGN.md
```

然后告诉 agent 按这份规则的视觉要求构建页面。`DESIGN.md` 描述界面应有的视觉表现，`AGENTS.md` 描述仓库的工作方式，两者各有用途。

画廊是自包含静态页面，直接用浏览器打开 `gallery.html` 就行，不需要服务器。支持搜索、分类筛选和内嵌预览。数据源是 `design-md/index.json`，改完要重新生成。

```sh
node build.mjs
```

不要直接改 `gallery.html`，它是生成文件。

## 收录范围与授权

已经有可核实规范的收录了十多个产品，包括阿里云百炼、火山引擎 AI Hub、小米、华为、飞书、知乎、网易、稀土掘金、滴滴、商汤科技、美团、携程、微信开放平台、拼多多。百度、腾讯、阿里巴巴、大众点评、支付宝、小红书、新浪、京东、淘宝还在计划中。

在线 [Gallery](https://github-html-preview.dohyeon5626.com/?https://github.com/wyf0931/awesome-design-md-cn/blob/main/gallery.html) 能搜索、筛选和内嵌预览。

项目由社区独立维护，与 Google、所收录品牌及参考项目均无隶属关系。品牌名称与标识归各自所有者。分析依据公开页面和官方设计资料，不复制营销文案、Logo 或产品图片。

License 是 MIT。