import { and, eq, or, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { articles, articleVotes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const db = getDb();
    const user = await hexclaveServerApp.getUser();

    let currentProfile = null;
    if (user) {
      currentProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
      });
    }

    const article = await db.query.articles.findFirst({
      where: or(eq(articles.slug, slug), eq(articles.id, slug)),
      with: {
        author: {
          with: { institution: true },
        },
        institution: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Increment views in background
    try {
      await db
        .update(articles)
        .set({ viewsCount: sql`${articles.viewsCount} + 1` })
        .where(eq(articles.id, article.id));
    } catch (e) {
      console.warn("Failed to increment article view:", e);
    }

    // Check user vote
    let userVote = 0;
    if (currentProfile) {
      const vote = await db.query.articleVotes.findFirst({
        where: and(eq(articleVotes.articleId, article.id), eq(articleVotes.profileId, currentProfile.id)),
      });
      if (vote) {
        userVote = vote.value;
      }
    }

    return NextResponse.json({
      article: {
        ...article,
        viewsCount: article.viewsCount + 1,
        userVote,
      },
    });
  } catch (error) {
    console.error("GET /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const currentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!currentProfile) {
      return NextResponse.json({ error: "Profile required" }, { status: 404 });
    }

    const article = await db.query.articles.findFirst({
      where: or(eq(articles.slug, slug), eq(articles.id, slug)),
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.authorId !== currentProfile.id && currentProfile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not the author" }, { status: 403 });
    }

    const body = (await req.json()) as Record<string, any>;
    const { title, subtitle, content, coverImageUrl, category, tags, status } = body;

    const words = (content || article.content).trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const plainText = (content || article.content)
      .replace(/<[^>]*>/g, "")
      .replace(/#+\s+/g, "")
      .replace(/[*_~`]/g, "")
      .trim();
    const excerpt = plainText.slice(0, 160) + (plainText.length > 160 ? "..." : "");

    const updateData: any = {
      updatedAt: new Date(),
      readingTimeMinutes: readingTime,
      excerpt,
    };

    if (title) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle?.trim() || null;
    if (content) updateData.content = content;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl?.trim() || null;
    if (category) updateData.category = category;
    if (tags && Array.isArray(tags)) updateData.tags = tags;
    if (status) {
      updateData.status = status;
      if (status === "PUBLISHED" && !article.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    await db.update(articles).set(updateData).where(eq(articles.id, article.id));

    return NextResponse.json({
      message: "Article updated successfully",
      article: { ...article, ...updateData },
    });
  } catch (error) {
    console.error("PUT /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const currentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!currentProfile) {
      return NextResponse.json({ error: "Profile required" }, { status: 404 });
    }

    const article = await db.query.articles.findFirst({
      where: or(eq(articles.slug, slug), eq(articles.id, slug)),
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.authorId !== currentProfile.id && currentProfile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not the author" }, { status: 403 });
    }

    await db.delete(articles).where(eq(articles.id, article.id));

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
