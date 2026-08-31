import { and, desc, eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { merchants, products } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // e.g. "food"
    const storeId = searchParams.get("storeId");
    const query = searchParams.get("q");
    const isVegParam = searchParams.get("isVeg");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const offset = (page - 1) * limit;

    const db = getDb();
    const user = await hexclaveServerApp.getUser();

    let targetInstitutionId: string | null = null;
    if (user) {
      const profile = await db.query.userProfiles.findFirst({
        where: (up, { eq }) => eq(up.userId, user.id),
      });
      if (profile) {
        targetInstitutionId = profile.institutionId;
      }
    }

    const conditions: any[] = [eq(products.isAvailable, true)];

    if (storeId) {
      conditions.push(eq(products.merchantId, storeId));
    }

    if (isVegParam === "true") {
      conditions.push(eq(products.isVeg, true));
    }

    if (query?.trim()) {
      const pattern = `%${query.trim()}%`;
      conditions.push(
        or(
          ilike(products.name, pattern),
          ilike(products.description, pattern),
          ilike(products.categoryName, pattern)
        )
      );
    }

    // Query products with merchant info
    const rawProducts = await db.query.products.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(products.displayOrder), desc(products.createdAt)],
      limit: limit + 1,
      offset,
      with: {
        merchant: {
          columns: {
            id: true,
            name: true,
            slug: true,
            categorySlug: true,
            verticalType: true,
            logoUrl: true,
            coverUrl: true,
            rating: true,
            estimatedPrepTime: true,
            isOpen: true,
            institutionId: true,
          },
        },
      },
    });

    // Filter by vertical/category if specified
    let filtered = rawProducts;
    if (category && category !== "all") {
      filtered = rawProducts.filter(
        (p) =>
          p.merchant?.categorySlug === category ||
          p.merchant?.verticalType?.toLowerCase() === category.toLowerCase()
      );
    }

    const hasMore = filtered.length > limit;
    const items = hasMore ? filtered.slice(0, limit) : filtered;

    const formattedProducts = items.map((p) => ({
      id: p.id,
      merchantId: p.merchantId,
      storeName: p.merchant?.name || "Campus Store",
      storeSlug: p.merchant?.slug || "",
      storeLogo: p.merchant?.logoUrl || "",
      storeRating: p.merchant?.rating || "4.5",
      estimatedPrepTime: p.merchant?.estimatedPrepTime || "15–20 min",
      isOpen: p.merchant?.isOpen ?? true,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      categoryName: p.categoryName,
      isVeg: p.isVeg,
      isPopular: p.displayOrder > 0,
      customizationOptions: p.options,
    }));

    return NextResponse.json({
      products: formattedProducts,
      hasMore,
      page,
      limit,
    });
  } catch (error) {
    console.error("GET /api/marketplace/products error:", error);
    return NextResponse.json({ error: "Internal Server Error", products: [] }, { status: 500 });
  }
}
