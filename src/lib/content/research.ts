import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const RESEARCH_ROOT = path.join(process.cwd(), "content", "research");
const sourceSchema = z.object({ title: z.string().min(1), url: z.string().url(), publishedAt: z.coerce.date().optional() });
const researchSchema = z.object({
  title: z.string().min(1), description: z.string().min(1), date: z.coerce.date(), updated: z.coerce.date().optional(),
  topic: z.string().min(1), industry: z.string().min(1), tags: z.array(z.string()).default([]),
  status: z.enum(["Draft", "Review", "Published"]), featured: z.boolean().default(false), sources: z.array(sourceSchema).default([]),
});

export type ResearchRecord = z.infer<typeof researchSchema> & { slug: string; body: string; raw: string };

function files() { return fs.existsSync(RESEARCH_ROOT) ? fs.readdirSync(RESEARCH_ROOT).filter((file) => file.endsWith(".md")) : []; }

export function getAllResearch(includeUnpublished = false) {
  return files().map((file): ResearchRecord => {
    const raw = fs.readFileSync(path.join(RESEARCH_ROOT, file), "utf8");
    const parsed = matter(raw);
    return { ...researchSchema.parse(parsed.data), slug: file.replace(/\.md$/, ""), body: parsed.content.trim(), raw };
  }).filter((report) => includeUnpublished || report.status === "Published").sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getResearchBySlug(slug: string, includeUnpublished = false) { return getAllResearch(includeUnpublished).find((report) => report.slug === slug); }
export function researchPath(slug: string) { return `/research/${slug}`; }
export function researchMarkdownPath(slug: string) { return `${researchPath(slug)}.md`; }
