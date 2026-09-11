import { type NextRequest, NextResponse } from "next/server";
import { requireAdminProfile } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { notifications, posts, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAdminProfile();
    const body = (await req.json()) as any;
    const { title, message, scope, institutionId, priority, sendNotification } = body;

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const db = getDb();

    // Determine target institution
    let targetInstId = institutionId;
    if (!targetInstId) {
      const fallback = await db.query.institutions.findFirst();
      targetInstId = fallback?.id;
    }

    const postScope = scope === "CAMPUS" ? "CAMPUS" : "INDIA";
    const announcementPrefix =
      priority === "URGENT"
        ? "[URGENT NOTICE]"
        : priority === "WARNING"
        ? "[CAMPUS ALERT]"
        : "[OFFICIAL ANNOUNCEMENT]";

    const postBody = `**${announcementPrefix} ${title.trim()}**\n\n${message.trim()}`;

    // 1. Create official broadcast post
    const [broadcastPost] = await db
      .insert(posts)
      .values({
        authorId: profile.id,
        institutionId: targetInstId,
        title: `${announcementPrefix} ${title.trim()}`,
        body: postBody,
        type: "NORMAL",
        scope: postScope,
        isAnonymous: false,
        status: "PUBLISHED",
      })
      .returning();

    let notificationCount = 0;

    // 2. If sendNotification is true, broadcast notifications to target users
    if (sendNotification) {
      const targetUsers = await db.query.userProfiles.findMany({
        where:
          postScope === "CAMPUS" && targetInstId
            ? eq(userProfiles.institutionId, targetInstId)
            : undefined,
        columns: { id: true },
        limit: 200,
      });

      if (targetUsers.length > 0) {
        const notifValues = targetUsers.map((u) => ({
          userId: u.id,
          type: "MILESTONE",
          actorId: profile.id,
          referenceId: broadcastPost.id,
          previewText: `${announcementPrefix}: ${title.slice(0, 60)}`,
        }));

        await db.insert(notifications).values(notifValues);
        notificationCount = notifValues.length;
      }
    }

    return NextResponse.json({
      success: true,
      broadcastPost,
      notificationCount,
      message: `Broadcast published successfully! ${notificationCount > 0 ? `Sent to ${notificationCount} students.` : ""}`,
    });
  } catch (err: any) {
    console.error("[Admin Broadcasts API Error]:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
