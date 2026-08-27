import { getDb } from "@/db";
import { posts,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,desc,eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface TrendItem {
  category: string;
  topic: string;
  postCount: number;
  formattedCount: string;
  href: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  category: string;
  timeAgo: string;
  postCount: string;
  authorName?: string;
  authorAvatar?: string | null;
  href: string;
}

export async function GET(req: Request) {
  try {
    let user = null;
    try {
      user = await hexclaveServerApp.getUser();
    } catch {
      // Unauthenticated or public viewer
    }
    const { searchParams } = new URL(req.url);
    const requestedScope = searchParams.get("scope") === "GLOBAL" ? "GLOBAL" : "CAMPUS";


    const db = getDb();
    let userInstitutionId: string | null = null;
    let collegeName = "Your Campus";

    if (user) {
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
        with: { institution: true },
      });
      if (profile) {
        userInstitutionId = profile.institutionId;
        collegeName = profile.institution?.name?.split(",")[0] || "Your Campus";
      }
    }

    // Determine query conditions based on scope
    const conditions = [eq(posts.status, "PUBLISHED")];
    if (requestedScope === "CAMPUS" && userInstitutionId) {
      conditions.push(eq(posts.institutionId, userInstitutionId));
    }

    // Query published posts (up to 300 to aggregate full trends)
    const recentPosts = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: [desc(posts.createdAt)],
      limit: 300,
      with: {
        author: true,
        institution: true,
        votes: true,
        comments: true,
      },
    });

    // 1. Extract and aggregate hashtags from real post bodies
    const hashtagMap = new Map<string, { count: number; category: string }>();

    for (const post of recentPosts) {
      const text = post.body || "";
      const matches = text.match(/#([a-zA-Z0-9_\u0900-\u097F]+)/g);
      if (matches) {
        for (const rawTag of matches) {
          const cleanTag = rawTag.trim();
          const existing = hashtagMap.get(cleanTag) || {
            count: 0,
            category: requestedScope === "CAMPUS" ? `Trending in ${collegeName}` : "Trending in India",
          };
          existing.count += 1;
          hashtagMap.set(cleanTag, existing);
        }
      }
    }

    // If campus scope has fewer than 5 hashtags, backfill with real global hashtags from the DB
    if (hashtagMap.size < 5) {
      const globalPosts = await db.query.posts.findMany({
        where: eq(posts.status, "PUBLISHED"),
        orderBy: [desc(posts.createdAt)],
        limit: 300,
      });

      for (const post of globalPosts) {
        const text = post.body || "";
        const matches = text.match(/#([a-zA-Z0-9_\u0900-\u097F]+)/g);
        if (matches) {
          for (const rawTag of matches) {
            const cleanTag = rawTag.trim();
            if (!hashtagMap.has(cleanTag)) {
              hashtagMap.set(cleanTag, {
                count: 1,
                category: "Trending in India",
              });
            } else if (hashtagMap.get(cleanTag)?.category === "Trending in India") {
              const item = hashtagMap.get(cleanTag)!;
              item.count += 1;
            }
          }
        }
      }
    }

    // Sort hashtags by count descending
    const sortedHashtags = Array.from(hashtagMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    const trends: TrendItem[] = sortedHashtags.map(([tag, data]) => ({
      category: data.category,
      topic: tag,
      postCount: data.count,
      formattedCount: data.count === 1 ? "1 post" : `${data.count} posts`,
      href: `/app/hashtag/${encodeURIComponent(tag.replace(/^#/, ""))}`,
    }));

    // 2. Extract Top News / Discussions (highest engagement)
    const newsSource = recentPosts.length > 0 ? recentPosts : await db.query.posts.findMany({
      where: eq(posts.status, "PUBLISHED"),
      orderBy: [desc(posts.createdAt)],
      limit: 50,
      with: { author: true, institution: true, votes: true, comments: true },
    });

    const newsItems: NewsItem[] = newsSource
      .map((p) => {
        const score = (p.votes || []).length + (p.comments || []).length * 2;
        return { post: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ post: p }) => {
        const title = p.title || p.body.slice(0, 80) + (p.body.length > 80 ? "..." : "");
        const postTotal = (p.votes || []).length + (p.comments || []).length;
        const inst = p.institution?.name?.split(",")[0] || collegeName;
        return {
          id: p.id,
          headline: title,
          category: `Campus Buzz · ${inst}`,
          timeAgo: "Trending now",
          postCount: `${postTotal} interactions`,
          authorName: p.isAnonymous ? "Anonymous Student" : p.author?.displayName || "Student",
          authorAvatar: p.isAnonymous ? null : p.author?.avatarUrl || null,
          href: `/app/post/${p.id}`,
        };
      });

    return NextResponse.json({
      trends,
      news: newsItems,
      scope: requestedScope,
      collegeName,
    });
  } catch (error) {
    console.error("Error generating trends:", error);
    return NextResponse.json({
      trends: [],
      news: [],
      scope: "GLOBAL",
      collegeName: "Campus",
    });
  }
}
