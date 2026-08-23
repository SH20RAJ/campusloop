"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw, SearchIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { deletePost, setPostStatus } from "./actions";
import { revealAnonymousAuthor, type RevealedIdentity } from "../anonymity-actions";

type PostStatusFilter = "ALL" | "PUBLISHED" | "PENDING_REVIEW" | "HIDDEN" | "DELETED";
type PostAnonFilter = "all" | "anon" | "public";

const statusTabs: { value: PostStatusFilter; label: string }[] = [
	{ value: "ALL", label: "All" },
	{ value: "PUBLISHED", label: "Published" },
	{ value: "PENDING_REVIEW", label: "Flagged" },
	{ value: "HIDDEN", label: "Hidden" },
	{ value: "DELETED", label: "Deleted" },
];

const anonTabs: { value: PostAnonFilter; label: string }[] = [
	{ value: "all", label: "Everyone" },
	{ value: "anon", label: "👻 Anonymous" },
	{ value: "public", label: "Named" },
];

interface PostRow {
	id: string;
	body: string;
	type: string;
	isAnonymous: boolean;
	pseudonym?: string | null;
	status: string;
	riskScore?: number;
	createdAt: string | Date;
	institution?: { name: string; slug?: string } | null;
}

interface PostsTableProps {
	initialPosts: PostRow[];
	page: number;
	totalPages: number;
	totalCount: number;
	activeStatus: PostStatusFilter;
	activeAnon: PostAnonFilter;
}

