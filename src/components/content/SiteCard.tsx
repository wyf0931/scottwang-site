import { getGithubRepo } from "@/lib/github/source";
import type { SiteRecord } from "@/lib/content/sites";

function GithubMark() {
  return <svg className="site-source-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.86 8.35 6.84 9.71.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.04.36.32.68.95.68 1.92v2.76c0 .27.18.59.69.49A10.04 10.04 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" /></svg>;
}

function compactNumber(value?: number) {
  return value === undefined ? null : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function SiteCard({ site }: { site: SiteRecord }) {
  const repo = site.github ? getGithubRepo(site.github) : null;
  const stars = repo?.stars != null ? compactNumber(repo.stars) : null;
  return <article className="site-card" id={site.slug}>
    <h3><a href={site.url} target="_blank" rel="noreferrer">{site.title}</a></h3>
    <p>{site.description}</p>
    <div className="site-source">
      <span className="site-source-label">{repo ? "仓库" : "网址"}</span>
      {repo ? <a className="site-source-repo" href={repo.url} target="_blank" rel="noreferrer"><GithubMark /><span>{repo.fullName}</span></a> : <a className="site-source-url" href={site.url} target="_blank" rel="noreferrer">{site.url}</a>}
      {stars && <span className="site-source-extra">★ {stars}</span>}
      {site.license && <span className="site-source-extra">{site.license}</span>}
    </div>
    <div className="tag-row">{site.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
  </article>;
}
