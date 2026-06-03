import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompletedProfile } from "@/lib/auth";

import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
	const { profile } = await requireCompletedProfile();

	return (
		<main className="mx-auto max-w-3xl px-4 py-6">
			<div className="mb-6">
				<p className="text-sm font-semibold text-slate-700">Settings</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight">Account and privacy</h1>
				<p className="mt-2 text-sm text-muted-foreground">Manage your visible student profile and future discovery preferences.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>These fields appear on your non-anonymous student profile.</CardDescription>
				</CardHeader>
				<CardContent>
					<SettingsForm
						profile={{
							displayName: profile.displayName,
							username: profile.username,
							bio: profile.bio,
							course: profile.course,
							branch: profile.branch,
							year: profile.year,
							interests: profile.interests,
						}}
					/>
				</CardContent>
			</Card>

			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Privacy</CardTitle>
						<CardDescription>Default privacy controls for the MVP.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>Anonymous posts hide your identity from students.</p>
						<p>Reports and moderation retain private accountability.</p>
						<p>DM and match mode controls are placeholders until those features launch.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Institution</CardTitle>
						<CardDescription>College changes require review.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>Change-institution requests will be reviewed by CampusLoop safety/admin.</p>
						<Button variant="outline" className="rounded-xl" disabled>
							Request institution change
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Future modes</CardTitle>
						<CardDescription>Match and chat are prepared, not enabled.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>Match mode: 18+ opt-in placeholder.</p>
						<p>Chat: mutual/accepted DMs placeholder.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Session</CardTitle>
						<CardDescription>Use StackAuth account controls.</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline" className="rounded-xl">
							<Link href="/handler/signout">Logout</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
