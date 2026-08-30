import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { bikeAvailabilityBlocks, bikeBookings, bikes } from "@/db/schema";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ bikeId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { bikeId } = await params;
    const { searchParams } = new URL(req.url);
    const startAtStr = searchParams.get("startAt");
    const endAtStr = searchParams.get("endAt");

    const db = getDb();

    const bike = await db.query.bikes.findFirst({
      where: eq(bikes.id, bikeId),
      with: {
        merchant: {
          columns: {
            id: true,
            name: true,
            slug: true,
            address: true,
            locationPin: true,
            rating: true,
            reviewCount: true,
            phone: true,
            pickupInstructions: true,
          },
        },
      },
    });

    if (!bike || bike.status === "INACTIVE") {
      return NextResponse.json({ error: "Bike not found" }, { status: 404 });
    }

    let isAvailableForDates = true;
    let overlapReason: string | null = null;
    let rentalDays = 1;
    let rentalAmount = bike.dailyPrice;

    if (startAtStr && endAtStr) {
      const startAt = new Date(startAtStr);
      const endAt = new Date(endAtStr);

      if (!isNaN(startAt.getTime()) && !isNaN(endAt.getTime()) && endAt > startAt) {
        // Calculate duration in days (or fractions)
        const diffMs = endAt.getTime() - startAt.getTime();
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        rentalDays = Math.max(1, Math.ceil(diffHours / 24));
        rentalAmount = rentalDays * bike.dailyPrice;

        // Check overlapping bookings
        const overlappingBooking = await db.query.bikeBookings.findFirst({
          where: and(
            eq(bikeBookings.bikeId, bikeId),
            inArray(bikeBookings.status, ["REQUESTED", "CONFIRMED", "READY_FOR_PICKUP", "ACTIVE"]),
            sql`${bikeBookings.startAt} < ${endAt} AND ${bikeBookings.endAt} > ${startAt}`
          ),
        });

        if (overlappingBooking) {
          isAvailableForDates = false;
          overlapReason = "This bike already has a booking during your selected period.";
        }

        // Check maintenance or merchant blocks
        if (isAvailableForDates) {
          const overlappingBlock = await db.query.bikeAvailabilityBlocks.findFirst({
            where: and(
              eq(bikeAvailabilityBlocks.bikeId, bikeId),
              sql`${bikeAvailabilityBlocks.startAt} < ${endAt} AND ${bikeAvailabilityBlocks.endAt} > ${startAt}`
            ),
          });

          if (overlappingBlock) {
            isAvailableForDates = false;
            overlapReason =
              overlappingBlock.reason === "MAINTENANCE"
                ? "This bike is scheduled for maintenance during this time."
                : "This bike is unavailable for booking during this time.";
          }
        }
      }
    }

    return NextResponse.json({
      bike,
      availability: {
        isAvailableForDates,
        overlapReason,
        rentalDays,
        rentalAmount,
        depositAmount: bike.securityDeposit,
        totalPayable: rentalAmount + bike.securityDeposit,
      },
    });
  } catch (error) {
    console.error("Error fetching bike detail:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
