import { GithubRepoCard } from "./GithubRepoCard";
import type { SiteRecord } from "@/lib/content/sites";

export function SiteCard({ site }: { site: SiteRecord }) {
  return <article className="site-card" id={site.slug}><div className="site-meta"><span>{site.license ?? "Website"}</span><time dateTime={site.date.toISOString()}>{site.date.toLocaleDateString("zh-CN")}</time></div><h3><a href={site.url} target="_blank" rel="noreferrer">{site.title}</a></h3><p>{site.description}</p>{site.body && <p className="site-note">{site.body}</p>}{site.github && <GithubRepoCard repo={site.github} />}<div className="tag-row">{site.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="site-links"><a href={site.url} target="_blank" rel="noreferrer">Visit site ↗</a>{site.github && <a href={`https://github.com/${site.github}`} target="_blank" rel="noreferrer">GitHub ↗</a>}</div></article>;
}
