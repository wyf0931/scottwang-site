import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { CONTENT_ROOT } from "./paths";

const SITES_ROOT = path.join(CONTENT_ROOT, "sites");

const siteSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  url: z.string().url(),
  github: z.string().regex(/^[^/\s]+\/[^/\s]+$/, "Expected a GitHub repository in owner/repo format").optional(),
  license: z.string().min(1).optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type SiteRecord = z.infer<typeof siteSchema> & { slug: string; body: string; raw: string };

// The sites collection curates external websites. A record carries metadata and a
// short note only; when a site is backed by a GitHub repository, the card embeds
// the shared GitHub block instead of duplicating repository facts here.
export function getAllSites(includeDrafts = false): SiteRecord[] {
  if (!fs.existsSync(SITES_ROOT)) return [];
  return fs.readdirSync(SITES_ROOT).filter((file) => file.endsWith(".md")).map((file): SiteRecord => {
    const raw = fs.readFileSync(path.join(SITES_ROOT, file), "utf8");
    const parsed = matter(raw);
    return { ...siteSchema.parse(parsed.data), slug: file.replace(/\.md$/, ""), body: parsed.content.trim(), raw };
  }).filter((site) => includeDrafts || !site.draft)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title));
}

export function getSiteBySlug(slug: string, includeDrafts = false) {
  return getAllSites(includeDrafts).find((site) => site.slug === slug);
}
