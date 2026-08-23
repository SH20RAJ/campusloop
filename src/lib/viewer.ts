import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions } from "@/db/schema";

/**
 * Viewer-Only Mode
 * ----------------
 * Users who sign in with a non-college email (gmail, outlook, ...) are
 * onboarded into a reserved "Viewer Hub" institution instead of being
 * rejected. They can browse every public surface of the app but every
 * write API refuses them with 403. This gives JEE/NEET aspirants and
 * incoming students a read-only window into campus life without
 * diluting the verified-student guarantee of the content itself.
 *
 * The hub is a normal `institutions` row (no schema migration): a
 * profile is a viewer iff its institutionId is the hub's id.
 */
export const VIEWER_INSTITUTION_SLUG = "viewer-hub";
export const VIEWER_INSTITUTION_AISHE = "SYSTEM-VIEWER-HUB";
export const VIEWER_INSTITUTION_NAME = "Aspirant Viewer Hub";

const globalForViewer = globalThis as typeof globalThis & {
  campusloopViewerInstitutionId?: string;
};

/** Returns the Viewer Hub institution id, creating the row on first use. */
export async function getViewerInstitutionId(): Promise<string> {
  if (globalForViewer.campusloopViewerInstitutionId) {
    return globalForViewer.campusloopViewerInstitutionId;
  }

  const db = getDb();
  let hub = await db.query.institutions.findFirst({
    where: eq(institutions.slug, VIEWER_INSTITUTION_SLUG),
  });

  if (!hub) {
    const [created] = await db
      .insert(institutions)
      .values({
        aisheCode: VIEWER_INSTITUTION_AISHE,
        name: VIEWER_INSTITUTION_NAME,
        slug: VIEWER_INSTITUTION_SLUG,
        source: "system",
      })
      .onConflictDoNothing({ target: institutions.slug })
      .returning();
    hub =
      created ??
      (await db.query.institutions.findFirst({
        where: eq(institutions.slug, VIEWER_INSTITUTION_SLUG),
      }));
  }

  if (!hub) {
    throw new Error("Failed to resolve the viewer hub institution");
  }

  globalForViewer.campusloopViewerInstitutionId = hub.id;
  return hub.id;
}

/** True when the given profile is a read-only viewer account. */
export async function isViewerProfile(profile: { institutionId: string | null }): Promise<boolean> {
  if (!profile.institutionId) return false;
  const viewerId = await getViewerInstitutionId();
  return profile.institutionId === viewerId;
}

/**
 * Write-API guard. Returns a 403 response when the profile is a viewer
 * account, null otherwise. Usage: `const blocked = await rejectViewerWrite(profile); if (blocked) return blocked;`
 */
export async function rejectViewerWrite(profile: {
  institutionId: string | null;
}): Promise<NextResponse | null> {
  if (await isViewerProfile(profile)) {
    return NextResponse.json(
      {
        error:
          "You're in Viewer Mode. Sign up with your official college email to post, vote, and interact.",
        viewerMode: true,
      },
      { status: 403 },
    );
  }
  return null;
}
