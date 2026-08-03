import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderMdx } from "@/lib/content/markdown";
import { getAllResearch, getResearchBySlug, researchMarkdownPath, researchPath } from "@/lib/content/research";
import { site } from "@/lib/seo/site";

export const dynamicParams = false;
export function generateStaticParams() { return getAllResearch().map((report) => ({ slug: report.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const report = getResearchBySlug((await params).slug);
  if (!report) return {};
  return { title: report.title, description: report.description, alternates: { canonical: researchPath(report.slug) }, openGraph: { type: "article", title: report.title, description: report.description }, twitter: { card: "summary_large_image", title: report.title, description: report.description } };
}

export default async function ResearchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const report = getResearchBySlug((await params).slug);
  if (!report) notFound();
  const content = await renderMdx(report.body);
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: report.title, description: report.description, datePublished: report.date.toISOString(), dateModified: (report.updated ?? report.date).toISOString(), articleSection: report.topic, about: { "@type": "Thing", name: report.industry }, keywords: report.tags, citation: report.sources.map((source) => source.url), isPartOf: { "@type": "CollectionPage", name: "ScottWang Research", url: `${site.url}/research` }, author: { "@type": "Person", name: "王云飞", alternateName: "ScottWang", url: site.url }, mainEntityOfPage: `${site.url}${researchPath(report.slug)}` };
  return <article className="research-detail"><header className="research-detail-header"><p className="eyebrow accent">/ research report</p><h1>{report.title}</h1><p className="lead">{report.description}</p><div className="research-meta"><span>{report.industry}</span><span>{report.topic}</span><time dateTime={(report.updated ?? report.date).toISOString()}>Updated {(report.updated ?? report.date).toLocaleDateString("zh-CN")}</time></div><div className="tag-row">{report.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><a className="raw-link" href={researchMarkdownPath(report.slug)}>Read Markdown ↗</a></header><div className="research-brief"><strong>Research brief</strong><span>Published report · {report.sources.length} sources</span></div><div className="article-body">{content}</div>{report.sources.length > 0 && <aside className="research-sources"><h2>Sources</h2><ol>{report.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ol></aside>}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></article>;
}
