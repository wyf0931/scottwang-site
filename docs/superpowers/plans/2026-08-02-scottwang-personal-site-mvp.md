# ScottWang Personal Site MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a distinctive Markdown-first personal site for ScottWang with Home, Writing, Notes, Thoughts, About, media embeds, agent-readable Markdown routes, and production-grade SEO/GEO foundations.

**Architecture:** Use Next.js App Router with TypeScript and statically generated local Markdown/MDX content. Keep content discovery, frontmatter validation, rendering, metadata, and machine-readable outputs behind small typed modules so the visual layer can evolve independently. Deploy from GitHub to Vercel, with GitHub Actions validating content and the production build.

**Tech Stack:** Next.js, React, TypeScript, MDX, Zod, Tailwind CSS, Shiki or rehype-pretty-code, Vitest, Playwright, GitHub Actions, Vercel.

---

## Repository documentation contract

- `README.md`: quick start, local development, content authoring, commands, deployment, and project map for ScottWang.
- `AGENTS.md`: instructions for coding agents: architecture, safe edit boundaries, content schema, validation commands, design principles, and handoff rules.
- `docs/`: durable project knowledge. `docs/superpowers/specs/` stores approved designs; `docs/superpowers/plans/` stores implementation plans; later decisions and research go in focused files under `docs/architecture/` and `docs/research/`.

## File map

### Foundation and content

- `package.json`: scripts and runtime/dev dependencies.
- `next.config.ts`: static export-compatible Next configuration.
- `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`: project tooling.
- `src/lib/content/schema.ts`: Zod frontmatter schema and content types.
- `src/lib/content/source.ts`: filesystem discovery, parsing, draft filtering, sorting, and lookups.
- `src/lib/content/markdown.ts`: Markdown/MDX rendering configuration and plain-text extraction.
- `src/lib/content/paths.ts`: canonical content and Markdown endpoint path generation.
- `content/writing/*`, `content/notes/*`, `content/thoughts/*`: published and draft examples.

### UI and routes

- `src/app/layout.tsx`: site-wide metadata, fonts, global shell, and JSON-LD Person data.
- `src/app/page.tsx`: homepage composition.
- `src/app/writing/page.tsx`, `src/app/notes/page.tsx`, `src/app/thoughts/page.tsx`: collection pages.
- `src/app/[type]/[slug]/page.tsx`: article pages with static params and Article JSON-LD.
- `src/app/about/page.tsx`: personal profile and contact content.
- `src/app/[type]/[slug].md/route.ts`, `src/app/about.md/route.ts`: raw Markdown routes.
- `src/components/site/*`: navigation, footer, page shell, responsive primitives.
- `src/components/content/*`: cards, article layout, code blocks, TOC, media embeds, callouts.
- `src/styles/tokens.css`, `src/app/globals.css`: owned design tokens and global styles.

### SEO, feeds, and verification

- `src/app/robots.ts`, `src/app/sitemap.ts`: generated crawler metadata.
- `src/app/opengraph-image.tsx`: shared default OG image; article-specific images can follow in P1.
- `src/app/rss.xml/route.ts`: RSS feed.
- `src/app/llms.txt/route.ts`: concise site map and retrieval guide.
- `public/favicon.svg`, `public/site.webmanifest`: identity assets.
- `tests/content.test.ts`, `tests/routes.test.ts`, `tests/metadata.test.ts`: contract tests.
- `tests/e2e/site.spec.ts`: browser smoke tests.

### Operations

- `.github/workflows/ci.yml`: install, lint, typecheck, test, build, and link validation.
- `README.md`, `AGENTS.md`: project usage and agent handoff documentation.
- `docs/architecture/content-pipeline.md`: post-implementation architecture record.

## Task 1: Create the project foundation and documentation contract

**Files:**

- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `next-env.d.ts`
- Create: `eslint.config.mjs`, `vitest.config.ts`, `.gitignore`
- Create: `README.md`, `AGENTS.md`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/styles/tokens.css`
- Create: `public/favicon.svg`, `public/site.webmanifest`
- Test: `tests/smoke.test.ts`

- [ ] **Step 1: Add package scripts and dependencies**

Use scripts named `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, and `test:e2e`. Pin the initial framework versions with the package manager lockfile. Include Next.js, React, TypeScript, Zod, gray-matter, unified/remark/rehype packages, Shiki, Vitest, Testing Library, and Playwright.

- [ ] **Step 2: Add static-export-safe configuration**

Configure `next.config.ts` with `output: "export"`, `trailingSlash: true`, and `images: { unoptimized: true }`. Keep all P0 routes statically renderable and do not add server-only runtime dependencies.

- [ ] **Step 3: Add the documentation contract**

Document the commands, content directory layout, frontmatter example, route map, deployment assumptions, and how to add a new article in `README.md`. In `AGENTS.md`, state that content is the source of truth, drafts must stay out of production, UI changes must preserve semantic HTML and mobile behavior, and agents must run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before handoff.

- [ ] **Step 4: Add the global design baseline**

Define CSS variables for background, surface, text, muted text, border, accent, code background, content width, and spacing. Use a near-black background, cool neutral text, and one restrained electric accent. Add accessible focus styles, reduced-motion support, and readable Chinese typography.

- [ ] **Step 5: Verify the empty shell**

Run:

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands pass and `out/` is generated.

