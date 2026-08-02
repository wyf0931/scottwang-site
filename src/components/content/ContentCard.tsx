import Link from "next/link";
import type { ContentRecord } from "@/lib/content/schema";
import { contentPath } from "@/lib/content/paths";

export function ContentCard({ entry }: { entry: ContentRecord }) {
  return <article className="content-card"><div className="eyebrow"><span>{entry.type}</span><time dateTime={entry.date.toISOString()}>{entry.date.toLocaleDateString("zh-CN")}</time></div><h3><Link href={contentPath(entry.type, entry.slug)}>{entry.title}</Link></h3><p>{entry.description}</p><div className="tag-row">{entry.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></article>;
}
