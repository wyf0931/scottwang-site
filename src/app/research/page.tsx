import Link from "next/link";
import { getAllResearch, researchPath } from "@/lib/content/research";

export const metadata = { title: "Research", description: "由 AI Agent 辅助调研、人工审核后发布的行业研究报告。" };

export default function ResearchPage() {
  return <section className="research-page"><p className="eyebrow accent">/ intelligence briefs</p><h1>Research</h1><p className="lead">关于 AI、Agent、互联网技术与其他行业的结构化研究报告。每份报告都标注来源、方法与边界。</p><div className="research-grid">{getAllResearch().map((report) => <article className="research-card" key={report.slug}><div className="research-meta"><span>{report.industry}</span><time dateTime={report.date.toISOString()}>{report.date.toLocaleDateString("zh-CN")}</time></div><h2><Link href={researchPath(report.slug)}>{report.title}</Link></h2><p>{report.description}</p><div className="tag-row">{report.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><Link className="text-link" href={researchPath(report.slug)}>Read report <span>→</span></Link></article>)}</div></section>;
}
