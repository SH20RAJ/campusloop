import { getDb } from "@/db";
import { bikes } from "@/db/schema";
import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { and,desc,eq,ne } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCachedAuthUser();
    const profile = user ? await getCachedUserProfile(user.id) : null;
    const institutionId = profile?.institutionId || "inst_35df75700bb23dd30311ef5f";

    const { searchParams } = new URL(req.url);
    const fuelType = searchParams.get("fuelType");

    const db = getDb();

    const bikeList = await db.query.bikes.findMany({
      where: and(
        ne(bikes.status, "INACTIVE"),
        fuelType ? eq(bikes.fuelType, fuelType) : undefined
      ),
      orderBy: [desc(bikes.createdAt)],
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
          },
        },
      },
    });

    return NextResponse.json({ bikes: bikeList });
  } catch (error) {
    console.error("Error fetching rental bikes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
