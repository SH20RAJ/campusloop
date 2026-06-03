import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { FeedList } from "@/components/app/feed-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompletedProfile } from "@/lib/auth";
import { getVisibleProfilePosts } from "@/lib/feed";

export default async function ProfilePage() {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const [institution] = await db
		.select({
			name: institutions.name,
			state: institutions.state,
			district: institutions.district,
		})
		.from(institutions)
		.where(eq(institutions.id, profile.institutionId))
		.limit(1);
	const visiblePosts = await getVisibleProfilePosts(profile.id);

	return (
		<main className="mx-auto max-w-3xl px-4 py-6">
			<Card className="overflow-hidden">
				<div className="h-28 bg-[linear-gradient(120deg,#0f172a,#0f766e,#38bdf8)]" />
				<CardHeader className="-mt-10">
					<div className="flex size-20 items-center justify-center rounded-2xl border-4 border-white bg-slate-950 text-2xl font-semibold text-white">
						{profile.displayName.charAt(0).toUpperCase()}
					</div>
					<CardTitle className="mt-3 text-2xl">{profile.displayName}</CardTitle>
					<p className="text-sm text-muted-foreground">@{profile.username}</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm leading-6 text-slate-700">{profile.bio || "No bio yet."}</p>
					<div className="grid gap-3 rounded-2xl border bg-slate-50 p-4 text-sm sm:grid-cols-2">
						<div>
							<p className="text-xs font-medium text-muted-foreground">Institution</p>
							<p className="font-semibold">{institution?.name ?? "CampusLoop"}</p>
							<p className="text-xs text-muted-foreground">{[institution?.district, institution?.state].filter(Boolean).join(", ")}</p>
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">Course</p>
							<p className="font-semibold">{[profile.course, profile.branch, profile.year ? `Year ${profile.year}` : null].filter(Boolean).join(" · ") || "Not set"}</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						{profile.interests.length ? (
							profile.interests.map((interest) => (
								<span key={interest} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
									{interest}
								</span>
							))
						) : (
							<span className="text-sm text-muted-foreground">No interests added yet.</span>
						)}
					</div>
				</CardContent>
			</Card>

			<section className="mt-6">
				<h2 className="mb-3 text-xl font-semibold tracking-tight">Public posts</h2>
				<FeedList posts={visiblePosts} emptyTitle="No public posts yet" />
				<p className="mt-3 text-xs text-muted-foreground">Anonymous posts are not shown as yours on your public profile.</p>
			</section>
		</main>
	);
}
