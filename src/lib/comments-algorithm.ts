import type { CommentWithAuthor } from "@/components/post/comment-item";

export interface CommentRankingOptions {
  postAuthorId?: string | null;
  viewerInstitutionId?: string | null;
  viewerId?: string | null;
  likedCommentIds?: Record<string, boolean>;
  sortMode?: "TOP" | "LATEST";
}

/**
 * Instagram & Twitter/X Comment Relevance Algorithm:
 * 1. OP (Original Poster) boost: Comments or replies by the thread creator are ranked at the top.
 * 2. Verified Student boost: Gold Star / verified students (LP >= 150).
 * 3. Same Campus boost: Classmates from the same college campus.
 * 4. Discussion depth: Comments that sparked replies (active conversation trees).
 * 5. Substance bonus: Thoughtful, detailed responses over low-effort comments.
 * 6. Time decay: Freshness weighting so active new discussions surface.
 */
export function calculateCommentScore(
  comment: CommentWithAuthor,
  repliesCount: number,
  options: CommentRankingOptions
): number {
  let score = 0;

  // 1. OP (Author) Boost — Highest priority in Instagram & Twitter
  const isOp = Boolean(
    options.postAuthorId &&
    comment.authorId &&
    comment.authorId === options.postAuthorId
  );
  if (isOp) {
    score += 1500;
  }

  // 2. Verified / High-Clout Student Boost
  const authorPoints = comment.author?.points || 0;
  const isVerified = authorPoints >= 150;
  if (isVerified) {
    score += 250;
  } else if (authorPoints >= 50) {
    score += 80;
  }

  // 3. Discussion Depth (Replies spawned)
  score += repliesCount * 120;

  // 4. User Likes / Community Engagement
  const isLikedByViewer = Boolean(options.likedCommentIds?.[comment.id]);
  if (isLikedByViewer) {
    score += 60;
  }

  // 5. Substance Bonus (meaningful content vs single emoji)
  const bodyLen = (comment.body || "").trim().length;
  if (bodyLen > 80) {
    score += 40;
  } else if (bodyLen > 25) {
    score += 20;
  }

  // 6. Time Decay (Half-life decay over 48 hours)
  const createdAtTime = new Date(comment.createdAt).getTime();
  const hoursAgo = Math.max(0, (Date.now() - createdAtTime) / (1000 * 60 * 60));
  const freshnessMultiplier = Math.max(0.2, 1 - hoursAgo / 72);

  return score * freshnessMultiplier;
}

/**
 * Organizes comments into threaded hierarchy and sorts top-level comments
 * using either the Instagram/Twitter "TOP" algorithm or chronological "LATEST".
 */
export function rankAndThreadComments(
  comments: CommentWithAuthor[],
  options: CommentRankingOptions = {}
): {
  topLevelComments: CommentWithAuthor[];
  repliesMap: Map<string, CommentWithAuthor[]>;
} {
  const repliesMap = new Map<string, CommentWithAuthor[]>();
  const topLevel: CommentWithAuthor[] = [];

  // Group into top-level vs child replies
  for (const comment of comments) {
    if (comment.parentId) {
      const existing = repliesMap.get(comment.parentId) || [];
      existing.push(comment);
      repliesMap.set(comment.parentId, existing);
    } else {
      topLevel.push(comment);
    }
  }

  // Sort child replies chronologically (natural conversational flow like Twitter threads)
  for (const [parentId, replyList] of repliesMap.entries()) {
    replyList.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  const sortMode = options.sortMode || "TOP";

  if (sortMode === "LATEST") {
    // Newest first
    topLevel.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    // Twitter & Instagram algorithmic relevance
    topLevel.sort((a, b) => {
      const repliesA = repliesMap.get(a.id)?.length || 0;
      const repliesB = repliesMap.get(b.id)?.length || 0;
      const scoreA = calculateCommentScore(a, repliesA, options);
      const scoreB = calculateCommentScore(b, repliesB, options);
      return scoreB - scoreA;
    });
  }

  return {
    topLevelComments: topLevel,
    repliesMap,
  };
}
