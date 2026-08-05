import { getAllContent } from "@/lib/content/source";
import { contentPath } from "@/lib/content/paths";
import { site } from "@/lib/seo/site";
import { getAllProjects, projectPath } from "@/lib/content/projects";
import { getAllResearch, researchPath } from "@/lib/content/research";

export const dynamic = "force-static";

export function GET() {
  const documents: Array<{ id: string; title: string; description: string; body: string; type: string; tags: string; date: string; url: string }> = getAllContent().map((entry) => ({
    id: `${entry.type}-${entry.slug}`,
    title: entry.title,
    description: entry.description,
    body: entry.plainText,
    type: entry.kind as string,
    tags: [entry.kind, entry.resourceType, ...entry.tags].filter(Boolean).join(" "),
    date: entry.date.toISOString(),
    url: `${site.url}${contentPath(entry.type, entry.slug)}`,
  })).concat(getAllProjects().map((project) => ({ id: `project-${project.slug}`, title: project.title, description: project.description, body: project.body, type: "projects", tags: `${project.visibility} ${project.stack.join(" ")}`, date: project.date.toISOString(), url: `${site.url}${projectPath(project.slug)}` }))).concat(getAllResearch().map((report) => ({ id: `research-${report.slug}`, title: report.title, description: report.description, body: report.body, type: "research", tags: `${report.industry} ${report.topic} ${report.tags.join(" ")}`, date: report.date.toISOString(), url: `${site.url}${researchPath(report.slug)}` })));
  return Response.json(documents, { headers: { "Cache-Control": "public, max-age=3600" } });
}
