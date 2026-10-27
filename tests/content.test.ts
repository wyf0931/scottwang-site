import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMdx } from "@/lib/content/markdown";
import { getAllContent, getContentBySlug, getContentByType } from "@/lib/content/source";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";
import { getAllSites, getSiteBySlug } from "@/lib/content/sites";
import { getAllSeries, getContentBySeries, getSeriesBySlug, getSeriesRegistry } from "@/lib/content/series";
import { seriesPath } from "@/lib/content/paths";

describe("content source", () => {
  it("loads public content in date order", () => {
    const entries = getAllContent();
    expect(entries.length).toBeGreaterThanOrEqual(4);
    expect(entries.every((entry) => !entry.draft)).toBe(true);
  });

  it("filters by type and resolves slugs", () => {
    expect(getContentByType("notes").map((entry) => entry.slug)).toEqual(expect.arrayContaining(["5w2h", "udp-packet", "media-embeds", "eternal-september", "fomo", "strix", "needle", "deeptutor", "book-vs-cangjie", "croc", "podman-vs-portainer", "colima", "ragflow", "saining-xie-interview", "lingyu-liu-interview", "he-xiaopeng-interview", "openshell", "agpl-3-0", "apache-2-0", "mit-license", "pdf-need-insight", "ruflo", "ruflo-agents"]));
    expect(getContentBySlug("thoughts", "draft-example")).toBeUndefined();
  });

  it("loads the UDP packet note", () => {
    expect(getContentBySlug("notes", "udp-packet")).toMatchObject({
      title: "UDP 数据包：轻量，但不替你保证可靠",
      kind: "note",
    });
  });

  it("includes OmniData as an active closed-source project", () => {
    expect(getAllProjects()).toHaveLength(8);
    expect(getProjectBySlug("omni-data")).toMatchObject({ status: "Active", visibility: "Closed Source", url: "https://data.ohmyagent.ai/" });
  });

  it("includes oma-drop as an open-source project", () => {
    expect(getProjectBySlug("oma-drop")).toMatchObject({
      status: "Active",
      visibility: "Open Source",
      repository: "https://github.com/wyf0931/oma-drop",
    });
  });

  it("includes oma-fetcher as an active open-source project", () => {
    expect(getProjectBySlug("oma-fetcher")).toMatchObject({
      status: "Active",
      visibility: "Open Source",
      featured: true,
      repository: "https://github.com/wyf0931/oma-fetcher",
    });
  });

  it("includes the three new open-source projects", () => {
    expect(getProjectBySlug("oma-watermark")).toMatchObject({
      status: "Active",
      visibility: "Open Source",
      repository: "https://github.com/wyf0931/oma-watermark",
    });
    expect(getProjectBySlug("mflux-webui")).toMatchObject({
      status: "Active",
      visibility: "Open Source",
      repository: "https://github.com/wyf0931/mflux-webui",
    });
    expect(getProjectBySlug("awesome-design-md-cn")).toMatchObject({
      status: "Active",
      visibility: "Open Source",
      repository: "https://github.com/wyf0931/awesome-design-md-cn",
    });
  });

  it("loads the curated sites collection", () => {
    expect(getAllSites()).toHaveLength(3);
    expect(getSiteBySlug("chinese-poetry")).toMatchObject({
      title: "中华古诗词数据库",
      url: "https://awesome-poetry.top/",
      github: "chinese-poetry/chinese-poetry",
      license: "MIT",
      licenseUrl: "https://spdx.org/licenses/MIT.html",
    });
    expect(getSiteBySlug("fde-guidance-book")).toMatchObject({
      title: "FDE: The Guidance Book of Forward Deployed Engineer",
      url: "https://fde4.ai/book/",
      github: "xdash/FDE-the-Guidance-Book-of-Forward-Deployed-Engineer",
      featured: true,
    });
    expect(getSiteBySlug("scikit-learn-user-guide")).toMatchObject({
      title: "scikit-learn User Guide",
      url: "https://scikit-learn.org/stable/user_guide.html",
      github: "scikit-learn/scikit-learn",
      licenseUrl: "https://spdx.org/licenses/BSD-3-Clause.html",
      featured: false,
    });
  });

  it("preserves native mark elements in MDX content", async () => {
    const content = await renderMdx("<p>保留 <mark>这段高亮</mark> 文本。</p>");

    expect(renderToStaticMarkup(content)).toContain("<mark>这段高亮</mark>");
  });
});

const FORBIDDEN_FRAME = /^(why|how|what)(\s*[，,。.、：:/]\s*.*)?$/;
const FORBIDDEN_GENERIC = /^(overview|details|background|introduction|intro|summary|conclusion|motivation)$/;
const FORBIDDEN_CN = /^(背景|方案|实现|功能|架构|概述|目标|关于|项目介绍|项目概述|项目简介|技术栈|使用方法|使用方式|安装说明|背景与动机|设计思路|解决方案|工作原理)$/;
const ALLOWED_EXACT = /^(小结|参考资料|来源|参考|references|reference|license|许可|许可协议)$/;

function frameworkSlotHeadings(markdown: string): string[] {
  const offenders: string[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^#{2,3} (.+)$/.exec(line.trim());
    if (!match) continue;
    const heading = match[1].trim();
    const lowered = heading.toLowerCase();
    if (ALLOWED_EXACT.test(lowered)) continue;
    if (FORBIDDEN_FRAME.test(lowered) || FORBIDDEN_GENERIC.test(lowered) || FORBIDDEN_CN.test(lowered)) {
      offenders.push(heading);
    }
  }
  return offenders;
}

