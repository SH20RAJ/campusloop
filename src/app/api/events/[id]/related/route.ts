import { and, desc, eq, ne, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    // Authenticated user session (optional)
    const user = await hexclaveServerApp.getUser();
    let currentProfile = null;
    if (user?.id) {
      currentProfile = await db.query.userProfiles.findFirst({
        where: (u, { eq }) => eq(u.userId, user.id),
      });
    }

    // Find current event first
    const currentEvent = await db.query.events.findFirst({
      where: or(eq(events.id, id), eq(events.slug, id)),
    });

    if (!currentEvent) {
      return NextResponse.json({ related: [] });
    }

    // Related conditions:
    // 1. Must NOT be the current event
    // 2. Must be PUBLIC or if PRIVATE, same institution
    // 3. Same eventType or same institution
    const visibilityCondition = currentProfile?.institutionId
      ? or(
          eq(events.visibility, "PUBLIC"),
          and(eq(events.visibility, "PRIVATE"), eq(events.institutionId, currentProfile.institutionId))
        )
      : eq(events.visibility, "PUBLIC");

    const relatedEvents = await db.query.events.findMany({
      where: and(
        ne(events.id, currentEvent.id),
        visibilityCondition,
        or(
          eq(events.eventType, currentEvent.eventType),
          eq(events.institutionId, currentEvent.institutionId)
        )
      ),
      orderBy: [desc(events.startDate)],
      limit: 4,
      with: {
        organizer: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        institution: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        registrations: {
          columns: {
            id: true,
          },
        },
      },
    });

    const enriched = relatedEvents.map((ev) => ({
      id: ev.id,
      slug: ev.slug,
      title: ev.title,
      tagline: ev.tagline,
      bannerUrl: ev.bannerUrl,
      clubName: ev.clubName,
      institution: ev.institution,
      eventType: ev.eventType,
      mode: ev.mode,
      venue: ev.venue,
      startDate: ev.startDate,
      endDate: ev.endDate,
      registrationDeadline: ev.registrationDeadline,
      prizesDescription: ev.prizesDescription,
      entryFee: ev.entryFee,
      loopPointsReward: ev.loopPointsReward,
      attendeeCount: ev.registrations.length,
    }));

    return NextResponse.json({ related: enriched });
  } catch (error) {
    console.error("GET /api/events/[id]/related error:", error);
    return NextResponse.json({ related: [] });
  }
}
