import Link from "next/link";
import { ContentCard } from "@/components/content/ContentCard";
import { getAllContent } from "@/lib/content/source";
import { getAllProjects } from "@/lib/content/projects";
import { getAllResearch, researchPath } from "@/lib/content/research";

export default function Home() {
  const content = getAllContent();
  const projects = getAllProjects().filter((project) => project.featured).slice(0, 2);
  const research = getAllResearch().find((report) => report.featured) ?? getAllResearch()[0];
  return <div className="home-page">
    <section className="home-intro" aria-label="ScottWang profile">
      <div className="home-avatar" aria-hidden="true">SW</div>
      <h1>ScottWang</h1>
      <p className="home-subtitle">王云飞</p>
      <p className="home-role">互联网技术与 AI / Agent 架构师</p>
      <p className="home-copy">记录技术笔记、行业观察、资源分享和一些还在形成中的判断。</p>
      <div className="home-links">
        <a href="https://github.com/wyf0931" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://x.com/wyf0931" target="_blank" rel="noreferrer">X</a>
        <a href="mailto:wyf0931@gmail.com">Email</a>
        <Link href="/about">About</Link>
      </div>
    </section>
    <section className="content-section"><div className="section-heading"><div><h2>Latest</h2></div><Link className="text-link" href="/content">All posts <span>→</span></Link></div><div className="content-grid">{content.slice(0, 5).map((entry) => <ContentCard key={`${entry.type}-${entry.slug}`} entry={entry} />)}</div></section>
    <section className="content-section project-preview"><div className="section-heading"><div><h2>Projects</h2></div><Link className="text-link" href="/projects">All projects <span>→</span></Link></div><div className="project-grid">{projects.map((project) => <Link className="project-teaser" href={`/projects/${project.slug}`} key={project.slug}><span>{project.title}</span><small>{project.description}</small></Link>)}</div></section>
    {research && <section className="research-feature"><div><h2>Research</h2><p>{research.title}</p></div><Link className="text-link" href={researchPath(research.slug)}>Read report <span>→</span></Link></section>}
  </div>;
}
