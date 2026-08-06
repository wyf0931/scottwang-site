"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ContentKind, ContentRecord } from "@/lib/content/schema";
import { ContentCard } from "./ContentCard";

const filters: Array<{ value: ContentKind | "all"; label: string }> = [
  { value: "all", label: "All" }, { value: "essay", label: "Essays" }, { value: "note", label: "Notes" },
  { value: "thought", label: "Thoughts" }, { value: "resource", label: "Resources" },
];

export function ContentFilters({ entries }: { entries: ContentRecord[] }) {
  const params = useSearchParams();
  const kind = params.get("kind") as ContentKind | null;
  const tag = params.get("tag");
  const activeKind = filters.some((filter) => filter.value === kind) ? kind : "all";
  const visible = entries.filter((entry) => (activeKind === "all" || entry.kind === activeKind) && (!tag || entry.tags.includes(tag)));
  const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort((a, b) => a.localeCompare(b));
  return <div className="content-browser">
    <div className="content-filters" aria-label="Content filters">
      <p className="sidebar-label">Filter</p>
      <div className="filter-group">{filters.map((filter) => <Link className={activeKind === filter.value ? "filter-link is-active" : "filter-link"} href={filter.value === "all" ? "/content" : `/content?kind=${filter.value}`} key={filter.value}>{filter.label}</Link>)}</div>
      <div className="filter-tags"><span>Topic</span>{tags.map((item) => <Link className={tag === item ? "filter-tag is-active" : "filter-tag"} href={`/content?tag=${encodeURIComponent(item)}`} key={item}>#{item}</Link>)}</div>
      <div className="content-browse-links"><p className="sidebar-label">Browse</p><Link href="/tags">Tags →</Link><Link href="/series">Series →</Link><Link href="/archive">Archive →</Link></div>
    </div>
    <p className="filter-summary">{visible.length} {visible.length === 1 ? "entry" : "entries"}{tag ? ` · ${tag}` : ""}</p>
    {visible.length ? <div className="content-grid">{visible.map((entry) => <ContentCard key={`${entry.type}-${entry.slug}`} entry={entry} />)}</div> : <p className="empty-state">No content matches this filter yet.</p>}
  </div>;
}
