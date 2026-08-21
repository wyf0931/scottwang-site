# AGENTS.md

## Project

This is ScottWang's Markdown-first personal site. Keep it precise, calm, technical, and premium. Avoid generic SaaS styling and noisy cyberpunk decoration.

## Source of truth

- `content/` is the source of published content. Do not hard-code articles in route components.
- `src/lib/content/` owns parsing, validation, and content queries; `src/app/` owns routes; `src/components/` owns reusable UI.
- `docs/` stores durable decisions, specifications, plans, and operating notes.
- `README.md` is the user-facing quick start. This file is the agent-facing operating guide.

## Content rules

- Article content lives in `content/writing`, `content/notes`, or `content/thoughts` as `.md` or `.mdx`. These legacy directories also define the compatible public routes.
- Public articles require `title`, `description`, `date`, `type`, `tags`, and `draft`. `kind` is the presentation taxonomy: `essay`, `note`, `thought`, or `resource`. Existing types map to kinds as `writing → essay`, `notes → note`, and `thoughts → thought`.
- Resources may use `resourceType` (`github`, `youtube`, `bilibili`, `course`, `website`, or `upload`) and `resourceUrl`.
- Drafts must stay out of public routes, feeds, sitemap, `llms.txt`, and search indexes.
- Use concise, stable `tags` and optional `series` values because they become public URLs.
- Projects live in `content/projects/*.md`; research reports live in `content/research/*.md`. Only published research reports enter public outputs.
- Books live in `content/books/*.md` and are parsed by `src/lib/content/books.ts`; published books appear on `/books` and in the relevant machine-readable outputs.
- Chinese writing, rewriting, or substantial editing must use the installed `human-writing` skill before drafting. Keep the result factual, material-led, and free of generic model prose.

## Supported content features

- Use `Callout`, `YouTubeEmbed`, and `BilibiliEmbed` for MDX media. Do not add arbitrary iframe or script embeds.
- GFM tables are supported. Mermaid diagrams use fenced `mermaid` blocks and the controlled `MermaidDiagram` component.
- A content file may declare `github: "owner/repo"` for compatibility and metadata caching. Do not rely on it for placement. GitHub project cards are explicitly inserted in MDX with `<GithubRepoCard repo="owner/repo" />`; the card may appear anywhere in the article body.
- GitHub project notes are written for architecture and technology selection. Cover the business or engineering problem, the solution path, core flow, technical trade-offs, alternatives, selection boundaries, and a minimal validation example as the material allows. Do not turn them into README summaries or generic feature lists.
- After drafting a GitHub project article, use the `human-writing` skill to review facts, source boundaries, paragraph progression, Chinese rhythm, and AI-like phrasing before publishing.
- Comments use optional Giscus/GitHub Discussions. Umami tracking is optional and must not load without `NEXT_PUBLIC_UMAMI_WEBSITE_ID`; the footer statistics also require a public Umami share ID and stay hidden otherwise.

## Engineering guardrails

- Preserve static generation and Vercel compatibility. Do not introduce a database, CMS, account system, or runtime search service without an approved design update.
- Keep content parsing separate from rendering. Prefer small typed modules over large route files.
- Preserve semantic HTML, keyboard access, visible focus, readable Chinese typography, and mobile layouts.
- When adding a content type or output, update its schema, query, route, metadata/feed behavior, docs, and tests together.
- For the GitHub project card and article framework, follow `docs/superpowers/specs/2026-08-16-github-project-embeds-and-selection-notes-design.md`.
- Generated public Markdown, GitHub metadata, and OG images are build artifacts. They are produced by the `predev`/`prebuild` scripts and must not become a second content source of truth.

## Branch and worktree workflow

- `main` must remain deployable. At the start and end of every task, inspect `git worktree list`, `git branch -vv`, and `git status --short --branch`. Resolve leftover changes promptly and do not let uncommitted files accumulate across tasks.
- The repository has two maintenance tracks. The blog application and code use a dedicated worktree from `main`, with `feat/...`, `fix/...`, or `docs/...` branches. Code and configuration changes land through a reviewed pull request.
- Content-only changes use a `content/...` branch in the current worktree. Do not create a separate worktree for content work unless parallel work makes it necessary. Content work is normally single-threaded.
- Do not mix application or configuration changes into a `content/...` branch. If the task crosses that boundary, move the code/config changes to a `feat/...`, `fix/...`, or `docs/...` branch and follow the application track.

## Content publishing contract

This is the fast, standard workflow for content agents. It applies to Codex, Pi, Claude Code, Hermes Agent, and other collaborators.

0. From a clean `main`, create the branch with `git switch -c content/<slug>`. Check `git status --short --branch` before writing.
1. Research the topic according to the request. Search Wikipedia, Hacker News, Reddit, Stack Overflow, relevant blogs, and primary sources where appropriate. Record only the material needed to support the article's facts, definitions, examples, and boundaries. Do not treat forum comments as authoritative definitions.
2. Draft the article in the correct `content/writing`, `content/notes`, or `content/thoughts` location. Unless the user specifies otherwise, use a concept-explanation style for architecture, engineering, and industry terms. The default audience is architects, programmers, experienced developers, internet practitioners, and technically curious general readers. Choose a structure that fits the material, such as Golden Circle, total-summary-total, progressive explanation, or 5W1H for news. Follow the content schema and keep drafts out of public outputs.
3. Use the `human-writing` skill to review the draft for factual boundaries, source use, paragraph progression, Chinese rhythm, and AI-like phrasing. Fix the review findings before publishing.
4. Verify the content with `git diff --check` and the applicable content/build checks. Commit the content branch, merge it locally into `main`, and push `main` to `origin`. GitHub Actions deploys production from `main`. Delete the merged local `content/...` branch when the worktree is clean.

For the current task, content agents should complete this flow in one continuous pass. Do not leave a content branch waiting for a later handoff, do not push an unreviewed branch as a substitute for publishing, and do not use the application worktree/PR process for ordinary content-only work.

Example:

```bash
git worktree add -b docs/<slug> ../scottwang-docs-<slug> main
```

## Verification and operations

For code or configuration changes, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

For browser coverage, run `npm run test:e2e` when the change affects routes, interaction, responsive layout, or rendered content. `npm run build` first generates public Markdown, GitHub card metadata, and OG images.
Use `./bin/ops.sh` for local server control, Obsidian imports, and the verified publishing flow:

```bash
./bin/ops.sh start|stop|restart|status
./bin/ops.sh import-obsidian <vault-or-folder> --dry-run
./bin/ops.sh deploy "docs: update note"
```

Equivalent package-script entry points are `npm run import:obsidian` for direct importer use and `npm run test:e2e` for Playwright browser tests. `bin/ops.sh deploy` runs the verification chain, commits and pushes the current branch, then merges and pushes `main`; use it for the content publishing contract after reviewing the resulting commit. For application changes, use the pull-request flow instead.
The script keeps PID and log files in `.runtime/`. Never commit tokens or Vercel secrets. GitHub Actions runs CI and deploys `main` to Vercel with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
