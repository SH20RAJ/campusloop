export const FEED_SORT_TABS = [
  { id: "for_you", label: "For you" },
  { id: "memes", label: "Memes" },
  { id: "trending", label: "Trending" },
  { id: "latest", label: "Latest" },
  { id: "top_voted", label: "Top Voted" },
] as const;

export const FEED_VISIBILITY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "anonymous", label: "Anonymous" },
  { id: "public", label: "Public" },
] as const;

export const FEED_CATEGORY_OPTIONS = [
  { id: "ALL", label: "All" },
  { id: "MEME", label: "Memes" },
  { id: "CONFESSION", label: "Confess" },
  { id: "POLL", label: "Polls" },
] as const;

export const FEED_SCOPE_OPTIONS = [
  { id: "CAMPUS", label: "My College" },
  { id: "GLOBAL", label: "All Colleges" },
] as const;

export const TRENDING_CAMPUS_TAGS = [
  "#LateNightTea",
  "#Confessions",
  "#CanteenGossip",
  "#ExamStress",
  "#LibraryVibes",
  "#HostelLife",
  "#PlacementSeason",
  "#FestVibes",
  "#Hackathon2026",
] as const;

export const MAX_POST_CHARS = 2000;
export const DEFAULT_FEED_PAGE_LIMIT = 20;
