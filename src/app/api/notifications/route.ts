import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { notifications, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "all";

    // Base query conditions
    const whereConditions = [eq(notifications.userId, profile.id)];

    if (tab === "mentions") {
      whereConditions.push(eq(notifications.type, "MENTION"));
    } else if (tab === "replies") {
      whereConditions.push(inArray(notifications.type, ["COMMENT", "REPLY", "STORY_REPLY"]));
    } else if (tab === "reactions") {
      whereConditions.push(inArray(notifications.type, ["LIKE", "REPOST", "STORY_LIKE"]));
    } else if (tab === "crushes") {
      whereConditions.push(inArray(notifications.type, ["CRUSH_ALERT", "MATCH"]));
    } else if (tab === "messages") {
      whereConditions.push(eq(notifications.type, "MESSAGE"));
    } else if (tab === "posts") {
      whereConditions.push(eq(notifications.type, "NEW_POST"));
    }

    const rawNotifications = await db.query.notifications.findMany({
      where: and(...whereConditions),
      orderBy: [desc(notifications.createdAt)],
      with: {
        actor: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            points: true,
            institutionId: true,
            role: true,
          },
          with: {
            institution: {
              columns: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      limit: 60,
    });

    // Anonymize actors for non-mutual CRUSH_ALERT to protect intent-hidden design
    let sanitized = rawNotifications.map((n) => {
      if (n.type === "CRUSH_ALERT") {
        return {
          ...n,
          actor: {
            id: "hidden",
            username: "secret_crush",
            displayName: "Anonymous Student",
            avatarUrl: null,
            points: 0,
            institutionId: null,
            role: "STUDENT",
            institution: null,
          },
        };
      }
      return n;
    });

    // If verified tab is chosen, filter where actor is verified (points >= 150 or admin)
    if (tab === "verified") {
      sanitized = sanitized.filter((n) => (n.actor?.points || 0) >= 150 || n.actor?.role === "ADMIN");
    }

    // Count total unread notifications for this user
    const [unreadRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, profile.id), eq(notifications.isRead, false)));

    const unreadCount = unreadRow?.count || 0;

    return NextResponse.json({
      notifications: sanitized,
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as { all?: boolean; id?: string };

    if (body.all) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, profile.id), eq(notifications.isRead, false)));
    } else if (body.id) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, body.id), eq(notifications.userId, profile.id)));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const scope = searchParams.get("scope"); // "all" | "read"
    const tab = searchParams.get("tab");

    // Every branch is scoped to the caller's own rows, so one student can never
    // clear another's notifications.
    const ownedByCaller = eq(notifications.userId, profile.id);

    if (id) {
      await db.delete(notifications).where(and(eq(notifications.id, id), ownedByCaller));
      return NextResponse.json({ success: true, deleted: "one" });
    }

    if (scope === "read") {
      await db.delete(notifications).where(and(ownedByCaller, eq(notifications.isRead, true)));
      return NextResponse.json({ success: true, deleted: "read" });
    }

    if (scope === "all") {
      const conditions = [ownedByCaller];

      // Clearing from a filtered tab only clears that tab, which is what the
      // visible list implies.
      if (tab === "mentions") {
        conditions.push(eq(notifications.type, "MENTION"));
      } else if (tab === "replies") {
        conditions.push(inArray(notifications.type, ["COMMENT", "REPLY", "STORY_REPLY"]));
      } else if (tab === "reactions") {
        conditions.push(inArray(notifications.type, ["LIKE", "REPOST", "STORY_LIKE"]));
      } else if (tab === "crushes") {
        conditions.push(inArray(notifications.type, ["CRUSH_ALERT", "MATCH"]));
      } else if (tab === "messages") {
        conditions.push(eq(notifications.type, "MESSAGE"));
      } else if (tab === "posts") {
        conditions.push(eq(notifications.type, "NEW_POST"));
      }

      await db.delete(notifications).where(and(...conditions));
      return NextResponse.json({ success: true, deleted: "all" });
    }

    return NextResponse.json({ error: "Provide an `id`, or `scope=all` / `scope=read`" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
