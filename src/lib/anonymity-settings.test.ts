import { describe,expect,it } from "vitest";


describe("Custom Anonymous Username & Feed Visibility Logic", () => {
  describe("Anonymous Username validation", () => {
    const anonUsernameRegex = /^[a-z0-9_]{3,24}$/;

    it("accepts valid alphanumeric anonymous handles with underscores", () => {
      expect(anonUsernameRegex.test("ghost_runner")).toBe(true);
      expect(anonUsernameRegex.test("batman")).toBe(true);
      expect(anonUsernameRegex.test("campus_ninja_99")).toBe(true);
      expect(anonUsernameRegex.test("abc")).toBe(true);
    });

    it("rejects handles that are too short or too long", () => {
      expect(anonUsernameRegex.test("ab")).toBe(false);
      expect(anonUsernameRegex.test("a".repeat(25))).toBe(false);
    });

    it("rejects invalid characters, spaces, and uppercase", () => {
      expect(anonUsernameRegex.test("GhostRunner")).toBe(false);
      expect(anonUsernameRegex.test("ghost runner")).toBe(false);
      expect(anonUsernameRegex.test("ghost-runner")).toBe(false);
      expect(anonUsernameRegex.test("ghost@runner")).toBe(false);
    });
  });

  describe("Feed Visibility Modes", () => {
    type FeedVisibilityMode = "ALL" | "NON_ANONYMOUS";

    const mockPosts = [
      { id: "1", body: "Identified student post", isAnonymous: false },
      { id: "2", body: "Secret crush confession", isAnonymous: true, pseudonym: "ghost_runner" },
      { id: "3", body: "Campus question", isAnonymous: false },
      { id: "4", body: "Late night anonymous thought", isAnonymous: true, pseudonym: "anon_f18e9a2b" },
    ];

    function filterPostsByVisibility(posts: typeof mockPosts, mode: FeedVisibilityMode) {
      if (mode === "NON_ANONYMOUS") {
        return posts.filter((p) => !p.isAnonymous);
      }
      return posts;
    }

    it("shows all types of posts in ALL mode", () => {
      const results = filterPostsByVisibility(mockPosts, "ALL");
      expect(results.length).toBe(4);
      expect(results.some((p) => p.isAnonymous)).toBe(true);
    });

    it("hides all anonymous posts and confessions in NON_ANONYMOUS mode", () => {
      const results = filterPostsByVisibility(mockPosts, "NON_ANONYMOUS");
      expect(results.length).toBe(2);
      expect(results.every((p) => !p.isAnonymous)).toBe(true);
      expect(results.map((p) => p.id)).toEqual(["1", "3"]);
    });
  });
});
