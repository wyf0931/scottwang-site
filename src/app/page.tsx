import Link from "next/link";
import { ContentCard } from "@/components/content/ContentCard";
import { getAllContent } from "@/lib/content/source";

export default function Home() {
  const content = getAllContent();
  const featured = content.find((entry) => entry.featured) ?? content[0];
  return <div className="home-page">
    <section className="hero"><p className="eyebrow accent">/ personal system online</p><h1>Build systems<br /><em>that compound.</em></h1><p className="hero-copy">我是王云飞，英文名 ScottWang。互联网技术与 AI / Agent 架构师，记录正在构建的系统、阅读过的资料，以及仍在形成的判断。</p><div className="hero-actions"><Link className="button button-primary" href="/writing">Explore writing <span>↗</span></Link><Link className="text-link" href="/about">About me <span>→</span></Link></div></section>
    {featured && <section className="featured-section"><div className="section-label"><span>Featured signal</span><span>01 / 01</span></div><ContentCard entry={featured} /></section>}
    <section className="content-section"><div className="section-heading"><div><p className="eyebrow accent">Latest transmissions</p><h2>Recent thinking</h2></div><Link className="text-link" href="/writing">View all <span>→</span></Link></div><div className="content-grid">{content.slice(0, 3).map((entry) => <ContentCard key={`${entry.type}-${entry.slug}`} entry={entry} />)}</div></section>
    <section className="values"><span>共赢</span><span>专注</span><span>精进</span></section>
  </div>;
}
