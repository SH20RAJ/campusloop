import { getDb } from "@/db";
import { bikeAvailabilityBlocks, bikeBookings, bikes, merchants, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bikeId = searchParams.get("bikeId");

    const db = getDb();
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.categorySlug, "rentals"),
    });

    if (!merchant) {
      return NextResponse.json({ error: "No rental merchant found" }, { status: 404 });
    }

    const fleet = await db.query.bikes.findMany({
      where: eq(bikes.merchantId, merchant.id),
      orderBy: [desc(bikes.createdAt)],
    });

    const activeBikeId = bikeId || fleet[0]?.id;

    if (!activeBikeId) {
      return NextResponse.json({ fleet: [], blocks: [], bookings: [] });
    }

    const blocks = await db.query.bikeAvailabilityBlocks.findMany({
      where: eq(bikeAvailabilityBlocks.bikeId, activeBikeId),
      orderBy: [desc(bikeAvailabilityBlocks.startAt)],
    });

    const bookings = await db.query.bikeBookings.findMany({
      where: and(
        eq(bikeBookings.bikeId, activeBikeId),
        inArray(bikeBookings.status, ["REQUESTED", "CONFIRMED", "READY_FOR_PICKUP", "ACTIVE"])
      ),
      orderBy: [desc(bikeBookings.startAt)],
      with: {
        student: {
          columns: { displayName: true, username: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ fleet, selectedBikeId: activeBikeId, blocks, bookings });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.categorySlug, "rentals"),
    });

    if (!merchant) {
      return NextResponse.json({ error: "No rental merchant found" }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, any>;
    const { bikeId, startAt: startAtStr, endAt: endAtStr, reason = "MAINTENANCE", notes } = body;

    if (!bikeId || !startAtStr || !endAtStr) {
      return NextResponse.json({ error: "Bike and time range are required" }, { status: 400 });
    }

    const startAt = new Date(startAtStr);
    const endAt = new Date(endAtStr);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()) || endAt <= startAt) {
      return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
    }

    const [block] = await db
      .insert(bikeAvailabilityBlocks)
      .values({
        bikeId,
        merchantId: merchant.id,
        startAt,
        endAt,
        reason,
        notes: notes?.trim() || null,
      })
      .returning();

    return NextResponse.json({ success: true, block });
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Block id is required" }, { status: 400 });
    }

    const db = getDb();
    await db.delete(bikeAvailabilityBlocks).where(eq(bikeAvailabilityBlocks.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting block:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
