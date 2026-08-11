# ScottWang Personal Site Design

## 1. Product direction

This project is a personal technology and AI site for Wang Yunfei (ScottWang), an internet technology and AI/Agent architect. It is broader than a blog: it combines a personal homepage, long-form writing, technical notes, short thoughts, and selected projects.

The first release optimizes for two outcomes:

1. Make a strong first impression through a distinctive, high-quality technology-oriented visual identity.
2. Make Markdown-based publishing fast and durable for the owner and coding agents.

The first release is not a community platform or a private knowledge-management system. It is a public, content-first personal site with a clear path to evolve.

## 2. Audience and brand baseline

Primary audiences:

- Engineers, architects, AI practitioners, and open-source builders.
- People evaluating ScottWang's thinking, experience, and current focus.
- Search engines and AI agents that need clean, structured site information.

Brand attributes:

- Technology-forward, precise, calm, and exploratory.
- Geek atmosphere without visual noise or ornamental cyberpunk effects.
- Values: 共赢 / Win together, 专注 / Focus, 精进 / Improve.

Public identity:

- English name: ScottWang
- Background: former architect at an internet mobility company; currently focused full-time on AI.
- Public email: wyf0931@gmail.com, shown on About.
- WeChat: displayed on About as a QR/visual contact method, not exposed as plain text by default.

## 3. Information architecture

Primary navigation:

`Home / Writing / Notes / Thoughts / About`

Initial routes:

- `/`
- `/writing` and `/writing/[slug]`
- `/notes` and `/notes/[slug]`
- `/thoughts` and `/thoughts/[slug]`
- `/about`

Machine-readable routes:

- `/about.md`
- `/writing/[slug].md`
- `/notes/[slug].md`
- `/thoughts/[slug].md`
- `/llms.txt`
- `/robots.txt`
- `/sitemap.xml`
- `/rss.xml`

The `.md` routes return the original, clean Markdown source with frontmatter preserved or clearly separated. HTML pages remain the canonical human-facing experience.

## 4. Recommended technical approach

Use a custom Next.js App Router site with TypeScript and local Markdown/MDX content, deployed to Vercel from GitHub.

Why this approach:

- Maximum control over a personal-brand homepage and article experience.
- Native fit with Vercel preview and production deployments.
- Markdown is the source of truth while MDX permits carefully controlled interactive components.
- Static generation keeps the initial site fast and portable.
- The application layer leaves room for later search, analytics, comments, project pages, and APIs.

Alternatives considered:

- Astro + Content Collections: excellent for content-first static sites and strong type-safe content schemas, but Next.js is a better first choice for the desired custom React-oriented product surface.
- Nextra: fastest route to a Markdown documentation site, but its information architecture and visual defaults are more documentation-oriented than personal-brand-oriented.

Technology baseline:

- Next.js App Router + TypeScript
- Tailwind CSS or focused CSS Modules with project-owned design tokens
- Markdown plus MDX
- Typed frontmatter schema
- Static generation for all public content
- Vercel connected to GitHub
- GitHub Actions for linting, type checks, build, and content/link validation

## 5. Content model

Content is file-based and grouped by type:

```text
content/
  writing/
    building-agent-systems/
      index.md
      cover.png
  notes/
    nextjs-mdx-patterns.md
  thoughts/
    why-i-build-in-public.md
```

Required frontmatter:

```yaml
title: "Article title"
description: "Short description for lists, SEO, and agents"
date: "2026-08-02"
type: "writing" # writing | notes | thoughts
tags: ["AI", "Agent", "Architecture"]
draft: false
```

Optional frontmatter:

```yaml
updated: "2026-08-02"
series: "Agent Architecture"
featured: true
cover: "/media/cover.png"
canonical: "https://example.com/writing/slug"
```

The content pipeline will:

1. Discover Markdown/MDX files.
2. Validate frontmatter and content type.
3. Exclude drafts from production output.
4. Produce typed content records and route metadata.
5. Render HTML, clean Markdown, RSS, sitemap entries, and structured metadata from the same source.

## 6. Rendering and media

P0 content components:

- Headings, paragraphs, lists, blockquotes, tables, links, images, captions.
- Syntax-highlighted code blocks with copy action.
- Callouts and inline metadata.
- YouTube and Bilibili embeds through explicit MDX components with responsive wrappers and safe URL validation.

Media policy:

- Local images are preferred for reliability and long-term ownership.
- External media is allowed only through supported providers/components.
- Arbitrary raw iframe HTML is not part of the default content contract.

## 6.1 Lightweight Chinese search (P1)

Search is a post-launch enhancement and must remain simple to operate. It will not introduce a database, server-side search service, vector index, or user accounts.

