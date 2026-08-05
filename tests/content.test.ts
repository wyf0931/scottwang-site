import { describe, expect, it } from "vitest";
import { getAllContent, getContentBySlug, getContentByType } from "@/lib/content/source";

describe("content source", () => {
  it("loads public content in date order", () => {
    const entries = getAllContent();
    expect(entries.length).toBeGreaterThanOrEqual(4);
    expect(entries.find((entry) => entry.featured)?.title).toBe("Building Agent Systems That Compound");
    expect(entries.every((entry) => !entry.draft)).toBe(true);
  });

  it("filters by type and resolves slugs", () => {
    expect(getContentByType("notes").map((entry) => entry.slug)).toEqual(expect.arrayContaining(["nextjs-mdx-patterns", "media-embeds"]));
    expect(getContentBySlug("thoughts", "why-build-in-public")?.type).toBe("thoughts");
    expect(getContentBySlug("thoughts", "draft-example")).toBeUndefined();
  });

  it("supports canonical kinds and resource metadata", () => {
    const resource = getContentBySlug("notes", "agent-resources");
    expect(resource?.kind).toBe("resource");
    expect(resource?.resourceType).toBe("github");
    expect(resource?.resourceUrl).toContain("github.com");
  });
});
