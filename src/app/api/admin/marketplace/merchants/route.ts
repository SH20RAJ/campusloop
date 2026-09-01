import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { merchants } from "@/db/schema";
import { generateMerchantPassword, hashMerchantPassword } from "@/lib/marketplace/merchant-password";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await resolveAdminSession();
    const db = getDb();

    const allMerchants = await db.query.merchants.findMany({
      orderBy: [desc(merchants.createdAt)],
      with: {
        institution: {
          columns: { id: true, name: true, slug: true },
        },
        products: {
          columns: { id: true, name: true, price: true, isAvailable: true, categoryName: true },
        },
        orders: {
          columns: { id: true, total: true, status: true, createdAt: true },
        },
      },
    });

    const totalGmv = allMerchants.reduce((sum, m) => {
      const storeGmv = (m.orders || [])
        .filter((o: any) => !["REJECTED", "CANCELLED"].includes(o.status))
        .reduce((s: number, o: any) => s + (o.total || 0), 0);
      return sum + storeGmv;
    }, 0);

    const totalOrdersCount = allMerchants.reduce((sum, m) => sum + (m.orders?.length || 0), 0);
    const totalProductsCount = allMerchants.reduce((sum, m) => sum + (m.products?.length || 0), 0);
    const activeMerchantsCount = allMerchants.filter((m) => m.status === "ACTIVE" && m.isOpen).length;

    return NextResponse.json({
      merchants: allMerchants,
      stats: {
        totalMerchants: allMerchants.length,
        activeMerchants: activeMerchantsCount,
        totalProducts: totalProductsCount,
        totalOrders: totalOrdersCount,
        totalGmv,
      },
    });
  } catch (error) {
    console.error("Error in admin merchants GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await resolveAdminSession();
    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const {
      name,
      slug,
      institutionId,
      categorySlug,
      description,
      address,
      locationPin,
      phone,
      email,
      logoUrl,
      coverUrl,
      deliveryFee,
      minOrderValue,
      estimatedPrepTime,
      loginUsername,
      loginPassword,
    } = body;

    if (!name || !institutionId || !address) {
      return NextResponse.json({ error: "Name, Institution, and Address are required" }, { status: 400 });
    }

    const cleanSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const cleanLoginUsername = loginUsername?.trim().toLowerCase() || cleanSlug.replace(/[^a-z0-9]/g, "");

    const issuedPassword: string = loginPassword?.trim() || generateMerchantPassword();
    const hashedPassword = await hashMerchantPassword(issuedPassword);

    const [created] = await db
      .insert(merchants)
      .values({
        name: name.trim(),
        slug: cleanSlug,
        institutionId,
        categorySlug: categorySlug || "food",
        description: description?.trim() || null,
        address: address.trim(),
        locationPin: locationPin?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        coverUrl: coverUrl?.trim() || null,
        deliveryFee: typeof deliveryFee === "number" ? deliveryFee : 0,
        minOrderValue: typeof minOrderValue === "number" ? minOrderValue : 0,
        estimatedPrepTime: estimatedPrepTime?.trim() || "15-20 min",
        status: "ACTIVE",
        isOpen: true,
        loginUsername: cleanLoginUsername,
        loginPassword: hashedPassword,
      })
      .returning();

    return NextResponse.json({
      success: true,
      merchant: created,
      issuedPassword,
    });
  } catch (error) {
    console.error("Error creating merchant in admin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
