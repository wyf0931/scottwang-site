# Content and Resource Taxonomy

## Goal

Unify Writing, Notes, and Thoughts under one Content information architecture while adding Resources as a first-class content form. Preserve existing Markdown files, URLs, raw Markdown endpoints, SEO, RSS, search, and Agent-readable outputs.

## Data model

Existing `type` remains the source-directory and route-compatibility field:

```yaml
type: notes
```

The canonical presentation field is `kind`:

```yaml
kind: essay | note | thought | resource
```

Resources may additionally declare:

```yaml
resourceType: github | youtube | bilibili | course | website | upload
resourceUrl: https://...
```

`tags` remain thematic metadata such as `AI`, `Agent`, `Architecture`, and `Open Source`.

Existing entries default to a kind mapped from their legacy type: writing → essay, notes → note, thoughts → thought. This avoids a content migration requirement.

## Information architecture

- `/content` is the canonical unified collection page.
- `/content?kind=resource` filters resources.
- `/content?tag=AI` filters by topic tag.
- The primary navigation exposes `Content`, `Projects`, `Research`, and `About`.
- `/writing`, `/notes`, and `/thoughts` remain as compatible filtered views.
- Resource detail pages use the existing content detail route and remain Markdown-first.

## UI behavior

The Content page shows a restrained filter bar for All, Essays, Notes, Thoughts, and Resources, followed by the existing content cards. Resource cards show a small source label and external-link treatment when applicable. The design stays aligned with the Hugo Coder-inspired academic/editorial visual system.

## Integration behavior

Unified content is used by the homepage, search index, RSS, sitemap, and `llms.txt`. Resource metadata is indexed as searchable text and exposed in the raw Markdown without changing existing raw paths.

## Validation

- TypeScript/build passes.
- Existing legacy collection routes resolve.
- `/content` renders all content and filters correctly.
- A GitHub resource fixture validates source metadata and external linking.
- Existing Playwright regression tests continue to pass.
