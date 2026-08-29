import { getDb } from "@/db";
import { bikeBookings, bikeInspections, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const booking = await db.query.bikeBookings.findFirst({
      where: eq(bikeBookings.id, id),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, any>;
    const {
      type = "PICKUP_HANDOVER",
      frontOk = true,
      rearOk = true,
      tyresOk = true,
      lightsOk = true,
      odometerKm,
      fuelLevel = "FULL",
      hasDamage = false,
      damageNotes,
      photos = [],
    } = body;

    const [inspection] = await db
      .insert(bikeInspections)
      .values({
        bookingId: id,
        bikeId: booking.bikeId,
        type,
        frontOk,
        rearOk,
        tyresOk,
        lightsOk,
        odometerKm: typeof odometerKm === "number" ? odometerKm : null,
        fuelLevel,
        hasDamage,
        damageNotes: damageNotes?.trim() || null,
        photos,
        inspectorRole: "MERCHANT",
      })
      .returning();

    // If damage reported at return, set deposit state to DISPUTED (PRD item 15 & 20)
    if (type === "RETURN_CHECK" && hasDamage) {
      await db
        .update(bikeBookings)
        .set({
          depositRefundStatus: "DISPUTED",
          status: "DISPUTED",
          updatedAt: new Date(),
        })
        .where(eq(bikeBookings.id, id));
    }

    return NextResponse.json({ success: true, inspection });
  } catch (error) {
    console.error("Error creating bike inspection:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
