import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { articles, userProfiles } from "@/db/schema";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { username: rawUsername } = await params;
    const cleanUsername = rawUsername.replace(/^@/, "").toLowerCase().trim();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PUBLISHED";

    const db = getDb();
    const targetUser = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, cleanUsername),
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // This powers a card list, which never renders the body — omitting `content`
    // keeps a prolific author's profile from shipping a megabyte of markdown.
    const userArticles = await db.query.articles.findMany({
      where: and(eq(articles.authorId, targetUser.id), eq(articles.status, status)),
      orderBy: [desc(articles.createdAt)],
      limit: 60,
      columns: { content: false },
      with: {
        author: {
          with: { institution: true },
        },
        institution: true,
      },
    });

    return NextResponse.json({ articles: userArticles });
  } catch (error) {
    console.error("GET /api/articles/user/[username] error:", error);
    return NextResponse.json({ error: "Failed to fetch user articles" }, { status: 500 });
  }
}
