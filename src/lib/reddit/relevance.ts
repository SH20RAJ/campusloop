import type { NormalizedRedditPost, RawRedditPostData, SubredditSourceConfig } from "./types";

export const CAMPUS_RELEVANCE_KEYWORDS = [
  "college",
  "university",
  "hostel",
  "campus",
  "professor",
  "prof",
  "attendance",
  "assignment",
  "assignments",
  "exam",
  "exams",
  "midsem",
  "endsem",
  "placement",
  "placements",
  "internship",
  "internships",
  "engineering",
  "btech",
  "mtech",
  "jee",
  "neet",
  "gate",
  "coding",
  "dsa",
  "leetcode",
  "fest",
  "clubs",
  "roommate",
  "roommates",
  "canteen",
  "mess food",
  "syllabus",
  "faculty",
  "viva",
  "cgpa",
  "gpa",
  "sgpa",
  "backlog",
  "backlogs",
  "fresher",
  "freshers",
  "senior",
  "seniors",
  "tier 1",
  "tier 2",
  "tier 3",
  "degree",
  "convocation",
  "lecture",
  "library",
  "semester",
  "student",
  "students",
  "iit",
  "nit",
  "iiit",
  "bits",
  "vit",
  "srm",
  "delhi university",
  "anna university",
  "mumbai university",
  "alumni",
];

/**
 * Calculates college relevance score (0 - 100) based on Indian student keywords.
 */
export function calculateCollegeRelevanceScore(text: string): {
  relevanceScore: number;
  matchedKeywords: string[];
} {
  const normalized = text.toLowerCase();
  const matchedKeywords: string[] = [];

  for (const kw of CAMPUS_RELEVANCE_KEYWORDS) {
    // Word boundary or containment check
    const regex = new RegExp(`\\b${kw.replace(/\s+/g, "\\s+")}\\b`, "i");
    if (regex.test(normalized)) {
      matchedKeywords.push(kw);
    }
  }

  // Each matched keyword contributes 10 points, up to 60 points max
  const score = Math.min(matchedKeywords.length * 10, 60);

  return {
    relevanceScore: score,
    matchedKeywords,
  };
}

/**
 * Calculates overall Reddit ranking and relevance score for CampusLoop.
 * Combines subreddit source priority, upvote velocity, recency, keyword affinity, and media bonus.
 */
export function calculateRedditRelevance(
  post: RawRedditPostData,
  sourceConfig?: SubredditSourceConfig,
  contentType: NormalizedRedditPost["contentType"] = "TEXT"
): {
  totalScore: number;
  collegeScore: number;
  matchedKeywords: string[];
  isAcceptable: boolean;
  rejectionReason?: string;
} {
  // Reject NSFW immediately
  if (post.over_18) {
    return {
      totalScore: -1000,
      collegeScore: 0,
      matchedKeywords: [],
      isAcceptable: false,
      rejectionReason: "NSFW content is forbidden",
    };
  }

  // Reject removed or deleted posts
  if (
    post.selftext === "[removed]" ||
    post.selftext === "[deleted]" ||
    post.title === "[deleted]" ||
    post.removed_by_category
  ) {
    return {
      totalScore: -1000,
      collegeScore: 0,
      matchedKeywords: [],
      isAcceptable: false,
      rejectionReason: "Post was deleted or removed on Reddit",
    };
  }

  const fullText = `${post.title || ""} ${post.selftext || ""} ${post.subreddit || ""}`;
  const { relevanceScore: collegeScore, matchedKeywords } = calculateCollegeRelevanceScore(fullText);

  const basePriority = sourceConfig?.priority ?? 50;

  // Engagement bonuses
  const upvoteBonus = Math.min(Math.max(0, (post.score || 0) / 20), 50);
  const commentBonus = Math.min(Math.max(0, (post.num_comments || 0) / 5), 30);

  // Recency decay bonus
  const nowUtc = Date.now() / 1000;
  const postUtc = post.created_utc || nowUtc;
  const hoursSince = Math.max(0, (nowUtc - postUtc) / 3600);
  const recencyBonus = Math.round(40 / (hoursSince + 1) ** 0.75);

  // Media bonus
  let mediaBonus = 0;
  if (contentType === "VIDEO") mediaBonus = 25;
  else if (contentType === "IMAGE") mediaBonus = 20;
  else if (contentType === "GALLERY") mediaBonus = 18;
  else if (contentType === "GIF") mediaBonus = 15;

  // Inherent high-priority subreddit boost for dedicated college hubs
  let subredditCampusBonus = 0;
  const subLower = post.subreddit.toLowerCase();
  if (
    subLower === "btechtards" ||
    subLower === "jeeneetards" ||
    subLower === "collegerant" ||
    subLower === "college"
  ) {
    subredditCampusBonus = 25;
  }

  // Penalties
  let penalties = 0;
  if (post.spoiler) penalties += 15;
  if ((post.score || 0) < 5 && hoursSince > 12) penalties += 25;

  const totalScore = Math.max(
    0,
    Math.round(
      basePriority +
        upvoteBonus +
        commentBonus +
        recencyBonus +
        mediaBonus +
        collegeScore +
        subredditCampusBonus -
        penalties
    )
  );

  // Rejection threshold check:
  // Must have a minimum total score to justify import
  const isAcceptable = totalScore >= 40;

  return {
    totalScore,
    collegeScore,
    matchedKeywords,
    isAcceptable,
    rejectionReason: isAcceptable ? undefined : "Low relevance score",
  };
}
