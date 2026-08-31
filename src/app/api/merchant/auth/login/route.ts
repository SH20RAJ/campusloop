import { eq, ilike, or } from "drizzle-orm";
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
      where: or(
        ilike(merchants.loginUsername, cleanUsername),
        ilike(merchants.slug, cleanUsername),
        ilike(merchants.email, cleanUsername),
        eq(merchants.phone, username.trim())
      ),
    });

    if (!merchant) {
      return NextResponse.json({ error: "Invalid merchant username or store not found" }, { status: 401 });
    }

    // Verify plaintext password, with fallback backfill for legacy rows
    const expectedPassword = merchant.loginPassword || `store@${merchant.slug}`;
    if (
      merchant.loginPassword &&
      merchant.loginPassword !== cleanPassword &&
      cleanPassword !== expectedPassword
    ) {
      return NextResponse.json({ error: "Incorrect password for this merchant account" }, { status: 401 });
    }

    // If password was missing in database, backfill it now
    if (!merchant.loginPassword || !merchant.loginUsername) {
      await db
        .update(merchants)
        .set({
          loginUsername: merchant.loginUsername || merchant.slug,
          loginPassword: cleanPassword || expectedPassword,
        })
        .where(eq(merchants.id, merchant.id));
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
