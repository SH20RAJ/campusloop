"use client";

import { useActionState, useMemo, useState } from "react";

import type { InstitutionOption } from "@/lib/institutions";
import { usernameFromEmail } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { completeOnboarding, type OnboardingActionState } from "./actions";

type OnboardingFormProps = {
	institutions: InstitutionOption[];
	autoDetectedInstitution: InstitutionOption | null;
	email: string | null;
	emailDomain: string | null;
	displayName: string;
};

export function OnboardingForm({
	institutions,
	autoDetectedInstitution,
	email,
	emailDomain,
	displayName,
}: OnboardingFormProps) {
	const [state, action, isPending] = useActionState<OnboardingActionState, FormData>(completeOnboarding, {});
	const [query, setQuery] = useState(autoDetectedInstitution?.name ?? "");
	const [selectedInstitutionId, setSelectedInstitutionId] = useState(autoDetectedInstitution?.id ?? "");

	const filteredInstitutions = useMemo(() => {
		const normalized = query.trim().toLowerCase();

		if (!normalized) {
			return institutions.slice(0, 12);
		}

		return institutions
			.filter((institution) => {
				const haystack = [
					institution.name,
					institution.slug,
					institution.state,
					institution.district,
					institution.website,
					institution.websiteDomain,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return haystack.includes(normalized);
			})
			.slice(0, 12);
	}, [institutions, query]);

	const selectedInstitution = institutions.find((institution) => institution.id === selectedInstitutionId);

	return (
		<form action={action} className="space-y-6">
			<input type="hidden" name="institutionId" value={selectedInstitutionId} />
			<Card className="border-border/70 shadow-sm">
				<CardHeader>
					<CardTitle>Your student profile</CardTitle>
					<CardDescription>
						This is your visible campus identity. Anonymous posts still stay anonymous to other students.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-5">
					<div className="grid gap-2">
						<Label htmlFor="displayName">Display name</Label>
						<Input id="displayName" name="displayName" defaultValue={displayName} minLength={2} required />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							name="username"
							defaultValue={usernameFromEmail(email)}
							minLength={3}
							pattern="[a-z0-9_]+"
							required
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="border-border/70 shadow-sm">
				<CardHeader>
					<CardTitle>Choose your college</CardTitle>
					<CardDescription>
						{autoDetectedInstitution
							? `We found a possible match from ${emailDomain}. Confirm it or search manually.`
							: "We could not auto-detect your college. Search and select it manually."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="institutionSearch">Institution</Label>
						<Input
							id="institutionSearch"
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
								setSelectedInstitutionId("");
							}}
							placeholder="Search by college, district, state, slug, or website"
						/>
					</div>
					<div className="max-h-72 overflow-y-auto rounded-lg border bg-background">
						{filteredInstitutions.length ? (
							filteredInstitutions.map((institution) => (
								<button
									key={institution.id}
									type="button"
									onClick={() => {
										setSelectedInstitutionId(institution.id);
										setQuery(institution.name);
									}}
									className="flex w-full flex-col gap-1 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted"
									data-selected={selectedInstitutionId === institution.id}
								>
									<span className="font-medium">{institution.name}</span>
									<span className="text-xs text-muted-foreground">
										{[institution.district, institution.state, institution.websiteDomain].filter(Boolean).join(" · ")}
									</span>
								</button>
							))
						) : (
							<div className="px-4 py-8 text-sm text-muted-foreground">No institutions found. Try a broader search.</div>
						)}
					</div>
					{selectedInstitution ? (
						<div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
							Selected: <span className="font-semibold">{selectedInstitution.name}</span>
						</div>
					) : null}
				</CardContent>
			</Card>

			<Card className="border-border/70 shadow-sm">
				<CardHeader>
					<CardTitle>Campus context</CardTitle>
					<CardDescription>Help classmates understand where you fit in campus life.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-5 sm:grid-cols-2">
					<div className="grid gap-2">
						<Label htmlFor="course">Course</Label>
						<Input id="course" name="course" placeholder="B.Tech, BBA, MBBS" />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="branch">Branch</Label>
						<Input id="branch" name="branch" placeholder="CSE, Finance, Anatomy" />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="year">Year</Label>
						<Input id="year" name="year" inputMode="numeric" placeholder="1" />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="interests">Interests</Label>
						<Input id="interests" name="interests" placeholder="coding, football, startups" />
					</div>
					<div className="grid gap-2 sm:col-span-2">
						<Label htmlFor="bio">Bio</Label>
						<Textarea id="bio" name="bio" placeholder="A short intro for your non-anonymous profile." />
					</div>
				</CardContent>
			</Card>

			{state.error ? (
				<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{state.error}
				</div>
			) : null}

			<Button type="submit" className="h-12 w-full text-base" disabled={isPending}>
				{isPending ? "Joining campus..." : "Join my campus"}
			</Button>
		</form>
	);
}
