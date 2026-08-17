import Image from "next/image";
import type { GithubRepo } from "@/lib/github/source";
import { getGithubRepo } from "@/lib/github/source";

function compactNumber(value?: number) {
  return value === undefined ? "—" : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function GithubMark() {
  return <svg className="github-repo-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.86 8.35 6.84 9.71.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.04.36.32.68.95.68 1.92v2.76c0 .27.18.59.69.49A10.04 10.04 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" /></svg>;
}

export function GithubRepoCard({ repo }: { repo: GithubRepo | string }) {
  const record = typeof repo === "string" ? getGithubRepo(repo) : repo;
  return <aside className="github-repo-card" aria-label={`GitHub repository ${record.fullName}`}>
    <div className="github-repo-heading"><span className="github-repo-brand"><GithubMark /><span>GitHub project</span></span>{record.avatarUrl && <Image className="github-repo-avatar" src={record.avatarUrl} alt={`${record.owner} avatar`} width={40} height={40} unoptimized />}</div>
    <a className="github-repo-title" href={record.url} target="_blank" rel="noreferrer"><span><small>{record.owner} /</small><strong>{record.name}</strong></span><span className="github-repo-external">↗</span></a>
    <p>{record.description ?? "Repository metadata will be refreshed on the next build."}</p>
    <div className="github-repo-meta"><span><b>★</b> {compactNumber(record.stars)} stars</span><span>{record.language ?? "Unknown language"}</span><span><b>⑂</b> {compactNumber(record.forks)} forks</span></div>
    <a className="github-repo-cta" href={record.url} target="_blank" rel="noreferrer">View on GitHub <span>↗</span></a>
  </aside>;
}
