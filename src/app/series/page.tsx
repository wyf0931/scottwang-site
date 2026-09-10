import Link from "next/link";
import { seriesPath } from "@/lib/content/paths";
import { getAllSeries } from "@/lib/content/series";

export const metadata = { title: "Series" };

export default function SeriesPage() {
  return <section className="taxonomy-page"><p className="eyebrow accent">/ index</p><h1>Series</h1><p className="lead">围绕一个主题持续展开的内容集合。</p><div className="taxonomy-grid">{getAllSeries().map((series) => <Link className="taxonomy-card" key={series.slug} href={seriesPath(series.slug)}><span>↳</span><strong>{series.title}</strong></Link>)}</div></section>;
}