describe("heading style", () => {
  it("keeps headings content-specific instead of framework slots", () => {
    const offenders: string[] = [];
    for (const dir of ["writing", "notes", "thoughts", "projects", "research"]) {
      const root = path.join(process.cwd(), "content", dir);
      if (!fs.existsSync(root)) continue;
      const walk = (current: string): string[] =>
        fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) return walk(full);
          return entry.name.endsWith(".md") ? [full] : [];
        });
      for (const file of walk(root)) {
        const rel = path.relative(process.cwd(), file);
        for (const heading of frameworkSlotHeadings(fs.readFileSync(file, "utf8"))) {
          offenders.push(`${rel}: ## ${heading}`);
        }
      }
    }
    expect(
      offenders,
      `headings name the framework slot instead of the content:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("rejects a framework name kept in front of the real topic", () => {
    expect(frameworkSlotHeadings("## Why，Agent 只是模型不够用\n\n正文。")).toEqual(["Why，Agent 只是模型不够用"]);
    expect(frameworkSlotHeadings("## What / curl_cffi 到底是什么\n\n正文。")).toEqual(["What / curl_cffi 到底是什么"]);
    expect(frameworkSlotHeadings("## 四级降级链和正文评估\n\n正文。")).toEqual([]);
    expect(frameworkSlotHeadings("## 小结\n\n正文。")).toEqual([]);
    expect(frameworkSlotHeadings("```markdown\n## Why\n```\n")).toEqual([]);
  });
});

// 营销味标题钩子：反转/对比、悬念缺口、动作化夸张、绝对化。
const TITLE_HOOKS = [
  "是两回事",
  "不是同一个东西",
  "而不是",
  "你以为",
  "其实",
  "到底",
  "竟然",
  "居然",
  "究竟",
  "差的那一步",
  "救回来",
  "值得吗",
  "塞进",
  "拆穿",
  "伸进",
  "看它怎么",
  "从一句话到",
  "从一句体验描述到",
  "永远不再",
  "依然管用",
  "真正的",
  "不是AI 家教",
  "把 AI 变成",
];

function titleHooks(title: string): string[] {
  return TITLE_HOOKS.filter((hook) => title.includes(hook));
}

describe("title style", () => {
  it("title is an objective label, not a hook", () => {
    const offenders: string[] = [];
    for (const dir of ["writing", "notes", "thoughts", "projects", "research"]) {
      const root = path.join(process.cwd(), "content", dir);
      if (!fs.existsSync(root)) continue;
      const walk = (current: string): string[] =>
        fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) return walk(full);
          return entry.name.endsWith(".md") ? [full] : [];
        });
      for (const file of walk(root)) {
        const text = fs.readFileSync(file, "utf8");
        const match = /^title:\s*"(.+)"\s*$/m.exec(text);
        if (!match) continue;
        const hooks = titleHooks(match[1]);
        if (hooks.length) {
          offenders.push(`${path.relative(process.cwd(), file)}: ${match[1]} (${hooks.join(", ")})`);
        }
      }
    }
    expect(
      offenders,
      `titles are written as attention hooks instead of objective labels:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("flags a hook title and lets an objective one pass", () => {
    expect(titleHooks("叙事学导论：讲什么和怎么讲，是两回事")).toContain("是两回事");
    expect(titleHooks("叙事学导论：Genette 的时间、视角与语态分类")).toEqual([]);
    expect(titleHooks("Strix：把 AI 变成渗透测试员，而不是更聪明的漏洞扫描器")).toEqual(["而不是", "把 AI 变成"]);
    expect(titleHooks("Strix：自动化渗透测试工作流的 AI Agent")).toEqual([]);
  });
});

describe("series registry", () => {
  it("keeps the grouping key, the URL slug, and the display title as separate values", () => {
    expect(getSeriesBySlug("agent-architecture")).toMatchObject({
      key: "Agent Architecture",
      slug: "agent-architecture",
      title: "Agent 架构",
      count: getContentBySeries("agent-architecture").length,
    });
    expect(getSeriesBySlug("data-judgment")).toMatchObject({ key: "data-judgment", slug: "data-judgment", title: "数据与判断" });
  });

  it("uses registry titles instead of the raw series value", () => {
    expect(getAllSeries().map((series) => series.title)).toEqual(expect.arrayContaining(["数据与判断", "OKR 与 KPI", "本地大模型", "Agent 架构"]));
  });

  it("registers every series used by content", () => {
    const registry = getSeriesRegistry();
    const used = new Set(getAllContent().flatMap((entry) => (entry.series ? [entry.series] : [])));

    expect(used.size).toBeGreaterThan(0);
    expect([...used].filter((key) => !registry.has(key))).toEqual([]);
  });

  it("links a series by slug and keeps every entry grouped under its key", () => {
    expect(seriesPath("agent-architecture")).toBe("/series/agent-architecture");
    expect(getContentBySeries("agent-architecture").map((entry) => entry.slug)).toEqual(["multi-agent-collaboration-patterns"]);
    expect(getContentBySeries("data-judgment").length).toBeGreaterThan(1);
    expect(getContentBySeries("data-judgment").every((entry) => entry.series === "data-judgment")).toBe(true);
  });
});
