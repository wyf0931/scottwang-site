import { describe, expect, it } from "vitest";
import { getAllContent, getContentBySlug, getContentByType } from "@/lib/content/source";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";

describe("content source", () => {
  it("loads public content in date order", () => {
    const entries = getAllContent();
    expect(entries.length).toBeGreaterThanOrEqual(4);
    expect(entries.every((entry) => !entry.draft)).toBe(true);
  });

  it("filters by type and resolves slugs", () => {
    expect(getContentByType("notes").map((entry) => entry.slug)).toEqual(expect.arrayContaining(["5w2h", "udp-packet", "media-embeds", "eternal-september", "fomo"]));
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
});
