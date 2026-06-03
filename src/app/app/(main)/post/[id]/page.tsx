import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ReportForm } from "@/components/app/report-form";
import { requireCompletedProfile } from "@/lib/auth";
import { getPostDetail } from "@/lib/post-detail";
import { blockUserAction } from "@/app/app/(main)/safety/actions";

import { addCommentAction, deleteCommentAction, deletePostAction, votePollAction, votePostAction } from "../actions";

function formatTime(date: Date) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

export default async function PostDetailPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ comment?: string }>;
}) {
	const { profile } = await requireCompletedProfile();
	const { id } = await params;
	const query = await searchParams;
	const detail = await getPostDetail(id, profile.id);

	if (!detail) {
		redirect("/app/campus");
	}

	const canModerate = profile.role === "ADMIN" || profile.role === "MODERATOR";
	const canSeePost = detail.post.status === "PUBLISHED" || detail.post.authorId === profile.id || canModerate;

	if (!canSeePost) {
		redirect("/app/campus");
	}

	const authorName = detail.post.isAnonymous ? "Anonymous student" : detail.post.authorDisplayName ?? "CampusLoop student";
	const authorMeta = detail.post.isAnonymous ? "Hidden from students" : `@${detail.post.authorUsername}`;
	const canDeletePost = detail.post.authorId === profile.id || canModerate;
	const pollTotal = detail.pollOptions.reduce((total, option) => total + option.voteCount, 0);
	const viewerVotedPoll = detail.pollOptions.some((option) => option.selectedByViewer);

	return (
		<main className="mx-auto max-w-3xl px-4 py-6">
			<Link href="/app/campus" className="text-sm font-medium text-muted-foreground hover:text-foreground">
				Back to campus
			</Link>

			<Card className="mt-4 overflow-hidden">
				<CardHeader className="space-y-4">
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
								{detail.post.isAnonymous ? "A" : authorName.charAt(0).toUpperCase()}
							</div>
							<div className="min-w-0">
								<p className="truncate font-semibold">{authorName}</p>
								<p className="truncate text-xs text-muted-foreground">
									{authorMeta} · {detail.post.institutionName} · {formatTime(detail.post.createdAt)}
								</p>
							</div>
						</div>
						{canDeletePost ? (
							<form action={deletePostAction}>
								<input type="hidden" name="postId" value={detail.post.id} />
								<Button variant="destructive" size="sm" className="rounded-full">
									Delete
								</Button>
							</form>
						) : null}
					</div>
					<div>
						{detail.post.title ? <CardTitle className="text-2xl">{detail.post.title}</CardTitle> : null}
						<p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{detail.post.body}</p>
					</div>
				</CardHeader>
				<CardContent className="space-y-5 border-t bg-slate-50/70 p-4">
					<div className="flex flex-wrap items-center gap-2">
						<form action={votePostAction}>
							<input type="hidden" name="postId" value={detail.post.id} />
							<input type="hidden" name="value" value="1" />
							<Button variant={detail.viewerVote === 1 ? "default" : "outline"} className="rounded-full">
								↑ {detail.post.voteScore}
							</Button>
						</form>
						<form action={votePostAction}>
							<input type="hidden" name="postId" value={detail.post.id} />
							<input type="hidden" name="value" value="-1" />
							<Button variant={detail.viewerVote === -1 ? "default" : "outline"} className="rounded-full">
								↓
							</Button>
						</form>
						<span className="text-sm text-muted-foreground">{detail.comments.length} comments</span>
						<ReportForm targetType="POST" targetId={detail.post.id} />
						{!detail.post.isAnonymous && detail.post.authorId !== profile.id ? (
							<form action={blockUserAction}>
								<input type="hidden" name="blockedUserId" value={detail.post.authorId} />
								<Button size="sm" variant="ghost" className="rounded-full text-muted-foreground">
									Block user
								</Button>
							</form>
						) : null}
					</div>

					{detail.post.type === "POLL" ? (
						<div className="rounded-2xl border bg-white p-4">
							<p className="font-semibold">Poll</p>
							<div className="mt-3 space-y-3">
								{detail.pollOptions.map((option) => {
									const percent = pollTotal > 0 ? Math.round((option.voteCount / pollTotal) * 100) : 0;

									return (
										<form key={option.id} action={votePollAction}>
											<input type="hidden" name="postId" value={detail.post.id} />
											<input type="hidden" name="optionId" value={option.id} />
											<Button
												variant={option.selectedByViewer ? "default" : "outline"}
												className="relative h-auto min-h-11 w-full justify-between overflow-hidden rounded-xl px-4 py-3"
												disabled={viewerVotedPoll}
											>
												<span className="relative z-10">{option.text}</span>
												{viewerVotedPoll ? <span className="relative z-10 text-xs">{percent}% · {option.voteCount}</span> : null}
												{viewerVotedPoll ? (
													<span className="absolute inset-y-0 left-0 bg-emerald-200/60" style={{ width: `${percent}%` }} />
												) : null}
											</Button>
										</form>
									);
								})}
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>

			<Card className="mt-5">
				<CardHeader>
					<CardTitle>Comments</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					{query.comment === "blocked" ? (
						<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
							That comment cannot be posted in its current form.
						</div>
					) : null}
					{query.comment === "review" ? (
						<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
							Your comment was saved for safety review.
						</div>
					) : null}
					<form action={addCommentAction} className="space-y-3">
						<input type="hidden" name="postId" value={detail.post.id} />
						<Textarea name="body" required minLength={2} placeholder="Add a comment" />
						<label className="flex items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" name="isAnonymous" className="size-4" />
							Comment anonymously
						</label>
						<Button className="rounded-xl">Comment</Button>
					</form>

					<div className="space-y-3">
						{detail.comments.map((comment) => {
							const commentAuthor = comment.isAnonymous ? "Anonymous student" : comment.authorDisplayName ?? "CampusLoop student";
							const canDeleteComment = comment.authorId === profile.id || canModerate;

							return (
								<div key={comment.id} className="rounded-2xl border bg-slate-50 p-4">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-semibold">{commentAuthor}</p>
											<p className="text-xs text-muted-foreground">
												{comment.isAnonymous ? "Hidden from students" : `@${comment.authorUsername}`} · {formatTime(comment.createdAt)}
											</p>
										</div>
										{canDeleteComment ? (
											<form action={deleteCommentAction}>
												<input type="hidden" name="postId" value={detail.post.id} />
												<input type="hidden" name="commentId" value={comment.id} />
												<Button size="sm" variant="ghost" className="rounded-full text-muted-foreground">
													Delete
												</Button>
											</form>
										) : null}
										<ReportForm targetType="COMMENT" targetId={comment.id} label="Report" />
										{!comment.isAnonymous && comment.authorId !== profile.id ? (
											<form action={blockUserAction}>
												<input type="hidden" name="blockedUserId" value={comment.authorId} />
												<Button size="sm" variant="ghost" className="rounded-full text-muted-foreground">
													Block
												</Button>
											</form>
										) : null}
									</div>
									<p className="mt-3 whitespace-pre-line text-sm leading-6">{comment.body}</p>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
