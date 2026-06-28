import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { reports, userProfiles, posts } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, sql } from "drizzle-orm";

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
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const { reason, details } = (await req.json()) as { reason: string; details?: string };

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    // Insert the report
    await db.insert(reports).values({
      reporterId: profile.id,
      targetType: "POST",
      targetId: id,
      reason,
      details: details || null,
      status: "OPEN",
    });

    // Check count of reports for this post
    const reportsCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(sql`target_id = ${id} AND target_type = 'POST'`);

    const reportsCount = reportsCountResult[0]?.count || 0;

    // Auto-hide rule: Hide post if reports >= 5
    if (reportsCount >= 5) {
      await db
        .update(posts)
        .set({ status: "PENDING_REVIEW" })
        .where(eq(posts.id, id));
    }

    return NextResponse.json({ message: "Post reported successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
