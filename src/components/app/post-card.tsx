import Link from "next/link";

import type { FeedPost } from "@/lib/feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { votePostAction } from "@/app/app/(main)/post/actions";

const typeLabels: Record<FeedPost["type"], string> = {
	NORMAL: "Post",
	ANONYMOUS: "Anonymous",
	CONFESSION: "Confession",
	POLL: "Poll",
	QUESTION: "Question",
	MEME: "Meme",
	EVENT: "Event",
	LOST_FOUND: "Lost & Found",
};

function formatTime(date: Date) {
	const delta = Date.now() - date.getTime();
	const minutes = Math.max(1, Math.floor(delta / 60_000));

	if (minutes < 60) {
		return `${minutes}m ago`;
	}

	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours}h ago`;
	}

	return `${Math.floor(hours / 24)}d ago`;
}

export function PostCard({ post }: { post: FeedPost }) {
	const authorName = post.isAnonymous ? "Anonymous student" : post.authorDisplayName ?? "CampusLoop student";
	const authorHandle = post.isAnonymous ? "Hidden from students" : `@${post.authorUsername}`;

	return (
		<Card className="overflow-hidden border-border/70 bg-white shadow-sm">
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
							{post.isAnonymous ? "A" : authorName.charAt(0).toUpperCase()}
						</div>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold">{authorName}</p>
							<p className="truncate text-xs text-muted-foreground">
								{authorHandle} · {post.institutionName}
							</p>
						</div>
					</div>
					<Badge variant={post.type === "CONFESSION" ? "destructive" : "secondary"}>{typeLabels[post.type]}</Badge>
				</div>
				<div>
					{post.title ? (
						<Link href={`/app/post/${post.id}`} className="text-lg font-semibold tracking-tight hover:underline">
							{post.title}
						</Link>
					) : null}
					<p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{post.body}</p>
				</div>
			</CardHeader>
			<CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
				<span>{post.scope}</span>
				<span>·</span>
				<span>{formatTime(post.createdAt)}</span>
				{post.riskScore > 0 ? (
					<>
						<span>·</span>
						<span>Safety checked</span>
					</>
				) : null}
			</CardContent>
			<CardFooter className="flex items-center justify-between border-t bg-slate-50/70 px-4 py-3">
				<div className="flex items-center gap-2">
					<form action={votePostAction}>
						<input type="hidden" name="postId" value={post.id} />
						<input type="hidden" name="value" value="1" />
						<Button size="sm" variant="outline" className="h-8 rounded-full">
							↑ {post.voteScore}
						</Button>
					</form>
					<form action={votePostAction}>
						<input type="hidden" name="postId" value={post.id} />
						<input type="hidden" name="value" value="-1" />
						<Button size="sm" variant="outline" className="h-8 rounded-full">
							↓
						</Button>
					</form>
					<Button asChild size="sm" variant="ghost" className="h-8 rounded-full">
						<Link href={`/app/post/${post.id}`}>{post.commentCount} comments</Link>
					</Button>
				</div>
				<Button size="sm" variant="ghost" className="h-8 rounded-full text-muted-foreground" disabled>
					Report
				</Button>
			</CardFooter>
		</Card>
	);
}
