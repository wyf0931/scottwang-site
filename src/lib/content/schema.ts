import { z } from "zod";

export const contentTypeSchema = z.enum(["writing", "notes", "thoughts"]);
export type ContentType = z.infer<typeof contentTypeSchema>;

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  type: contentTypeSchema,
  tags: z.array(z.string()).default([]),
  series: z.string().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  cover: z.string().optional(),
  canonical: z.string().url().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export type ContentRecord = Frontmatter & {
  slug: string;
  sourcePath: string;
  raw: string;
  body: string;
  plainText: string;
  readingTime: number;
};
