import { and,count,desc,eq,ilike,type SQL } from "drizzle-orm";
import { Metadata } from "next";

import { posts } from "@/db/schema";

import { resolveAdminSession } from "../_lib/guard";
import { PostsTable } from "./posts-table";

export const metadata: Metadata = {
	title: "Admin Posts | CampusLoop",
};

type PostStatusFilter = "ALL" | "PUBLISHED" | "PENDING_REVIEW" | "HIDDEN" | "DELETED";
type PostAnonFilter = "all" | "anon" | "public";

interface PageProps {
	searchParams: Promise<{ q?: string; page?: string; status?: string; anon?: string }>;
}

function normalizeStatus(value?: string): PostStatusFilter {
	const allowed: PostStatusFilter[] = ["ALL", "PUBLISHED", "PENDING_REVIEW", "HIDDEN", "DELETED"];
	return allowed.includes((value ?? "ALL") as PostStatusFilter) ? (value as PostStatusFilter) : "ALL";
}

function normalizeAnon(value?: string): PostAnonFilter {
	return value === "anon" || value === "public" ? value : "all";
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const { db } = await resolveAdminSession();

	const q = params.q || "";
	const page = Math.max(1, Number(params.page) || 1);
	const limit = 20;
	const offset = (page - 1) * limit;

	const status = normalizeStatus(params.status);
	const anon = normalizeAnon(params.anon);

	const conditions: SQL[] = [];
	if (q) conditions.push(ilike(posts.body, `%${q}%`));
	if (status !== "ALL") conditions.push(eq(posts.status, status));
	if (anon === "anon") conditions.push(eq(posts.isAnonymous, true));
	if (anon === "public") conditions.push(eq(posts.isAnonymous, false));
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [[totals], list] = await Promise.all([
		db.select({ total: count() }).from(posts).where(whereClause),
		db.query.posts.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy: [desc(posts.createdAt)],
			with: {
				institution: true,
			},
		}),
	]);

	const totalCount = totals?.total || 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / limit));

	return (
		<div className="mx-auto max-w-6xl space-y-6">
			<header>
				<h2 className="text-2xl font-bold tracking-tight text-foreground">Post Moderation</h2>
				<p className="text-muted-foreground text-sm">Review, verify, hide or restore posts across all campuses.</p>
			</header>

			<PostsTable
				initialPosts={list}
				page={page}
				totalPages={totalPages}
				totalCount={totalCount}
				activeStatus={status}
				activeAnon={anon}
			/>
		</div>
	);
}
