import {
getSecretCrushSlotLimit,
getSecretCrushSlotProgress,
} from "@/constants/gamification";
import { describe,expect,it } from "vitest";
import {
computeCompatibility,
resolveGenderPreference,
sharedInterestsBetween,
type CompatibilityProfile,
} from "./dating";

function profile(overrides: Partial<CompatibilityProfile> = {}): CompatibilityProfile {
  return {
    id: "p1",
    institutionId: "inst-a",
    interests: [],
    course: null,
    branch: null,
    year: null,
    bio: null,
    avatarUrl: null,
    photos: [],
    points: 0,
    institution: { state: "Jharkhand" },
    ...overrides,
  };
}

describe("resolveGenderPreference", () => {
  it("defaults male users to seeing women", () => {
    expect(resolveGenderPreference("MALE", null)).toBe("FEMALE");
  });

  it("defaults female users to seeing men", () => {
    expect(resolveGenderPreference("FEMALE", undefined)).toBe("MALE");
  });

  it("defaults other/unset gender to everyone", () => {
    expect(resolveGenderPreference("OTHER", null)).toBe("ALL");
    expect(resolveGenderPreference(null, null)).toBe("ALL");
  });

  it("explicit choice always wins over the default", () => {
    expect(resolveGenderPreference("MALE", "MALE")).toBe("MALE");
    expect(resolveGenderPreference("FEMALE", "ALL")).toBe("ALL");
  });

  it("ignores invalid requested values", () => {
    expect(resolveGenderPreference("MALE", "DEFAULT")).toBe("FEMALE");
    expect(resolveGenderPreference("MALE", "garbage")).toBe("FEMALE");
  });
});

describe("sharedInterestsBetween", () => {
  it("matches case-insensitively and preserves candidate casing", () => {
    const me = profile({ interests: ["music", "Cricket", "coding"] });
    const cand = profile({ id: "p2", interests: ["Music", "cricket", "dance"] });
    expect(sharedInterestsBetween(me, cand)).toEqual(["Music", "cricket"]);
  });

  it("returns empty when either side has no interests", () => {
    expect(sharedInterestsBetween(profile(), profile({ id: "p2", interests: ["x"] }))).toEqual([]);
  });
});

describe("computeCompatibility", () => {
  it("ranks a shared-interest same-campus candidate above a stranger", () => {
    const me = profile({ interests: ["music", "gaming", "movies"], year: 2 });
    const soulmate = profile({
      id: "cand-a",
      interests: ["music", "gaming", "movies"],
      year: 2,
      bio: "love late night jams",
      avatarUrl: "x.png",
      photos: ["a", "b"],
    });
    const stranger = profile({
      id: "cand-b",
      institutionId: "inst-z",
      institution: { state: "Kerala" },
    });

    const a = computeCompatibility(me, soulmate);
    const b = computeCompatibility(me, stranger);
    expect(a.score).toBeGreaterThan(b.score);
    expect(a.sharedInterests).toHaveLength(3);
  });

  it("boosts candidates who already liked you", () => {
    const me = profile();
    const cand = profile({ id: "cand-a" });
    const plain = computeCompatibility(me, cand).score;
    const boosted = computeCompatibility(me, cand, { likedMe: true }).score;
    expect(boosted).toBe(plain + 8);
  });

  it("is deterministic for the same pair and clamps to 35..99", () => {
    const me = profile({ interests: ["a", "b", "c", "d"] });
    const cand = profile({
      id: "cand-max",
      interests: ["a", "b", "c", "d"],
      year: 1,
      course: "btech",
      branch: "cse",
      bio: "a very long bio about everything",
      avatarUrl: "x",
      photos: ["1", "2", "3"],
      points: 500,
    });
    const r1 = computeCompatibility(me, cand, { likedMe: true });
    const r2 = computeCompatibility(me, cand, { likedMe: true });
    expect(r1.score).toBe(r2.score);
    expect(r1.score).toBeLessThanOrEqual(99);
    expect(computeCompatibility(me, profile({ id: "cand-min", institutionId: "z", institution: {} })).score).toBeGreaterThanOrEqual(35);
  });
});

describe("Secret Crush Slot Expansion (5 -> 50 with LP Clout)", () => {
  it("defaults to 5 slots for students under 150 LP", () => {
    expect(getSecretCrushSlotLimit(0)).toBe(5);
    expect(getSecretCrushSlotLimit(50)).toBe(5);
    expect(getSecretCrushSlotLimit(149)).toBe(5);
  });

  it("expands to 50 slots when reaching 150 LP (Gold Star / Verified Clout)", () => {
    expect(getSecretCrushSlotLimit(150)).toBe(50);
    expect(getSecretCrushSlotLimit(250)).toBe(50);
    expect(getSecretCrushSlotLimit(1000)).toBe(50);
  });

  it("computes accurate slot progress and points remaining", () => {
    const p1 = getSecretCrushSlotProgress(30);
    expect(p1.isExpanded).toBe(false);
    expect(p1.maxSlots).toBe(5);
    expect(p1.pointsNeeded).toBe(120);
    expect(p1.progressPercent).toBe(20);

    const p2 = getSecretCrushSlotProgress(150);
    expect(p2.isExpanded).toBe(true);
    expect(p2.maxSlots).toBe(50);
    expect(p2.pointsNeeded).toBe(0);
    expect(p2.progressPercent).toBe(100);
  });
});
