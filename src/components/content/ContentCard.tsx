import Link from "next/link";
import type { ContentRecord } from "@/lib/content/schema";
import { contentPath } from "@/lib/content/paths";

export function ContentCard({ entry }: { entry: ContentRecord }) {
  const resourceLabel = entry.resourceType ? entry.resourceType : undefined;
  return <article className="content-card"><time dateTime={entry.date.toISOString()}>{entry.date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })}</time><div><h3><Link href={contentPath(entry.type, entry.slug)}>{entry.title}</Link></h3><p>{entry.description}</p><div className="tag-row"><span>{entry.kind}{resourceLabel ? ` / ${resourceLabel}` : ""}</span>{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>{entry.kind === "resource" && entry.resourceUrl && <a className="resource-link" href={entry.resourceUrl} target="_blank" rel="noreferrer">Open resource ↗</a>}</div></article>;
}
