import { getDb } from "@/db";
import { bikeBookings, bikeBookingStatusHistory, bikes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
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
    const { status: nextStatus, rejectionReason } = body;

    const booking = await db.query.bikeBookings.findFirst({
      where: eq(bikeBookings.id, id),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {
      status: nextStatus,
      updatedAt: new Date(),
    };

    if (nextStatus === "REJECTED") {
      updatePayload.cancelledBy = "MERCHANT";
      updatePayload.cancellationReason = rejectionReason?.trim() || "Rejected by merchant";
    }

    if (nextStatus === "ACTIVE") {
      updatePayload.actualPickupAt = new Date();
      // Update physical bike status to RENTED
      await db
        .update(bikes)
        .set({ status: "RENTED", updatedAt: new Date() })
        .where(eq(bikes.id, booking.bikeId));
    }

    if (nextStatus === "RETURNED" || nextStatus === "COMPLETED") {
      updatePayload.actualReturnAt = new Date();
      // Free up physical bike status back to AVAILABLE
      await db
        .update(bikes)
        .set({ status: "AVAILABLE", updatedAt: new Date() })
        .where(eq(bikes.id, booking.bikeId));

      if (nextStatus === "COMPLETED") {
        updatePayload.depositRefundStatus = "REFUNDED";
      }
    }

    const [updated] = await db
      .update(bikeBookings)
      .set(updatePayload)
      .where(eq(bikeBookings.id, id))
      .returning();

    // Log status transition history
    await db.insert(bikeBookingStatusHistory).values({
      bookingId: id,
      fromStatus: booking.status,
      toStatus: nextStatus,
      changedBy: "MERCHANT",
      reason: rejectionReason?.trim() || `Status updated to ${nextStatus}`,
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Error advancing bike booking status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
