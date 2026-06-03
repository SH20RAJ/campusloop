import { redirect } from "next/navigation";

import { getProfileByUserId, requireCurrentUser } from "@/lib/auth";
import { extractEmailDomain, findInstitutionByDomain, listInstitutionOptions } from "@/lib/institutions";

import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
	const user = await requireCurrentUser();
	const profile = await getProfileByUserId(user.id);

	if (profile?.onboardingCompleted) {
		redirect("/app/campus");
	}

	const emailDomain = extractEmailDomain(user.primaryEmail);
	const [institutions, autoDetectedInstitution] = await Promise.all([
		listInstitutionOptions(),
		emailDomain ? findInstitutionByDomain(emailDomain) : Promise.resolve(null),
	]);

	return (
		<main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc,#eef7f3)] px-4 py-8">
			<div className="mx-auto max-w-3xl">
				<div className="mb-8">
					<p className="text-sm font-semibold text-emerald-700">CampusLoop onboarding</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Join your real campus</h1>
					<p className="mt-3 max-w-2xl text-muted-foreground">
						Select your institution and create a campus profile. You can speak freely, but abuse remains accountable to
						the safety system.
					</p>
				</div>
				<OnboardingForm
					institutions={institutions}
					autoDetectedInstitution={autoDetectedInstitution}
					email={user.primaryEmail}
					emailDomain={emailDomain}
					displayName={user.displayName ?? user.primaryEmail?.split("@")[0] ?? "Student"}
				/>
			</div>
		</main>
	);
}
