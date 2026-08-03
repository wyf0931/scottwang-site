import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const publicRoot = path.join(root, "public", "og");

function escapeXml(value) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;"); }
function wrap(value, max = 18) {
  const chars = [...value];
  const lines = [];
  for (let index = 0; index < chars.length; index += max) lines.push(chars.slice(index, index + max).join(""));
  return lines.slice(0, 4);
}
function render({ title, type, label, accent = "#111111" }) {
  const lines = wrap(title);
  const titleSvg = lines.map((line, index) => `<text x="94" y="${270 + index * 68}" fill="#111111" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans SC',sans-serif" font-size="56" font-weight="700" letter-spacing="-2">${escapeXml(line)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fafafa"/><path d="M0 96H1200M0 534H1200" stroke="#e5e5e5"/><path d="M96 0V630M1104 0V630" stroke="#e5e5e5"/><rect x="94" y="78" width="28" height="28" fill="${accent}"/><text x="142" y="101" fill="#555" font-family="ui-monospace,SFMono-Regular,monospace" font-size="18" letter-spacing="3">SCOTTWANG / ${escapeXml(type.toUpperCase())}</text>${titleSvg}<text x="94" y="566" fill="#777" font-family="ui-monospace,SFMono-Regular,monospace" font-size="16" letter-spacing="2">${escapeXml(label)}</text><text x="1104" y="566" text-anchor="end" fill="#111" font-family="ui-monospace,SFMono-Regular,monospace" font-size="16">OHMYCLAW.CN</text></svg>`;
}
function write(kind, slug, data) {
  const output = path.join(publicRoot, kind, `${slug}.svg`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, render(data));
}
function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isFile() && entry.name.endsWith(".md")) return [{ slug: entry.name.replace(/\.md$/, ""), file: path.join(directory, entry.name) }];
    if (entry.isDirectory()) { const file = path.join(directory, entry.name, "index.md"); return fs.existsSync(file) ? [{ slug: entry.name, file }] : []; }
    return [];
  });
}
for (const type of ["writing", "notes", "thoughts"]) for (const { slug, file } of markdownFiles(path.join(root, "content", type))) {
  const data = matter(fs.readFileSync(file, "utf8"));
  if (data.data.draft === true) continue;
  write(path.join("content", type), slug, { title: data.data.title, type, label: data.data.description ?? "Technical notes and field reports" });
}
for (const kind of ["projects", "research"]) for (const { slug, file } of markdownFiles(path.join(root, "content", kind))) {
  const data = matter(fs.readFileSync(file, "utf8"));
  if (kind === "research" && data.data.status !== "Published") continue;
  write(kind, slug, { title: data.data.title, type: kind === "research" ? "research report" : "project", label: data.data.industry ?? data.data.visibility ?? "Systems in motion" });
}
