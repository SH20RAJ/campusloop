import Link from "next/link";
import {
	Activity,
	EyeOff,
	FileText,
	Ghost,
	GraduationCap,
	ShieldAlert,
	Sparkles,
	TrendingUp,
	UserCheck,
	Users,
} from "lucide-react";
import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { institutions, posts, userProfiles } from "@/db/schema";

import { ActivityChart } from "./_components/activity-chart";
import { StatCard } from "./_components/stat-card";
import { resolveAdminSession } from "./_lib/guard";
import {
	getActivitySeries,
	getDashboardStats,
	getRecentAuditLog,
	getTopColleges,
	getTotalEngagement,
} from "./_lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
	const { db } = await resolveAdminSession();

	const [stats, activity, topColleges, auditLog, engagement, recentPosts, recentUsers] = await Promise.all([
		getDashboardStats(db),
		getActivitySeries(db).catch(() => []),
		getTopColleges(db).catch(() => []),
		getRecentAuditLog(db).catch(() => []),
		getTotalEngagement(db),
		db
			.select({
				id: posts.id,
				body: posts.body,
				isAnonymous: posts.isAnonymous,
				pseudonym: posts.pseudonym,
				institutionName: institutions.name,
			})
			.from(posts)
			.leftJoin(institutions, eq(posts.institutionId, institutions.id))
			.orderBy(desc(posts.createdAt))
			.limit(5)
			.catch(() => []),
		db.query.userProfiles.findMany({ orderBy: [desc(userProfiles.createdAt)], limit: 5, with: { institution: true } }).catch(() => []),
	]);

	return (
		<div className="mx-auto max-w-6xl space-y-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
					<p className="text-muted-foreground text-sm">Real-time telemetry across the CampusLoop network.</p>
				</div>
				<Link
					href="/admin/review"
					className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
				>
					<ShieldAlert className="h-4 w-4" />
					Review Queue ({stats.pendingPosts})
				</Link>
			</header>

			<section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
				<StatCard label="Total Users" value={stats.totalUsers} icon={Users} accent="primary" href="/admin/users" hint={`${stats.activeUsers} active · ${stats.bannedUsers} banned`} />
				<StatCard label="Total Posts" value={stats.totalPosts} icon={FileText} accent="blue" href="/admin/posts" hint={`${stats.publishedPosts} published`} />
				<StatCard label="Pending Review" value={stats.pendingPosts} icon={EyeOff} accent={stats.pendingPosts > 0 ? "red" : "green"} href="/admin/review" hint="auto-flagged by safety engine" />
				<StatCard label="Open Reports" value={stats.openReports} icon={ShieldAlert} accent={stats.openReports > 0 ? "orange" : "green"} href="/admin/reports" />
				<StatCard label="Comments" value={stats.totalComments} icon={Activity} accent="violet" href="/admin/comments" />
				<StatCard label="Anonymous Posts" value={stats.anonymousPosts} icon={Ghost} accent="primary" hint={`${stats.anonVaultEntries} sealed identities`} />
				<StatCard label="Colleges" value={stats.colleges} icon={GraduationCap} accent="orange" href="/admin/colleges" />
				<StatCard label="LP Circulating" value={stats.lpCirculating.toLocaleString()} icon={Sparkles} accent="violet" hint={`${engagement.votes.toLocaleString()} total votes`} />
			</section>

			<section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
				<h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
					<TrendingUp className="h-4 w-4 text-muted-foreground" /> Network Activity — Last 14 Days
				</h3>
				{activity.length > 0 ? (
					<ActivityChart data={activity} />
				) : (
					<p className="text-xs text-muted-foreground py-10 text-center">No activity data available yet.</p>
				)}
			</section>

			<section className="grid gap-6 lg:grid-cols-3">
				<div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 lg:col-span-2">
					<h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Posts</h3>
					<div className="divide-y divide-border">
						{recentPosts.map((post) => (
							<Link key={post.id} href={`/app/post/${post.id}`} className="block py-3 first:pt-0 last:pb-0 space-y-1 hover:bg-muted/40 rounded-lg px-2 -mx-2 transition-colors">
								<div className="flex justify-between items-baseline gap-2">
									<span className="text-xs font-semibold text-foreground truncate">
										{post.isAnonymous ? `👻 ${post.pseudonym || "Anonymous"}` : post.body.slice(0, 40)}
									</span>
									<span className="text-[10px] text-muted-foreground shrink-0">{post.institutionName?.split(",")[0]}</span>
								</div>
								<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.body}</p>
							</Link>
						))}
						{recentPosts.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No posts found.</p>}
					</div>
				</div>

				<div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
					<h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Signups</h3>
					<div className="divide-y divide-border">
						{recentUsers.map((p) => (
							<div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
								<div className="min-w-0">
									<p className="text-xs font-semibold text-foreground truncate">{p.displayName}</p>
									<p className="text-[10px] text-muted-foreground">@{p.username}</p>
								</div>
								<span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border font-medium text-foreground truncate max-w-[120px]">
									{p.institution?.name?.split(",")[0] || "—"}
								</span>
							</div>
						))}
						{recentUsers.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No signups found.</p>}
					</div>
				</div>
			</section>

			<section className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
					<h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Top Campuses</h3>
					<div className="space-y-2">
						{topColleges.map((c, i) => (
							<Link key={c.id} href={`/app/college/${c.slug}`} className="flex items-center gap-3 py-1.5 group">
								<span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
									i === 0 ? "bg-orange-500/15 text-orange-500" : i === 1 ? "bg-blue-500/15 text-blue-500" : "bg-muted text-muted-foreground"
								}`}>
									{i + 1}
								</span>
								<span className="text-xs font-semibold text-foreground truncate flex-1 group-hover:text-primary transition-colors">{c.name.split(",")[0]}</span>
								<span className="text-[10px] text-muted-foreground shrink-0">{c.postCount} posts · {c.students} students</span>
							</Link>
						))}
						{topColleges.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No colleges indexed.</p>}
					</div>
				</div>

				<div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Moderation Audit Trail</h3>
						<Link href="/admin/audit" className="text-[10px] font-bold text-primary hover:underline">VIEW ALL</Link>
					</div>
					<div className="divide-y divide-border">
						{auditLog.map((entry) => (
							<div key={entry.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="text-xs font-semibold text-foreground">{entry.action.replaceAll("_", " ")}</p>
									<p className="text-[10px] text-muted-foreground truncate">
										by @{entry.moderatorName || "system"} · {entry.targetType} · {new Date(entry.createdAt).toLocaleDateString()}
									</p>
								</div>
								<UserCheck className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
							</div>
						))}
						{auditLog.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No moderation actions recorded yet.</p>}
					</div>
				</div>
			</section>
		</div>
	);
}
