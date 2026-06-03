import Link from "next/link";

import { FeedList } from "@/components/app/feed-list";
import { Button } from "@/components/ui/button";
import { requireCompletedProfile } from "@/lib/auth";
import { getConfessionsFeed } from "@/lib/feed";

export default async function ConfessionsPage({ searchParams }: { searchParams: Promise<{ scope?: "campus" | "india" }> }) {
	const { profile } = await requireCompletedProfile();
	const params = await searchParams;
	const scope = params.scope === "india" ? "india" : "campus";
	const feed = await getConfessionsFeed(profile.institutionId, scope);

	return (
		<main className="mx-auto max-w-3xl px-4 py-6">
			<div className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
				<p className="text-sm font-semibold text-emerald-300">Confess</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight">Anonymous, not lawless</h1>
				<p className="mt-3 text-sm leading-6 text-white/72">
					Confessions are anonymous to students, but CampusLoop can take action against abuse.
				</p>
				<div className="mt-5 flex flex-wrap gap-2">
					<Button asChild className="rounded-full bg-white text-slate-950 hover:bg-white/90">
						<Link href="/app/post/new">Write confession</Link>
					</Button>
					<Button asChild variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
						<Link href={scope === "campus" ? "/app/confessions?scope=india" : "/app/confessions"}>{scope === "campus" ? "India confessions" : "Campus confessions"}</Link>
					</Button>
				</div>
			</div>
			<FeedList posts={feed} emptyTitle="No confessions yet" />
		</main>
	);
}
