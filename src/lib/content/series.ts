import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { CONTENT_ROOT } from "./paths";
import { getAllContent } from "./source";
import type { ContentRecord } from "./schema";

const SERIES_ROOT = path.join(CONTENT_ROOT, "series");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const seriesSchema = z.object({
  // The exact value articles put in `series:` frontmatter. It is the grouping key.
  series: z.string().min(1),
  // The URL segment. Defaults to `series` and must stay a lowercase kebab-case slug.
  slug: z.string().regex(slugPattern, "Expected a lowercase kebab-case slug, for example agent-architecture").optional(),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
});

export type SeriesRegistryEntry = z.infer<typeof seriesSchema>;
export type SeriesRecord = { key: string; slug: string; title: string; description?: string; count: number };

// A series keeps one stable URL segment and one display title. The grouping key,
// the URL, and the title are separate fields, so renaming a title never moves a URL
// and the key may keep the legacy wording articles already use.
export function getSeriesRegistry() {
  const registry = new Map<string, SeriesRegistryEntry>();
  const slugs = new Map<string, string>();
  if (!fs.existsSync(SERIES_ROOT)) return registry;
  for (const file of fs.readdirSync(SERIES_ROOT).filter((name) => name.endsWith(".md"))) {
    const source = path.join(SERIES_ROOT, file);
    const entry = seriesSchema.parse(matter(fs.readFileSync(source, "utf8")).data);
    const slug = entry.slug ?? entry.series;
    if (!slugPattern.test(slug)) throw new Error(`${source}: series "${entry.series}" needs an explicit lowercase kebab-case slug`);
    if (registry.has(entry.series)) throw new Error(`${source}: duplicate series key "${entry.series}"`);
    if (slugs.has(slug)) throw new Error(`${source}: duplicate series slug "${slug}", already used by ${slugs.get(slug)}`);
    registry.set(entry.series, { ...entry, slug });
    slugs.set(slug, source);
  }
  return registry;
}

export function getAllSeries(includeDrafts = false): SeriesRecord[] {
  const registry = getSeriesRegistry();
  const usage = new Map<string, { count: number; sources: string[] }>();
  for (const entry of getAllContent(includeDrafts)) {
    if (!entry.series) continue;
    const current = usage.get(entry.series) ?? { count: 0, sources: [] };
    usage.set(entry.series, { count: current.count + 1, sources: [...current.sources, entry.sourcePath] });
  }
  return [...usage.entries()]
    .map(([key, { count, sources }]) => {
      const record = registry.get(key);
      if (!record) throw new Error(`Unknown series "${key}" used by ${sources.join(", ")}. Add a registry file in content/series with series: "${key}".`);
      return { key, slug: record.slug ?? key, title: record.title, description: record.description, count };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "zh") || a.slug.localeCompare(b.slug));
}

export function getSeriesBySlug(slug: string, includeDrafts = false) {
  return getAllSeries(includeDrafts).find((series) => series.slug === slug);
}

// Within a series, entries with an explicit `order` sort first (ascending); entries
// without one follow, newest first, then by title. This keeps a series navigable in
// its intended teaching sequence rather than by publication date.
function bySeriesOrder(a: ContentRecord, b: ContentRecord) {
  return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
    || b.date.getTime() - a.date.getTime()
    || a.title.localeCompare(b.title);
}

// All public content for a series key, in its intended order.
export function getOrderedSeriesContent(key: string, includeDrafts = false): ContentRecord[] {
  return getAllContent(includeDrafts).filter((entry) => entry.series === key).sort(bySeriesOrder);
}

export function getContentBySeries(slug: string, includeDrafts = false) {
  const record = getSeriesBySlug(slug, includeDrafts);
  return record ? getOrderedSeriesContent(record.key, includeDrafts) : [];
}
