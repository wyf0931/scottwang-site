import { ContentFilters } from "@/components/content/ContentFilters";
import { getAllContent } from "@/lib/content/source";
import { Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-static";

export default function ContentPage() {
  return <section className="collection-page content-page"><p className="eyebrow accent">/ content index</p><h1>Content</h1><p className="lead">Essays、Notes、Thoughts 与值得保存的 Resources，统一记录关于技术、AI、Agent 系统和正在形成的判断。</p><div className="taxonomy-links"><Link href="/tags">Browse tags →</Link><Link href="/series">Browse series →</Link><Link href="/archive">View archive →</Link></div><Suspense fallback={<p className="filter-summary">Loading content…</p>}><ContentFilters entries={getAllContent()} /></Suspense></section>;
}
