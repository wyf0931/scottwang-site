import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentRecord } from "@/lib/content/schema";

export function ArticleLayout({ entry, html, children }: { entry: ContentRecord; html: string; children?: ReactNode }) {
  return <article className="article-layout">
    <header className="article-header"><p className="eyebrow accent">{entry.type} / {entry.tags.join(" · ")}</p><h1>{entry.title}</h1><p className="article-description">{entry.description}</p><div className="article-meta"><time dateTime={entry.date.toISOString()}>{entry.date.toLocaleDateString("zh-CN")}</time><span>{entry.readingTime} min read</span><Link href={`/${entry.type}/${entry.slug}.md`}>Markdown ↗</Link></div></header>
    <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
    {children}
  </article>;
}
