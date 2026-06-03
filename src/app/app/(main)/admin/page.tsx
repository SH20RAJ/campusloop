import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { comments, posts, reports, userProfiles } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireModeratorProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";

import { moderationAction } from "./actions";

const statuses = ["OPEN", "REVIEWING", "RESOLVED", "REJECTED"] as const;

type ReportStatus = (typeof statuses)[number];
type TargetType = "POST" | "COMMENT" | "USER";

function normalizeStatus(value?: string): ReportStatus {
	return statuses.includes(value as ReportStatus) ? (value as ReportStatus) : "OPEN";
}

async function getTargetSummary(targetType: TargetType, targetId: string) {
	const db = getDb();

	if (targetType === "POST") {
		const [post] = await db
			.select({
				id: posts.id,
				title: posts.title,
				body: posts.body,
				status: posts.status,
				authorId: posts.authorId,
				authorUserId: userProfiles.userId,
				authorUsername: userProfiles.username,
			})
			.from(posts)
			.innerJoin(userProfiles, eq(posts.authorId, userProfiles.id))
			.where(eq(posts.id, targetId))
			.limit(1);

		return post
			? {
					label: post.title || post.body.slice(0, 90),
					body: post.body,
					status: post.status,
					authorId: post.authorId,
					authorUserId: post.authorUserId,
					authorUsername: post.authorUsername,
				}
			: null;
	}

	if (targetType === "COMMENT") {
		const [comment] = await db
			.select({
				body: comments.body,
				status: comments.status,
				authorId: comments.authorId,
				authorUserId: userProfiles.userId,
				authorUsername: userProfiles.username,
			})
			.from(comments)
			.innerJoin(userProfiles, eq(comments.authorId, userProfiles.id))
			.where(eq(comments.id, targetId))
			.limit(1);

		return comment
			? {
					label: comment.body.slice(0, 90),
					body: comment.body,
					status: comment.status,
					authorId: comment.authorId,
					authorUserId: comment.authorUserId,
					authorUsername: comment.authorUsername,
				}
			: null;
	}

	const [user] = await db
		.select({
			displayName: userProfiles.displayName,
			username: userProfiles.username,
			status: userProfiles.status,
			authorId: userProfiles.id,
			authorUserId: userProfiles.userId,
		})
		.from(userProfiles)
		.where(eq(userProfiles.id, targetId))
		.limit(1);

	return user
		? {
				label: `${user.displayName} (@${user.username})`,
				body: "Reported user profile",
				status: user.status,
				authorId: user.authorId,
				authorUserId: user.authorUserId,
				authorUsername: user.username,
			}
		: null;
}

