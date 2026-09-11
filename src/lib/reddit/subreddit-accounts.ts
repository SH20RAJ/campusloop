import { randomUUID } from "node:crypto";
import { eq, inArray, isNull } from "drizzle-orm";
import type { getDb } from "@/db";
import { externalPosts, institutions, posts, userProfiles, type UserProfile } from "@/db/schema";

type Database = ReturnType<typeof getDb>;

export interface SubredditAccountMeta {
  subreddit: string;
  username: string;
  displayName: string;
  officialName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  bannerUrl?: string;
  points: number;
}

export const KNOWN_SUBREDDIT_METAS: Record<string, SubredditAccountMeta> = {
  btechtards: {
    subreddit: "Btechtards",
    username: "btechtards",
    displayName: "r/Btechtards",
    officialName: "r/Btechtards Engineering Hub",
    headline: "Official Subreddit Hub · Engineering & Hostel Life",
    bio: "The premier hub for Indian engineering students. Daily B.Tech memes, placement survival lore, semester exam panic, and hostel banter.",
    avatarUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&fit=crop",
    points: 4850,
  },
  jeeneetards: {
    subreddit: "JEENEETards",
    username: "jeeneetards",
    displayName: "r/JEENEETards",
    officialName: "r/JEENEETards Aspirants Hub",
    headline: "Official Subreddit Hub · JEE & NEET Chronicles",
    bio: "For the warrior aspirants of JEE, NEET, and competitive exams across India. Copium, study playlists, test series rants, and late-night motivation.",
    avatarUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&fit=crop",
    points: 4200,
  },
  indianteenagers: {
    subreddit: "IndianTeenagers",
    username: "indianteenagers",
    displayName: "r/IndianTeenagers",
    officialName: "r/IndianTeenagers Campus Life",
    headline: "Official Subreddit Hub · Student Stories & Banter",
    bio: "A safe space for Indian college students and youth. Unfiltered discussions, wholesome campus stories, confessions, and teenage chronicles.",
    avatarUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&fit=crop",
    points: 3900,
  },
  delhiuniversity: {
    subreddit: "delhiuniversity",
    username: "delhiuniversity",
    displayName: "r/delhiuniversity",
    officialName: "r/delhiuniversity Student Hub",
    headline: "Official Subreddit Hub · North & South Campus Vibes",
    bio: "Everything Delhi University: North Campus vs South Campus debates, fest updates, society drama, attendance shortages, and PG life in Kamla Nagar.",
    avatarUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&fit=crop",
    points: 3600,
  },
  programmerhumor: {
    subreddit: "ProgrammerHumor",
    username: "programmerhumor",
    displayName: "r/ProgrammerHumor",
    officialName: "r/ProgrammerHumor Tech Hub",
    headline: "Official Subreddit Hub · Developer & CS Memes",
    bio: "When code compiles on the first try but crashes in production. CS department humor, Git merge conflicts, semicolon tears, and LeetCode lore.",
    avatarUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&fit=crop",
    points: 4100,
  },
  indianacademia: {
    subreddit: "IndianAcademia",
    username: "indianacademia",
    displayName: "r/IndianAcademia",
    officialName: "r/IndianAcademia Academic Guidance",
    headline: "Official Subreddit Hub · Career & Higher Education",
    bio: "Guidance on colleges, degrees, master's admissions, research opportunities, and academic pathways in India and abroad.",
    avatarUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&fit=crop",
    points: 3100,
  },
  college: {
    subreddit: "college",
    username: "college",
    displayName: "r/college",
    officialName: "r/college Global Campus Hub",
    headline: "Official Subreddit Hub · Global Student Life",
    bio: "Collegiate experiences, professor interactions, dorm living, exam survival guides, and campus tips from students worldwide.",
    avatarUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&fit=crop",
    points: 3400,
  },
  indiameme: {
    subreddit: "IndiaMeme",
    username: "indiameme",
    displayName: "r/IndiaMeme",
    officialName: "r/IndiaMeme Campus Humor",
    headline: "Official Subreddit Hub · Desi Student Memes",
    bio: "Top-tier desi humor, viral college templates, relatable student struggles, and daily laughs.",
    avatarUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&fit=crop",
    points: 3500,
  },
  engineeringmemes: {
    subreddit: "EngineeringMemes",
    username: "engineeringmemes",
    displayName: "r/EngineeringMemes",
    officialName: "r/EngineeringMemes STEM Hub",
    headline: "Official Subreddit Hub · STEM & Engineering Culture",
    bio: "Approximating pi as 3, rounding gravity to 10, and hoping the bridge doesn't collapse. Pure engineering culture.",
    avatarUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&fit=crop",
    points: 3300,
  },
};

