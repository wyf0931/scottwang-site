"use client";

import { useEffect, useRef } from "react";

export function GiscusComments() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const repo = process.env.NEXT_PUBLIC_GISCUS_REPO ?? "wyf0931/scottwang-site";
    const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "R_kgDOTrHbZQ";
    const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? "Announcements";
    const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "DIC_kwDOTrHbZc4DClpJ";
    if (!container.current || !repo || !repoId || !category || !categoryId || container.current.childElementCount > 0) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    Object.entries({ repo, repoId, category, categoryId, mapping: "pathname", strict: "0", reactionsEnabled: "1", emitMetadata: "0", inputPosition: "top", theme: "preferred_color_scheme", lang: "zh-CN" }).forEach(([key, value]) => { script.dataset[key] = value; });
    container.current.appendChild(script);
  }, []);
  return <section className="comments-section" aria-label="Comments"><div className="section-label"><span>Discussion</span><span>GitHub Discussions</span></div><div ref={container} className="giscus-comments" /></section>;
}
