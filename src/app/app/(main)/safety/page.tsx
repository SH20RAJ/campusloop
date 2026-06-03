import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { getDb } from "@/db";
import { blocks, userProfiles } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompletedProfile } from "@/lib/auth";

import { unblockUserAction } from "./actions";

const blockedProfiles = alias(userProfiles, "blocked_profiles");

export default async function SafetyPage() {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const blockedUsers = await db
		.select({
			id: blockedProfiles.id,
			displayName: blockedProfiles.displayName,
			username: blockedProfiles.username,
		})
		.from(blocks)
		.innerJoin(blockedProfiles, eq(blocks.blockedUserId, blockedProfiles.id))
		.where(eq(blocks.blockerId, profile.id));

	return (
		<main className="mx-auto max-w-4xl px-4 py-6">
			<div className="mb-6">
				<p className="text-sm font-semibold text-rose-700">Safety</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight">Speak freely. Stay safe.</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					CampusLoop protects student expression, but anonymous abuse is not allowed.
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Anonymity rules</CardTitle>
						<CardDescription>Anonymous means anonymous to students, not to the safety system.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
						<p>Normal users never see anonymous author identity.</p>
						<p>CampusLoop stores private author IDs to investigate reports, threats, doxxing, and abuse.</p>
						<p>Moderation access is role-gated and actions are audited.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Community guidelines</CardTitle>
						<CardDescription>CampusLoop should feel candid, useful, and safe.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>No harassment, bullying, hate speech, threats, doxxing, impersonation, spam, or sexual exploitation.</p>
						<p>Do not post private phone numbers, emails, addresses, hostel rooms, or targeted allegations.</p>
						<p>Criticize ideas and behavior without exposing or attacking people.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>How reporting works</CardTitle>
						<CardDescription>Reports go to moderators and can trigger content or account action.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>Report reasons include harassment, hate speech, doxxing, threats, sexual content, spam, impersonation, and other.</p>
						<p>Moderators can hide or delete content, warn users, suspend accounts, ban accounts, resolve reports, or reject false reports.</p>
						<p>This app is not an emergency service. Contact local authorities or campus officials for urgent safety issues.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Blocked users</CardTitle>
						<CardDescription>Blocked users are hidden from future interaction surfaces where practical.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{blockedUsers.length ? (
							blockedUsers.map((user) => (
								<div key={user.id} className="flex items-center justify-between rounded-xl border bg-slate-50 p-3">
									<div>
										<p className="text-sm font-semibold">{user.displayName}</p>
										<p className="text-xs text-muted-foreground">@{user.username}</p>
									</div>
									<form action={unblockUserAction}>
										<input type="hidden" name="blockedUserId" value={user.id} />
										<Button size="sm" variant="outline" className="rounded-full">
											Unblock
										</Button>
									</form>
								</div>
							))
						) : (
							<p className="text-sm text-muted-foreground">You have not blocked anyone yet.</p>
						)}
					</CardContent>
				</Card>
			</div>

			<Card className="mt-4 border-dashed">
				<CardHeader>
					<CardTitle>Account controls</CardTitle>
					<CardDescription>Delete/deactivate account controls are planned for the next account-management pass.</CardDescription>
				</CardHeader>
			</Card>
		</main>
	);
}
