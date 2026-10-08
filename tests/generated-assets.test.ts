import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllContent } from "@/lib/content/source";
import { getAllProjects } from "@/lib/content/projects";
import { contentOgImagePath } from "@/lib/seo/site";

// Run a prebuild generator against a copy of `content/` so the test never writes
// into the repository's own `public/` directory.
function generate(script: string) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "scottwang-generated-"));
  fs.cpSync(path.join(process.cwd(), "content"), path.join(root, "content"), { recursive: true });
  fs.mkdirSync(path.join(root, "public", "research"), { recursive: true });
  fs.mkdirSync(path.join(root, "public", "resources", "research"), { recursive: true });
  fs.mkdirSync(path.join(root, "public", "og", "research"), { recursive: true });
  fs.writeFileSync(path.join(root, "public", "research", "stale.md"), "stale");
  fs.writeFileSync(path.join(root, "public", "resources", "research", "stale.md"), "stale");
  fs.writeFileSync(path.join(root, "public", "og", "research", "stale.svg"), "stale");
  execFileSync(process.execPath, [path.join(process.cwd(), "scripts", script)], { cwd: root, stdio: "pipe" });
  return root;
}

describe("generated assets", () => {
  it("writes an OG image for every published entry at the path the pages reference", () => {
    const root = generate("generate-og-images.mjs");
    const expected = [
      ...getAllContent().map((entry) => contentOgImagePath(entry.type, entry.slug)),
      ...getAllProjects().map((project) => contentOgImagePath("projects", project.slug)),
    ];

    expect(expected.length).toBeGreaterThan(0);
    expect(expected.filter((url) => !fs.existsSync(path.join(root, "public", url)))).toEqual([]);
    expect(fs.existsSync(path.join(root, "public", "og", "research"))).toBe(false);
  });

  it("writes raw markdown for every published entry and skips drafts", () => {
    const root = generate("generate-public-content.mjs");
    const expected = getAllContent().map((entry) => `/${entry.type}/${entry.slug}.md`);

    expect(expected.length).toBeGreaterThan(0);
    expect(expected.filter((url) => !fs.existsSync(path.join(root, "public", url)))).toEqual([]);
    expect(fs.existsSync(path.join(root, "public", "thoughts", "draft-example.md"))).toBe(false);
    expect(fs.existsSync(path.join(root, "public", "research"))).toBe(false);
    expect(fs.existsSync(path.join(root, "public", "resources", "research"))).toBe(false);
  });
});
