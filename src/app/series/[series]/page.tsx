import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentCard } from "@/components/content/ContentCard";
import { getContentBySeries, getAllSeries, getSeriesBySlug } from "@/lib/content/series";

export function generateStaticParams() {
  const series = getAllSeries();
  // Turbopack with output: export requires at least one param;
  // a placeholder that hits notFound() avoids the build error when no series exist.
  return series.length > 0 ? series.map((s) => ({ series: s.slug })) : [{ series: ".none" }];
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ series: string }> }): Promise<Metadata> {
  const record = getSeriesBySlug(decodeURIComponent((await params).series));
  return record ? { title: record.title, description: record.description } : { title: "Series" };
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ series: string }> }) {
  const slug = decodeURIComponent((await params).series);
  const record = getSeriesBySlug(slug);
  if (!record) notFound();
  const entries = getContentBySeries(slug);
  const lead = record.description ? `${record.description}共 ${entries.length} 篇公开内容。` : `围绕「${record.title}」持续展开的 ${entries.length} 篇公开内容。`;
  return <section className="taxonomy-page"><p className="eyebrow accent">/ series</p><h1>{record.title}</h1><p className="lead">{lead}</p><div className="content-grid">{entries.map((entry) => <ContentCard key={`${entry.type}-${entry.slug}`} entry={entry} />)}</div></section>;
}
