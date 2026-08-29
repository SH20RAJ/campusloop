import { getDb } from "@/db";
import { marketplaceOffers,merchants,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,desc,eq,ilike,or } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const query = searchParams.get("q");
    const institutionIdParam = searchParams.get("institutionId");

    const user = await hexclaveServerApp.getUser();
    const db = getDb();

    let targetInstitutionId = institutionIdParam;

    if (!targetInstitutionId && user) {
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
      });
      if (profile) {
        targetInstitutionId = profile.institutionId;
      }
    }

    const conditions: any[] = [
      eq(merchants.status, "ACTIVE"),
    ];

    if (categorySlug && categorySlug !== "all" && categorySlug !== "deals") {
      conditions.push(eq(merchants.categorySlug, categorySlug));
    }

    if (query && query.trim()) {
      const pattern = `%${query.trim()}%`;
      conditions.push(
        or(
          ilike(merchants.name, pattern),
          ilike(merchants.description, pattern),
          ilike(merchants.address, pattern)
        )
      );
    }

    // If campus scope is provided, filter by campus; if not, return active merchants
    if (targetInstitutionId) {
      conditions.push(eq(merchants.institutionId, targetInstitutionId));
    }

    const stores = await db.query.merchants.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(merchants.rating), desc(merchants.createdAt)],
      with: {
        offers: {
          where: eq(marketplaceOffers.isActive, true),
          limit: 2,
        },
        products: {
          limit: 4,
        },
        institution: {
          columns: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Error fetching marketplace stores:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
