import { posts,reports,userProfiles } from "@/db/schema";
import { and,desc,eq } from "drizzle-orm";
import { Metadata } from "next";
import { ReportsTable } from "./reports-table";

import { resolveAdminSession } from "../_lib/guard";

export const metadata: Metadata = {
	title: "Admin Reports | CampusLoop",
};

export default async function AdminReportsPage() {
	const { db } = await resolveAdminSession();

	// Fetch open reports with joined post and author details.
	// leftJoin keeps anonymous posts (null author) visible for review.
	const openReports = await db
		.select({
			id: reports.id,
			reason: reports.reason,
			details: reports.details,
			createdAt: reports.createdAt,
			postId: posts.id,
			postBody: posts.body,
			postPseudonym: posts.pseudonym,
			authorDisplayName: userProfiles.displayName,
			authorUsername: userProfiles.username,
		})
		.from(reports)
		.innerJoin(posts, eq(reports.targetId, posts.id))
		.leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
		.where(and(eq(reports.status, "OPEN"), eq(reports.targetType, "POST")))
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
