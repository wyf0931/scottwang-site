import { getAllContent } from "@/lib/content/source";
import { contentPath } from "@/lib/content/paths";
import { site } from "@/lib/seo/site";

export const dynamic = "force-static";

export function GET() {
  const documents = getAllContent().map((entry) => ({
    id: `${entry.type}-${entry.slug}`,
    title: entry.title,
    description: entry.description,
    body: entry.plainText,
    type: entry.type,
    tags: entry.tags.join(" "),
    date: entry.date.toISOString(),
    url: `${site.url}${contentPath(entry.type, entry.slug)}`,
  }));
  return Response.json(documents, { headers: { "Cache-Control": "public, max-age=3600" } });
}
