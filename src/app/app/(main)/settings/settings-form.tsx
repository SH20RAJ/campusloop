"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { updateProfileSettings, type SettingsState } from "./actions";

type SettingsFormProps = {
	profile: {
		displayName: string;
		username: string;
		bio: string | null;
		course: string | null;
		branch: string | null;
		year: number | null;
		interests: string[];
	};
};

export function SettingsForm({ profile }: SettingsFormProps) {
	const [state, action, pending] = useActionState<SettingsState, FormData>(updateProfileSettings, {});

	return (
		<form action={action} className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="grid gap-2">
					<Label htmlFor="displayName">Display name</Label>
					<Input id="displayName" name="displayName" defaultValue={profile.displayName} required />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="username">Username</Label>
					<Input id="username" name="username" defaultValue={profile.username} pattern="[a-z0-9_]+" required />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="course">Course</Label>
					<Input id="course" name="course" defaultValue={profile.course ?? ""} />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="branch">Branch</Label>
					<Input id="branch" name="branch" defaultValue={profile.branch ?? ""} />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="year">Year</Label>
					<Input id="year" name="year" defaultValue={profile.year ?? ""} inputMode="numeric" />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="interests">Interests</Label>
					<Input id="interests" name="interests" defaultValue={profile.interests.join(", ")} />
				</div>
				<div className="grid gap-2 sm:col-span-2">
					<Label htmlFor="bio">Bio</Label>
					<Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} />
				</div>
			</div>

			{state.error ? <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</div> : null}
			{state.success ? <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{state.success}</div> : null}

			<Button disabled={pending} className="rounded-xl">
				{pending ? "Saving..." : "Save settings"}
			</Button>
		</form>
	);
}
