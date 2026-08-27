import { getDb } from "@/db";
import { notifications,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,desc,eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * The newest unread notification, rendered by the service worker after a push
 * tickle wakes it. Content is fetched over the student's own session, so it
 * never travels through the push service.
 */
export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [latest] = await db.query.notifications.findMany({
      where: and(eq(notifications.userId, profile.id), eq(notifications.isRead, false)),
      orderBy: [desc(notifications.createdAt)],
      limit: 1,
      with: {
        actor: {
          columns: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    const unread = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, profile.id), eq(notifications.isRead, false)));

    if (!latest) {
      return NextResponse.json({ notification: null, unreadCount: 0 });
    }

    // CRUSH_ALERT is intentionally anonymous — never name the sender.
    const anonymous = latest.type === "CRUSH_ALERT";
    const actorName = anonymous ? "Someone" : latest.actor?.displayName || "A student";

    return NextResponse.json({
      unreadCount: unread.length,
      notification: {
        id: latest.id,
        type: latest.type,
        title: buildTitle(latest.type, actorName),
        body: latest.previewText || defaultBody(latest.type, actorName),
        icon: anonymous ? null : latest.actor?.avatarUrl || null,
        url: buildUrl(latest.type, latest.referenceId),
      },
    });
  } catch (error) {
    console.error("GET /api/notifications/latest error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function buildTitle(type: string, actorName: string): string {
  switch (type) {
    case "MATCH":
      return "It's a match! 💫";
    case "CRUSH_ALERT":
      return "Someone has a campus crush 🔒";
    case "FRIEND":
      return `${actorName} followed you back`;
    case "FOLLOW":
      return `${actorName} started following you`;
    case "MILESTONE":
      return "New clout milestone 🏆";
    default:
      return `${actorName} on CampusLoop`;
  }
}

function defaultBody(type: string, actorName: string): string {
  switch (type) {
    case "LIKE":
      return `${actorName} liked your post`;
    case "STORY_LIKE":
      return `${actorName} liked your campus vibe`;
    case "COMMENT":
      return `${actorName} replied to your post`;
    case "REPLY":
    case "STORY_REPLY":
      return `${actorName} replied to you`;
    case "MENTION":
      return `${actorName} mentioned you`;
    case "REPOST":
      return `${actorName} reposted you`;
    case "MATCH":
      return "You both liked each other — say hi!";
    case "CRUSH_ALERT":
      return "A verified student added you to their crush vault";
    case "FRIEND":
      return "You're campus friends now";
    case "FOLLOW":
      return "Tap to view their profile";
    default:
      return "Open CampusLoop to see what's new";
  }
}

function buildUrl(type: string, referenceId: string | null): string {
  if (!referenceId) return "/app/notifications";
  switch (type) {
    case "LIKE":
    case "COMMENT":
    case "REPLY":
    case "MENTION":
    case "REPOST":
      return `/app/post/${referenceId}`;
    case "STORY_LIKE":
    case "STORY_REPLY":
      return `/app/story/${referenceId}`;
    case "MATCH":
      return `/app/chat/${referenceId}`;
    case "CRUSH_ALERT":
      return "/app/crush";
    case "FOLLOW":
    case "FRIEND":
      return `/@${referenceId}`;
    default:
      return "/app/notifications";
  }
}
