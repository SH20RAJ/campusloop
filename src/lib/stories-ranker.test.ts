import { describe, expect, it } from "vitest";
import { rankAndFilterStories } from "./stories-ranker";

describe("Story Ranking & Filtering Engine", () => {
  const viewerId = "user_viewer";
  const friendId = "user_friend"; // mutual follow
  const followingId = "user_following"; // one-way follow
  const strangerId = "user_stranger"; // not followed

  const dummyProfiles: Record<string, any> = {
    [viewerId]: { id: viewerId, username: "viewer", displayName: "Viewer Student" },
    [friendId]: { id: friendId, username: "bestie", displayName: "Bestie Friend" },
    [followingId]: { id: followingId, username: "prof", displayName: "Campus Prof" },
    [strangerId]: { id: strangerId, username: "random", displayName: "Random Stranger" },
  };

  it("filters out stories from non-followings (strangers)", () => {
    const now = new Date();
    const activeStories = [
      {
        id: "s1",
        userId: strangerId,
        mediaUrl: "https://example.com/s1.jpg",
        text: "Stranger vibe",
        backgroundColor: null,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 86400000),
        user: dummyProfiles[strangerId],
      },
      {
        id: "s2",
        userId: followingId,
        mediaUrl: "https://example.com/s2.jpg",
        text: "Following vibe",
        backgroundColor: null,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 86400000),
        user: dummyProfiles[followingId],
      },
    ];

    const result = rankAndFilterStories({
      viewerProfileId: viewerId,
      activeStories,
      followingIds: [followingId],
      friendIds: [],
    });

    expect(result.length).toBe(1);
    expect(result[0].user.id).toBe(followingId);
  });

  it("prioritizes mutual friends before general followings", () => {
    const t1 = new Date(Date.now() - 5000);
    const t2 = new Date(Date.now() - 1000);

    const activeStories = [
      {
        id: "s_following",
        userId: followingId,
        mediaUrl: "https://example.com/f.jpg",
        text: "Following Story",
        backgroundColor: null,
        createdAt: t2, // newer story
        expiresAt: new Date(Date.now() + 86400000),
        user: dummyProfiles[followingId],
      },
      {
        id: "s_friend",
        userId: friendId,
        mediaUrl: "https://example.com/friend.jpg",
        text: "Friend Story",
        backgroundColor: null,
        createdAt: t1, // older story
        expiresAt: new Date(Date.now() + 86400000),
        user: dummyProfiles[friendId],
      },
    ];

    const result = rankAndFilterStories({
      viewerProfileId: viewerId,
      activeStories,
      followingIds: [friendId, followingId],
      friendIds: [friendId],
    });

    expect(result.length).toBe(2);
    // Friend must be first despite slightly older story
    expect(result[0].user.id).toBe(friendId);
    expect(result[0].isFriend).toBe(true);
    expect(result[1].user.id).toBe(followingId);
    expect(result[1].isFriend).toBe(false);
  });

  it("always keeps viewer's own story at index 0", () => {
    const now = new Date();
    const activeStories = [
      {
        id: "s_friend",
        userId: friendId,
        mediaUrl: "https://example.com/friend.jpg",
        text: "Friend Story",
        backgroundColor: null,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 86400000),
        user: dummyProfiles[friendId],
      },
      {
        id: "s_self",
        userId: viewerId,
        mediaUrl: "https://example.com/self.jpg",
        text: "My Own Story",
        backgroundColor: null,
        createdAt: new Date(now.getTime() - 10000),
        expiresAt: new Date(now.getTime() + 86400000),
        user: dummyProfiles[viewerId],
      },
    ];

    const result = rankAndFilterStories({
      viewerProfileId: viewerId,
      activeStories,
      followingIds: [friendId],
      friendIds: [friendId],
    });

    expect(result.length).toBe(2);
    expect(result[0].user.id).toBe(viewerId);
    expect(result[0].isSelf).toBe(true);
    expect(result[1].user.id).toBe(friendId);
  });
});
