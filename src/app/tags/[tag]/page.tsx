import { notFound } from "next/navigation";
import { ContentCard } from "@/components/content/ContentCard";
import { getAllContent } from "@/lib/content/source";
import { getAllTags } from "@/lib/content/taxonomy";

export function generateStaticParams() {
  const tags = getAllTags();
  return tags.length > 0 ? tags.map((t) => ({ tag: t })) : [{ tag: ".none" }];
}
export const dynamicParams = false;

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const tag = decodeURIComponent((await params).tag);
  if (tag === ".none" || !getAllTags().includes(tag)) notFound();
  const entries = getAllContent().filter((entry) => entry.tags.includes(tag));
  return <section className="taxonomy-page"><p className="eyebrow accent">/ tag</p><h1>#{tag}</h1><p className="lead">{entries.length} 篇公开内容。</p><div className="content-grid">{entries.map((entry) => <ContentCard key={`${entry.type}-${entry.slug}`} entry={entry} />)}</div></section>;
}
