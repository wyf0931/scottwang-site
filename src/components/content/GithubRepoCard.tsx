import type { GithubRepo } from "@/lib/github/source";

function compactNumber(value?: number) {
  return value === undefined ? "—" : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function GithubRepoCard({ repo }: { repo: GithubRepo }) {
  return <aside className="github-repo-card" aria-label="GitHub repository">
    <div className="github-repo-heading"><span className="eyebrow accent">/ github repository</span><span className="github-repo-mark">GH</span></div>
    <a className="github-repo-title" href={repo.url} target="_blank" rel="noreferrer"><strong>{repo.fullName}</strong><span>↗</span></a>
    <p>{repo.description ?? "Repository metadata will be refreshed on the next build."}</p>
    <div className="github-repo-meta"><span>★ {compactNumber(repo.stars)}</span><span>{repo.language ?? "Unknown language"}</span><span>⑂ {compactNumber(repo.forks)}</span></div>
  </aside>;
}
