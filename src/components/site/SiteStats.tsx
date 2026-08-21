"use client";

import { useEffect, useState } from "react";

type SiteStats = { pageviews: number; visitors: number };

export function SiteStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
    const shareId = process.env.NEXT_PUBLIC_UMAMI_SHARE_ID;
    if (!websiteId || !shareId) return;

    const apiUrl = (process.env.NEXT_PUBLIC_UMAMI_API_URL ?? "https://cloud.umami.is").replace(/\/$/, "");
    const params = new URLSearchParams({ startAt: "0", endAt: String(Date.now()) });
    let active = true;
    fetch(`${apiUrl}/api/websites/${encodeURIComponent(websiteId)}/stats?${params}`, {
      headers: { "x-umami-share-token": shareId },
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data: SiteStats | null) => {
        if (active && data && Number.isFinite(data.pageviews) && Number.isFinite(data.visitors)) setStats(data);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!stats) return null;
  return <span className="site-stats" aria-label="站点访问统计">
    <span>总访问量 {stats.pageviews.toLocaleString("zh-CN")}</span>
    <span>独立访客 {stats.visitors.toLocaleString("zh-CN")}</span>
  </span>;
}
