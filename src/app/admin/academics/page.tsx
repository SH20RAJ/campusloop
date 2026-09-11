import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { academicResources, institutions, userProfiles } from "@/db/schema";
import { resolveAdminSession } from "../_lib/guard";
import { AcademicsAdminClient } from "./academics-admin-client";

export const metadata: Metadata = {
  title: "Academics Vault Moderation",
};

export const dynamic = "force-dynamic";

export default async function AdminAcademicsPage() {
  const { db } = await resolveAdminSession();

  const rawResources = await db
    .select({
      id: academicResources.id,
      title: academicResources.title,
      description: academicResources.description,
      subjectCode: academicResources.subjectCode,
      subjectName: academicResources.subjectName,
      branch: academicResources.branch,
      semester: academicResources.semester,
      resourceType: academicResources.resourceType,
      fileUrl: academicResources.fileUrl,
      driveUrl: academicResources.driveUrl,
      downloadsCount: academicResources.downloadsCount,
      upvotesCount: academicResources.upvotesCount,
      isVerified: academicResources.isVerified,
      createdAt: academicResources.createdAt,
      institutionName: institutions.name,
      uploaderName: userProfiles.displayName,
    })
    .from(academicResources)
    .leftJoin(institutions, eq(academicResources.institutionId, institutions.id))
    .leftJoin(userProfiles, eq(academicResources.uploaderId, userProfiles.id))
    .orderBy(desc(academicResources.createdAt))
    .limit(100)
    .catch(() => []);

  const resources = rawResources.map((r) => ({
    ...r,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Academics Vault &amp; Notes Moderation
          </h2>
          <p className="text-muted-foreground text-sm">
            Review, verify, and curate university study materials, PYQs, and syllabus notes.
          </p>
        </div>
      </header>

      <AcademicsAdminClient initialResources={resources} />
    </div>
  );
}
