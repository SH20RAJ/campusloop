import type { FeedPost } from "@/lib/feed";

import { PostCard } from "./post-card";

export function FeedList({ posts, emptyTitle }: { posts: FeedPost[]; emptyTitle: string }) {
	if (!posts.length) {
		return (
			<div className="rounded-2xl border border-dashed bg-white px-6 py-12 text-center">
				<p className="font-semibold">{emptyTitle}</p>
				<p className="mt-2 text-sm text-muted-foreground">Be the first student to start the loop.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
		</div>
	);
}
