import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const outputDir = path.join(root, ".generated");
const outputFile = path.join(outputDir, "github-repos.json");
const contentRoot = path.join(root, "content");
const types = ["writing", "notes", "thoughts"];
const repositories = new Set();

for (const type of types) {
  const directory = path.join(contentRoot, type);
  if (!fs.existsSync(directory)) continue;
  for (const file of fs.readdirSync(directory)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(directory, file), "utf8");
    const github = matter(raw).data.github;
    if (typeof github === "string" && /^[^/\s]+\/[^/\s]+$/.test(github)) repositories.add(github);
  }
}

const previous = fs.existsSync(outputFile) ? JSON.parse(fs.readFileSync(outputFile, "utf8")) : [];
const previousBySlug = new Map(previous.map((repo) => [repo.slug, repo]));
const results = [];

for (const slug of repositories) {
  const fallback = previousBySlug.get(slug) ?? { slug, fullName: slug, name: slug.split("/")[1], owner: slug.split("/")[0], url: `https://github.com/${slug}` };
  try {
    const response = await fetch(`https://api.github.com/repos/${slug}`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "scottwang-site-build" } });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const data = await response.json();
    results.push({ slug, fullName: data.full_name, name: data.name, owner: data.owner?.login ?? slug.split("/")[0], avatarUrl: data.owner?.avatar_url, url: data.html_url, description: data.description, stars: data.stargazers_count, language: data.language, forks: data.forks_count, updatedAt: data.updated_at });
    console.log(`[github] refreshed ${slug}`);
  } catch (error) {
    results.push(fallback);
    console.warn(`[github] using cached metadata for ${slug}: ${error.message}`);
  }
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(results, null, 2)}\n`);
