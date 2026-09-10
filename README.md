# ScottWang Personal Site

ScottWang 的 Markdown-first 个人站点，记录 AI、Agent 架构、技术内容、资源、开源项目和个人思考。

## Quick start

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

常用本地操作由 `bin/ops.sh` 统一管理：

```bash
./bin/ops.sh start
./bin/ops.sh status
./bin/ops.sh restart
./bin/ops.sh stop
```

后台进程、PID 和日志放在被 Git 忽略的 `.runtime/` 目录。

## 写作

文章放在 `content/writing`、`content/notes` 或 `content/thoughts`，支持 `.md` 和 `.mdx`。目录与 `type` 保留旧链接兼容，`kind` 用于统一展示分类。

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

资源可补充：

```yaml
resourceType: "github" # github | youtube | bilibili | course | website | upload
resourceUrl: "https://github.com/..."
```

### 合集标题

`series` 是合集的分组键。文章的 URL 和合集页标题都在 `content/series/` 里单独登记，下面是一个完整文件 `content/series/agent-architecture.md`：

```yaml
series: "Agent Architecture"   # 分组键，必须与文章 frontmatter 里的 series 值一致
slug: "agent-architecture"     # 决定 /series/<slug>/，省略时直接用 series 的值
title: "Agent 架构"
description: "多 agent 系统的协作模式、运行循环与职责划分。"
```

改标题只改 `title`，不要改 `series` 或 `slug`，否则会换掉已经发布的链接。`slug` 必须是小写 kebab-case；`series` 含空格或中文时必须显式写 `slug`。用了 `series` 却没登记合集，构建会直接报错并指出是哪些文章。

正文仍使用 Markdown，用于记录背景、判断和使用建议。`draft: true` 的内容不会出现在公开页面、RSS、sitemap、`llms.txt` 或搜索索引中。

支持的 MDX 组件包括 `Callout`、`YouTubeEmbed`、`BilibiliEmbed` 和 `GithubRepoCard`。外部视频不要直接写 iframe。GitHub 卡片可以放在正文任意位置：

```mdx
<GithubRepoCard repo="owner/repo" />
```

Markdown 支持 GFM 表格和 Mermaid 图表。

### 从 Obsidian 导入

先预览，再检查生成内容：

```bash
./bin/ops.sh import-obsidian ~/Documents/ObsidianVault --dry-run
./bin/ops.sh import-obsidian ~/Documents/ObsidianVault --tag Obsidian
```

默认写入 `content/notes/<slug>/index.md` 并保持为草稿。确认无误后再使用 `--publish --overwrite`。导入器会处理基础 wikilink、callout 和本地图片附件，图片复制到 `public/obsidian-assets/<slug>/`。

项目放在 `content/projects/*.md`，研究报告放在 `content/research/`。研究报告由外部 Agent 生成，人工审核后才发布；站点本身不连接 Agent 运行时。

## 内容导航

- `/content`：统一浏览文章和资源
- `/writing`、`/notes`、`/thoughts`：按旧类型筛选的兼容视图
- `/tags`、`/series`、`/archive`：标签、合集和归档
- `/projects`、`/research`、`/resources`：项目、研究报告、站点收藏（Sites）

## 开发与发布

提交前运行完整检查：

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

项目分为应用代码和内容两条维护轨道。代码、配置和文档使用从 `main` 创建的独立 worktree，分支命名为 `feat/...`、`fix/...` 或 `docs/...`，通过 Pull Request 合并。纯内容变更使用 `content/...` 分支，不额外创建 worktree，完成资料检索、写作审查和验证后直接本地合并到 `main` 并推送。

```bash
./bin/ops.sh deploy "docs: update note"
```

`deploy` 会执行检查、提交当前改动、推送当前分支、合并到 `main` 并推送，适合内容发布流程。代码和配置变更仍通过 Pull Request 合并。不要提交 Token 或 Vercel secrets。

生产环境使用 Vercel，仓库需要 `VERCEL_TOKEN`、`VERCEL_ORG_ID` 和 `VERCEL_PROJECT_ID`。部署时只上传源码，由 Vercel 在自己的构建机上执行构建，站点地址由部署命令里的 `--build-env NEXT_PUBLIC_SITE_URL` 注入。

## 项目结构

- `content/`：Markdown/MDX 内容源
- `src/lib/content/`：解析、校验和查询
- `src/app/`：路由和页面组合
- `src/components/`：可复用组件
- `docs/`：架构、决策、规格和操作说明
- `AGENTS.md`：Coding Agent 工作规范

需要更完整的内容格式、导入和运维说明时，阅读 [docs/user-manual.md](docs/user-manual.md)；部署细节见 [docs/architecture/operations.md](docs/architecture/operations.md)。

## 可机器读取的输出

站点提供 `/about.md`、文章 `.md` 路由、`/llms.txt`、`/robots.txt`、`/sitemap.xml` 和 `/rss.xml`，方便搜索引擎与 Coding Agent 读取公开内容。
