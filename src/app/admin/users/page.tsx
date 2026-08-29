import { institutions,userProfiles } from "@/db/schema";
import { and,asc,count,desc,eq,ilike,or,sql,type SQL } from "drizzle-orm";
import { Metadata } from "next";
import { resolveAdminSession } from "../_lib/guard";
import { UsersTable } from "./users-table";

export const metadata: Metadata = {
	title: "Admin Users & Student Analytics | CampusLoop",
};

type RoleFilter = "ALL" | "STUDENT" | "MODERATOR" | "ADMIN";
type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "BANNED";
type SortFilter = "RECENT" | "ACTIVE" | "POINTS" | "OLDEST";

interface PageProps {
	searchParams: Promise<{ q?: string; page?: string; role?: string; status?: string; sort?: string }>;
}

function normalize<T extends string>(value: string | undefined, allowed: T[], fallback: T): T {
	return allowed.includes(value as T) ? (value as T) : fallback;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const { db } = await resolveAdminSession();

	const q = params.q || "";
	const page = Math.max(1, Number(params.page) || 1);
	const limit = 20;
	const offset = (page - 1) * limit;

	const role = normalize<RoleFilter>(params.role, ["ALL", "STUDENT", "MODERATOR", "ADMIN"], "ALL");
	const status = normalize<StatusFilter>(params.status, ["ALL", "ACTIVE", "SUSPENDED", "BANNED"], "ALL");
	const sort = normalize<SortFilter>(params.sort, ["RECENT", "ACTIVE", "POINTS", "OLDEST"], "RECENT");

	const conditions: SQL[] = [];
	if (q) {
		conditions.push(
			or(ilike(userProfiles.username, `%${q}%`), ilike(userProfiles.displayName, `%${q}%`))!
		);
	}
	if (role !== "ALL") conditions.push(eq(userProfiles.role, role));
	if (status !== "ALL") conditions.push(eq(userProfiles.status, status));
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	let orderBy: SQL[] = [desc(userProfiles.createdAt)];
	if (sort === "ACTIVE") {
		orderBy = [sql`${userProfiles.lastSeenAt} DESC NULLS LAST`];
	} else if (sort === "POINTS") {
		orderBy = [desc(userProfiles.points)];
	} else if (sort === "OLDEST") {
		orderBy = [asc(userProfiles.createdAt)];
	}

	// Fetch executive analytics, filtered users count, paginated users, and colleges list in parallel
	const [countResult, analyticsResult, users, collegesList] = await Promise.all([
		db.select({ total: count() }).from(userProfiles).where(whereClause),
		db
			.select({
				total: count(),
				active: sql<number>`count(case when ${userProfiles.status} = 'ACTIVE' then 1 end)::int`,
				suspended: sql<number>`count(case when ${userProfiles.status} = 'SUSPENDED' then 1 end)::int`,
				banned: sql<number>`count(case when ${userProfiles.status} = 'BANNED' then 1 end)::int`,
				students: sql<number>`count(case when ${userProfiles.role} = 'STUDENT' then 1 end)::int`,
				moderators: sql<number>`count(case when ${userProfiles.role} = 'MODERATOR' then 1 end)::int`,
				admins: sql<number>`count(case when ${userProfiles.role} = 'ADMIN' then 1 end)::int`,
				onlineNow: sql<number>`count(case when ${userProfiles.lastSeenAt} >= NOW() - INTERVAL '15 minutes' then 1 end)::int`,
				activeToday: sql<number>`count(case when ${userProfiles.lastSeenAt} >= NOW() - INTERVAL '24 hours' then 1 end)::int`,
				recent7d: sql<number>`count(case when ${userProfiles.createdAt} >= NOW() - INTERVAL '7 days' then 1 end)::int`,
				verifiedBadge: sql<number>`count(case when ${userProfiles.points} >= 150 then 1 end)::int`,
				avgPoints: sql<number>`coalesce(round(avg(${userProfiles.points})), 0)::int`,
			})
			.from(userProfiles),
		db.query.userProfiles.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy,
			with: { institution: true },
		}),
		db
			.select({ id: institutions.id, name: institutions.name })
			.from(institutions)
			.orderBy(desc(institutions.name)),
	]);

	const totalCount = countResult[0]?.total || 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / limit));
	const analytics = analyticsResult[0] || {
		total: totalCount,
		active: totalCount,
		suspended: 0,
		banned: 0,
		students: totalCount,
		moderators: 0,
		admins: 0,
		onlineNow: 0,
		activeToday: 0,
		recent7d: 0,
		verifiedBadge: 0,
		avgPoints: 0,
	};

	return (
		<div className="mx-auto max-w-6xl space-y-6">
			<header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">User Directory &amp; Analytics</h2>
					<p className="text-muted-foreground text-sm">
						{totalCount.toLocaleString()} total student profiles · review presence, activity, roles, and safety.
					</p>
				</div>
			</header>

			<UsersTable
				initialUsers={users}
				page={page}
				totalPages={totalPages}
				totalCount={totalCount}
				institutions={collegesList}
				activeRole={role}
				activeStatus={status}
				activeSort={sort}
				analytics={analytics}
			/>
		</div>
	);
}