Recommended implementation:

- Generate a compact search index during the site build.
- Index only published content: title, description, plain-text body, type, tags, date, and URL.
- Use Orama in the browser with its Mandarin tokenizer for Chinese tokenization.
- Load the index lazily when the search UI is opened.
- Provide one global search entry point with keyboard shortcut support where practical.
- Show title, content type, date, matched excerpt, and highlighted terms.
- Support filtering by `Writing`, `Notes`, `Thoughts`, and tags when the index size remains small enough.
- Keep the index versioned with the deployment output; no runtime synchronization is required.

Acceptance criteria:

- Chinese queries can find matches inside titles, summaries, and body text without whitespace between terms.
- English technical terms and mixed Chinese/English queries work reasonably.
- Drafts and excluded content never enter the index.
- Search remains usable on mobile and does not block initial page rendering.
- A failed or unavailable index degrades to a clear empty/error state rather than breaking navigation.

## 7. SEO, GEO, and agent access

P0 metadata and discovery:

- Per-page title, description, canonical URL, Open Graph, and Twitter Card.
- JSON-LD for `Person`, `Article`, and `BreadcrumbList` where applicable.
- `robots.txt`, `sitemap.xml`, and RSS.
- `llms.txt` summarizing the site, author, content sections, and important URLs.
- Markdown endpoints for About and every public content item.
- Stable slugs, meaningful headings, semantic HTML, and clean internal linking.

The source Markdown endpoint and generated `llms.txt` are complementary: source endpoints provide exact content, while `llms.txt` provides a concise site map and retrieval guide.

## 8. Delivery priorities

### P0 — launch gate

- Personal homepage and navigation.
- Writing, Notes, Thoughts content collections and detail pages.
- Markdown/MDX authoring with schema validation and draft filtering.
- High-quality responsive dark technology-oriented visual system.
- Code blocks, images, captions, reading time, table of contents, and supported video embeds.
- About page with identity, values, email, and QR/visual WeChat contact.
- Open Graph, core metadata, JSON-LD, RSS, robots, sitemap, llms.txt, and Markdown routes.
- GitHub/Vercel workflow with checks and preview deployments.
- Documentation and representative sample content.

### P1 — first post-launch iteration

- Tags, series, archives, and richer content navigation.
- Lightweight static site search with Chinese tokenization.
- Giscus comments backed by GitHub Discussions.
- Reading progress, related posts, sharing, and generated OG images.
- GitHub project cards.
- Privacy-oriented analytics such as Plausible or Umami.
- Link/image/content validation in CI.

### P2 — platform evolution

- Now/status stream, project detail system, timeline, and knowledge map.
- Semantic search and an agent retrieval API.
- Newsletter management and subscriptions.
- Private notes, accounts, bookmarks, recommendations, and reading history.
- Community submissions, public API, multi-theme support, and AI-assisted editorial checks.

Explicitly excluded from P0: database, user accounts, self-hosted comments, CMS administration, complex real-time data, and a general-purpose theme marketplace.

## 9. Git and deployment workflow

- `main` is production.
- Feature work happens on branches or worktrees.
- Pull requests receive Vercel preview deployments.
- GitHub Actions run formatting/lint checks, TypeScript checks, content validation, link validation, and production build.
- Merge to `main` triggers production deployment.
- Worktree boundaries are used for independent feature work when parallel implementation is helpful.

## 10. Quality and acceptance criteria

The MVP is accepted when:

- A new Markdown file can be added with documented frontmatter and appears in the correct collection after build.
- Draft content is never included in production routes, feeds, sitemap, or agent indexes.
- Every public article has a human-readable HTML route and a corresponding Markdown route.
- The homepage communicates ScottWang's identity, focus, values, and latest content within one screenful on desktop and a short scroll on mobile.
- The site works responsively at mobile, tablet, and desktop widths.
- Core pages have valid metadata, canonical URLs, structured data, robots, sitemap, RSS, and llms output.
- CI catches invalid frontmatter, type errors, lint errors, broken builds, and known broken internal links.
- The site can be deployed from GitHub to Vercel without manual content migration.

## 11. Implementation decomposition

Implementation should be split into independently verifiable workstreams:

1. Project foundation and content pipeline.
2. Design tokens, shell, navigation, and responsive visual system.
3. Collection pages and article rendering.
4. About page and identity content.
5. SEO/GEO, Markdown endpoints, feeds, and structured data.
6. Media components for images, YouTube, and Bilibili.
7. GitHub Actions, validation, and deployment documentation.

The first implementation plan should keep these boundaries explicit and sequence shared contracts before parallel UI/content work.
