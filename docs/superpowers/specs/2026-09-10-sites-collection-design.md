# Sites collection design

## Decision

The Books shelf becomes the Sites collection. `/resources` now has a `Sites` section that curates external websites worth returning to: online books, databases, and reference tools. Each entry is a short metadata record, never a mirror of the site itself.

The first entry that motivated the change is the Chinese poetry database:

- site: `https://awesome-poetry.top/`
- repository: `chinese-poetry/chinese-poetry` (MIT)
- 5.5 万首唐诗、26 万首宋诗、2.1 万首宋词，唐宋近 1.4 万位诗人、两宋 1500 位词人

## Data model

`content/sites/<slug>.md`, parsed by `src/lib/content/sites.ts`:

```yaml
title: "中华古诗词数据库"
description: "一句话摘要。"
date: "2026-09-10"
url: "https://example.com/"
github: "owner/repo"   # optional
license: "MIT"          # optional
tags: []
featured: false
draft: false
```

`github` and `license` are optional. The old `author`, `language`, `status`, `sourceUrl`, `readerUrl`, and `licenseNote` fields are gone; repository facts belong to the GitHub block, not to the site record.

## UI behavior

- The section keeps the site's editorial list look: borderless cards with a bottom hairline.
- Card titles use the same size, weight, and ink as blog list titles (`.content-card h3`), instead of the previous smaller muted gray.
- A card with a `github` field embeds the shared `GithubRepoCard` (stars, description, language, CTA), with the card chrome flattened to fit the list.
- Tags, the license chip, the date, and a `Visit site` link complete the card.

## Integration behavior

- `search-index.json` lists sites as `type: "sites"` with per-entry anchors (`/resources#<slug>`).
- `llms.txt` replaces the Books section with Sites, linking straight to each site and its repository.
- `scripts/generate-github-cards.mjs` scans `content/sites` too, so repository metadata for site entries is refreshed on every build.

## Compatibility

`/resources#books` anchors become `/resources#sites`. The only external references were the machine-readable outputs and an e2e test, both updated. There are no per-book pages to redirect.

## Validation

- TypeScript, lint, tests, build, and Playwright pass.
- Unit tests cover both site records; the e2e test asserts the section, both cards, and both GitHub blocks.
