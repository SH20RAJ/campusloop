import { and, desc, eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions, marketplaceOffers, merchants, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { isBitMesraCampus } from "@/lib/marketplace/locations";

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

    // Default to BIT Mesra if no institution assigned
    if (!targetInstitutionId) {
      targetInstitutionId = "inst_35df75700bb23dd30311ef5f";
    }

    const conditions: any[] = [
      eq(merchants.status, "ACTIVE"),
      eq(merchants.institutionId, targetInstitutionId),
    ];

    if (categorySlug && categorySlug !== "all" && categorySlug !== "deals") {
      conditions.push(eq(merchants.categorySlug, categorySlug));
    }

    if (query?.trim()) {
      const pattern = `%${query.trim()}%`;
      conditions.push(
        or(
          ilike(merchants.name, pattern),
          ilike(merchants.description, pattern),
          ilike(merchants.address, pattern)
        )
      );
    }

    const [stores, currentInstitution] = await Promise.all([
      db.query.merchants.findMany({
        where: and(...conditions),
        orderBy: [desc(merchants.isOpen), desc(merchants.rating), desc(merchants.createdAt)],
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
      }),
      db.query.institutions.findFirst({
        where: eq(institutions.id, targetInstitutionId),
        columns: { id: true, name: true, slug: true },
      }),
    ]);

    const isBitMesra =
      isBitMesraCampus(targetInstitutionId) ||
      isBitMesraCampus(currentInstitution?.slug) ||
      isBitMesraCampus(currentInstitution?.name);

    return NextResponse.json({
      stores,
      institution: currentInstitution,
      isBitMesra,
    });
  } catch (error) {
    console.error("Error fetching marketplace stores:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
