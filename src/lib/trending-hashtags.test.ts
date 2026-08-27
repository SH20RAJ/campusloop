import { describe,expect,it } from "vitest";
import { getTrendingHashtags } from "./trending-hashtags";

describe("trending-hashtags engine", () => {
  it("returns curated and database trending hashtags", async () => {
    const list = await getTrendingHashtags({ limit: 8 });
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(8);

    const first = list[0];
    expect(first.tag.startsWith("#")).toBe(true);
    expect(first.count).toBeGreaterThan(0);
    expect(first.formattedCount).toBeDefined();
    expect(first.category).toBeDefined();
  });

  it("filters hashtags by query prefix", async () => {
    const list = await getTrendingHashtags({ query: "tech", limit: 5 });
    expect(list.length).toBeGreaterThan(0);
    for (const item of list) {
      expect(item.tag.toLowerCase()).toContain("tech");
    }
  });

  it("handles query starting with hash symbol #", async () => {
    const list = await getTrendingHashtags({ query: "#hostel", limit: 5 });
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((item) => item.tag.toLowerCase().includes("hostel"))).toBe(true);
  });

  it("assigns valid sources", async () => {
    const list = await getTrendingHashtags({ limit: 10 });
    for (const item of list) {
      expect(["campus", "social", "global"]).toContain(item.source);
    }
  });
});
