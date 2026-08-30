import { getDb } from "@/db";
import { eventRegistrations, events, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and, eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const event = await db.query.events.findFirst({
      where: or(eq(events.id, id), eq(events.slug, id)),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const reg = await db.query.eventRegistrations.findFirst({
      where: and(
        eq(eventRegistrations.eventId, event.id),
        eq(eventRegistrations.profileId, profile.id)
      ),
    });

    if (!reg) {
      // If not registered yet, create a registration with reminder
      await db.insert(eventRegistrations).values({
        id: `ereg_${nanoid(12)}`,
        eventId: event.id,
        profileId: profile.id,
        registrationType: "SOLO",
        reminderSet: true,
        status: "CONFIRMED",
      });

      return NextResponse.json({ reminderSet: true, registered: true });
    }

    const nextState = !reg.reminderSet;
    await db
      .update(eventRegistrations)
      .set({ reminderSet: nextState })
      .where(eq(eventRegistrations.id, reg.id));

    return NextResponse.json({ reminderSet: nextState });
  } catch (error) {
    console.error("POST /api/events/[id]/reminder error:", error);
    return NextResponse.json({ error: "Failed to toggle reminder" }, { status: 500 });
  }
}
