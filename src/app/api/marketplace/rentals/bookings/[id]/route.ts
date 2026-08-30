import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { bikeBookingStatusHistory, bikeBookings, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
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

    const booking = await db.query.bikeBookings.findFirst({
      where: and(eq(bikeBookings.id, id), eq(bikeBookings.studentId, profile.id)),
      with: {
        bike: true,
        merchant: {
          columns: {
            id: true,
            name: true,
            slug: true,
            address: true,
            locationPin: true,
            phone: true,
            pickupInstructions: true,
          },
        },
        documents: true,
        inspections: true,
        statusHistory: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error fetching student bike booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
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

    const body = (await req.json()) as Record<string, any>;
    const { action, reason } = body;

    if (action !== "CANCEL") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const booking = await db.query.bikeBookings.findFirst({
      where: and(eq(bikeBookings.id, id), eq(bikeBookings.studentId, profile.id)),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "REQUESTED" && booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Cannot cancel booking once pickup has started or completed." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(bikeBookings)
      .set({
        status: "CANCELLED",
        cancelledBy: "STUDENT",
        cancellationReason: reason?.trim() || "Cancelled by student",
        updatedAt: new Date(),
      })
      .where(eq(bikeBookings.id, id))
      .returning();

    await db.insert(bikeBookingStatusHistory).values({
      bookingId: id,
      fromStatus: booking.status,
      toStatus: "CANCELLED",
      changedBy: "STUDENT",
      reason: reason?.trim() || "Cancelled by student",
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
