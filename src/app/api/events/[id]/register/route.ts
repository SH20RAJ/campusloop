import { and, eq, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { eventRegistrations, events, notifications, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectIfLacksCapability } from "@/lib/capabilities";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      with: {
        institution: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Capability check: Must be able to participate
    const guardResponse = await rejectIfLacksCapability(profile, "CREATE_POST");
    if (guardResponse) return guardResponse;

    const event = await db.query.events.findFirst({
      where: or(eq(events.id, id), eq(events.slug, id)),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return NextResponse.json({ error: "Registration deadline for this event has passed" }, { status: 400 });
    }

    // Check eligibility restrictions
    const eligibleIds = (event.eligibleInstitutionIds as string[]) || ["ALL"];
    const isOpenToAll = eligibleIds.includes("ALL");
    if (!isOpenToAll && !eligibleIds.includes(profile.institutionId)) {
      return NextResponse.json(
        {
          error:
            "This event is restricted to specific college students. Your campus is not in the eligible list.",
        },
        { status: 403 }
      );
    }

    // Check if already registered
    const existing = await db.query.eventRegistrations.findFirst({
      where: and(eq(eventRegistrations.eventId, event.id), eq(eventRegistrations.profileId, profile.id)),
    });

    if (existing) {
      return NextResponse.json({
        message: "Already registered",
        registration: existing,
      });
    }

    const body = ((await req.json().catch(() => ({}))) || {}) as Record<string, any>;
    const { registrationType = "SOLO", teamName, teamMembers = [], contactPhone, notes } = body;

    const regId = `ereg_${nanoid(12)}`;

    const newReg = {
      id: regId,
      eventId: event.id,
      profileId: profile.id,
      registrationType: registrationType === "TEAM" ? "TEAM" : "SOLO",
      teamName: registrationType === "TEAM" ? teamName?.trim() || "Team" : null,
      teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
      contactPhone: contactPhone?.trim() || null,
      notes: notes?.trim() || null,
      status: "CONFIRMED",
      reminderSet: true,
    };

    await db.insert(eventRegistrations).values(newReg);

    // Award Loop Points for registering
    try {
      const reward = event.loopPointsReward || 25;
      await db
        .update(userProfiles)
        .set({ points: sql`${userProfiles.points} + ${reward}` })
        .where(eq(userProfiles.id, profile.id));
    } catch {
      // Non-blocking
    }

    // Create confirmation notification
    try {
      await db.insert(notifications).values({
        userId: profile.id,
        actorId: event.organizerProfileId,
        type: "EVENT_REGISTRATION",
        referenceId: event.id,
        previewText: `You are officially registered for ${event.title} organized by ${event.clubName}!`,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: "Successfully registered for event!",
      registration: newReg,
      pointsEarned: event.loopPointsReward || 25,
    });
  } catch (error) {
    console.error("POST /api/events/[id]/register error:", error);
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    await db
      .delete(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, event.id), eq(eventRegistrations.profileId, profile.id)));

    return NextResponse.json({ success: true, message: "Registration cancelled" });
  } catch (error) {
    console.error("DELETE /api/events/[id]/register error:", error);
    return NextResponse.json({ error: "Failed to cancel registration" }, { status: 500 });
  }
}
