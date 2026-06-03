import { redirect } from "next/navigation";

import { getProfileByUserId, requireCurrentUser } from "@/lib/auth";

export default async function AppIndexPage() {
	const user = await requireCurrentUser();
	const profile = await getProfileByUserId(user.id);

	if (!profile?.onboardingCompleted) {
		redirect("/app/onboarding");
	}

	redirect("/app/campus");
}
