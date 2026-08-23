import { userProfiles, institutions } from "@/db/schema";
import { and, count, desc, eq, or, ilike, type SQL } from "drizzle-orm";
import { UsersTable } from "./users-table";
import { Metadata } from "next";

import { resolveAdminSession } from "../_lib/guard";

export const metadata: Metadata = {
	title: "Admin Users | CampusLoop",
};

type RoleFilter = "ALL" | "STUDENT" | "MODERATOR" | "ADMIN";
type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "BANNED";

interface PageProps {
	searchParams: Promise<{ q?: string; page?: string; role?: string; status?: string }>;
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

	const conditions: SQL[] = [];
	if (q) {
		conditions.push(
			or(ilike(userProfiles.username, `%${q}%`), ilike(userProfiles.displayName, `%${q}%`))!
		);
	}
	if (role !== "ALL") conditions.push(eq(userProfiles.role, role));
	if (status !== "ALL") conditions.push(eq(userProfiles.status, status));
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Fetch colleges list for user creation (needed by the create form)
	const [countResult, users, collegesList] = await Promise.all([
		db.select({ total: count() }).from(userProfiles).where(whereClause),
		db.query.userProfiles.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy: [desc(userProfiles.createdAt)],
			with: { institution: true },
		}),
		db
			.select({ id: institutions.id, name: institutions.name })
			.from(institutions)
			.orderBy(desc(institutions.name)),
	]);

	const totalCount = countResult[0]?.total || 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / limit));

	return (
		<div className="mx-auto max-w-6xl space-y-6">
			<header>
				<h2 className="text-2xl font-bold tracking-tight text-foreground">User Accounts</h2>
				<p className="text-muted-foreground text-sm">
					{totalCount.toLocaleString()} accounts · review, verify, promote, suspend or ban.
				</p>
			</header>

			<UsersTable
				initialUsers={users}
				page={page}
				totalPages={totalPages}
				totalCount={totalCount}
				institutions={collegesList}
				activeRole={role}
				activeStatus={status}
			/>
		</div>
	);
}
