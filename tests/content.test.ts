import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMdx } from "@/lib/content/markdown";
import { getAllContent, getContentBySlug, getContentByType } from "@/lib/content/source";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";
import { getAllBooks, getBookBySlug } from "@/lib/content/books";
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
    expect(getAllProjects()).toHaveLength(4);
    expect(getProjectBySlug("omni-data")).toMatchObject({ status: "Active", visibility: "Closed Source", url: "https://data.ohmyagent.ai/" });
  });

  it("includes oma-drop as an open-source project", () => {
    expect(getProjectBySlug("oma-drop")).toMatchObject({
      status: "Active",
      visibility: "Open Source",
      repository: "https://github.com/wyf0931/oma-drop",
    });
  });

  it("loads the curated books shelf", () => {
    expect(getAllBooks()).toHaveLength(1);
    expect(getBookBySlug("fde-guidance-book")).toMatchObject({
      title: "FDE: The Guidance Book of Forward Deployed Engineer",
      readerUrl: "https://fde4.ai/book/",
      draft: false,
    });
  });

  it("preserves native mark elements in MDX content", async () => {
    const content = await renderMdx("<p>保留 <mark>这段高亮</mark> 文本。</p>");

    expect(renderToStaticMarkup(content)).toContain("<mark>这段高亮</mark>");
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