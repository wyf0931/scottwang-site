# Content pipeline

## Source of truth

Markdown and MDX files under `content/writing`, `content/notes`, and `content/thoughts` are the only content source. Each file is parsed by `src/lib/content/source.ts`, validated by the Zod schema, and transformed into a typed `ContentRecord`.

## Public filtering

`getAllContent()` excludes `draft: true` by default. Every public page, RSS entry, sitemap URL, `llms.txt` item, and `.md` route uses the same public query, so drafts cannot leak through a secondary output.

## Derived outputs

The same record provides:

- HTML collection and article pages
- Clean Markdown source routes
- RSS items
- Sitemap entries
- `llms.txt` retrieval links
- Reading-time and excerpt data

## Boundaries

Content modules do not render layout. Route components compose records into UI, and machine-readable routes consume the same records without depending on browser APIs. External media is represented by explicit components rather than arbitrary HTML.

## P1 search decision

Search is intentionally outside the launch gate. The planned implementation is a build-time public-content index with Orama's Mandarin tokenizer, lazy-loaded in the browser. It will remain database-free and will be added only after the P0 publishing flow is stable.
