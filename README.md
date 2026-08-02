# ScottWang Personal Site

王云飞（ScottWang）的个人站点，记录 AI、Agent 架构、技术笔记、开源项目和个人思考。

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

在 `content/writing`、`content/notes` 或 `content/thoughts` 新增 `.md` / `.mdx` 文件，使用以下 frontmatter：

```yaml
title: "标题"
description: "摘要"
date: "2026-08-02"
type: "notes"
tags: ["AI"]
draft: false
```

`draft: true` 的内容不会进入公开列表。完整建设方案和实施计划见 `docs/superpowers/`。

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
