import Link from "next/link";
import { getAllSeries } from "@/lib/content/taxonomy";

export const metadata = { title: "Series" };

export default function SeriesPage() {
  return <section className="taxonomy-page"><p className="eyebrow accent">/ index</p><h1>Series</h1><p className="lead">围绕一个主题持续展开的内容集合。</p><div className="taxonomy-grid">{getAllSeries().map((series) => <Link className="taxonomy-card" key={series} href={`/series/${encodeURIComponent(series)}`}><span>↳</span><strong>{series}</strong></Link>)}</div></section>;
}
