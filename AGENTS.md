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
- Comments use optional Giscus/GitHub Discussions. Umami is optional and must not load without `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.

## Engineering guardrails

- Preserve static generation and Vercel compatibility. Do not introduce a database, CMS, account system, or runtime search service without an approved design update.
- Keep content parsing separate from rendering. Prefer small typed modules over large route files.
- Preserve semantic HTML, keyboard access, visible focus, readable Chinese typography, and mobile layouts.
- When adding a content type or output, update its schema, query, route, metadata/feed behavior, docs, and tests together.
- For the GitHub project card and article framework, follow `docs/superpowers/specs/2026-08-16-github-project-embeds-and-selection-notes-design.md`.
- Generated public Markdown, GitHub metadata, and OG images are build artifacts. They are produced by the `predev`/`prebuild` scripts and must not become a second content source of truth.

## Branch and worktree workflow

- Keep `main` deployable and pristine. Make changes on a dedicated `feat/...`, `fix/...`, `docs/...`, or `content/...` branch in a worktree created from `main`.
- Use `content/...` only for editorial changes that do not touch code or configuration. Use `feat/...`, `fix/...`, or `docs/...` for framework, config, and documentation changes.
- Run the applicable verification before handoff. Land changes through a pull request or `./bin/ops.sh deploy`, never by committing directly to `main`.

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

Equivalent package-script entry points are `npm run import:obsidian` for direct importer use and `npm run test:e2e` for Playwright browser tests. `bin/ops.sh deploy` runs the verification chain, commits and pushes the current branch, then merges and pushes `main`; use a dedicated branch or worktree and review the resulting commit before invoking it.

The script keeps PID and log files in `.runtime/`. Never commit tokens or Vercel secrets. GitHub Actions runs CI and deploys `main` to Vercel with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
