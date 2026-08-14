# Books shelf design

## Decision

Add a static `/books` shelf to the site. The shelf curates publicly readable technical books and sends readers to the best official reader when one exists.

The first entry is `FDE: The Guidance Book of Forward Deployed Engineer`. Its GitHub repository is public, but it does not declare a standard open source license. The README grants free reading and noncommercial sharing with attribution, while commercial use requires written permission. The author also maintains an official VitePress reader at `https://fde4.ai/book/`.

## Scope

Phase one ships:

- top navigation entry for `Books`
- `/books` collection page
- `content/books/*.md` metadata records
- typed source module for book records
- sitemap, `llms.txt`, and static search index coverage
- tests and documentation

Phase one does not ship:

- local mirroring of full book text
- chapter reading routes
- login, notes, highlights, or a database
- RSS entries for books

## Rationale

The site is a static Markdown-first publisher. A curated shelf fits that model because it is mostly metadata, editorial selection, and stable outbound reading links.

Inline highlights and private notes would require identity, persistence, and resilient text anchoring. That crosses the current project boundary and should only happen after a separate approved design. If that need becomes real, evaluate Hypothesis first because it provides annotations without changing the site into an account system.
