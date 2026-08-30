import { and, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/db";
import type { Institution, UserProfile } from "@/db/schema";
import { institutionDomains, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

/**
 * Campus upgrade: turning a Campus Preview account into a verified student.
 *
 * The rule this file exists to enforce is that possession of a college inbox is
 * the ONLY thing that grants campus access. Two earlier shortcuts broke that:
 *
 *  - the caller could pass an `institutionId` directly, which meant anyone
 *    could join any college regardless of their email domain, and
 *  - the domain was matched with a fuzzy `LIKE` against a college's website or
 *    slug, so a lookalike domain could resolve to a real campus.
 *
 * Both are gone. A domain counts only if it is explicitly whitelisted in
 * `institution_domains`, and the address is only accepted after the mail
 * provider has confirmed the student can read it.
 */

export type UpgradeCheckFailure = {
  ok: false;
  status: number;
  error: string;
  unrecognizedDomain?: string;
};

export type UpgradeCheckSuccess = {
  ok: true;
  email: string;
  domain: string;
  institution: Institution;
  profile: UserProfile;
};

export type UpgradeCheck = UpgradeCheckSuccess | UpgradeCheckFailure;

/** Conservative shape check; the real proof is the verification email. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * Validates that `rawEmail` may be claimed by the signed-in user.
 *
 * Run before sending a verification mail AND again before applying the upgrade:
 * the two are separated by however long the student takes to open their inbox,
 * and the address could be claimed by someone else in between.
 */
export async function checkCampusUpgradeEligibility(rawEmail: string): Promise<UpgradeCheck> {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const email = rawEmail.trim().toLowerCase();
  if (!looksLikeEmail(email)) {
    return { ok: false, status: 400, error: "Please enter a valid college email address." };
  }

  const domain = email.split("@")[1];
  const db = getDb();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) {
    return { ok: false, status: 404, error: "Profile not found" };
  }

  // A domain is only proof of enrolment if we have explicitly whitelisted it.
  const domainMatch = await db.query.institutionDomains.findFirst({
    where: eq(institutionDomains.domain, domain),
    with: { institution: true },
  });

  if (!domainMatch?.institution) {
    return {
      ok: false,
      status: 404,
      error:
        "We don't recognise this college email domain yet. Ask your college to be indexed, or use your official college address.",
      unrecognizedDomain: domain,
    };
  }

  // Nobody may claim an address that already belongs to another profile.
  const takenByProfile = await db.query.userProfiles.findFirst({
    where: and(sql`lower(${userProfiles.email}) = ${email}`, ne(userProfiles.id, profile.id)),
    columns: { id: true },
  });

  if (takenByProfile) {
    return {
      ok: false,
      status: 409,
      error:
        "That college email is already linked to a CampusLoop account. Sign in with it instead, or contact support if it isn't yours.",
    };
  }

  // The same address may also exist on another auth account without a profile.
  const takenByAuthAccount = await isEmailOnAnotherAuthAccount(email, user.id);
  if (takenByAuthAccount) {
    return {
      ok: false,
      status: 409,
      error:
        "That college email is already registered. Sign in with it instead, or contact support if it isn't yours.",
    };
  }

  return { ok: true, email, domain, institution: domainMatch.institution, profile };
}

/**
 * True when `email` is a contact channel on some auth account other than
 * `currentUserId`. The directory search is free-text, so every candidate is
 * confirmed by comparing its channel values exactly.
 */
export async function isEmailOnAnotherAuthAccount(email: string, currentUserId: string): Promise<boolean> {
  try {
    const candidates = await hexclaveServerApp.listUsers({ query: email, limit: 20 });

    for (const candidate of candidates) {
      if (candidate.id === currentUserId) continue;

      if (candidate.primaryEmail?.toLowerCase() === email) return true;

      const channels = await candidate.listContactChannels();
      if (channels.some((channel) => channel.value.toLowerCase() === email)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    // Fail closed: if we cannot prove the address is free, do not hand out
    // campus access on the strength of an unverified assumption.
    console.error("Campus upgrade: auth-account dedup lookup failed:", error);
    throw new Error("Could not verify that this email is available. Please try again.");
  }
}
