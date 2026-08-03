import Link from "next/link";
import { getAllProjects, projectPath } from "@/lib/content/projects";

export const metadata = { title: "Projects", description: "ScottWang 正在构建、探索或维护的个人项目。" };

export default function ProjectsPage() {
  return <section className="projects-page"><p className="eyebrow accent">/ systems in motion</p><h1>Projects</h1><p className="lead">一些正在构建、探索，或已经沉淀下来的系统。公开程度取决于项目本身。</p><div className="project-grid">{getAllProjects().map((project) => <ProjectCard key={project.slug} project={project} />)}</div></section>;
}

export function ProjectCard({ project }: { project: ReturnType<typeof getAllProjects>[number] }) {
  return <article className="project-card"><div className="project-meta"><span>{project.status}</span><span>{project.visibility}</span></div><h2><Link href={projectPath(project.slug)}>{project.title}</Link></h2><p>{project.description}</p><div className="tag-row">{project.stack.map((item) => <span key={item}>{item}</span>)}</div><div className="project-links"><Link href={projectPath(project.slug)}>View project →</Link>{project.repository && <a href={project.repository} target="_blank" rel="noreferrer">GitHub ↗</a>}{project.url && <a href={project.url} target="_blank" rel="noreferrer">Open ↗</a>}</div></article>;
}
