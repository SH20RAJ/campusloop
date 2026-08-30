import { getDb } from "@/db";
import { eventRegistrations, events, institutions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { hasCapability, rejectIfLacksCapability } from "@/lib/capabilities";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

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

    const enriched = list.map((ev) => {
      const isRegistered = currentProfile
        ? ev.registrations.some((r) => r.profileId === currentProfile.id)
        : false;
      const userReg = currentProfile
        ? ev.registrations.find((r) => r.profileId === currentProfile.id)
        : null;

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
      };
    });

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
    } = body;

    if (!title || !description || !clubName || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, description, club name, start date, and end date are required" },
        { status: 400 }
      );
    }

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
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      participationType,
      minTeamSize: Number(minTeamSize) || 1,
      maxTeamSize: Number(maxTeamSize) || 4,
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      isPaid: Boolean(isPaid),
      entryFee: entryFee || "Free",
      prizesDescription: prizesDescription?.trim() || null,
      perks: Array.isArray(perks) ? perks : ["Certificates", "Prizes", "Loop Points"],
      loopPointsReward: Number(loopPointsReward) || 30,
      status: "PUBLISHED",
    };

    await db.insert(events).values(newEvent);

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
