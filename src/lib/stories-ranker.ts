import type { Story, UserProfile } from "@/db/schema";

export type StoryPayload = Pick<
  Story,
  "id" | "mediaUrl" | "text" | "backgroundColor" | "createdAt" | "expiresAt"
>;

export interface RankedStoryGroup {
  user: UserProfile;
  stories: StoryPayload[];
  isSelf: boolean;
  isFriend: boolean;
  isFollowing: boolean;
}

export interface RankStoriesInput {
  viewerProfileId: string;
  activeStories: Array<{
    id: string;
    userId: string;
    mediaUrl: string | null;
    text: string | null;
    backgroundColor: string | null;
    createdAt: Date;
    expiresAt: Date;
    user?: UserProfile | null;
  }>;
  followingIds: string[];
  friendIds: string[]; // Mutual follows
}

/**
 * Filters stories to ONLY show:
 * 1. The viewer's own stories
 * 2. Stories from users the viewer is following
 *
 * And prioritizes the output:
 * - Priority 0: Viewer's own stories
 * - Priority 1: Mutual Friends (mutual follows), sorted by newest story
 * - Priority 2: General Followings, sorted by newest story
 */
export function rankAndFilterStories(input: RankStoriesInput): RankedStoryGroup[] {
  const { viewerProfileId, activeStories, followingIds, friendIds } = input;

  const followingSet = new Set(followingIds);
  const friendSet = new Set(friendIds);

  // Map to group stories by user
  const userMap = new Map<string, { user: UserProfile; stories: StoryPayload[] }>();

  for (const story of activeStories) {
    if (!story.user) continue;

    const isSelf = story.userId === viewerProfileId;
    const isFollowing = followingSet.has(story.userId);

    // Rule: ONLY show stories of self or followings
    if (!isSelf && !isFollowing) {
      continue;
    }

    if (!userMap.has(story.userId)) {
      userMap.set(story.userId, {
        user: story.user,
        stories: [],
      });
    }

    const entry = userMap.get(story.userId)!;
    entry.stories.push({
      id: story.id,
      mediaUrl: story.mediaUrl,
      text: story.text,
      backgroundColor: story.backgroundColor,
      createdAt: story.createdAt,
      expiresAt: story.expiresAt,
    });
  }

  // Convert map to ranked list
  const groups: RankedStoryGroup[] = [];

  for (const [userId, entry] of userMap.entries()) {
    // Sort stories within user group chronologically (oldest to newest for viewing)
    entry.stories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const isSelf = userId === viewerProfileId;
    const isFriend = friendSet.has(userId);
    const isFollowing = followingSet.has(userId);

    groups.push({
      user: entry.user,
      stories: entry.stories,
      isSelf,
      isFriend,
      isFollowing,
    });
  }

  // Sort groups by priority:
  // 1. Viewer self first
  // 2. Friends (mutual follows) with newest stories first
  // 3. Followings with newest stories first
  groups.sort((a, b) => {
    if (a.isSelf) return -1;
    if (b.isSelf) return 1;

    if (a.isFriend && !b.isFriend) return -1;
    if (!a.isFriend && b.isFriend) return 1;

    // Both friends or both general followings: sort by newest story timestamp
    const aLatest = Math.max(...a.stories.map((s) => new Date(s.createdAt).getTime()));
    const bLatest = Math.max(...b.stories.map((s) => new Date(s.createdAt).getTime()));

    return bLatest - aLatest;
  });

  return groups;
}
