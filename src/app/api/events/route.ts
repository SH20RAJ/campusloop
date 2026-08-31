import { and, desc, eq, ilike, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { events, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectIfLacksCapability } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "ALL";
    const scope = searchParams.get("scope") || "ALL"; // 'MY_CAMPUS' | 'ALL'
    const query = searchParams.get("q") || "";

    // Authenticated user session
    const user = await hexclaveServerApp.getUser();
    let currentProfile = null;
    if (user?.id) {
      currentProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
      });
    }

    const conditions = [];

    // Category filter
    if (category !== "ALL") {
      const typeMap: Record<string, string> = {
        hackathons: "HACKATHON",
        workshops: "WORKSHOP",
        fests: "FEST",
        cultural: "CULTURAL",
        competitions: "COMPETITION",
        seminars: "SEMINAR",
        meetups: "MEETUP",
      };
      const mappedType = typeMap[category.toLowerCase()] || category.toUpperCase();
      conditions.push(eq(events.eventType, mappedType));
    }

    // Campus scope filter
    if (scope === "MY_CAMPUS" && currentProfile?.institutionId) {
      conditions.push(eq(events.institutionId, currentProfile.institutionId));
    }

    // Search query
    if (query.trim()) {
      const pattern = `%${query.trim()}%`;
      conditions.push(
        or(
          ilike(events.title, pattern),
          ilike(events.clubName, pattern),
          ilike(events.description, pattern),
          ilike(events.venue, pattern)
        )
      );
    }

    // Visibility filter:
    // 1. Never show UNLISTED events in the general listing/search unless specifically invited
    // 2. PRIVATE events only shown if user is from the same institution or is organizer
    if (currentProfile?.institutionId) {
      conditions.push(
        or(
          eq(events.visibility, "PUBLIC"),
          and(eq(events.visibility, "PRIVATE"), eq(events.institutionId, currentProfile.institutionId)),
          eq(events.organizerProfileId, currentProfile.id)
        )
      );
    } else {
      // Unauthenticated / guest only sees PUBLIC
      conditions.push(eq(events.visibility, "PUBLIC"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db.query.events.findMany({
      where: whereClause,
      orderBy: [desc(events.startDate)],
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
            logoUrl: true,
          },
        },
        registrations: {
          columns: {
            id: true,
            profileId: true,
            reminderSet: true,
          },
        },
      },
    });

    const sort = searchParams.get("sort") || "trending"; // 'trending' | 'upcoming' | 'latest'

    const enriched = list.map((ev) => {
      const isRegistered = currentProfile
        ? ev.registrations.some((r) => r.profileId === currentProfile.id)
        : false;
      const userReg = currentProfile ? ev.registrations.find((r) => r.profileId === currentProfile.id) : null;

      return {
        id: ev.id,
        slug: ev.slug,
        title: ev.title,
        tagline: ev.tagline,
        description: ev.description,
        bannerUrl: ev.bannerUrl,
        clubName: ev.clubName,
        organizer: ev.organizer,
        institution: ev.institution,
        eligibleInstitutionIds: ev.eligibleInstitutionIds,
        eventType: ev.eventType,
        mode: ev.mode,
        venue: ev.venue,
        meetingUrl: ev.meetingUrl,
        startDate: ev.startDate,
        endDate: ev.endDate,
        registrationDeadline: ev.registrationDeadline,
        participationType: ev.participationType,
        minTeamSize: ev.minTeamSize,
        maxTeamSize: ev.maxTeamSize,
        maxParticipants: ev.maxParticipants,
        isPaid: ev.isPaid,
        entryFee: ev.entryFee,
        prizesDescription: ev.prizesDescription,
        perks: ev.perks,
        loopPointsReward: ev.loopPointsReward,
        status: ev.status,
        attendeeCount: ev.registrations.length,
        isRegistered,
        reminderSet: userReg?.reminderSet ?? false,
        createdAt: ev.createdAt,
      };
    });

    const now = Date.now();
    if (sort === "trending") {
      enriched.sort((a, b) => {
        const regScoreA = Math.log10(1 + (a.attendeeCount || 0)) * 4.0;
        const regScoreB = Math.log10(1 + (b.attendeeCount || 0)) * 4.0;

        const startDiffDaysA = Math.max(0, (new Date(a.startDate).getTime() - now) / (1000 * 60 * 60 * 24));
        const startDiffDaysB = Math.max(0, (new Date(b.startDate).getTime() - now) / (1000 * 60 * 60 * 24));

        const urgencyA = startDiffDaysA <= 14 ? ((14 - startDiffDaysA) / 14) * 3.0 : 0;
        const urgencyB = startDiffDaysB <= 14 ? ((14 - startDiffDaysB) / 14) * 3.0 : 0;

        const affinityA =
          currentProfile?.institutionId && (a.institution as any)?.id === currentProfile.institutionId
            ? 2.5
            : 0;
        const affinityB =
          currentProfile?.institutionId && (b.institution as any)?.id === currentProfile.institutionId
            ? 2.5
            : 0;

        const scoreA = regScoreA + urgencyA + affinityA;
        const scoreB = regScoreB + urgencyB + affinityB;

        return scoreB - scoreA;
      });
    } else if (sort === "upcoming") {
      enriched.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } else if (sort === "latest") {
      enriched.sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime()
      );
    }

    return NextResponse.json({ events: enriched });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    // Check capability: Aspirants / Viewers cannot create events without connecting college email
    const guardResponse = await rejectIfLacksCapability(profile, "CREATE_POST");
    if (guardResponse) return guardResponse;

    const body = (await req.json()) as Record<string, any>;
    const {
      title,
      tagline,
      description,
      bannerUrl,
      clubName,
      eligibleInstitutionIds = ["ALL"],
      eventType = "HACKATHON",
      mode = "OFFLINE",
      venue,
      meetingUrl,
      startDate,
      endDate,
      registrationDeadline,
      participationType = "SOLO",
      minTeamSize = 1,
      maxTeamSize = 4,
      maxParticipants,
      isPaid = false,
      entryFee = "Free",
      prizesDescription,
      perks = ["Certificates", "Prizes", "Loop Points"],
      loopPointsReward = 30,
      status = "PUBLISHED",
      visibility = "PUBLIC",
    } = body;

    if (!title || !description || !clubName || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, description, club name, start date, and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Start and end dates must be valid" }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ error: "The event end time must be after its start time" }, { status: 400 });
    }

    const deadline = registrationDeadline ? new Date(registrationDeadline) : null;
    if (deadline && !Number.isNaN(deadline.getTime()) && deadline > start) {
      return NextResponse.json(
        { error: "Registrations must close on or before the event starts" },
        { status: 400 }
      );
    }

    // Only organiser-selectable states; COMPLETED/CANCELLED are lifecycle-driven.
    const safeStatus = status === "DRAFT" ? "DRAFT" : "PUBLISHED";

    const eventId = `event_${nanoid(12)}`;
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${nanoid(6)}`;

    const newEvent = {
      id: eventId,
      slug,
      title: title.trim(),
      tagline: tagline?.trim() || null,
      description: description.trim(),
      bannerUrl: bannerUrl || null,
      clubName: clubName.trim(),
      organizerProfileId: profile.id,
      institutionId: profile.institutionId,
      eligibleInstitutionIds,
      eventType,
      mode,
      venue: venue?.trim() || null,
      meetingUrl: meetingUrl?.trim() || null,
      startDate: start,
      endDate: end,
      registrationDeadline: deadline && !Number.isNaN(deadline.getTime()) ? deadline : null,
      participationType,
      minTeamSize: Number(minTeamSize) || 1,
      maxTeamSize: Number(maxTeamSize) || 4,
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      isPaid: Boolean(isPaid),
      entryFee: entryFee || "Free",
      prizesDescription: prizesDescription?.trim() || null,
      perks: Array.isArray(perks) ? perks : ["Certificates", "Prizes", "Loop Points"],
      loopPointsReward: Number(loopPointsReward) || 30,
      status: safeStatus,
      visibility: ["PUBLIC", "UNLISTED", "PRIVATE"].includes(visibility) ? visibility : "PUBLIC",
    };

    await db.insert(events).values(newEvent);

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
