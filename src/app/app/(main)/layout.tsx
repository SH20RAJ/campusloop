import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { AppShell } from "@/components/app/app-shell";
import { requireCompletedProfile } from "@/lib/auth";

export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
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

	return (
		<AppShell
			profile={{
				displayName: profile.displayName,
				username: profile.username,
				role: profile.role,
			}}
			institution={institution ?? { name: "CampusLoop", state: null, district: null }}
		>
			{children}
		</AppShell>
	);
}
