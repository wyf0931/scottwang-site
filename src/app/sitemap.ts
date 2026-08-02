import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content/source";
import { contentPath } from "@/lib/content/paths";
import { site } from "@/lib/seo/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/writing", "/notes", "/thoughts", "/about"].map((path) => ({ url: `${site.url}${path}`, lastModified: new Date() }));
  return [...fixed, ...getAllContent().map((entry) => ({ url: `${site.url}${contentPath(entry.type, entry.slug)}`, lastModified: entry.updated ?? entry.date }))];
}