const statusBadgeTone: Record<string, string> = {
	PUBLISHED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
	PENDING_REVIEW: "bg-orange-500/10 text-orange-500 border-orange-500/20",
	HIDDEN: "bg-muted text-muted-foreground border-border",
	DELETED: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function PostsTable({ initialPosts, page, totalPages, totalCount, activeStatus, activeAnon }: PostsTableProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [search, setSearch] = useState(searchParams.get("q") || "");
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [revealed, setRevealed] = useState<Record<string, RevealedIdentity>>({});
	const [revealPostId, setRevealPostId] = useState<string | null>(null);
	const [deletePostId, setDeletePostId] = useState<string | null>(null);

	function pushParams(mutate: (params: URLSearchParams) => void) {
		const params = new URLSearchParams(searchParams.toString());
		mutate(params);
		router.push(`/admin/posts?${params.toString()}`);
	}

	async function runAction(postId: string, fn: () => Promise<unknown>, successMsg = "Action completed") {
		setActionLoading(postId);
		try {
			await fn();
			toast.success(successMsg);
			router.refresh();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Action failed");
		} finally {
			setActionLoading(null);
		}
	}

	async function confirmReveal() {
		if (!revealPostId) return;
		const postId = revealPostId;
		await runAction(postId, async () => {
			const identity = await revealAnonymousAuthor("POST", postId);
			setRevealed((prev) => ({ ...prev, [postId]: identity }));
			setRevealPostId(null);
		}, "Anonymous author revealed (audit logged)");
	}

	async function confirmDelete() {
		if (!deletePostId) return;
		const postId = deletePostId;
		await runAction(postId, async () => {
			await deletePost(postId);
			setDeletePostId(null);
		}, "Post deleted successfully");
	}

	return (
		<div className="space-y-4">
			{/* Filter bar */}
			<div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
				<div className="flex flex-wrap gap-1.5">
					{statusTabs.map((tab) => (
						<button
							key={tab.value}
							onClick={() => pushParams((p) => { p.set("status", tab.value); p.set("page", "1"); })}
							className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
								activeStatus === tab.value
									? "bg-primary text-primary-foreground border-primary"
									: "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
							}`}
						>
							{tab.label}
						</button>
					))}
					<span className="w-px bg-border mx-1" aria-hidden />
					{anonTabs.map((tab) => (
						<button
							key={tab.value}
							onClick={() => pushParams((p) => { p.set("anon", tab.value); p.set("page", "1"); })}
							className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
								activeAnon === tab.value
									? "bg-foreground text-background border-foreground"
									: "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						pushParams((p) => { if (search.trim()) p.set("q", search.trim()); else p.delete("q"); p.set("page", "1"); });
					}}
					className="flex gap-2 w-full max-w-xs"
				>
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Search posts..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-md border border-border focus:ring-1 focus:ring-ring outline-none"
						/>
					</div>
				</form>
			</div>

			{/* Table */}
			<div className="rounded-xl border border-border bg-card overflow-hidden">
				<div className="w-full overflow-x-auto">
					<table className="w-full text-left text-sm text-muted-foreground">
						<thead className="bg-muted text-xs uppercase text-foreground">
							<tr>
								<th className="px-5 py-3">Author</th>
								<th className="px-5 py-3">Content</th>
								<th className="px-5 py-3">Status</th>
								<th className="px-5 py-3 text-right">Actions</th>
							</tr>
						</thead>
						<tbody>
							{initialPosts.map((post) => (
								<tr key={post.id} className="border-b border-border hover:bg-muted/50 align-top">
									<td className="px-5 py-4">
										<div className="flex flex-col gap-0.5">
											<span className="font-semibold text-foreground text-xs">
												{post.isAnonymous ? (revealed[post.id]?.displayName ?? "👻 Anonymous") : revealed[post.id]?.displayName ?? post.institution?.name?.split(",")[0]}
											</span>
											{post.isAnonymous && !revealed[post.id] && (
												<span className="text-[10px] text-muted-foreground font-mono">{post.pseudonym || "anon"}</span>
											)}
											{(revealed[post.id] || !post.isAnonymous) && (
												<a href={`/admin/users?q=${revealed[post.id]?.username ?? ""}`} className="text-[10px] text-blue-500 hover:underline">
													@{revealed[post.id]?.username ?? post.institution?.slug ?? "—"} · {revealed[post.id]?.accountStatus ?? "named"}
												</a>
											)}
										</div>
									</td>
									<td className="px-5 py-4 text-foreground max-w-sm">
										<p className="text-xs line-clamp-3 leading-relaxed">{post.body}</p>
										<div className="flex items-center gap-2 mt-1.5">
											<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-muted text-foreground">{post.type}</span>
											{typeof post.riskScore === "number" && post.riskScore > 0 && (
												<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${post.riskScore >= 70 ? "text-red-500 border-red-500/30 bg-red-500/10" : "text-orange-500 border-orange-500/30 bg-orange-500/10"}`}>
													risk {post.riskScore}
												</span>
											)}
											<span className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
										</div>
									</td>
									<td className="px-5 py-4">
										<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeTone[post.status] ?? ""}`}>
											{post.status}
										</span>
									</td>
									<td className="px-5 py-4 text-right">
										<div className="flex items-center justify-end gap-1">
											{post.isAnonymous && !revealed[post.id] && (
												<button
													disabled={actionLoading === post.id}
													onClick={() => setRevealPostId(post.id)}
													title="Reveal author (audit logged)"
													className="p-1.5 rounded hover:bg-muted text-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
												>
													<Eye className="h-4 w-4" />
												</button>
											)}
											{post.status === "PUBLISHED" ? (
												<button
													disabled={actionLoading === post.id}
													onClick={() => runAction(post.id, () => setPostStatus(post.id, "HIDDEN"), "Post hidden from feeds")}
													title="Hide post"
													className="p-1.5 rounded hover:bg-muted text-orange-500 disabled:opacity-50 transition-colors cursor-pointer"
												>
													<EyeOff className="h-4 w-4" />
												</button>
											) : (
												<button
													disabled={actionLoading === post.id}
													onClick={() => runAction(post.id, () => setPostStatus(post.id, "PUBLISHED"), "Post published successfully")}
													title="Restore / publish"
													className="p-1.5 rounded hover:bg-muted text-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
												>
													<RotateCcw className="h-4 w-4" />
												</button>
											)}
											<button
												disabled={actionLoading === post.id}
												onClick={() => setDeletePostId(post.id)}
												title="Delete post"
												className="p-1.5 rounded hover:bg-muted text-destructive disabled:opacity-50 transition-colors cursor-pointer"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							))}
							{initialPosts.length === 0 && (
								<tr>
									<td colSpan={4} className="px-6 py-10 text-center">No posts match these filters.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination Footer */}
				<div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/40">
					<span className="text-xs text-muted-foreground">
						{totalCount.toLocaleString()} posts · Page {page} of {totalPages}
					</span>
					<div className="flex gap-2">
						<button
							disabled={page <= 1}
							onClick={() => pushParams((p) => p.set("page", String(page - 1)))}
							className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<button
							disabled={page >= totalPages}
							onClick={() => pushParams((p) => p.set("page", String(page + 1)))}
							className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Reveal Author Modal */}
			<ConfirmDialog
				isOpen={Boolean(revealPostId)}
				title="Reveal Anonymous Author?"
				description="Are you sure you want to reveal the identity of this anonymous author? This action is permanently audit-logged with your admin ID."
				confirmText="Reveal Identity"
				variant="info"
				isLoading={Boolean(actionLoading && revealPostId && actionLoading === revealPostId)}
				onClose={() => setRevealPostId(null)}
				onConfirm={confirmReveal}
			/>

			{/* Delete Post Modal */}
			<ConfirmDialog
				isOpen={Boolean(deletePostId)}
				title="Delete Post?"
				description="Are you sure you want to delete this post? It will be removed from all feeds."
				confirmText="Delete Post"
				variant="danger"
				isLoading={Boolean(actionLoading && deletePostId && actionLoading === deletePostId)}
				onClose={() => setDeletePostId(null)}
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
