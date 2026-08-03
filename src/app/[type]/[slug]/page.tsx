import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/content/ArticleLayout";
import { renderMdx } from "@/lib/content/markdown";
import { getAllContent, getContentBySlug } from "@/lib/content/source";
import { contentTypeSchema } from "@/lib/content/schema";
import { articleStructuredData, site } from "@/lib/seo/site";
import type { Metadata } from "next";

export function generateStaticParams() { return getAllContent().map((entry) => ({ type: entry.type, slug: entry.slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ type: string; slug: string }> }): Promise<Metadata> {
  const { type, slug } = await params;
  const parsed = contentTypeSchema.safeParse(type);
  const entry = parsed.success ? getContentBySlug(parsed.data, slug) : undefined;
  if (!entry) return {};
  return { title: entry.title, description: entry.description, alternates: { canonical: `/${entry.type}/${entry.slug}` }, openGraph: { type: "article", title: entry.title, description: entry.description, publishedTime: entry.date.toISOString(), modifiedTime: (entry.updated ?? entry.date).toISOString(), url: `${site.url}/${entry.type}/${entry.slug}`, images: ["/og.svg"] }, twitter: { card: "summary_large_image", title: entry.title, description: entry.description, images: ["/og.svg"] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  const parsed = contentTypeSchema.safeParse(type);
  if (!parsed.success) notFound();
  const entry = getContentBySlug(parsed.data, slug);
  if (!entry) notFound();
  const content = await renderMdx(entry.body);
  return <ArticleLayout entry={entry} content={content} structuredData={articleStructuredData(entry)} />;
}
