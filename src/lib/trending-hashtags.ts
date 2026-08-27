import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { desc,eq } from "drizzle-orm";

export interface TrendingHashtag {
  tag: string;
  count: number;
  formattedCount: string;
  category: string;
  isHot?: boolean;
  source: "campus" | "social" | "global";
}

/**
 * Curated high-velocity social media, open-source & Indian campus trends
 * modeled after real-time Twitter/X India, Instagram explore, and developer circles.
 */
const CURATED_SOCIAL_TRENDS: Array<{ tag: string; baseCount: number; category: string; source: "social" }> = [
  { tag: "#Tech", baseCount: 1420, category: "Tech & Open Source", source: "social" },
  { tag: "#AI", baseCount: 2150, category: "Tech & AI", source: "social" },
  { tag: "#OpenAI", baseCount: 1840, category: "Tech & AI", source: "social" },
  { tag: "#DeepSeek", baseCount: 980, category: "Tech & AI", source: "social" },
  { tag: "#Startups", baseCount: 1120, category: "Founders & Startups", source: "social" },
  { tag: "#BuildInPublic", baseCount: 890, category: "Dev Community", source: "social" },
  { tag: "#NextJS", baseCount: 760, category: "Open Source & Web", source: "social" },
  { tag: "#Rust", baseCount: 640, category: "Systems & Open Source", source: "social" },
  { tag: "#LeetCode", baseCount: 1280, category: "Coding & Placements", source: "social" },
  { tag: "#Hackathon", baseCount: 810, category: "Tech Events", source: "social" },
  { tag: "#HostelLife", baseCount: 2400, category: "Campus Vibe", source: "social" },
  { tag: "#CampusHelp", baseCount: 950, category: "Student Help", source: "social" },
  { tag: "#LateNightTea", baseCount: 780, category: "Hostel Life", source: "social" },
  { tag: "#MusicJams", baseCount: 840, category: "Music & Culture", source: "social" },
  { tag: "#IndieMusic", baseCount: 560, category: "Music & Culture", source: "social" },
  { tag: "#EndsemSurvivors", baseCount: 1950, category: "College Exams", source: "social" },
  { tag: "#PlacementSeason", baseCount: 1670, category: "Careers & Placements", source: "social" },
  { tag: "#CampusConfessions", baseCount: 2200, category: "Confessions", source: "social" },
  { tag: "#Gaming", baseCount: 920, category: "Gaming & Esports", source: "social" },
  { tag: "#Cricket", baseCount: 3100, category: "Trending in India", source: "social" },
];

interface CacheEntry {
  timestamp: number;
  data: Map<string, { count: number; category: string; campusId?: string | null }>;
}

let cachedDbTags: CacheEntry | null = null;
const CACHE_TTL_MS = 45 * 1000; // 45 seconds

/**
 * Fetch and aggregate active hashtags from real database posts
 */
async function getAggregatedDbHashtags(): Promise<Map<string, { count: number; category: string; campusId?: string | null }>> {
  const now = Date.now();
  if (cachedDbTags && now - cachedDbTags.timestamp < CACHE_TTL_MS) {
    return cachedDbTags.data;
  }

  const tagMap = new Map<string, { count: number; category: string; campusId?: string | null }>();

  try {
    const db = getDb();
    const recentPosts = await db.query.posts.findMany({
      where: eq(posts.status, "PUBLISHED"),
      orderBy: [desc(posts.createdAt)],
      limit: 300,
      columns: {
        body: true,
        institutionId: true,
      },
    });

    for (const post of recentPosts) {
      const text = post.body || "";
      const matches = text.match(/#([a-zA-Z0-9_\u0900-\u097F]+)/g);
      if (matches) {
        for (const rawTag of matches) {
          const clean = rawTag.trim();
          // Capitalize clean display
          const key = clean.toLowerCase();
          const existing = tagMap.get(key) || {
            count: 0,
            category: post.institutionId ? "Trending on Campus" : "Trending in India",
            campusId: post.institutionId,
          };
          existing.count += 1;
          tagMap.set(key, existing);
        }
      }
    }
  } catch {
    // Graceful fallback to social & curated trends when DB is unavailable or during offline tests
  }

  cachedDbTags = { timestamp: now, data: tagMap };
  return tagMap;
}


export interface GetTrendingHashtagsOptions {
  query?: string;
  campusId?: string | null;
  limit?: number;
}

/**
 * Get intelligent trending hashtags combining real-time database posts
 * with trending X / Instagram / Open Source social media topics.
 */
export async function getTrendingHashtags({
  query = "",
  campusId,
  limit = 12,
}: GetTrendingHashtagsOptions = {}): Promise<TrendingHashtag[]> {
  const dbTags = await getAggregatedDbHashtags();
  const cleanQ = query.trim().toLowerCase().replace(/^#/, "");

  const resultsMap = new Map<string, TrendingHashtag>();

  // 1. Process Database Hashtags (Real posts take highest priority)
  for (const [key, item] of dbTags.entries()) {
    if (cleanQ && !key.includes(cleanQ)) {
      continue;
    }

    // Capitalize first letter or preserve known casing
    const displayTag = key.startsWith("#") ? key : `#${key}`;
    const formattedTag = displayTag.charAt(0) + displayTag.charAt(1).toUpperCase() + displayTag.slice(2);

    const isCampusMatch = campusId && item.campusId === campusId;

    resultsMap.set(key, {
      tag: formattedTag,
      count: item.count,
      formattedCount: `${item.count} ${item.count === 1 ? "post" : "posts"}`,
      category: isCampusMatch ? "Trending on Your Campus" : "Trending on CampusLoop",
      isHot: item.count >= 10,
      source: isCampusMatch ? "campus" : "global",
    });
  }

  // 2. Merge Curated Social Media / X Trends
  for (const social of CURATED_SOCIAL_TRENDS) {
    const key = social.tag.toLowerCase();
    if (cleanQ && !key.includes(cleanQ)) {
      continue;
    }

    if (resultsMap.has(key)) {
      // Boost existing DB tag with social media category if needed
      const existing = resultsMap.get(key)!;
      existing.isHot = true;
    } else {
      resultsMap.set(key, {
        tag: social.tag,
        count: social.baseCount,
        formattedCount: `${(social.baseCount / 1000).toFixed(1)}K posts`,
        category: social.category,
        isHot: true,
        source: "social",
      });
    }
  }

  // Sort:
  // - Matches starting with query come first
  // - Campus DB matches come second
  // - High post counts come third
  const sorted = Array.from(resultsMap.values()).sort((a, b) => {
    const aKey = a.tag.toLowerCase().replace(/^#/, "");
    const bKey = b.tag.toLowerCase().replace(/^#/, "");

    if (cleanQ) {
      const aStarts = aKey.startsWith(cleanQ);
      const bStarts = bKey.startsWith(cleanQ);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
    }

    if (a.source === "campus" && b.source !== "campus") return -1;
    if (a.source !== "campus" && b.source === "campus") return 1;

    return b.count - a.count;
  });

  return sorted.slice(0, limit);
}
