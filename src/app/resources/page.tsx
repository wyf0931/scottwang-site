import Link from "next/link";
import { GithubRepoCard } from "@/components/content/GithubRepoCard";
import { getAllSites } from "@/lib/content/sites";
import { getAllResearch, researchPath } from "@/lib/content/research";

export const metadata = {
  title: "Resources",
  description: "ScottWang 的资源中心：精选的外部网站与阅读入口，以及 AI Agent 与各领域的研究报告。",
};

export default function ResourcesPage() {
  const sites = getAllSites();
  const research = getAllResearch();

  return (
    <section className="resources-page">
      <p className="eyebrow accent">/ resources</p>
      <h1>Resources</h1>
      <p className="lead">值得收藏的外部站点与阅读入口，以及按领域整理的研究报告。外部内容注明来源和授权，站内报告标注方法与边界。</p>

      <section id="sites" className="resource-section" aria-labelledby="sites-heading">
        <h2 id="sites-heading">Sites</h2>
        {sites.length === 0 ? (
          <p className="resource-empty">站点整理中。</p>
        ) : (
          <div className="sites-list">
            {sites.map((site) => (
              <article className="site-card" key={site.slug} id={site.slug}>
                <div className="site-meta">
                  <span>{site.license ?? "Website"}</span>
                  <time dateTime={site.date.toISOString()}>{site.date.toLocaleDateString("zh-CN")}</time>
                </div>
                <h3><a href={site.url} target="_blank" rel="noreferrer">{site.title}</a></h3>
                <p>{site.description}</p>
                {site.body && <p className="site-note">{site.body}</p>}
                {site.github && <GithubRepoCard repo={site.github} />}
                <div className="tag-row">{site.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="site-links">
                  <a href={site.url} target="_blank" rel="noreferrer">Visit site ↗</a>
                  {site.github && <a href={`https://github.com/${site.github}`} target="_blank" rel="noreferrer">GitHub ↗</a>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="research" className="resource-section" aria-labelledby="research-heading">
        <h2 id="research-heading">Research</h2>
        {research.length === 0 ? (
          <p className="resource-empty">研究报告撰写中。</p>
        ) : (
          <div className="research-grid">
            {research.map((report) => (
              <article className="research-card" key={report.slug}>
                <div className="research-meta">
                  <span>{report.industry}</span>
                  <time dateTime={report.date.toISOString()}>{report.date.toLocaleDateString("zh-CN")}</time>
                </div>
                <h3><Link href={researchPath(report.slug)}>{report.title}</Link></h3>
                <p>{report.description}</p>
                <div className="tag-row">{report.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                <Link className="text-link" href={researchPath(report.slug)}>Read report <span>→</span></Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
