import fs from "node:fs";
import path from "node:path";

export type GithubRepo = {
  slug: string;
  fullName: string;
  name: string;
  url: string;
  owner: string;
  avatarUrl?: string;
  description?: string;
  stars?: number;
  language?: string;
  forks?: number;
  updatedAt?: string;
};

const DATA_FILE = path.join(process.cwd(), ".generated", "github-repos.json");

function records(): GithubRepo[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as GithubRepo[]; } catch { return []; }
}

export function getGithubRepo(slug: string): GithubRepo {
  const cached = records().find((repo) => repo.slug === slug);
  return cached ?? { slug, fullName: slug, name: slug.split("/")[1] ?? slug, owner: slug.split("/")[0] ?? slug, url: `https://github.com/${slug}` };
}
