# Sites directory and GitHub card hierarchy

## Decision

Add a first-class `/sites` collection page and a `Sites` item to the primary navigation. Keep `/resources` as a compatible combined hub, with its existing Sites section linking to the dedicated collection. The source of truth remains `content/sites/*.md` and the existing `getAllSites` query.

## Sites page

The dedicated page uses a responsive editorial grid. It renders two compact cards per row on wide screens and one card per row on narrow screens. Each card contains the site type/date, linked title, short description, optional editorial note, tags, and external links. GitHub-backed entries keep the shared `GithubRepoCard`, but the card is visually compact within the site card. No client-side search or database is added.

The initial scikit-learn entry links to the official User Guide at `https://scikit-learn.org/stable/user_guide.html`, uses the repository `scikit-learn/scikit-learn`, and describes the guide as a reference for supervised and unsupervised learning, preprocessing, model selection, and evaluation in Python. It is published but not featured.

## GitHub card typography

The repository owner and name use one consistent monospace size. The repository name becomes the primary title size, while the owner becomes a smaller secondary line. This reverses the current visual imbalance where the repository identifier dominates the enclosing site title. The change applies to the shared card everywhere and keeps the existing external-link affordance, wrapping, focus state, and mobile behavior.

## Compatibility and outputs

Search and machine-readable outputs point site entries to `/sites#<slug>` so the dedicated page is canonical. The `/resources` page remains indexable and keeps its existing anchors. Add the `/sites` route to the sitemap and extend route/e2e coverage for the navigation, page, scikit-learn entry, responsive grid class, and GitHub card hierarchy.

## Validation

Run `git diff --check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e`. Use browser verification at desktop and mobile widths to confirm cards stack cleanly and long repository names wrap without overflow.
