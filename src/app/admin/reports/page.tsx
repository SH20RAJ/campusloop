import { getDb } from "@/db";
import { reports, posts, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ReportsTable } from "./reports-table";

export default async function AdminReportsPage() {
  const db = getDb();
  
  // Fetch open reports with joined post and author details
  const openReports = await db
    .select({
      id: reports.id,
      reason: reports.reason,
      details: reports.details,
      createdAt: reports.createdAt,
      postId: posts.id,
      postBody: posts.body,
      authorDisplayName: userProfiles.displayName,
      authorUsername: userProfiles.username,
    })
    .from(reports)
    .innerJoin(posts, eq(reports.targetId, posts.id))
    .innerJoin(userProfiles, eq(posts.authorId, userProfiles.id))
    .where(eq(reports.status, "OPEN"))
    .orderBy(desc(reports.createdAt));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Content Moderation</h2>
        <p className="text-muted-foreground">Review flagged posts and take action to keep the campus safe.</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <ReportsTable initialReports={openReports} />
      </div>
    </div>
  );
}
