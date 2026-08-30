import { getDb } from "@/db";
import { articles, articleVotes, institutions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { awardPoints } from "@/lib/gamification-server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function createExcerpt(content: string): string {
  // Strip markdown formatting and HTML tags for a clean excerpt
  const plainText = content
    .replace(/<[^>]*>/g, "")
    .replace(/#+\s+/g, "")
    .replace(/[*_~`]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
  return plainText.slice(0, 160) + (plainText.length > 160 ? "..." : "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 30);
    const offset = (page - 1) * limit;

    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const query = searchParams.get("q");
    const scope = searchParams.get("scope") || "GLOBAL";
    const sort = searchParams.get("sort") || "latest"; // latest, popular, trending
    const status = searchParams.get("status") || "PUBLISHED";
    const authorId = searchParams.get("authorId");

    const user = await hexclaveServerApp.getUser();
    const db = getDb();

    let currentProfile = null;
    if (user) {
      currentProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
      });
    }

    const conditions: any[] = [eq(articles.status, status)];

    if (authorId) {
      conditions.push(eq(articles.authorId, authorId));
    }

    if (scope === "CAMPUS" && currentProfile?.institutionId) {
      conditions.push(eq(articles.institutionId, currentProfile.institutionId));
    }

    if (category && category !== "ALL") {
      conditions.push(eq(articles.category, category));
    }

    if (query) {
      const pattern = `%${query.trim()}%`;
      conditions.push(
        or(
          ilike(articles.title, pattern),
          ilike(articles.subtitle, pattern),
          ilike(articles.excerpt, pattern)
        )
      );
    }

    let orderByClause = [desc(articles.publishedAt)];
    if (sort === "popular") {
      orderByClause = [desc(articles.upvotesCount), desc(articles.viewsCount)];
    } else if (sort === "trending") {
      orderByClause = [desc(articles.viewsCount), desc(articles.createdAt)];
    }

    // The hub, feed widget and search all render cards from `excerpt`, so the
    // full markdown body is never needed here and would dominate the response.
    const articleList = await db.query.articles.findMany({
      where: and(...conditions),
      orderBy: orderByClause,
      limit,
      offset,
      columns: { content: false },
      with: {
        author: {
          with: { institution: true },
        },
        institution: true,
      },
    });

    // Check viewer votes if logged in
    let userVotesMap: Record<string, number> = {};
    if (currentProfile && articleList.length > 0) {
      const articleIds = articleList.map((a) => a.id);
      const userVotes = await db.query.articleVotes.findMany({
        where: and(
          eq(articleVotes.profileId, currentProfile.id),
          sql`${articleVotes.articleId} IN ${articleIds}`
        ),
      });
      userVotes.forEach((v) => {
        userVotesMap[v.articleId] = v.value;
      });
    }

    const enriched = articleList.map((art) => ({
      ...art,
      userVote: userVotesMap[art.id] || 0,
    }));

    return NextResponse.json({
      articles: enriched,
      page,
      hasMore: articleList.length === limit,
    });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      with: { institution: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile required" }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, any>;
    const {
      title,
      subtitle,
      content,
      coverImageUrl,
      category = "GENERAL",
      tags = [],
      status = "PUBLISHED",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Article title is required" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Article content is required" }, { status: 400 });
    }

    const baseSlug = slugify(title);
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const finalSlug = `${baseSlug || "article"}-${uniqueSuffix}`;

    const readingTime = calculateReadingTime(content);
    const excerpt = createExcerpt(content);
    const articleId = `art_${Date.now()}_${uniqueSuffix}`;

    const newArticle = {
      id: articleId,
      slug: finalSlug,
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      content,
      excerpt,
      coverImageUrl: coverImageUrl?.trim() || null,
      authorId: profile.id,
      institutionId: profile.institutionId || null,
      category,
      tags: Array.isArray(tags) ? tags : [],
      readingTimeMinutes: readingTime,
      viewsCount: 0,
      upvotesCount: 0,
      downvotesCount: 0,
      isFeatured: false,
      status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(articles).values(newArticle);

    // Award clout Loop Points for publishing an article (+15 LP)
    if (status === "PUBLISHED") {
      try {
        await awardPoints(profile.id, 15, "ARTICLE_PUBLISHED");
      } catch (e) {
        console.warn("Failed to award LP for article:", e);
      }
    }

    return NextResponse.json({
      article: newArticle,
      message: status === "DRAFT" ? "Draft saved successfully" : "Article published successfully!",
    });
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
