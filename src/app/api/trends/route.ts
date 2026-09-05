import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { cleanSnippet } from "@/lib/utils";

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

    // 1. Extract and aggregate hashtags using high-performance PostgreSQL regexp_matches
    const tagSql =
      requestedScope === "CAMPUS" && userInstitutionId
        ? sql`
          SELECT 
            (regexp_matches(body, '#[a-zA-Z0-9_]+', 'g'))[1] as tag,
            count(*)::int as count
          FROM posts
          WHERE status = 'PUBLISHED' AND institution_id = ${userInstitutionId}
          GROUP BY tag
          ORDER BY count DESC
          LIMIT 12;
        `
        : sql`
          SELECT 
            (regexp_matches(body, '#[a-zA-Z0-9_]+', 'g'))[1] as tag,
            count(*)::int as count
          FROM posts
          WHERE status = 'PUBLISHED'
          GROUP BY tag
          ORDER BY count DESC
          LIMIT 12;
        `;

    const tagResults = await db.execute(tagSql);
    const rows = ((tagResults.rows || []) as Array<{ tag: string; count: number }>).slice();

    // If campus scope has fewer than 4 results, fill with global trends
    if (requestedScope === "CAMPUS" && rows.length < 4) {
      const globalTags = await db.execute(sql`
        SELECT 
          (regexp_matches(body, '#[a-zA-Z0-9_]+', 'g'))[1] as tag,
          count(*)::int as count
        FROM posts
        WHERE status = 'PUBLISHED'
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10;
      `);
      const existingTags = new Set(rows.map((r) => r.tag.toLowerCase()));
      for (const gr of (globalTags.rows || []) as Array<{ tag: string; count: number }>) {
        if (!existingTags.has(gr.tag.toLowerCase())) {
          rows.push(gr);
          existingTags.add(gr.tag.toLowerCase());
        }
      }
    }

    const categoryPrefix = requestedScope === "CAMPUS" ? `Trending in ${collegeName}` : "Trending in India";

    const trends: TrendItem[] = rows.slice(0, 10).map((r) => ({
      category: categoryPrefix,
      topic: r.tag.startsWith("#") ? r.tag : `#${r.tag}`,
      postCount: Number(r.count),
      formattedCount: Number(r.count) === 1 ? "1 post" : `${r.count} posts`,
      href: `/app/hashtag/${encodeURIComponent(r.tag.replace(/^#/, ""))}`,
    }));

    // 2. Extract Top News / Discussions (highest engagement)
    const newsSource =
      recentPosts.length > 0
        ? recentPosts
        : await db.query.posts.findMany({
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
        const title = cleanSnippet(p.title || p.body, 80) || "Campus Buzz Discussion";
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
