import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content/source";
import { contentPath } from "@/lib/content/paths";
import { site } from "@/lib/seo/site";
import { getAllProjects, projectPath } from "@/lib/content/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/writing", "/notes", "/thoughts", "/projects", "/about", "/tags", "/series", "/archive"].map((path) => ({ url: `${site.url}${path}`, lastModified: new Date() }));
  const content = getAllContent();
  const taxonomies = [...new Set(content.flatMap((entry) => entry.tags).map((tag) => `/tags/${encodeURIComponent(tag)}`)), ...new Set(content.flatMap((entry) => entry.series ? [`/series/${encodeURIComponent(entry.series)}`] : []))].map((path) => ({ url: `${site.url}${path}`, lastModified: new Date() }));
  const projects = getAllProjects().map((project) => ({ url: `${site.url}${projectPath(project.slug)}`, lastModified: project.date }));
  return [...fixed, ...taxonomies, ...projects, ...content.map((entry) => ({ url: `${site.url}${contentPath(entry.type, entry.slug)}`, lastModified: entry.updated ?? entry.date }))];
}
