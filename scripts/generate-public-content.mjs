import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const publicRoot = path.join(root, "public");
const types = ["writing", "notes", "thoughts"];

for (const type of types) {
  const sourceDir = path.join(contentRoot, type);
  const outputDir = path.join(publicRoot, type);
  fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(sourceDir)) continue;
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const source = entry.isDirectory()
      ? ["index.md", "index.mdx"].map((name) => path.join(sourceDir, entry.name, name)).find((file) => fs.existsSync(file))
      : /\.md$/.test(entry.name) ? path.join(sourceDir, entry.name) : undefined;
    if (!source) continue;
    const raw = fs.readFileSync(source, "utf8");
    if (/^draft:\s*true\s*$/m.test(raw)) continue;
    const slug = entry.isDirectory() ? entry.name : entry.name.replace(/\.md$/, "");
    fs.writeFileSync(path.join(outputDir, `${slug}.md`), raw);
  }
}
