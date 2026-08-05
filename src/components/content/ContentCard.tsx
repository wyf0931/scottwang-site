import Link from "next/link";
import type { ContentRecord } from "@/lib/content/schema";
import { contentPath } from "@/lib/content/paths";

export function ContentCard({ entry }: { entry: ContentRecord }) {
  const resourceLabel = entry.resourceType ? entry.resourceType : undefined;
  return <article className="content-card"><div className="eyebrow"><span>{entry.kind}{resourceLabel ? ` / ${resourceLabel}` : ""}</span><time dateTime={entry.date.toISOString()}>{entry.date.toLocaleDateString("zh-CN")}</time></div><h3><Link href={contentPath(entry.type, entry.slug)}>{entry.title}</Link></h3><p>{entry.description}</p><div className="tag-row">{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>{entry.kind === "resource" && entry.resourceUrl && <a className="resource-link" href={entry.resourceUrl} target="_blank" rel="noreferrer">Open resource ↗</a>}</article>;
}
