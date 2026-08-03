# Research Reports Design

## Boundary

Research reports are published artifacts, not an online research workflow. A local Deep Research Agent produces Markdown outside this repository; after review, the author places the approved file in `content/research/`. The site does not call the Agent, store jobs, or expose private research material.

## Content model

Each `content/research/*.md` file uses frontmatter with `title`, `description`, `date`, `updated`, `topic`, `industry`, `tags`, `status`, `featured`, and optional `sources`. `status` is `Draft`, `Review`, or `Published`; only `Published` reports are public. `sources` contains `{ title, url, publishedAt? }` records for citation transparency.

## Public experience

- `/research`: report index with industry, topic, date, and status signals
- `/research/[slug]`: report detail rendered from Markdown
- `/research/[slug].md`: raw Markdown for Agents and downstream tools
- featured reports on the home page
- report URLs in sitemap, RSS, `llms.txt`, and search index

## GEO and SEO

Every published report has canonical metadata, OpenGraph/Twitter metadata, `Article` JSON-LD with `isPartOf`, `citation`, `datePublished`, `dateModified`, and `about`, plus visible research method / source metadata when provided. The page keeps stable headings and a concise summary so search engines and answer agents can quote and attribute the work.

## Validation

Run lint, typecheck, tests, production build, and HTTP checks for the report index, detail page, raw Markdown endpoint, sitemap, `llms.txt`, and search index. Draft and review reports must not appear in any public output.
