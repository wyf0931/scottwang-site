import { SiteCard } from "@/components/content/SiteCard";
import { getAllSites } from "@/lib/content/sites";

export const metadata = { title: "Sites", description: "ScottWang 精选的外部网站、在线书籍、数据库与参考工具。" };

export default function SitesPage() {
  const sites = getAllSites();
  return <section className="sites-page"><p className="eyebrow accent">/ sites</p><h1>Sites</h1><p className="lead">值得反复访问的外部网站、在线书籍、数据库与参考工具。每个条目只保留必要的背景和入口。</p>{sites.length === 0 ? <p className="resource-empty">站点整理中。</p> : <div className="sites-grid">{sites.map((site) => <SiteCard key={site.slug} site={site} />)}</div>}</section>;
}
