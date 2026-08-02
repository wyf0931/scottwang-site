import path from "node:path";
import type { ContentType } from "./schema";

export const CONTENT_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "content");

export function contentPath(type: ContentType, slug: string) {
  return `/${type}/${slug}`;
}

export function markdownPath(type: ContentType, slug: string) {
  return `${contentPath(type, slug)}.md`;
}
