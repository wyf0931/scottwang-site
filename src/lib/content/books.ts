import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const BOOKS_ROOT = path.join(process.cwd(), "content", "books");

const bookSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  author: z.string().min(1),
  language: z.string().min(1),
  status: z.enum(["Reading", "Recommended", "Reference"]).default("Recommended"),
  tags: z.array(z.string()).default([]),
  sourceUrl: z.string().url(),
  readerUrl: z.string().url(),
  licenseNote: z.string().min(1),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type BookRecord = z.infer<typeof bookSchema> & { slug: string; body: string; raw: string };

function files() {
  if (!fs.existsSync(BOOKS_ROOT)) return [];
  return fs.readdirSync(BOOKS_ROOT).filter((file) => file.endsWith(".md"));
}

export function getAllBooks(includeDrafts = false) {
  return files().map((file): BookRecord => {
    const raw = fs.readFileSync(path.join(BOOKS_ROOT, file), "utf8");
    const parsed = matter(raw);
    return { ...bookSchema.parse(parsed.data), slug: file.replace(/\.md$/, ""), body: parsed.content.trim(), raw };
  }).filter((book) => includeDrafts || !book.draft).sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title));
}

export function getBookBySlug(slug: string, includeDrafts = false) {
  return getAllBooks(includeDrafts).find((book) => book.slug === slug);
}

export function booksPath() {
  return "/books";
}
