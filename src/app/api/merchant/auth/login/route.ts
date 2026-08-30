import { ilike } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { merchants } from "@/db/schema";
import { createMerchantSessionToken, setMerchantSessionCookie } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, any>;
    const { username, password } = body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const db = getDb();
    const merchant = await db.query.merchants.findFirst({
      where: ilike(merchants.loginUsername, cleanUsername),
    });

    if (!merchant) {
      return NextResponse.json({ error: "Invalid merchant username or store not found" }, { status: 401 });
    }

    if (!merchant.loginPassword || merchant.loginPassword !== cleanPassword) {
      return NextResponse.json({ error: "Incorrect password for this merchant account" }, { status: 401 });
    }

    if (merchant.status === "SUSPENDED" || merchant.status === "CLOSED") {
      return NextResponse.json(
        { error: "This merchant store account is currently suspended or closed. Contact campus admin." },
        { status: 403 }
      );
    }

    // Create session token and set cookie
    const token = await createMerchantSessionToken(merchant.id);
    const res = NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        slug: merchant.slug,
        categorySlug: merchant.categorySlug,
        logoUrl: merchant.logoUrl,
        coverUrl: merchant.coverUrl,
        address: merchant.address,
      },
    });

    setMerchantSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error("Error in merchant login:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
