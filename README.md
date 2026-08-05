# ScottWang Personal Site

王云飞（ScottWang）的个人站点，记录 AI、Agent 架构、技术内容、资源、开源项目和个人思考。

## Quick start

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

### Local operations

```bash
./bin/ops.sh start       # background dev server
./bin/ops.sh status      # PID, URL, and log location
./bin/ops.sh restart
./bin/ops.sh stop
```

Logs and the PID file are stored in `.runtime/` and are ignored by Git.

## 写作

在 `content/writing`、`content/notes` 或 `content/thoughts` 新增 `.md` / `.mdx` 文件，使用以下 frontmatter。目录和 `type` 主要用于兼容旧路径；Content 页面使用 `kind` 做统一分类：

```yaml
title: "标题"
description: "摘要"
date: "2026-08-02"
type: "notes"
kind: "note" # essay | note | thought | resource
tags: ["AI"]
series: "Agent Architecture"
draft: false
```

资源内容可以这样声明：

```yaml
kind: "resource"
resourceType: "github" # github | youtube | bilibili | course | website | upload
resourceUrl: "https://github.com/..."
```

`tags` 只表示主题，例如 `AI`、`Agent`、`Open Source`。资源正文仍然使用 Markdown，用于记录背景、评价和使用建议。

## 内容导航

- `/content`：统一浏览 Essays、Notes、Thoughts 和 Resources，可按类型或标签筛选
- `/tags`：按主题浏览标签
- `/series`：浏览连续主题合集
- `/archive`：按年份回看全部公开内容
- `/projects`：查看正在构建、探索或维护的项目
- `/research`：查看 AI Agent 辅助调研、人工审核后的研究报告

标签、合集、归档和项目页面会随 `content/` 中的 Markdown / MDX 文件自动生成。项目不默认等同于开源项目，闭源项目使用 `visibility: "Closed Source"`，不填写仓库链接即可。

Research 报告由外部 Deep Research Agent 生成 Markdown，审核后放入 `content/research/`。站点只负责静态发布，不与 Agent 运行时打通；`Draft` 和 `Review` 报告不会出现在公开页面、sitemap、RSS、`llms.txt` 或搜索索引中。

## Comments and analytics

文章和 Research 页面使用 GitHub Discussions + Giscus。生产环境已绑定仓库 `wyf0931/scottwang-site` 的 `Announcements` 分类；首次启用还需要在该仓库安装 [Giscus GitHub App](https://github.com/apps/giscus/installations/new)，否则页面会显示 `giscus is not installed on this repository`。

Umami 集成为可选项，不配置网站 ID 时不会加载任何统计脚本。配置 `NEXT_PUBLIC_UMAMI_SCRIPT_URL` 与 `NEXT_PUBLIC_UMAMI_WEBSITE_ID` 后重新部署即可启用。

`draft: true` 的内容不会进入公开列表。完整建设方案和实施计划见 `docs/superpowers/`。

`.mdx` 内容可以使用受控组件：

```mdx
<Callout tone="success">这是一条提示。</Callout>
<YouTubeEmbed url="https://www.youtube.com/watch?v=..." />
<BilibiliEmbed url="https://www.bilibili.com/video/BV..." />
```

外部视频只允许通过这些组件嵌入，不要直接写任意 iframe。

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Project map

- `content/`: Markdown/MDX source of truth
- `src/lib/content/`: parsing, validation, and rendering
- `src/app/`: routes and page composition
- `src/components/`: reusable visual components
- `docs/`: decisions, specifications, plans, and research
- `AGENTS.md`: instructions for Coding Agents

## Deployment

GitHub is the source repository and Vercel is the target deployment platform. Set `NEXT_PUBLIC_SITE_URL` to the production URL in Vercel. Production builds are static and can also be exported to `out/`.

For a local one-command production deploy, authenticate with Vercel and export a token:

```bash
export VERCEL_TOKEN="..."
./bin/ops.sh deploy
```

`deploy` runs lint, typecheck, tests, and a production build before invoking Vercel CLI. If the project is scoped to a Vercel team, also export `VERCEL_SCOPE`.

GitHub Actions deploys `main` automatically. Add these repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`. PRs run the verification workflow; production deployment runs only after changes reach `main`.

## Machine-readable routes

The site exposes `/about.md`, article `.md` routes, `/llms.txt`, `/robots.txt`, `/sitemap.xml`, and `/rss.xml` so search engines and coding agents can retrieve the site with low noise.
