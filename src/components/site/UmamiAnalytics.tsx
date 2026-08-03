"use client";

import { useEffect } from "react";

export function UmamiAnalytics() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
    const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
    if (!websiteId || !scriptUrl || document.querySelector("script[data-website-id]")) return;
    const script = document.createElement("script");
    script.defer = true;
    script.src = scriptUrl;
    script.dataset.websiteId = websiteId;
    script.dataset.doNotTrack = "true";
    document.head.appendChild(script);
  }, []);
  return null;
}
