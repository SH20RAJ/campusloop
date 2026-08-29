import { getDb } from "@/db";
import { bikeBookings, bikes, merchants, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
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

    // Find merchant owned or associated with user
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.categorySlug, "rentals"),
    });

    if (!merchant) {
      return NextResponse.json({ error: "No rental merchant found" }, { status: 404 });
    }

    // Fetch all active fleet bikes
    const fleetBikes = await db.query.bikes.findMany({
      where: and(eq(bikes.merchantId, merchant.id), ne(bikes.status, "INACTIVE")),
      orderBy: [desc(bikes.createdAt)],
    });

    const availableCount = fleetBikes.filter((b) => b.status === "AVAILABLE").length;
    const rentedCount = fleetBikes.filter((b) => b.status === "RENTED").length;
    const maintenanceCount = fleetBikes.filter((b) => b.status === "MAINTENANCE").length;
    const bookedCount = fleetBikes.filter((b) => b.status === "BOOKED").length;

    // Fetch Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysBookings = await db.query.bikeBookings.findMany({
      where: and(
        eq(bikeBookings.merchantId, merchant.id),
        sql`${bikeBookings.startAt} >= ${today} AND ${bikeBookings.startAt} < ${tomorrow}`
      ),
      orderBy: [desc(bikeBookings.startAt)],
      with: {
        bike: true,
        student: {
          columns: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      merchant,
      stats: {
        totalBikes: fleetBikes.length,
        availableCount,
        rentedCount,
        maintenanceCount,
        bookedCount,
      },
      todaysBookings,
    });
  } catch (error) {
    console.error("Error fetching merchant bike dashboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