- [ ] **Step 6: Commit foundation**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json next-env.d.ts eslint.config.mjs vitest.config.ts .gitignore README.md AGENTS.md src public tests
git commit -m "chore: scaffold personal site foundation"
```

## Task 2: Implement the Markdown/MDX content pipeline

**Files:**

- Create: `src/lib/content/schema.ts`, `src/lib/content/source.ts`, `src/lib/content/markdown.ts`, `src/lib/content/paths.ts`
- Create: `content/writing/building-agent-systems/index.mdx`
- Create: `content/notes/nextjs-mdx-patterns.md`
- Create: `content/thoughts/why-build-in-public.md`
- Create: `content/thoughts/draft-example.md`
- Create: `tests/content.test.ts`

- [ ] **Step 1: Define the frontmatter schema**

Use a Zod schema with required `title`, `description`, `date`, `type`, `tags`, and `draft`; optional `updated`, `series`, `featured`, `cover`, and `canonical`. Restrict `type` to `writing | notes | thoughts`; parse ISO dates; reject unknown content types and missing required fields with the source file path in the error.

- [ ] **Step 2: Implement deterministic discovery and filtering**

Read `.md` and `.mdx` files under `content/<type>`. Support both a flat file and a directory containing `index.md`/`index.mdx`. Return records sorted by `date` descending, then `title` ascending. Expose `getAllContent()`, `getContentByType(type)`, and `getContentBySlug(type, slug)`. Filter `draft: true` from production-facing queries.

- [ ] **Step 3: Implement rendering and plain-text extraction**

Configure remark/rehype for GFM, heading IDs, safe HTML handling, and syntax highlighting. Return rendered content plus a plain-text representation used by reading time, RSS, llms, and future search. Keep media and callouts as explicit component nodes rather than allowing unrestricted iframe HTML.

- [ ] **Step 4: Add representative content**

Use short real examples aligned with ScottWang's domain: Agent architecture, Markdown publishing, and a personal thought. Keep the draft example in the repository to prove production filtering.

- [ ] **Step 5: Write and run content contract tests**

Test valid parsing, invalid frontmatter, type filtering, date ordering, slug lookup, draft exclusion, and plain-text extraction. Run:

```bash
npm test -- tests/content.test.ts
```

Expected: PASS, including an assertion that `draft-example` is absent from public content queries.

- [ ] **Step 6: Commit the content pipeline**

```bash
git add src/lib/content content tests/content.test.ts
git commit -m "feat: add typed markdown content pipeline"
```

## Task 3: Build the visual shell and homepage

**Files:**

- Create: `src/components/site/Header.tsx`, `Footer.tsx`, `PageShell.tsx`, `SectionHeading.tsx`
- Create: `src/components/content/ContentCard.tsx`, `FeaturedContent.tsx`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `tests/e2e/site.spec.ts`

- [ ] **Step 1: Implement the responsive shell**

Build a keyboard-accessible header with the five primary links, a compact mobile menu, a persistent brand mark using `ScottWang`, and a footer containing values, email, RSS, and configured social links. Use semantic `header`, `nav`, `main`, and `footer` landmarks.

- [ ] **Step 2: Implement the homepage composition**

Create a hero that states "ScottWang", current focus on AI and Agent architecture, and the values "共赢 · 专注 · 精进". Add featured content, latest Writing/Notes/Thoughts entries, and a restrained system-like visual motif such as grid lines or signal markers. Avoid decorative noise and avoid making the hero depend on client-side JavaScript.

- [ ] **Step 3: Add responsive and accessibility behavior**

Ensure content remains readable at 320px width, interactive controls have visible focus, color contrast is sufficient, images have alt text, and `prefers-reduced-motion` disables nonessential transitions.

- [ ] **Step 4: Add browser smoke coverage**

In `tests/e2e/site.spec.ts`, open `/`, assert the brand name and five nav labels, assert at least one content card, and verify the mobile navigation can expose the same links. Run `npx playwright test tests/e2e/site.spec.ts` after starting the dev server.

- [ ] **Step 5: Commit the shell**

```bash
git add src/app src/components src/styles tests/e2e/site.spec.ts
git commit -m "feat: add personal site shell and homepage"
```

## Task 4: Add collection pages and article rendering

**Files:**

- Create: `src/app/writing/page.tsx`, `src/app/notes/page.tsx`, `src/app/thoughts/page.tsx`
- Create: `src/app/[type]/[slug]/page.tsx`
- Create: `src/components/content/ArticleLayout.tsx`, `MarkdownContent.tsx`, `TableOfContents.tsx`, `CodeBlock.tsx`, `Callout.tsx`
- Create: `src/components/content/VideoEmbed.tsx`
- Modify: `src/lib/content/markdown.ts`
- Test: `tests/routes.test.ts`, `tests/e2e/article.spec.ts`

- [ ] **Step 1: Implement collection lists**

Render each content type with title, description, date, tags, reading time, and a stable link. Show featured items only where explicitly marked. Do not add tags or series filtering UI until P1.

- [ ] **Step 2: Implement static article params and layout**

Generate static params from public content. Render breadcrumb/type, title, metadata, body, TOC, and previous/next links. Use `notFound()` for unknown type or slug. Keep the article HTML semantic and copyable.

- [ ] **Step 3: Implement explicit media components**

Accept only YouTube and Bilibili URL patterns, derive the provider embed URL, render a responsive iframe with a descriptive title, and reject unsupported hosts. Local images must use alt text and optional caption.

- [ ] **Step 4: Add article tests**

Test that each sample content type has a list and detail route, draft content is not routable, unsupported media URLs are rejected, and the article includes a heading and metadata. Run:

```bash
npm test -- tests/routes.test.ts
```

- [ ] **Step 5: Commit content presentation**

```bash
git add src/app src/components/content src/lib/content/markdown.ts tests/routes.test.ts tests/e2e/article.spec.ts
git commit -m "feat: render markdown collections and articles"
```

## Task 5: Add About, SEO, GEO, feeds, and Markdown endpoints

**Files:**

- Create: `src/app/about/page.tsx`, `src/app/about.md/route.ts`
- Create: `src/app/[type]/[slug].md/route.ts`
- Create: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/rss.xml/route.ts`, `src/app/llms.txt/route.ts`
- Create: `src/lib/seo/structured-data.ts`, `src/lib/seo/site.ts`
- Create: `src/app/opengraph-image.tsx`
- Modify: `src/app/layout.tsx`, `src/lib/content/paths.ts`
- Test: `tests/metadata.test.ts`

- [ ] **Step 1: Centralize site identity and URL configuration**

