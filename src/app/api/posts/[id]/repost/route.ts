import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { commentary } = (await req.json()) as { commentary?: string };

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Fetch original post
    const originalPost = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: { author: true },
    });

    if (!originalPost) {
      return NextResponse.json({ error: "Original post not found" }, { status: 404 });
    }

    const authorName = originalPost.isAnonymous ? "Anonymous Student" : `@${originalPost.author.username}`;
    
    // Construct repost content
    let newPostBody = "";
    if (commentary && commentary.trim().length > 0) {
      newPostBody = `${commentary.trim()}\n\n💬 Reshared from ${authorName}:\n"${originalPost.body}"`;
    } else {
      newPostBody = `🔁 Reposted from ${authorName}:\n"${originalPost.body}"`;
    }

    // Insert new post into DB with repostOfId DB flag
    const [repostedPost] = await db
      .insert(posts)
      .values({
        authorId: profile.id,
        institutionId: profile.institutionId || originalPost.institutionId,
        body: commentary && commentary.trim().length > 0 ? commentary.trim() : originalPost.body,
        type: originalPost.type,
        repostOfId: originalPost.id,
        repostComment: commentary && commentary.trim().length > 0 ? commentary.trim() : null,
        isAnonymous: false,
        status: "PUBLISHED",
      })
      .returning();

    return NextResponse.json(repostedPost, { status: 201 });
  } catch (error) {
    console.error("Error creating repost:", error);
    return NextResponse.json({ error: "Failed to create repost" }, { status: 500 });
  }
}
