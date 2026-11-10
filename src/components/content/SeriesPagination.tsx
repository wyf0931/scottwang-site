import Link from "next/link";
import { getOrderedSeriesContent } from "@/lib/content/series";
import type { ContentRecord } from "@/lib/content/schema";

function seriesLink(entry: ContentRecord, direction: "prev" | "next") {
  const label = direction === "prev" ? "上一篇" : "下一篇";
  return (
    <Link href={`/${entry.type}/${entry.slug}`} className={`series-pagination-link series-pagination-${direction}`}>
      <span className="series-pagination-label">{label}</span>
      <span className="series-pagination-title">{entry.title}</span>
    </Link>
  );
}

// Leads a reader through a series in its intended order: a link back to the
// previous article and a link forward to the next one, derived from the same
// ordering that the series page uses.
export function SeriesPagination({ entry }: { entry: ContentRecord }) {
  if (!entry.series) return null;
  // Match the entry's own visibility so a draft article can still navigate its
  // full series (drafts only leave public listings, not the reading sequence).
  const items = getOrderedSeriesContent(entry.series, entry.draft);
  const index = items.findIndex((item) => item.type === entry.type && item.slug === entry.slug);
  if (index < 0 || items.length < 2) return null;
  const prev = index > 0 ? items[index - 1] : null;
  const next = index < items.length - 1 ? items[index + 1] : null;
  if (!prev && !next) return null;
  return (
    <nav className="series-pagination" aria-label={`${entry.series} 系列导航`}>
      {prev ? seriesLink(prev, "prev") : <span className="series-pagination-placeholder" aria-hidden="true" />}
      {next ? seriesLink(next, "next") : <span className="series-pagination-placeholder" aria-hidden="true" />}
    </nav>
  );
}
