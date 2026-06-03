import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireCompletedProfile } from "@/lib/auth";

export default async function SafetyPage() {
	await requireCompletedProfile();

	return <ProtectedPlaceholder title="Safety" description="Guidelines, reporting, and blocked users will land here." />;
}