/**
 * Normalizes any subreddit name into a clean, safe username handle.
 * e.g. "r/Btechtards" -> "btechtards", "JEENEETards" -> "jeeneetards"
 */
export function normalizeSubredditHandle(subredditName: string): string {
  return subredditName
    .toLowerCase()
    .replace(/^r\//, "")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 28);
}

/**
 * Ensures an active UserProfile account exists for a given subreddit.
 * If not present, creates the account with customized metadata, verified status, and LP clout.
 */
export async function getOrCreateSubredditProfile(
  db: Database,
  rawSubreddit: string,
  institutionId?: string
): Promise<UserProfile> {
  const cleanHandle = normalizeSubredditHandle(rawSubreddit);
  if (!cleanHandle) {
    throw new Error(`Invalid subreddit name: ${rawSubreddit}`);
  }

  // 1. Check if profile already exists
  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, cleanHandle),
  });

  if (existing) {
    return existing;
  }

  // 2. Resolve institution ID
  let targetInstitutionId = institutionId;
  if (!targetInstitutionId) {
    const defaultInst = await db.query.institutions.findFirst();
    if (!defaultInst) {
      throw new Error("No institution found in database to attach subreddit account to.");
    }
    targetInstitutionId = defaultInst.id;
  }

  // 3. Resolve metadata (known curated metadata or dynamic template)
  const meta = KNOWN_SUBREDDIT_METAS[cleanHandle] || {
    subreddit: rawSubreddit.replace(/^r\//, ""),
    username: cleanHandle,
    displayName: `r/${rawSubreddit.replace(/^r\//, "")}`,
    officialName: `r/${rawSubreddit.replace(/^r\//, "")} Campus Hub`,
    headline: `Official Subreddit Hub · r/${rawSubreddit.replace(/^r\//, "")}`,
    bio: `Curated student memes, video reels, and discussions from the r/${rawSubreddit.replace(/^r\//, "")} community.`,
    avatarUrl: `https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&fit=crop`,
    points: 2000,
  };

  const newProfileId = randomUUID();

  const [inserted] = await db
    .insert(userProfiles)
    .values({
      id: newProfileId,
      userId: `reddit_${cleanHandle}`,
      username: cleanHandle,
      displayName: meta.displayName,
      officialName: meta.officialName,
      headline: meta.headline,
      bio: meta.bio,
      avatarUrl: meta.avatarUrl,
      bannerUrl: meta.bannerUrl || null,
      institutionId: targetInstitutionId,
      role: "STUDENT",
      status: "ACTIVE",
      isSeeded: true,
      points: meta.points,
      lastSeenAt: new Date(),
      socialLinks: {
        platforms: {
          reddit: `https://reddit.com/r/${meta.subreddit}`,
        },
      },
    })
    .returning();

  return inserted;
}

/**
 * Backfills existing posts that came from Reddit or have no author
 * by assigning their authorId to the appropriate subreddit UserProfile.
 */
export async function backfillSubredditAccounts(db: Database): Promise<{ updatedCount: number }> {
  // Find all external posts where the parent post has authorId IS NULL
  const extPosts = await db.query.externalPosts.findMany({
    with: {
      post: true,
    },
  });

  let updatedCount = 0;
  const defaultInst = await db.query.institutions.findFirst();
  if (!defaultInst) return { updatedCount: 0 };

  const cache = new Map<string, UserProfile>();

  for (const ep of extPosts) {
    if (!ep.post || ep.post.authorId) continue;
    const sub = ep.subreddit || "college";
    const handle = normalizeSubredditHandle(sub);

    let profile = cache.get(handle);
    if (!profile) {
      profile = await getOrCreateSubredditProfile(db, sub, defaultInst.id);
      cache.set(handle, profile);
    }

    await db
      .update(posts)
      .set({
        authorId: profile.id,
        isAnonymous: false,
      })
      .where(eq(posts.id, ep.postId));

    updatedCount++;
  }

  return { updatedCount };
}