Use environment variable `NEXT_PUBLIC_SITE_URL` with a documented local default for development. Define site name, author, description, navigation, and social metadata in `src/lib/seo/site.ts` so routes do not duplicate strings.

- [ ] **Step 2: Implement About content**

Show the identity, former internet mobility architecture background, current AI focus, values, email link, and a visual WeChat contact block whose asset path is configurable. Do not place the raw WeChat ID in visible page text.

- [ ] **Step 3: Implement metadata and JSON-LD**

Add global Person/WebSite metadata and per-article Article/BreadcrumbList metadata. Include canonical URLs and Open Graph/Twitter fields. Provide a default dark branded OG image.

- [ ] **Step 4: Implement machine-readable outputs**

Return the exact Markdown source for public content and About. Generate RSS, sitemap, robots, and llms.txt from the same public content query. Exclude drafts everywhere. `llms.txt` must identify ScottWang, site sections, canonical Markdown routes, and the fact that Markdown endpoints are authoritative content sources.

- [ ] **Step 5: Test metadata and endpoints**

Assert that a published article has title, description, canonical, and Article JSON-LD; a draft is absent from sitemap/RSS/llms; and `.md` endpoints return `text/markdown` with the expected title and source content.

- [ ] **Step 6: Commit discoverability**

```bash
git add src/app src/lib/seo src/lib/content/paths.ts tests/metadata.test.ts
git commit -m "feat: add seo agent outputs and markdown routes"
```

## Task 6: Add CI, deployment documentation, and release validation

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `docs/architecture/content-pipeline.md`
- Modify: `README.md`, `AGENTS.md`
- Test: full local verification suite

- [ ] **Step 1: Add the GitHub Actions workflow**

Run on pushes and pull requests to `main`: checkout, setup Node using the lockfile package manager, install with frozen lockfile, then run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Keep Vercel deployment configured through the GitHub integration rather than storing deployment secrets in the repository.

- [ ] **Step 2: Add content-pipeline documentation**

Document discovery, frontmatter validation, draft behavior, route generation, Markdown endpoints, and the boundary between content modules and UI components. Record the decision to keep search out of P0 and to use a lightweight static Chinese-tokenized index in P1.

- [ ] **Step 3: Update README and AGENTS handoff sections**

Add the exact CI commands, branch conventions, worktree guidance, file ownership boundaries, and release checklist. Explain that any new content type requires schema, route, list, metadata, feed, Markdown endpoint, and test updates.

- [ ] **Step 4: Run the release checklist**

```bash
npm run lint
npm run typecheck
npm test
npm run build
git status --short
```

Expected: all checks pass, the working tree is clean after commit, and `out/` contains the static site.

- [ ] **Step 5: Commit operations documentation**

```bash
git add .github/workflows/ci.yml docs/architecture/content-pipeline.md README.md AGENTS.md
git commit -m "ci: add validation workflow and contributor docs"
```

## P1 follow-up plan: lightweight Chinese search

This is intentionally separate from the launch gate. After the P0 site is deployed:

1. Add `@orama/orama` and `@orama/tokenizers`.
2. Build a public-content index containing title, description, plain text, type, tags, date, and URL.
3. Configure the Mandarin tokenizer and serialize the index into static build output.
4. Lazy-load the index from a global search dialog.
5. Add Chinese, mixed-language, draft exclusion, mobile, and index-failure tests.
6. Measure index size and first-query latency before adding filters or more fields.

## Plan self-review

- Spec coverage: P0 identity, navigation, content collections, Markdown/MDX, responsive UI, media embeds, About, SEO/GEO, Markdown endpoints, RSS, robots, sitemap, llms.txt, GitHub/Vercel workflow, documentation, and tests are covered by Tasks 1–6.
- P1 search is explicitly deferred and has its own bounded follow-up section with Chinese tokenization and static delivery.
- No incomplete steps, unresolved items, or undefined public functions are used in the plan.
- Content types and frontmatter names are consistent across schema, routes, tests, metadata, feeds, and documentation.
- The plan keeps database, accounts, CMS, comments, semantic search, and other P2 features outside the MVP.
