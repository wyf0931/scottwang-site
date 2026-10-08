import { getAllContent } from "@/lib/content/source";
import { contentPath } from "@/lib/content/paths";
import { site } from "@/lib/seo/site";

export const dynamic = "force-static";

export function GET() {
  const items = getAllContent().map((entry) => `<item><title><![CDATA[${entry.title}]]></title><link>${site.url}${contentPath(entry.type, entry.slug)}</link><guid>${site.url}${contentPath(entry.type, entry.slug)}</guid><description><![CDATA[${entry.description}]]></description><pubDate>${entry.date.toUTCString()}</pubDate></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${site.name}</title><link>${site.url}</link><description>${site.description}</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
