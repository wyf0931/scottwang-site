# ScottWang Site 用户手册

这份文档记录当前个人站的实现方式、内容组织和发布流程。以后换机器、换 Agent 或者隔一段时间回来维护，先读这里。

## 项目是什么

这是一个 Markdown-first 的静态个人站。代码和内容都放在 GitHub，生产环境由 Vercel 托管。

平时写作时，只需要改 `content/` 下面的 Markdown 或 MDX 文件。构建时，Next.js 会读取这些文件，生成文章页、列表页、搜索索引、RSS、sitemap、`llms.txt` 和原始 Markdown 路由。

生产站点是

```text
https://wyf0931.cn
```

代码仓库是

```text
https://github.com/wyf0931/scottwang-site
```

## 目录怎么分

常用目录如下。

```text
content/
├── writing/   长文
├── notes/     笔记和资源
├── thoughts/  想法
├── research/  AI Agent 调研报告
└── projects/  项目介绍

docs/          项目建设过程、方案和用户手册
src/           Next.js 应用代码
scripts/       构建前生成脚本
bin/ops.sh     本地启动和一键发布入口
AGENTS.md      给 Coding Agent 的操作说明
README.md      给人看的快速说明
```

`content/` 是公开内容的源头。不要把文章写死到页面组件里。

`docs/` 放项目自身的沉淀，例如架构、发布流程、内容模型和后续维护说明。

## 内容怎么生成页面

一篇 Markdown 会经过这条链路。

```text
content/*.md
  -> src/lib/content/source.ts
  -> src/lib/content/schema.ts
  -> src/lib/content/markdown.ts
  -> src/app/[type]/[slug]/page.tsx
  -> next build
  -> Vercel
```

`source.ts` 负责读取文件，`schema.ts` 负责校验 frontmatter，`markdown.ts` 负责把 Markdown 渲染成页面内容。路由组件只负责布局和页面组合。

同一份内容会派生出多种输出。

```text
文章页面
统一内容列表
标签页
合集页
归档页
RSS
sitemap
llms.txt
search-index.json
原始 .md 路由
动态 OG 图片
```

`draft: true` 的内容不会进入公开页面、RSS、sitemap、搜索索引和机器可读路由。

## 文章 frontmatter 怎么写

普通笔记可以这样写。

```yaml
---
title: "我的新笔记"
description: "一句话说明这篇笔记写什么。"
date: "2026-08-05"
type: "notes"
kind: "note"
tags:
  - AI
  - Agent
draft: false
---
```

`type` 主要决定兼容路径。

```text
writing  -> /writing/slug
notes    -> /notes/slug
thoughts -> /thoughts/slug
```

`kind` 是统一内容分类。

```text
essay
note
thought
resource
```

资源类内容可以加这些字段。

```yaml
kind: "resource"
resourceType: "github"
resourceUrl: "https://github.com/owner/repo"
github: "owner/repo"
```

如果写了 `github: "owner/repo"`，构建时会读取一次 GitHub API，在文章正文后、评论前展示仓库卡片。网络失败时会尽量使用缓存。

## Markdown 支持什么

普通 Markdown、GFM 表格和代码块都可以直接写。

Mermaid 图表使用 fenced code block。

````md
```mermaid
flowchart LR
  A[问题] --> B[方案]
  B --> C[发布]
```
````

MDX 内容可以用受控组件嵌入外部视频。

```mdx
<YouTubeEmbed url="https://www.youtube.com/watch?v=..." />
<BilibiliEmbed url="https://www.bilibili.com/video/BV..." />
```

不要直接写任意 iframe。

## 换一台机器怎么启动

先 clone 仓库。

```bash
git clone git@github.com:wyf0931/scottwang-site.git
cd scottwang-site
npm install
```

本地开发。

```bash
npm run dev
```

打开

```text
http://localhost:3000
```

也可以用 ops 脚本托管本地服务。

```bash
./bin/ops.sh start
./bin/ops.sh status
./bin/ops.sh restart
./bin/ops.sh stop
```

默认端口是 `3000`。需要换端口时这样启动。

```bash
PORT=3100 ./bin/ops.sh start
```

## 怎么添加一篇文章

新建文件。

```text
content/notes/my-new-note.md
```

写入 frontmatter 和正文。

```md
---
title: "我的新笔记"
description: "这是一篇测试笔记。"
date: "2026-08-05"
type: "notes"
kind: "note"
tags:
  - AI
draft: false
---

正文内容。
```

本地预览没问题后发布。

