import { describe,expect,it } from "vitest";
import { calculateCommentScore,rankAndThreadComments } from "./comments-algorithm";

describe("comments-algorithm", () => {
  it("boosts OP comments above regular comments", () => {
    const postAuthorId = "user_author_123";
    const opComment: any = {
      id: "c1",
      authorId: postAuthorId,
      body: "Thanks for checking out this thread!",
      createdAt: new Date(),
      author: { points: 20 },
    };
    const otherComment: any = {
      id: "c2",
      authorId: "user_other_456",
      body: "Nice post!",
      createdAt: new Date(),
      author: { points: 20 },
    };

    const opScore = calculateCommentScore(opComment, 0, { postAuthorId });
    const otherScore = calculateCommentScore(otherComment, 0, { postAuthorId });

    expect(opScore).toBeGreaterThan(otherScore);
  });

  it("boosts verified student comments", () => {
    const verifiedComment: any = {
      id: "c1",
      authorId: "u1",
      body: "Great question!",
      createdAt: new Date(),
      author: { points: 200 },
    };
    const rookieComment: any = {
      id: "c2",
      authorId: "u2",
      body: "Great question!",
      createdAt: new Date(),
      author: { points: 10 },
    };

    const vScore = calculateCommentScore(verifiedComment, 0, {});
    const rScore = calculateCommentScore(rookieComment, 0, {});

    expect(vScore).toBeGreaterThan(rScore);
  });

  it("boosts comments with active conversation replies", () => {
    const activeDiscussion: any = {
      id: "c1",
      authorId: "u1",
      body: "What do you think about the syllabus change?",
      createdAt: new Date(),
      author: { points: 50 },
    };
    const quietComment: any = {
      id: "c2",
      authorId: "u2",
      body: "What do you think about the syllabus change?",
      createdAt: new Date(),
      author: { points: 50 },
    };

    const activeScore = calculateCommentScore(activeDiscussion, 5, {});
    const quietScore = calculateCommentScore(quietComment, 0, {});

    expect(activeScore).toBeGreaterThan(quietScore);
  });

  it("sorts correctly in TOP vs LATEST mode", () => {
    const now = Date.now();
    const olderHighEngagement: any = {
      id: "c1",
      authorId: "author_op",
      body: "Author note",
      createdAt: new Date(now - 3600000),
      author: { points: 300 },
    };
    const brandNewLowEngagement: any = {
      id: "c2",
      authorId: "user_rand",
      body: "first",
      createdAt: new Date(now),
      author: { points: 10 },
    };

    const list = [olderHighEngagement, brandNewLowEngagement];

    // TOP mode ranks high engagement/OP first
    const topRanked = rankAndThreadComments(list, {
      postAuthorId: "author_op",
      sortMode: "TOP",
    });
    expect(topRanked.topLevelComments[0].id).toBe("c1");

    // LATEST mode ranks newest first
    const latestRanked = rankAndThreadComments(list, {
      postAuthorId: "author_op",
      sortMode: "LATEST",
    });
    expect(latestRanked.topLevelComments[0].id).toBe("c2");
  });
});
