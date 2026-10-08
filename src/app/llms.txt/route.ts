import { getAllContent } from "@/lib/content/source";
import { contentPath, markdownPath, seriesPath } from "@/lib/content/paths";
import { getAllSeries } from "@/lib/content/series";
import { site } from "@/lib/seo/site";
import { getAllProjects, projectPath } from "@/lib/content/projects";
import { getAllSites } from "@/lib/content/sites";

export const dynamic = "force-static";

export function GET() {
  const entries = getAllContent().map((entry) => `- [${entry.title}](${site.url}${contentPath(entry.type, entry.slug)}): ${entry.description}\n  Markdown: ${site.url}${markdownPath(entry.type, entry.slug)}`).join("\n");
  const projects = getAllProjects().map((project) => `- [${project.title}](${site.url}${projectPath(project.slug)}): ${project.description} [${project.visibility}]`).join("\n");
  const sites = getAllSites().map((entry) => `- [${entry.title}](${entry.url}): ${entry.description}${entry.github ? `\n  GitHub: https://github.com/${entry.github}` : ""}${entry.license ? `\n  License: ${entry.license}` : ""}`).join("\n");
  const series = getAllSeries().map((entry) => `- [${entry.title}](${site.url}${seriesPath(entry.slug)}): ${entry.count} published items${entry.description ? `; ${entry.description}` : ""}`).join("\n");
  const body = `# ${site.name}\n\n> ${site.description}\n\n## Author\n\nScottWang 是一名专注于 AI 与 Agent 架构的技术架构师。\n\n## Sections\n\n- Home: ${site.url}/\n- Content: ${site.url}/content\n- Writing (legacy view): ${site.url}/writing\n- Notes (legacy view): ${site.url}/notes\n- Thoughts (legacy view): ${site.url}/thoughts\n- Projects: ${site.url}/projects\n- Sites: ${site.url}/sites\n\n## Content model\n\nContent kinds are Essay, Note, Thought, and Resource. Tags describe topics. Resources may link to GitHub, YouTube, Bilibili, courses, websites, or uploaded files.\n\n## Series\n\n${series}\n\n## Projects\n\n${projects}\n\n## Sites\n\n${sites}\n\n## Published content\n\n${entries}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
