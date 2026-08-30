import { and, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { notifications, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { NotificationsClient } from "./notifications-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications | CampusLoop",
  description: "Stay updated with campus replies, upvotes, mentions, and secret crushes.",
};

export default async function NotificationsPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/handler/sign-in");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  let sanitized: any[] = [];
  let unreadCount = 0;

  try {
    // Initial server-side query
    const rawList = await db.query.notifications.findMany({
      where: eq(notifications.userId, profile.id),
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
      limit: 50,
    });

    // Anonymize actors for non-mutual CRUSH_ALERT
    sanitized = rawList.map((n) => {
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

    // Calculate unread count
    const [unreadRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, profile.id), eq(notifications.isRead, false)));

    unreadCount = unreadRow?.count || 0;
  } catch (error) {
    console.error("NotificationsPage server query error:", error);
  }

  return <NotificationsClient initialNotifications={sanitized} initialUnreadCount={unreadCount} />;
}
