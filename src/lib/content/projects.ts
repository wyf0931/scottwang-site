import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const PROJECT_ROOT = path.join(process.cwd(), "content", "projects");
const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  status: z.enum(["Active", "Archived", "Exploring"]),
  visibility: z.enum(["Open Source", "Private", "Closed Source"]),
  stack: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  url: z.string().url().optional(),
  repository: z.string().url().optional(),
});

export type ProjectRecord = z.infer<typeof projectSchema> & { slug: string; body: string };

function files() {
  if (!fs.existsSync(PROJECT_ROOT)) return [];
  return fs.readdirSync(PROJECT_ROOT).filter((file) => file.endsWith(".md"));
}

export function getAllProjects() {
  return files().map((file): ProjectRecord => {
    const raw = fs.readFileSync(path.join(PROJECT_ROOT, file), "utf8");
    const parsed = matter(raw);
    return { ...projectSchema.parse(parsed.data), slug: file.replace(/\.md$/, ""), body: parsed.content.trim() };
  }).sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title));
}

export function getProjectBySlug(slug: string) {
  return getAllProjects().find((project) => project.slug === slug);
}

export function projectPath(slug: string) {
  return `/projects/${slug}`;
}
