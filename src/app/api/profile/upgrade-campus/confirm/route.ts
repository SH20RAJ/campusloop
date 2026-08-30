import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { savedPosts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { checkCampusUpgradeEligibility } from "@/lib/campus-upgrade";

export const dynamic = "force-dynamic";

/**
 * Step 2 of the campus upgrade, run once the college address is verified.
 *
 * The account is upgraded in place rather than by creating a second account and
 * copying data across. The college address becomes the primary, sign-in-capable
 * channel and the personal address is kept as a secondary one, so the same
 * `user_profiles` row survives: saved posts, follows, posts, points and every
 * other row keyed on `profile.id` stay attached with nothing to migrate and
 * nothing to delete.
 */
export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { collegeEmail?: string };

    // Re-run every eligibility check. The gap between requesting and confirming
    // is however long the student takes to open their inbox, and the address
    // could have been claimed in the meantime.
    const check = await checkCampusUpgradeEligibility(body.collegeEmail || "");
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error, unrecognizedDomain: check.unrecognizedDomain },
        { status: check.status }
      );
    }

    const { email, institution, profile } = check;

    const channels = await user.listContactChannels();
    const collegeChannel = channels.find((c) => c.value.toLowerCase() === email);

    if (!collegeChannel) {
      return NextResponse.json(
        { error: "Start the verification first, then open the link we email you." },
        { status: 400 }
      );
    }

    // The entire security of this flow rests on this check.
    if (!collegeChannel.isVerified) {
      return NextResponse.json(
        {
          error: "That college email isn't verified yet. Open the link we sent, then try again.",
          pendingVerification: true,
        },
        { status: 403 }
      );
    }

    const previousEmail = profile.email ?? user.primaryEmail ?? null;

    // Promote the college address. Only one channel can be primary, so the
    // personal address is demoted to a secondary channel rather than removed —
    // the student keeps it as a recovery address.
    await collegeChannel.update({ isPrimary: true, usedForAuth: true });

    const db = getDb();
    await db
      .update(userProfiles)
      .set({
        institutionId: institution.id,
        role: "STUDENT",
        email,
        status: "ACTIVE",
      })
      .where(eq(userProfiles.id, profile.id));

    const [savedCountResult] = await db
      .select({ val: count() })
      .from(savedPosts)
      .where(eq(savedPosts.profileId, profile.id));

    return NextResponse.json({
      success: true,
      college: {
        id: institution.id,
        name: institution.name,
        slug: institution.slug,
        logoUrl: institution.logoUrl,
        state: institution.state,
      },
      emails: { primary: email, secondary: previousEmail },
      journeyStats: {
        savedPostsCount: savedCountResult?.val ?? 0,
        collegeName: institution.name,
      },
    });
  } catch (error) {
    console.error("POST /api/profile/upgrade-campus/confirm error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to unlock your campus" },
      { status: 500 }
    );
  }
}
