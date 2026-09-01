import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicResourceComments, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    const comments = await db.query.academicResourceComments.findMany({
      where: eq(academicResourceComments.resourceId, id),
      orderBy: [desc(academicResourceComments.createdAt)],
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            points: true,
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching academic comments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const body = (await req.json()) as Record<string, any>;
    const commentBody = body.body?.trim();
    const isHelpful = body.isHelpful !== false;

    if (!commentBody) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const [comment] = await db
      .insert(academicResourceComments)
      .values({
        resourceId: id,
        authorId: profile.id,
        body: commentBody,
        isHelpful,
      })
      .returning();

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        author: {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          points: profile.points,
        },
      },
    });
  } catch (error) {
    console.error("Error posting academic comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
