# Series title registry

## Problem

Series were the only taxonomy whose display name came from the value stored in frontmatter. `/series` and `/series/<value>/` rendered the raw `series` string, so a series written as `data-judgment` showed an English slug as its visible title. Tags already carry their own Chinese names, so the site looked inconsistent.

Renaming the frontmatter value would fix the title but move a published URL, and it left nowhere to keep a series summary. One field was doing three jobs: grouping key, URL segment, and display title.

## Decision

Split the three jobs into separate fields inside a registry file:

```text
content/series/agent-architecture.md
```

```yaml
---
series: "Agent Architecture"   # grouping key: exactly what articles write in `series:`
slug: "agent-architecture"     # URL segment for /series/<slug>/
title: "Agent 架构"             # display title
description: "多 agent 系统的协作模式、运行循环与职责划分。"
---
```

- `series` is the grouping key and must match the `series:` value in article frontmatter.
- `slug` is the public URL segment, restricted to lowercase kebab-case. It defaults to `series` and only needs writing when the key is not already a valid slug.
- `title` and `description` are presentation fields. Renaming a title never moves a URL.

`src/lib/content/series.ts` joins the registry with published content:

- `getSeriesRegistry()` returns the registry keyed by `series`, and rejects duplicate keys or slugs.
- `getAllSeries()` returns `{ key, slug, title, description?, count }` for every key that has published content, sorted by title.
- `getSeriesBySlug(slug)` resolves one series for the detail route and its metadata.
- `getContentBySeries(slug)` lists the entries grouped under that series, in its intended order. `getOrderedSeriesContent(key)` is the same list keyed directly by the grouping key.

## Rules

- Every series used by published content must have a registry entry. A missing entry fails the build with the offending key and its source files, instead of silently publishing a slug as a title or creating a phantom series.
- A registry file without published content does not create a route.
- The registry carries identity only. Entries, ordering, and counts come from the content itself.
- Legacy keys keep working. `Agent Architecture` is still the key in article frontmatter; only its URL segment was normalized.

## Article order and navigation

Within a series, the reading order comes from an optional `order` field in article frontmatter, a positive integer that is 1-based within that series:

```yaml
series: "Google 技术写作"
order: 1
```

- `getContentBySeries(slug)` sorts the entries by `order` ascending. Entries without `order` sort after the ordered ones, newest first, then by title.
- The series detail page renders cards in this order.
- Article pages render a `SeriesPagination` nav with 上一篇 / 下一篇 links, derived from the same ordered list, so a reader can follow a series front to back. The nav is omitted when the article is not part of a series or the series has a single item.
- `order` is scoped to a series; it does not affect `getAllContent()` date ordering on other pages.

## Compatibility

`/series/Agent%20Architecture/` was the published URL for the `Agent Architecture` series. `vercel.json` redirects it, and its non-trailing-slash form, to `/series/agent-architecture/`.

## UI behavior

- `/series` lists series by display title and links to `/series/<slug>/`.
- `/series/<slug>/` uses the title as the heading, the summary as the lead sentence, and reports the number of published items. Page metadata uses the same title and description.
- `llms.txt` gains a `Series` section with title, URL, summary, and item count.

## Boundaries

Not shipped in this change:

- series-level drafts
- a per-series RSS feed
- series filtering on `/content`
- the same treatment for tags, which already store their display names directly

## Validation

- TypeScript, lint, and the build pass.
- Tests cover key/slug/title separation, the slug-based URL, series grouping, and the invariant that every series used by content is registered.
- `/series` and each series detail page render Chinese titles, and the legacy `Agent Architecture` URL redirects.
