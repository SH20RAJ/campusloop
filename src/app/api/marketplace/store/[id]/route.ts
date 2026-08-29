import { getDb } from "@/db";
import {
  marketplaceOffers,
  marketplaceReviews,
  merchantBusinessHours,
  merchants,
  products,
} from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, id),
      with: {
        institution: {
          columns: { id: true, name: true, slug: true },
        },
        businessHours: {
          orderBy: [asc(merchantBusinessHours.dayOfWeek)],
        },
        offers: {
          where: eq(marketplaceOffers.isActive, true),
        },
        products: {
          where: eq(products.status, "ACTIVE"),
          orderBy: [asc(products.displayOrder), asc(products.createdAt)],
        },
        reviews: {
          orderBy: [desc(marketplaceReviews.createdAt)],
          limit: 10,
          with: {
            student: {
              columns: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ store: merchant });
  } catch (error) {
    console.error("Error fetching merchant store details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
