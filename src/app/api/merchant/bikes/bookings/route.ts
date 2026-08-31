import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { bikeBookings, merchants } from "@/db/schema";
import { resolveMerchantSession } from "@/lib/merchant-session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // The caller's own store, not "whichever rentals merchant exists first" —
    // that showed every rental store the same bookings, including other
    // students' names, phone numbers and licence details.
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";

    const db = getDb();

    let statusCondition: SQL | undefined;
    if (filter === "pending") {
      statusCondition = eq(bikeBookings.status, "REQUESTED");
    } else if (filter === "confirmed") {
      statusCondition = inArray(bikeBookings.status, ["CONFIRMED", "READY_FOR_PICKUP"]);
    } else if (filter === "active") {
      statusCondition = eq(bikeBookings.status, "ACTIVE");
    } else if (filter === "completed") {
      statusCondition = inArray(bikeBookings.status, ["RETURNED", "COMPLETED"]);
    } else if (filter === "cancelled") {
      statusCondition = inArray(bikeBookings.status, ["CANCELLED", "REJECTED", "DISPUTED"]);
    }

    const bookings = await db.query.bikeBookings.findMany({
      where: and(eq(bikeBookings.merchantId, merchant.id), statusCondition),
      orderBy: [desc(bikeBookings.createdAt)],
      with: {
        bike: true,
        student: {
          columns: { id: true, displayName: true, username: true, avatarUrl: true },
        },
        documents: true,
        inspections: true,
      },
    });

    return NextResponse.json({ bookings, merchant });
  } catch (error) {
    console.error("Error fetching merchant bike bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
