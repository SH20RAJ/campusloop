import { and, desc, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { bikes } from "@/db/schema";
import { resolveMerchantSession } from "@/lib/merchant-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Was "the first merchant with categorySlug = rentals", which showed every
    // rental store the same fleet — the first one's.
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();

    const fleet = await db.query.bikes.findMany({
      where: and(eq(bikes.merchantId, merchant.id), ne(bikes.status, "INACTIVE")),
      orderBy: [desc(bikes.createdAt)],
      with: {
        bookings: {
          limit: 3,
          orderBy: [desc(bikes.createdAt)],
        },
      },
    });

    return NextResponse.json({ fleet, merchant });
  } catch (error) {
    console.error("Error fetching fleet:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const {
      name,
      model,
      registrationNumber,
      imageUrl,
      hourlyPrice,
      dailyPrice,
      securityDeposit,
      pickupLocation,
      fuelType = "PETROL",
      specs,
      status = "AVAILABLE",
    } = body;

    if (!name || !registrationNumber || typeof dailyPrice !== "number") {
      return NextResponse.json(
        { error: "Name, registration number, and daily rental price are required" },
        { status: 400 }
      );
    }

    const [newBike] = await db
      .insert(bikes)
      .values({
        merchantId: merchant.id,
        name: name.trim(),
        model: model?.trim() || name.trim(),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        imageUrl:
          imageUrl || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop",
        hourlyPrice: typeof hourlyPrice === "number" ? hourlyPrice : 50,
        dailyPrice: Math.max(0, dailyPrice),
        securityDeposit: typeof securityDeposit === "number" ? securityDeposit : 1500,
        pickupLocation: pickupLocation?.trim() || "Campus Main Gate",
        fuelType,
        specs: specs || { helmetIncluded: true },
        status: status || "AVAILABLE",
      })
      .returning();

    return NextResponse.json({ success: true, bike: newBike });
  } catch (error) {
    console.error("Error creating bike:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    // Authenticated as the *store*, not as any signed-in student. This handler
    // used to accept a plain student session and then update by bike id alone,
    // so anyone with an account could reprice or retire another store's bikes.
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const { id, status, dailyPrice, hourlyPrice, securityDeposit, pickupLocation, specs, name } = body;

    if (!id) {
      return NextResponse.json({ error: "Bike id is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (typeof status === "string") updatePayload.status = status;
    if (typeof dailyPrice === "number") updatePayload.dailyPrice = Math.max(0, dailyPrice);
    if (typeof hourlyPrice === "number") updatePayload.hourlyPrice = Math.max(0, hourlyPrice);
    if (typeof securityDeposit === "number") updatePayload.securityDeposit = Math.max(0, securityDeposit);
    if (typeof pickupLocation === "string") updatePayload.pickupLocation = pickupLocation.trim();
    if (typeof name === "string") updatePayload.name = name.trim();
    if (specs) updatePayload.specs = specs;

    const [updated] = await db
      .update(bikes)
      .set(updatePayload)
      .where(and(eq(bikes.id, id), eq(bikes.merchantId, merchant.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Bike not found in your fleet" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bike: updated });
  } catch (error) {
    console.error("Error updating bike:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Bike id is required" }, { status: 400 });
    }

    const db = getDb();
    // Soft-delete to preserve booking history (PRD item 18), scoped to the
    // caller's own fleet.
    const [retired] = await db
      .update(bikes)
      .set({ status: "INACTIVE", updatedAt: new Date() })
      .where(and(eq(bikes.id, id), eq(bikes.merchantId, merchant.id)))
      .returning({ id: bikes.id });

    if (!retired) {
      return NextResponse.json({ error: "Bike not found in your fleet" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error soft-deleting bike:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
