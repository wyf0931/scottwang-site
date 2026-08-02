import { getAllContent } from "@/lib/content/source";
import { contentPath, markdownPath } from "@/lib/content/paths";
import { site } from "@/lib/seo/site";

export const dynamic = "force-static";

export function GET() {
  const entries = getAllContent().map((entry) => `- [${entry.title}](${site.url}${contentPath(entry.type, entry.slug)}): ${entry.description}\n  Markdown: ${site.url}${markdownPath(entry.type, entry.slug)}`).join("\n");
  const body = `# ${site.name}\n\n> ${site.description}\n\n## Author\n\n王云飞（ScottWang）是一名专注于 AI 与 Agent 架构的技术架构师。\n\n## Sections\n\n- Home: ${site.url}/\n- About: ${site.url}/about.md\n- Writing: ${site.url}/writing\n- Notes: ${site.url}/notes\n- Thoughts: ${site.url}/thoughts\n\n## Published content\n\n${entries}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
