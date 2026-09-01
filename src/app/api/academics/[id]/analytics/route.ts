import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicResources } from "@/db/schema";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Record<string, any>;
    const { action } = body;

    const db = getDb();

    if (action === "VIEW") {
      const [updated] = await db
        .update(academicResources)
        .set({
          viewsCount: sql`${academicResources.viewsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({ success: true, viewsCount: updated?.viewsCount || 0 });
    }

    if (action === "DOWNLOAD") {
      const [updated] = await db
        .update(academicResources)
        .set({
          downloadsCount: sql`${academicResources.downloadsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({ success: true, downloadsCount: updated?.downloadsCount || 0 });
    }

    if (action === "UPVOTE") {
      const [updated] = await db
        .update(academicResources)
        .set({
          upvotesCount: sql`${academicResources.upvotesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        upvotesCount: updated?.upvotesCount || 0,
        downvotesCount: updated?.downvotesCount || 0,
      });
    }

    if (action === "DOWNVOTE") {
      const [updated] = await db
        .update(academicResources)
        .set({
          downvotesCount: sql`${academicResources.downvotesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        upvotesCount: updated?.upvotesCount || 0,
        downvotesCount: updated?.downvotesCount || 0,
      });
    }

    if (action === "UNDO_UPVOTE") {
      const [updated] = await db
        .update(academicResources)
        .set({
          upvotesCount: sql`GREATEST(0, ${academicResources.upvotesCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        upvotesCount: updated?.upvotesCount || 0,
        downvotesCount: updated?.downvotesCount || 0,
      });
    }

    if (action === "UNDO_DOWNVOTE") {
      const [updated] = await db
        .update(academicResources)
        .set({
          downvotesCount: sql`GREATEST(0, ${academicResources.downvotesCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        upvotesCount: updated?.upvotesCount || 0,
        downvotesCount: updated?.downvotesCount || 0,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating academic analytics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
