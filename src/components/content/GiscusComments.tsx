"use client";

import { useEffect, useRef } from "react";

export function GiscusComments() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
    const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
    const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
    const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
    if (!container.current || !repo || !repoId || !category || !categoryId || container.current.childElementCount > 0) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    Object.entries({ repo, repoId, category, categoryId, mapping: "pathname", strict: "0", reactionsEnabled: "1", emitMetadata: "0", inputPosition: "top", theme: "preferred_color_scheme", lang: "zh-CN" }).forEach(([key, value]) => { script.dataset[key] = value; });
    container.current.appendChild(script);
  }, []);
  const configured = process.env.NEXT_PUBLIC_GISCUS_REPO_ID && process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
  return <section className="comments-section" aria-label="Comments"><div className="section-label"><span>Discussion</span><span>GitHub Discussions</span></div>{configured ? <div ref={container} className="giscus-comments" /> : <p className="comments-unavailable">评论功能正在配置中。</p>}</section>;
}
