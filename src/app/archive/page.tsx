import Link from "next/link";
import { contentYears } from "@/lib/content/taxonomy";
import { getAllContent } from "@/lib/content/source";

export const metadata = { title: "Archive" };

export default function ArchivePage() {
  const entries = getAllContent();
  return <section className="taxonomy-page archive-page"><p className="eyebrow accent">/ timeline</p><h1>Archive</h1><p className="lead">按时间回看所有 Writing、Notes 和 Thoughts。</p>{contentYears().map((year) => <section className="archive-year" key={year}><h2>{year}</h2><div>{entries.filter((entry) => entry.date.getFullYear() === year).map((entry) => <Link className="archive-item" key={`${entry.type}-${entry.slug}`} href={`/${entry.type}/${entry.slug}`}><span>{entry.date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}</span><strong>{entry.title}</strong><small>{entry.type}</small></Link>)}</div></section>)}</section>;
}
