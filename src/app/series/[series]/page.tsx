import { notFound } from "next/navigation";
import { ContentCard } from "@/components/content/ContentCard";
import { getAllContent } from "@/lib/content/source";
import { getAllSeries } from "@/lib/content/taxonomy";

export function generateStaticParams() { return getAllSeries().map((series) => ({ series })); }
export const dynamicParams = false;

export default async function SeriesDetailPage({ params }: { params: Promise<{ series: string }> }) {
  const series = decodeURIComponent((await params).series);
  if (!getAllSeries().includes(series)) notFound();
  const entries = getAllContent().filter((entry) => entry.series === series);
  return <section className="taxonomy-page"><p className="eyebrow accent">/ series</p><h1>{series}</h1><p className="lead">{entries.length} 篇公开内容。</p><div className="content-grid">{entries.map((entry) => <ContentCard key={`${entry.type}-${entry.slug}`} entry={entry} />)}</div></section>;
}
