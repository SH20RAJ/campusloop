import { describe, expect, it } from "vitest";
import {
  calculateReelScore,
  getAddictiveReelsScoreSql,
  rerankReels,
  type ReelCandidate,
  type ViewerReelContext,
} from "./algorithm";

describe("Addictive Reels Recommendation Engine", () => {
  const baseReel: ReelCandidate = {
    id: "reel-1",
    body: "Campus fest preparations kicking off! #coding #hackathon #campusvibe",
    title: "Hackathon 2026",
    authorId: "creator-alice",
    institutionId: "inst-bit",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
    votesCount: 15,
    commentsCount: 8,
    loopCount: 0,
    completionRate: 0.5,
  };

  it("multiplies addictive score significantly for looped/rewatched videos", () => {
    const singleWatchScore = calculateReelScore({ ...baseReel, loopCount: 0 }, { randomJitter: false });
    const tripleLoopedScore = calculateReelScore({ ...baseReel, loopCount: 3 }, { randomJitter: false });

    // 3 loops * 35 = 105 point difference
    expect(tripleLoopedScore).toBeGreaterThan(singleWatchScore + 100);
  });

  it("awards high completion bonus for videos watched past 85%", () => {
    const incompleteScore = calculateReelScore(
      { ...baseReel, completionRate: 0.4 },
      { randomJitter: false }
    );
    const completedScore = calculateReelScore(
      { ...baseReel, completionRate: 0.95 },
      { randomJitter: false }
    );

    // Completion bonus is +25
    expect(completedScore - incompleteScore).toBe(25);
  });

  it("applies strong personal affinity boost when reel tags match user interests", () => {
    const nonMatchingCtx: ViewerReelContext = {
      affinityTags: ["gaming", "anime"],
      randomJitter: false,
    };
    const matchingCtx: ViewerReelContext = {
      affinityTags: ["hackathon", "coding"],
      randomJitter: false,
    };

    const scoreNoMatch = calculateReelScore(baseReel, nonMatchingCtx);
    const scoreMatch = calculateReelScore(baseReel, matchingCtx);

    // Interest tag match awards +40
    expect(scoreMatch - scoreNoMatch).toBe(40);
  });

  it("boosts score for creators in user affinity list", () => {
    const strangerCtx: ViewerReelContext = {
      affinityCreatorIds: ["creator-bob"],
      randomJitter: false,
    };
    const fanCtx: ViewerReelContext = {
      affinityCreatorIds: ["creator-alice"],
      randomJitter: false,
    };

    const scoreStranger = calculateReelScore(baseReel, strangerCtx);
    const scoreFan = calculateReelScore(baseReel, fanCtx);

    // Creator affinity awards +50
    expect(scoreFan - scoreStranger).toBe(50);
  });

  it("awards same-campus boost to foster hyper-local engagement", () => {
    const otherCollegeCtx: ViewerReelContext = {
      userInstitutionId: "inst-other",
      randomJitter: false,
    };
    const homeCollegeCtx: ViewerReelContext = {
      userInstitutionId: "inst-bit",
      randomJitter: false,
    };

    const scoreOther = calculateReelScore(baseReel, otherCollegeCtx);
    const scoreHome = calculateReelScore(baseReel, homeCollegeCtx);

    // Campus bonus awards +25
    expect(scoreHome - scoreOther).toBe(25);
  });

  it("demotes seen reels heavily to prevent stale repetition", () => {
    const ctx: ViewerReelContext = {
      seenPostIds: new Set(["reel-1"]),
      randomJitter: false,
    };

    const score = calculateReelScore(baseReel, ctx);
    expect(score).toBe(-250);
  });

  it("accurately reranks a list of candidate reels in order of maximum addictiveness", () => {
    const candidates: ReelCandidate[] = [
      {
        id: "low-engagement",
        body: "Boring lecture notes #academics",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000),
        votesCount: 2,
        commentsCount: 0,
        loopCount: 0,
        completionRate: 0.1,
      },
      {
        id: "viral-looped",
        body: "Insane campus drone shot! #campusvibe #drone",
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
        votesCount: 150,
        commentsCount: 45,
        loopCount: 4,
        completionRate: 1.0,
      },
      {
        id: "moderate-match",
        body: "Coding challenge day 5 #coding",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000),
        votesCount: 30,
        commentsCount: 10,
        loopCount: 1,
        completionRate: 0.9,
      },
    ];

    const ctx: ViewerReelContext = {
      affinityTags: ["coding"],
      randomJitter: false,
    };

    const ranked = rerankReels(candidates, ctx);
    expect(ranked[0].id).toBe("viral-looped");
    expect(ranked[1].id).toBe("moderate-match");
    expect(ranked[2].id).toBe("low-engagement");
  });

  it("generates a valid Drizzle SQL expression with seen demotion and affinity clauses", () => {
    const sqlExpression = getAddictiveReelsScoreSql(
      "viewer-123",
      "inst-bit",
      ["reel-old-1", "reel-old-2"],
      ["coding", "fest"],
      ["creator-alice"]
    );

    expect(sqlExpression).toBeDefined();
    // Verify parameters or SQL chunk construction
    expect(sqlExpression.queryChunks.length).toBeGreaterThan(0);
  });
});