function ActionButton({
	reportId,
	targetType,
	targetId,
	action,
	children,
	variant = "outline",
}: {
	reportId: string;
	targetType: TargetType;
	targetId: string;
	action: string;
	children: React.ReactNode;
	variant?: "default" | "outline" | "destructive" | "ghost";
}) {
	return (
		<form action={moderationAction}>
			<input type="hidden" name="reportId" value={reportId} />
			<input type="hidden" name="targetType" value={targetType} />
			<input type="hidden" name="targetId" value={targetId} />
			<input type="hidden" name="action" value={action} />
			<Button size="sm" variant={variant} className="rounded-full">
				{children}
			</Button>
		</form>
	);
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
	await requireModeratorProfile();
	const params = await searchParams;
	const status = normalizeStatus(params.status);
	const db = getDb();
	const reportRows = await db
		.select({
			id: reports.id,
			targetType: reports.targetType,
			targetId: reports.targetId,
			reason: reports.reason,
			details: reports.details,
			status: reports.status,
			createdAt: reports.createdAt,
			reporterName: userProfiles.displayName,
			reporterUsername: userProfiles.username,
		})
		.from(reports)
		.innerJoin(userProfiles, eq(reports.reporterId, userProfiles.id))
		.where(eq(reports.status, status))
		.orderBy(desc(reports.createdAt))
		.limit(50);
	const enrichedReports = await Promise.all(
		reportRows.map(async (report) => ({
			...report,
			target: await getTargetSummary(report.targetType, report.targetId),
		})),
	);

	return (
		<main className="mx-auto max-w-5xl px-4 py-6">
			<div className="mb-6">
				<p className="text-sm font-semibold text-rose-700">Admin</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight">Moderation dashboard</h1>
				<p className="mt-2 text-sm text-muted-foreground">Private author identity is visible here only for safety and audit work.</p>
			</div>

			<div className="mb-5 flex gap-2 overflow-x-auto">
				{statuses.map((item) => (
					<Link
						key={item}
						href={`/app/admin?status=${item}`}
						className={cn(
							"rounded-full border bg-white px-4 py-2 text-sm font-medium text-muted-foreground",
							status === item && "border-slate-950 bg-slate-950 text-white",
						)}
					>
						{item}
					</Link>
				))}
			</div>

			<div className="space-y-4">
				{enrichedReports.length ? (
					enrichedReports.map((report) => (
						<Card key={report.id}>
							<CardHeader>
								<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<CardTitle className="text-lg">
											{report.targetType} · {report.reason}
										</CardTitle>
										<CardDescription>
											Reported by {report.reporterName} (@{report.reporterUsername}) · {report.createdAt.toLocaleString()}
										</CardDescription>
									</div>
									<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{report.status}</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-2xl border bg-slate-50 p-4">
									<p className="text-xs font-medium uppercase text-muted-foreground">Target content</p>
									<p className="mt-2 font-semibold">{report.target?.label ?? "Target not found"}</p>
									<p className="mt-2 whitespace-pre-line text-sm text-slate-700">{report.target?.body}</p>
									{report.target ? (
										<div className="mt-3 rounded-xl bg-white p-3 text-xs text-muted-foreground">
											<p>Private author profile ID: {report.target.authorId}</p>
											<p>Stack user ID: {report.target.authorUserId}</p>
											<p>Username: @{report.target.authorUsername}</p>
											<p>Target status: {report.target.status}</p>
										</div>
									) : null}
								</div>
								{report.details ? (
									<div className="rounded-xl border bg-white p-3 text-sm">
										<span className="font-semibold">Reporter details:</span> {report.details}
									</div>
								) : null}
								<div className="flex flex-wrap gap-2">
									<ActionButton reportId={report.id} targetType={report.targetType} targetId={report.targetId} action="HIDE_TARGET">
										Hide content
									</ActionButton>
									<ActionButton reportId={report.id} targetType={report.targetType} targetId={report.targetId} action="DELETE_TARGET" variant="destructive">
										Delete content
									</ActionButton>
									<ActionButton reportId={report.id} targetType={report.targetType} targetId={report.targetId} action="WARN_USER">
										Warn user
									</ActionButton>
									<ActionButton reportId={report.id} targetType={report.targetType} targetId={report.targetId} action="SUSPEND_USER">
										Suspend user
									</ActionButton>
									<ActionButton reportId={report.id} targetType={report.targetType} targetId={report.targetId} action="BAN_USER" variant="destructive">
										Ban user
									</ActionButton>
									<ActionButton reportId={report.id} targetType={report.targetType} targetId={report.targetId} action="RESOLVE_REPORT" variant="default">
										Resolve
									</ActionButton>
									<ActionButton reportId={report.id} targetType={report.targetType} targetId={report.targetId} action="REJECT_REPORT" variant="ghost">
										Reject
									</ActionButton>
								</div>
							</CardContent>
						</Card>
					))
				) : (
					<Card>
						<CardHeader>
							<CardTitle>No {status.toLowerCase()} reports</CardTitle>
							<CardDescription>The moderation queue is clear for this filter.</CardDescription>
						</CardHeader>
					</Card>
				)}
			</div>
		</main>
	);
}
