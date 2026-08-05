import { notFound } from "next/navigation";
import { ContentCard } from "@/components/content/ContentCard";
import { getContentByType } from "@/lib/content/source";
import { contentTypeSchema, type ContentType } from "@/lib/content/schema";
import Link from "next/link";

export function generateStaticParams() { return contentTypeSchema.options.map((type) => ({ type })); }

export default async function CollectionPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const parsed = contentTypeSchema.safeParse(type);
  if (!parsed.success) notFound();
  const entries = getContentByType(parsed.data as ContentType);
  return <section className="collection-page"><p className="eyebrow accent">/ legacy view</p><h1>{type === "writing" ? "Essays" : type === "notes" ? "Notes" : "Thoughts"}</h1><p className="lead">这是兼容旧链接的分类视图。现在可以在统一的 Content 中按内容形式和主题浏览。</p><div className="taxonomy-links"><Link href="/content">Browse all content →</Link><Link href="/tags">Browse tags →</Link><Link href="/series">Browse series →</Link><Link href="/archive">View archive →</Link></div><div className="content-grid">{entries.map((entry) => <ContentCard key={entry.slug} entry={entry} />)}</div></section>;
}
