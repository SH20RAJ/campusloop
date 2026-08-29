import { getDb } from "@/db";
import {
  bikeAvailabilityBlocks,
  bikeBookingDocuments,
  bikeBookings,
  bikeBookingStatusHistory,
  bikes,
  userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
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
    const {
      bikeId,
      startAt: startAtStr,
      endAt: endAtStr,
      customerPhone,
      hostelAddress,
      specialNotes,
      drivingLicenseNumber,
      drivingLicenseUrl,
      aadhaarLast4,
      aadhaarUrl,
      studentIdCardUrl,
      paymentMethod = "COD",
    } = body;

    if (!bikeId || !startAtStr || !endAtStr || !customerPhone || !hostelAddress) {
      return NextResponse.json(
        { error: "Bike, dates, contact phone, and hostel address are required" },
        { status: 400 }
      );
    }

    if (!drivingLicenseNumber) {
      return NextResponse.json(
        { error: "Driving License number is required for vehicle rentals" },
        { status: 400 }
      );
    }

    const startAt = new Date(startAtStr);
    const endAt = new Date(endAtStr);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()) || endAt <= startAt) {
      return NextResponse.json({ error: "Invalid rental time range" }, { status: 400 });
    }

    // 1. Fetch bike
    const bike = await db.query.bikes.findFirst({
      where: eq(bikes.id, bikeId),
    });

    if (!bike || bike.status === "INACTIVE") {
      return NextResponse.json({ error: "Bike not available for rental" }, { status: 404 });
    }

    // 2. Strict Server-Side Double-Booking Prevention Check (Existing Bookings)
    const overlappingBooking = await db.query.bikeBookings.findFirst({
      where: and(
        eq(bikeBookings.bikeId, bikeId),
        inArray(bikeBookings.status, ["REQUESTED", "CONFIRMED", "READY_FOR_PICKUP", "ACTIVE"]),
        sql`${bikeBookings.startAt} < ${endAt} AND ${bikeBookings.endAt} > ${startAt}`
      ),
    });

    if (overlappingBooking) {
      return NextResponse.json(
        {
          error:
            "This bike already has a confirmed or active booking during your selected period. Please choose a different time slot or bike.",
        },
        { status: 409 }
      );
    }

    // 3. Strict Server-Side Maintenance Block Check
    const overlappingBlock = await db.query.bikeAvailabilityBlocks.findFirst({
      where: and(
        eq(bikeAvailabilityBlocks.bikeId, bikeId),
        sql`${bikeAvailabilityBlocks.startAt} < ${endAt} AND ${bikeAvailabilityBlocks.endAt} > ${startAt}`
      ),
    });

    if (overlappingBlock) {
      return NextResponse.json(
        {
          error:
            overlappingBlock.reason === "MAINTENANCE"
              ? "This bike is scheduled for maintenance during this time range."
              : "This bike is blocked by the merchant for this time range.",
        },
        { status: 409 }
      );
    }

    // 4. Calculate amounts
    const diffMs = endAt.getTime() - startAt.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const rentalDays = Math.max(1, Math.ceil(diffHours / 24));
    const rentalAmount = rentalDays * bike.dailyPrice;
    const depositAmount = bike.securityDeposit;
    const totalAmount = rentalAmount + depositAmount;

    // Generate unique booking number (e.g. BR1042)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `BR${randomSuffix}`;

    // 5. Insert Booking
    const [booking] = await db
      .insert(bikeBookings)
      .values({
        bookingNumber,
        bikeId: bike.id,
        studentId: profile.id,
        merchantId: bike.merchantId,
        institutionId: profile.institutionId || "inst_35df75700bb23dd30311ef5f",
        startAt,
        endAt,
        rentalAmount,
        depositAmount,
        totalAmount,
        status: "REQUESTED",
        paymentStatus: "PENDING",
        paymentMethod: paymentMethod === "UPI" ? "UPI" : "COD",
        depositRefundStatus: "HELD",
        customerPhone: customerPhone.trim(),
        hostelAddress: hostelAddress.trim(),
        specialNotes: specialNotes?.trim() || null,
      })
      .returning();

    // 6. Insert Verification Documents
    await db.insert(bikeBookingDocuments).values({
      bookingId: booking.id,
      studentId: profile.id,
      drivingLicenseNumber: drivingLicenseNumber.trim(),
      drivingLicenseUrl: drivingLicenseUrl || null,
      aadhaarLast4: aadhaarLast4?.trim() || null,
      aadhaarUrl: aadhaarUrl || null,
      studentIdCardUrl: studentIdCardUrl || null,
      status: "VERIFIED",
    });

    // 7. Insert Initial Status History
    await db.insert(bikeBookingStatusHistory).values({
      bookingId: booking.id,
      fromStatus: null,
      toStatus: "REQUESTED",
      changedBy: "STUDENT",
      reason: "Booking requested by student",
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
    });
  } catch (error) {
    console.error("Error creating bike booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
