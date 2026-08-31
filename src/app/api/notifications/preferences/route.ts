import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  type NotificationPreferenceSet,
  updateNotificationPreferences,
} from "@/lib/notification-preferences";

export const dynamic = "force-dynamic";

async function getProfileId(): Promise<string | null> {
  const user = await hexclaveServerApp.getUser();
  if (!user) return null;
  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
    columns: { id: true },
  });
  return profile?.id ?? null;
}

/** The caller's account-wide notification switches. */
export async function GET() {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await getNotificationPreferences(profileId);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("GET /api/notifications/preferences error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Partial update. Only keys present in the body change, so a toggle in the UI
 * sends one field rather than the whole set and cannot clobber a switch that
 * another tab flipped a moment earlier.
 */
export async function PATCH(req: NextRequest) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const patch: Partial<NotificationPreferenceSet> = {};

    for (const key of Object.keys(DEFAULT_NOTIFICATION_PREFERENCES) as (keyof NotificationPreferenceSet)[]) {
      if (typeof body[key] === "boolean") {
        patch[key] = body[key] as boolean;
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid preference fields supplied" }, { status: 400 });
    }

    const preferences = await updateNotificationPreferences(profileId, patch);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("PATCH /api/notifications/preferences error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
