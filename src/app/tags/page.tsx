import Link from "next/link";
import { getAllTags, tagSlug } from "@/lib/content/taxonomy";

export const metadata = { title: "Tags" };

export default function TagsPage() {
  return <section className="taxonomy-page"><p className="eyebrow accent">/ index</p><h1>Tags</h1><p className="lead">按主题浏览所有公开内容。</p><div className="taxonomy-grid">{getAllTags().map((tag) => <Link className="taxonomy-card" key={tag} href={`/tags/${tagSlug(tag)}`}><span>#</span><strong>{tag}</strong></Link>)}</div></section>;
}
