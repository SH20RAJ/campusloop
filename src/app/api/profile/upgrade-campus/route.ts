import { NextResponse } from "next/server";
import { hexclaveServerApp } from "@/hexclave/server";
import { checkCampusUpgradeEligibility } from "@/lib/campus-upgrade";

export const dynamic = "force-dynamic";

/**
 * Step 1 of the campus upgrade: prove the student can read the college inbox.
 *
 * This endpoint grants nothing. It attaches the address to the signed-in auth
 * account as an unverified, non-primary contact channel and emails a
 * verification link. `/api/profile/upgrade-campus/confirm` applies the upgrade
 * once the provider reports the channel verified.
 *
 * It previously flipped the account to STUDENT on the strength of a typed
 * string, with no ownership check and no deduplication.
 */
export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { collegeEmail?: string };

    // `institutionId` is deliberately not read from the body: the campus is
    // derived from the verified domain, never chosen by the caller.
    const check = await checkCampusUpgradeEligibility(body.collegeEmail || "");
    if (!check.ok) {
      return NextResponse.json(
        { error: check.error, unrecognizedDomain: check.unrecognizedDomain },
        { status: check.status }
      );
    }

    const { email, institution } = check;

    const channels = await user.listContactChannels();
    let channel = channels.find((c) => c.value.toLowerCase() === email);

    if (channel?.isVerified) {
      // Already proven on a previous attempt — let the confirm step finish it.
      return NextResponse.json({
        pending: false,
        alreadyVerified: true,
        email,
        college: { id: institution.id, name: institution.name, slug: institution.slug },
      });
    }

    if (!channel) {
      // Not primary and not usable for sign-in until it is verified and the
      // upgrade is confirmed, so an unverified address can never be a way in.
      channel = await user.createContactChannel({
        value: email,
        type: "email",
        usedForAuth: false,
        isPrimary: false,
      });
    }

    await channel.sendVerificationEmail({
      callbackUrl: "https://campusloop.space/app/profile?campus_verified=1",
    });

    return NextResponse.json({
      pending: true,
      email,
      college: { id: institution.id, name: institution.name, slug: institution.slug },
      message: `We've sent a verification link to ${email}. Open it, then come back to finish unlocking your campus.`,
    });
  } catch (error) {
    console.error("POST /api/profile/upgrade-campus error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start campus verification" },
      { status: 500 }
    );
  }
}
