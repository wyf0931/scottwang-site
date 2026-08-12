import { notFound } from "next/navigation";
import { ContentCard } from "@/components/content/ContentCard";
import { getAllContent } from "@/lib/content/source";
import { getAllSeries } from "@/lib/content/taxonomy";

export function generateStaticParams() {
  const series = getAllSeries();
  // Turbopack with output: export requires at least one param;
  // a placeholder that hits notFound() avoids the build error when no series exist.
  return series.length > 0 ? series.map((s) => ({ series: s })) : [{ series: ".none" }];
}
export const dynamicParams = false;

export default async function SeriesDetailPage({ params }: { params: Promise<{ series: string }> }) {
  const series = decodeURIComponent((await params).series);
  if (series === ".none" || !getAllSeries().includes(series)) notFound();
  const entries = getAllContent().filter((entry) => entry.series === series);
  return <section className="taxonomy-page"><p className="eyebrow accent">/ series</p><h1>{series}</h1><p className="lead">{entries.length} 篇公开内容。</p><div className="content-grid">{entries.map((entry) => <ContentCard key={`${entry.type}-${entry.slug}`} entry={entry} />)}</div></section>;
}
