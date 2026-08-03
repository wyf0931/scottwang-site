import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentRecord } from "@/lib/content/schema";

export function ArticleLayout({ entry, content, structuredData }: { entry: ContentRecord; content: ReactNode; structuredData: Record<string, unknown> }) {
  return <article className="article-layout">
    <header className="article-header"><p className="eyebrow accent">{entry.type} / {entry.tags.join(" · ")}</p><h1>{entry.title}</h1><p className="article-description">{entry.description}</p><div className="article-meta"><time dateTime={entry.date.toISOString()}>{entry.date.toLocaleDateString("zh-CN")}</time><span>{entry.readingTime} min read</span><Link href={`/${entry.type}/${entry.slug}.md`}>Markdown ↗</Link></div></header>
    <div className="article-body">{content}</div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
  </article>;
}
