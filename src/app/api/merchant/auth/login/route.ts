import { eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { merchants } from "@/db/schema";
import { hashMerchantPassword, verifyMerchantPassword } from "@/lib/marketplace/merchant-password";
import { createMerchantSessionToken, setMerchantSessionCookie } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

/**
 * One message for every failure mode.
 *
 * Distinguishing "no such store" from "wrong password" turns the login form
 * into an oracle for which of the campus's stores exist and which slugs are
 * live.
 */
const GENERIC_FAILURE = "Incorrect merchant username or password.";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
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
      return NextResponse.json({ error: GENERIC_FAILURE }, { status: 401 });
    }

    // Verify against the stored credential only.
    //
    // Two backdoors used to live here. The check was skipped entirely when
    // `login_password` was empty — any password logged in, and was then saved
    // as the account's real password. And a derived fallback, `store@<slug>`,
    // was accepted even for accounts that *did* have a password set; slugs are
    // public, so that was a master key to every store on campus.
    const verification = await verifyMerchantPassword(cleanPassword, merchant.loginPassword);
    if (!verification.valid) {
      return NextResponse.json({ error: GENERIC_FAILURE }, { status: 401 });
    }

    if (merchant.status === "SUSPENDED" || merchant.status === "CLOSED") {
      return NextResponse.json(
        { error: "This merchant store account is currently suspended or closed. Contact campus admin." },
        { status: 403 }
      );
    }

    // Upgrade legacy plaintext rows in place, now that we know the password is
    // genuinely correct. Nobody is locked out by the migration; each account
    // is hashed the first time it signs in.
    if (verification.needsRehash) {
      const hashed = await hashMerchantPassword(cleanPassword);
      await db
        .update(merchants)
        .set({
          loginPassword: hashed,
          loginUsername: merchant.loginUsername || merchant.slug,
        })
        .where(eq(merchants.id, merchant.id));
    }

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
