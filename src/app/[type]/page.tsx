import { notFound } from "next/navigation";
import { ContentCard } from "@/components/content/ContentCard";
import { getContentByType } from "@/lib/content/source";
import { contentTypeSchema, type ContentType } from "@/lib/content/schema";

export function generateStaticParams() { return contentTypeSchema.options.map((type) => ({ type })); }

export default async function CollectionPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const parsed = contentTypeSchema.safeParse(type);
  if (!parsed.success) notFound();
  const entries = getContentByType(parsed.data as ContentType);
  return <section className="collection-page"><p className="eyebrow accent">/ {type}</p><h1>{type === "writing" ? "Writing" : type === "notes" ? "Notes" : "Thoughts"}</h1><p className="lead">关于技术、AI、Agent 系统与正在形成的判断。</p><div className="content-grid">{entries.map((entry) => <ContentCard key={entry.slug} entry={entry} />)}</div></section>;
}
