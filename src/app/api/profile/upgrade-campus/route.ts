import { getDb } from "@/db";
import { institutionDomains, institutions, savedPosts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { count, eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      collegeEmail?: string;
      institutionId?: string;
    };

    const { collegeEmail, institutionId } = body;

    if (!collegeEmail || !collegeEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid official college email" },
        { status: 400 }
      );
    }

    const cleanEmail = collegeEmail.trim().toLowerCase();
    const domain = cleanEmail.split("@")[1];

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Resolve target institution by explicit ID or domain match
    let targetInstitution = null;

    if (institutionId) {
      targetInstitution = await db.query.institutions.findFirst({
        where: eq(institutions.id, institutionId),
      });
    }

    if (!targetInstitution && domain) {
      // Look up institutionDomains table
      const domainMatch = await db.query.institutionDomains.findFirst({
        where: eq(institutionDomains.domain, domain),
        with: { institution: true },
      });

      if (domainMatch?.institution) {
        targetInstitution = domainMatch.institution;
      }
    }

    if (!targetInstitution && domain) {
      // Fuzzy match by website or slug
      targetInstitution = await db.query.institutions.findFirst({
        where: or(
          ilike(institutions.website, `%${domain}%`),
          ilike(institutions.slug, `%${domain.split(".")[0]}%`)
        ),
      });
    }

    if (!targetInstitution) {
      return NextResponse.json(
        {
          error:
            "Could not automatically detect your campus from this domain. Please select your college from the directory or request an index.",
          unrecognizedDomain: domain,
        },
        { status: 404 }
      );
    }

    // Atomic in-place upgrade from VIEWER to STUDENT
    await db
      .update(userProfiles)
      .set({
        institutionId: targetInstitution.id,
        role: "STUDENT",
        email: cleanEmail,
        status: "ACTIVE",
      })
      .where(eq(userProfiles.id, profile.id));

    // Calculate journey recap stats
    const [savedCountResult] = await db
      .select({ val: count() })
      .from(savedPosts)
      .where(eq(savedPosts.profileId, profile.id));

    const savedPostsCount = savedCountResult?.val ?? 0;

    return NextResponse.json({
      success: true,
      college: {
        id: targetInstitution.id,
        name: targetInstitution.name,
        slug: targetInstitution.slug,
        logoUrl: targetInstitution.logoUrl,
        state: targetInstitution.state,
      },
      journeyStats: {
        savedPostsCount,
        collegeName: targetInstitution.name,
      },
    });
  } catch (error) {
    console.error("POST /api/profile/upgrade-campus error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade campus mode" },
      { status: 500 }
    );
  }
}
