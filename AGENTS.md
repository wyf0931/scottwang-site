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

When adding a new content type or output, update the schema, source query, route, metadata/feed behavior, docs, and tests together.
