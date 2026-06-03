import { FeedList } from "@/components/app/feed-list";
import { FeedTabs } from "@/components/app/feed-tabs";
import { StoriesRow } from "@/components/app/stories-row";
import { requireCompletedProfile } from "@/lib/auth";
import { getCampusFeed, getFeedFilter } from "@/lib/feed";

export default async function CampusPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string; created?: string; review?: string }>;
}) {
	const { profile } = await requireCompletedProfile();
	const params = await searchParams;
	const activeTab = getFeedFilter(params.tab);
	const feed = await getCampusFeed(profile.institutionId, activeTab);

	return (
		<main className="mx-auto max-w-3xl px-4 py-6">
			<div className="mb-6">
				<p className="text-sm font-semibold text-emerald-700">Campus</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight">Your campus feed</h1>
				<p className="mt-2 text-sm text-muted-foreground">Posts, confessions, polls, questions, events, and lost-and-found from verified students.</p>
			</div>

			{params.created ? (
				<div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
					Your post is live.
				</div>
			) : null}
			{params.review ? (
				<div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
					Your post was saved for safety review.
				</div>
			) : null}

			<div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm">
				<StoriesRow />
			</div>

			<div className="mb-4">
				<FeedTabs active={activeTab} basePath="/app/campus" />
			</div>

			<FeedList posts={feed} emptyTitle="No campus posts yet" />
		</main>
	);
}
