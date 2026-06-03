import Link from "next/link";

import { FeedList } from "@/components/app/feed-list";
import { Button } from "@/components/ui/button";
import { requireCompletedProfile } from "@/lib/auth";
import { getPollFeed } from "@/lib/feed";

export default async function PollsPage({ searchParams }: { searchParams: Promise<{ scope?: "campus" | "global" }> }) {
	const { profile } = await requireCompletedProfile();
	const params = await searchParams;
	const scope = params.scope === "global" ? "global" : "campus";
	const feed = await getPollFeed(profile.institutionId, scope);

	return (
		<main className="mx-auto max-w-3xl px-4 py-6">
			<div className="mb-6 flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-amber-700">Polls</p>
					<h1 className="mt-1 text-3xl font-semibold tracking-tight">Campus pulse checks</h1>
					<p className="mt-2 text-sm text-muted-foreground">Vote on campus opinions. Results unlock after voting in the next interaction phase.</p>
				</div>
				<div className="flex gap-2">
					<Button asChild className="rounded-full">
						<Link href="/app/post/new">Create poll</Link>
					</Button>
					<Button asChild variant="outline" className="rounded-full">
						<Link href={scope === "campus" ? "/app/polls?scope=global" : "/app/polls"}>{scope === "campus" ? "Global" : "Campus"}</Link>
					</Button>
				</div>
			</div>
			<FeedList posts={feed} emptyTitle="No polls yet" />
		</main>
	);
}