```bash
./bin/ops.sh deploy "docs: add my new note"
```

## 怎么导入 Obsidian 笔记

如果平时在 Obsidian 里写笔记，可以用导入脚本把 vault 或某个子目录转成本站内容。

先做 dry run。

```bash
./bin/ops.sh import-obsidian ~/Documents/ObsidianVault --dry-run
```

确认将要生成的文件路径没问题后，再正式导入。

```bash
./bin/ops.sh import-obsidian ~/Documents/ObsidianVault --tag Obsidian
```

默认行为比较保守。

```text
导入位置       content/notes/<slug>/index.md
内容状态       draft: true
默认标签       Obsidian
图片附件       public/obsidian-assets/<slug>/
重复文件       默认跳过
```

常用参数如下。

```bash
--type notes|writing|thoughts   # 导入到哪个内容目录，默认 notes
--kind note|essay|thought|resource
--tag AI                        # 给所有导入内容追加标签，可以重复
--publish                       # 直接设置 draft: false
--overwrite                     # 覆盖已有导入文件
--dry-run                       # 只预览，不写文件
```

例如，只导入 Obsidian 里的 AI 目录，并作为公开笔记发布。

```bash
./bin/ops.sh import-obsidian ~/Documents/ObsidianVault/AI --tag AI --publish --overwrite
./bin/ops.sh deploy "content: import ai notes from obsidian"
```

导入脚本会做这些转换。

```text
[[Some Note]]                 -> [Some Note](/notes/some-note)
[[Some Note|alias]]           -> [alias](/notes/some-note)
![[image.png]]                -> ![image](/obsidian-assets/<slug>/image.png)
> [!NOTE] title               -> > **NOTE title**
```

脚本不会删除或修改原始 Obsidian 文件。第一次批量导入建议保持 draft，检查标题、摘要、图片和内部链接后，再把准备公开的文章改成 `draft: false`，最后执行发布。

## 一键发布做了什么

`./bin/ops.sh deploy "message"` 是当前推荐发布方式。它不依赖本机 Vercel token，生产部署由 GitHub Actions 触发。

脚本会按顺序执行这些动作。

```text
npm run lint
npm run typecheck
npm test
npm run build
git add -A
git commit -m "message"
git push origin 当前分支
git switch main
git pull origin main
git merge --no-ff 当前分支
git push origin main
git switch 回原分支
```

`main` 推送后，GitHub Actions 会跑 CI 和 Vercel 生产部署。部署完成后，内容会出现在 `https://wyf0931.cn`。

如果没有本地改动，脚本会跳过 commit，但仍会推当前分支并合并到 `main`。

## 生产部署需要哪些配置

GitHub Actions 需要这些仓库 secrets。

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

这些 secrets 保存在 GitHub 仓库设置里，不能写进代码。

Vercel 项目里需要站点 URL 和统计相关环境变量。

```text
NEXT_PUBLIC_SITE_URL=https://wyf0931.cn
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<your-umami-website-id>
```

Giscus 评论依赖 GitHub Discussions 和 Giscus GitHub App。仓库没有安装 Giscus 时，页面会显示对应错误。

## Agent 维护时要注意什么

后续 Coding Agent 接手时，先读 `AGENTS.md`。它是 Agent 的操作手册。

中文写作、改稿或资源介绍优先使用 `human-writing` skill。这个 skill 已安装在当前机器。换环境后如果没有，需要从下面仓库安装。

```text
https://github.com/KKKKhazix/human-writing
```

新增公开内容时，至少检查这些点。

```text
frontmatter 是否完整
draft 是否为 false
tags 是否稳定
资源类是否填写 resourceType 和 resourceUrl
GitHub 卡片是否使用 owner/repo
Markdown 表格和 Mermaid 是否能构建通过
```

新增内容类型、路由或输出时，不能只改页面。需要同步 schema、source query、route、metadata、RSS、sitemap、`llms.txt`、搜索索引、测试和文档。

## 常用命令

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e -- --workers=1
./bin/ops.sh deploy "message"
```

Playwright 在本机有时需要浏览器权限。如果沙盒启动失败，用带权限的终端或当前 Codex 的 escalated 执行方式。

## 当前边界

这个项目现在不引入数据库、CMS、账号系统或运行时搜索服务。搜索索引在构建时生成，前端按需加载。

Research 报告由外部 Deep Research Agent 生成 Markdown，站点只负责静态发布，不接入 Agent 运行时。

项目页可以记录开源、闭源或私有项目。只有明确公开的项目才填写公开仓库或 demo URL。
