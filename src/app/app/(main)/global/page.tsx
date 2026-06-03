import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { FeedList } from "@/components/app/feed-list";
import { FeedTabs } from "@/components/app/feed-tabs";
import { requireCompletedProfile } from "@/lib/auth";
import { getFeedFilter, getGlobalFeed } from "@/lib/feed";

export default async function GlobalPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
	const { profile } = await requireCompletedProfile();
	const params = await searchParams;
	const activeTab = getFeedFilter(params.tab);
	const db = getDb();
	const [institution] = await db
		.select({ state: institutions.state })
		.from(institutions)
		.where(eq(institutions.id, profile.institutionId))
		.limit(1);
	const feed = await getGlobalFeed(profile, institution?.state ?? null, activeTab);

	return (
		<main className="mx-auto max-w-3xl px-4 py-6">
			<div className="mb-6">
				<p className="text-sm font-semibold text-sky-700">Global</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight">Cross-campus mode</h1>
				<p className="mt-2 text-sm text-muted-foreground">India, state, global, and your own campus posts in one verified student network.</p>
			</div>
			<div className="mb-4">
				<FeedTabs active={activeTab} basePath="/app/global" />
			</div>
			<FeedList posts={feed} emptyTitle="No global posts yet" />
		</main>
	);
}
