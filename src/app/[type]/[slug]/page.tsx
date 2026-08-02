import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/content/ArticleLayout";
import { renderMarkdown } from "@/lib/content/markdown";
import { getAllContent, getContentBySlug } from "@/lib/content/source";
import { contentTypeSchema } from "@/lib/content/schema";

export function generateStaticParams() { return getAllContent().map((entry) => ({ type: entry.type, slug: entry.slug })); }

export default async function ArticlePage({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  const parsed = contentTypeSchema.safeParse(type);
  if (!parsed.success) notFound();
  const entry = getContentBySlug(parsed.data, slug);
  if (!entry) notFound();
  const html = await renderMarkdown(entry.body);
  return <ArticleLayout entry={entry} html={html} />;
}
