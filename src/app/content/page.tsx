import { ContentFilters } from "@/components/content/ContentFilters";
import { getAllContent } from "@/lib/content/source";
import { Suspense } from "react";

export const dynamic = "force-static";

export default function ContentPage() {
  return <section className="collection-page content-page"><p className="eyebrow accent">/ blog index</p><h1>Blog</h1><p className="lead">文章、笔记、想法和资源都放在这里，按时间倒序保存。</p><Suspense fallback={<p className="filter-summary">Loading content…</p>}><ContentFilters entries={getAllContent()} /></Suspense></section>;
}
