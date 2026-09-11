import type { SubredditSourceConfig } from "./types";

/**
 * Configurable Reddit Source List for CampusLoop.
 *
 * High Priority: Targeted Indian student, engineering, and meme communities.
 * Secondary: Broader collegiate, academic, and humor subreddits.
 */
export const REDDIT_SOURCES: SubredditSourceConfig[] = [
  // ── High Priority Indian College & Meme Communities ──
  {
    subreddit: "Btechtards",
    priority: 100,
    enabled: true,
    categories: ["college", "engineering", "btech", "meme", "student_life"],
    defaultSort: "hot",
  },
  {
    subreddit: "JEENEETards",
    priority: 95,
    enabled: true,
    categories: ["aspirants", "jee", "neet", "meme", "stress", "college_prep"],
    defaultSort: "hot",
  },
  {
    subreddit: "CollegeRant",
    priority: 85,
    enabled: true,
    categories: ["college", "professors", "exams", "rant", "hostel"],
    defaultSort: "hot",
  },
  {
    subreddit: "college",
    priority: 80,
    enabled: true,
    categories: ["college", "academics", "campus", "discussion"],
    defaultSort: "hot",
  },
  {
    subreddit: "IndianTeenagers",
    priority: 80,
    enabled: true,
    categories: ["teenagers", "student_life", "desi", "relationships"],
    defaultSort: "hot",
  },
  {
    subreddit: "IndiaMeme",
    priority: 75,
    enabled: true,
    categories: ["meme", "desi", "humor"],
    defaultSort: "hot",
  },
  {
    subreddit: "DesiMemes",
    priority: 75,
    enabled: true,
    categories: ["meme", "desi", "humor"],
    defaultSort: "hot",
  },
  {
    subreddit: "ProgrammerHumor",
    priority: 70,
    enabled: true,
    categories: ["coding", "cs", "engineering", "meme", "developer"],
    defaultSort: "hot",
  },

  // ── Secondary College & General Communities ──
  {
    subreddit: "EngineeringMemes",
    priority: 65,
    enabled: true,
    categories: ["engineering", "stem", "meme", "assignments"],
    defaultSort: "hot",
  },
  {
    subreddit: "University",
    priority: 60,
    enabled: true,
    categories: ["university", "academics", "campus"],
    defaultSort: "hot",
  },
  {
    subreddit: "IndianAcademia",
    priority: 60,
    enabled: true,
    categories: ["academics", "research", "degrees", "career"],
    defaultSort: "hot",
  },
  {
    subreddit: "CollegeSocialLife",
    priority: 55,
    enabled: true,
    categories: ["social", "campus", "clubs", "friends"],
    defaultSort: "hot",
  },
  {
    subreddit: "teenagers",
    priority: 50,
    enabled: true,
    categories: ["teenagers", "discussion", "relatable"],
    defaultSort: "hot",
  },
  {
    subreddit: "memes",
    priority: 50,
    enabled: true,
    categories: ["meme", "general"],
    defaultSort: "hot",
  },
  {
    subreddit: "dankmemes",
    priority: 50,
    enabled: true,
    categories: ["meme", "dank"],
    defaultSort: "hot",
  },
  {
    subreddit: "IndiaSocial",
    priority: 50,
    enabled: true,
    categories: ["social", "india", "casual"],
    defaultSort: "hot",
  },
];

export function getAllRedditSources(): SubredditSourceConfig[] {
  return REDDIT_SOURCES;
}

export function getActiveRedditSources(): SubredditSourceConfig[] {
  return REDDIT_SOURCES.filter((s) => s.enabled);
}

export function findRedditSource(subreddit: string): SubredditSourceConfig | undefined {
  const normalized = subreddit.toLowerCase().replace(/^r\//, "");
  return REDDIT_SOURCES.find((s) => s.subreddit.toLowerCase() === normalized);
}
