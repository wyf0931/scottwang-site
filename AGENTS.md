# AGENTS.md

## Project

This is ScottWang's Markdown-first personal site. The owner is 王云飞 / ScottWang, an internet technology and AI/Agent architect. The site should feel precise, calm, technical, and premium; avoid generic SaaS styling and noisy cyberpunk decoration.

## Source of truth

- Content belongs in `content/`; do not hard-code articles into route components.
- `docs/` contains durable project knowledge, approved specs, plans, and architectural notes.
- `README.md` is the user-facing quick-start document.
- `AGENTS.md` is the agent-facing operating manual.

## Content rules

Every public content file needs `title`, `description`, `date`, `type`, `tags`, and `draft`. Supported types are `writing`, `notes`, and `thoughts`. Drafts must never appear in public routes, feeds, sitemap, or machine-readable indexes.

## Engineering rules

- Preserve static generation and Vercel compatibility.
- Keep content parsing and UI rendering separate.
- Prefer small typed modules over large route files.
- Use explicit MDX components for external media; do not add arbitrary iframe HTML.
- Keep semantic HTML, keyboard access, visible focus, readable Chinese typography, and mobile layouts intact.
- Do not introduce a database, CMS, account system, or runtime search service without updating the approved design.

## Verification

Before handoff, run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Local operations and deployment

Use `./bin/ops.sh` for repeatable local operations:

```bash
./bin/ops.sh start|stop|restart|status
```

The script owns the `.runtime/` PID/log files and must not write runtime state into source directories. `./bin/ops.sh deploy` requires `VERCEL_TOKEN`, runs the full verification chain, and then deploys production through Vercel CLI. Never commit tokens or Vercel secrets.

`.github/workflows/ci.yml` validates pull requests and pushes. `.github/workflows/deploy.yml` deploys `main` to Vercel using the `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` repository secrets.

When adding a new content type or output, update the schema, source query, route, metadata/feed behavior, docs, and tests together.
