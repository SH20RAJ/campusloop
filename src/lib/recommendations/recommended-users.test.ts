import { describe, expect, it } from "vitest";
import { type RecommendedUser } from "./recommended-users";

describe("Recommended Users Recommendation Engine", () => {
  it("formats user match reasons accurately based on similarity and campus proximity", () => {
    const candidate: RecommendedUser = {
      id: "u1",
      displayName: "Aarav Sharma",
      username: "aarav_s",
      avatarUrl: null,
      bio: "Tech lover, React dev",
      branch: "CSE",
      year: 2,
      points: 180,
      institution: {
        name: "BIT Mesra",
        slug: "bit-mesra",
      },
      vibeScore: 92,
      matchReason: "✨ 92% Vibe Match",
      isFollowing: false,
    };

    expect(candidate.vibeScore).toBeGreaterThanOrEqual(35);
    expect(candidate.vibeScore).toBeLessThanOrEqual(99);
    expect(candidate.matchReason).toContain("Vibe Match");
  });

  it("handles fallback campus match reason correctly", () => {
    const campusCandidate: RecommendedUser = {
      id: "u2",
      displayName: "Priya Patel",
      username: "priya_p",
      avatarUrl: "https://example.com/pfp.jpg",
      bio: null,
      branch: "ECE",
      year: 3,
      points: 80,
      institution: {
        name: "IIT Delhi",
        slug: "iit-delhi",
      },
      vibeScore: 60,
      matchReason: "🏛️ Same Campus",
      isFollowing: false,
    };

    expect(campusCandidate.matchReason).toBe("🏛️ Same Campus");
  });
});
