import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CONTENT_ROOT } from "./paths";
import { contentTypeSchema, defaultContentKind, frontmatterSchema, type ContentRecord, type ContentType } from "./schema";

function contentFiles(type: ContentType) {
  const directory = path.join(CONTENT_ROOT, type);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) return [path.join(directory, entry.name)];
    if (!entry.isDirectory()) return [];
    const nested = ["index.md", "index.mdx"].map((name) => path.join(directory, entry.name, name));
    return nested.find((file) => fs.existsSync(file)) ?? [];
  });
}

function slugFromFile(type: ContentType, file: string) {
  const relative = path.relative(path.join(CONTENT_ROOT, type), file);
  return relative.replace(/\/index\.mdx?$/, "").replace(/\.mdx?$/, "").replaceAll(path.sep, "/");
}

function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFile(type: ContentType, file: string): ContentRecord {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const data = frontmatterSchema.parse({ ...parsed.data, type: parsed.data.type ?? type, kind: parsed.data.kind ?? defaultContentKind(type) });
  const kind = data.kind ?? defaultContentKind(type);
  const body = parsed.content.trim();
  const text = plainText(body);
  return { ...data, kind, slug: slugFromFile(type, file), sourcePath: file, raw, body, plainText: text, readingTime: Math.max(1, Math.ceil(text.length / 500)) };
}

export function getAllContent(includeDrafts = false): ContentRecord[] {
  return contentTypeSchema.options.flatMap((type) => contentFiles(type).map((file) => parseFile(type, file)))
    .filter((entry) => includeDrafts || !entry.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime() || a.title.localeCompare(b.title));
}

export function getContentByType(type: ContentType, includeDrafts = false) {
  return getAllContent(includeDrafts).filter((entry) => entry.type === type);
}

export function getContentBySlug(type: ContentType, slug: string, includeDrafts = false) {
  return getAllContent(includeDrafts).find((entry) => entry.type === type && entry.slug === slug);
}
