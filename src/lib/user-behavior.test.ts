import { describe, expect, it } from "vitest";
import { getUserAffinityInterests, trackUserBehavior } from "./user-behavior";

describe("User Behavior Analytics & Upstash Redis Engine", () => {
  it("safely handles tracking without crashing in any environment", async () => {
    await expect(
      trackUserBehavior({
        userId: "test-user-1",
        eventType: "POST_VIEW",
        targetType: "POST",
        targetId: "post-123",
        metadata: { dwellMs: 4500, interests: ["tech", "startups"] },
        weight: 2,
      })
    ).resolves.toBeUndefined();
  });

  it("handles interest extraction gracefully even without active Redis instance", async () => {
    const interests = await getUserAffinityInterests("test-user-1");
    expect(Array.isArray(interests)).toBe(true);
  });
});
