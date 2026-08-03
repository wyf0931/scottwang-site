import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderMdx } from "@/lib/content/markdown";
import { getAllProjects, getProjectBySlug, projectPath } from "@/lib/content/projects";
import { contentOgImagePath, site } from "@/lib/seo/site";

export const dynamicParams = false;
export function generateStaticParams() { return getAllProjects().map((project) => ({ slug: project.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  if (!project) return {};
  return { title: project.title, description: project.description, alternates: { canonical: projectPath(project.slug) }, openGraph: { type: "article", title: project.title, description: project.description, images: [contentOgImagePath("projects", project.slug)] } };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();
  const content = await renderMdx(project.body);
  const jsonLd = { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.description, dateCreated: project.date.toISOString(), creator: { "@type": "Person", name: "王云飞", alternateName: "ScottWang", url: site.url }, url: `${site.url}${projectPath(project.slug)}` };
  return <article className="project-detail"><header className="project-detail-header"><p className="eyebrow accent">/ project</p><h1>{project.title}</h1><p className="lead">{project.description}</p><div className="project-meta"><span>{project.status}</span><span>{project.visibility}</span><time dateTime={project.date.toISOString()}>{project.date.toLocaleDateString("zh-CN")}</time></div><div className="tag-row">{project.stack.map((item) => <span key={item}>{item}</span>)}</div><div className="project-links">{project.repository && <a href={project.repository} target="_blank" rel="noreferrer">GitHub ↗</a>}{project.url && <a href={project.url} target="_blank" rel="noreferrer">Open project ↗</a>}</div></header><div className="article-body">{content}</div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></article>;
}
