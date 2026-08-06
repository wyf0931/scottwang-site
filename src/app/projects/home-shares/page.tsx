import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "home-shares 已更名为 oma-drop — ScottWang",
  description: "home-shares 已更名为 oma-drop，项目地址和使用说明已迁移到新的项目页。",
  alternates: { canonical: `${site.url}/projects/oma-drop/` },
  robots: { index: false, follow: true },
};

export default function HomeSharesRedirectPage() {
  return (
    <article className="project-detail">
      <header className="project-detail-header">
        <p className="eyebrow accent">/ project renamed</p>
        <h1>home-shares 已更名为 oma-drop</h1>
        <p className="lead">这个局域网快传工具已经使用新的项目名维护。旧链接保留用于兼容，后续介绍、截图和使用方式都以 oma-drop 项目页为准。</p>
        <div className="project-links">
          <Link href="/projects/oma-drop/">Open oma-drop →</Link>
          <a href="https://github.com/wyf0931/oma-drop" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </header>
    </article>
  );
}
