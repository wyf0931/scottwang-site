import { z } from "zod";

export const contentTypeSchema = z.enum(["writing", "notes", "thoughts"]);
export type ContentType = z.infer<typeof contentTypeSchema>;
export const contentKindSchema = z.enum(["essay", "note", "thought", "resource"]);
export type ContentKind = z.infer<typeof contentKindSchema>;
export const resourceTypeSchema = z.enum(["github", "youtube", "bilibili", "course", "website", "upload"]);
export type ResourceType = z.infer<typeof resourceTypeSchema>;

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  type: contentTypeSchema,
  kind: contentKindSchema.optional(),
  resourceType: resourceTypeSchema.optional(),
  resourceUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  series: z.string().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  cover: z.string().optional(),
  canonical: z.string().url().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export type ContentRecord = Frontmatter & {
  kind: ContentKind;
  slug: string;
  sourcePath: string;
  raw: string;
  body: string;
  plainText: string;
  readingTime: number;
};

export function defaultContentKind(type: ContentType): Exclude<ContentKind, "resource"> {
  return type === "writing" ? "essay" : type === "notes" ? "note" : "thought";
}
