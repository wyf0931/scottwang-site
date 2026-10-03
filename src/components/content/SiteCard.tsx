import { GithubRepoCard } from "./GithubRepoCard";
import type { SiteRecord } from "@/lib/content/sites";

function LicenseMark() {
  return <svg className="site-license-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></svg>;
}

export function SiteCard({ site }: { site: SiteRecord }) {
  const license = site.license && (site.licenseUrl ? <a className="site-license" href={site.licenseUrl} target="_blank" rel="noreferrer"><LicenseMark />{site.license}</a> : <span className="site-license"><LicenseMark />{site.license}</span>);
  return <article className="site-card" id={site.slug}><h3><a href={site.url} target="_blank" rel="noreferrer">{site.title}</a></h3><p>{site.description}</p>{site.body && <p className="site-note">{site.body}</p>}{site.github && <GithubRepoCard repo={site.github} />}<div className="tag-row">{site.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="site-links"><a href={site.url} target="_blank" rel="noreferrer">Visit site ↗</a>{site.github && <a href={`https://github.com/${site.github}`} target="_blank" rel="noreferrer">GitHub ↗</a>}{license}</div></article>;
}
