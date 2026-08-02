import { describe, expect, it } from "vitest";
import { getAllContent, getContentBySlug, getContentByType } from "@/lib/content/source";

describe("content source", () => {
  it("loads public content in date order", () => {
    const entries = getAllContent();
    expect(entries.length).toBe(3);
    expect(entries[0].title).toBe("Building Agent Systems That Compound");
    expect(entries.every((entry) => !entry.draft)).toBe(true);
  });

  it("filters by type and resolves slugs", () => {
    expect(getContentByType("notes")).toHaveLength(1);
    expect(getContentBySlug("thoughts", "why-build-in-public")?.type).toBe("thoughts");
    expect(getContentBySlug("thoughts", "draft-example")).toBeUndefined();
  });
});
