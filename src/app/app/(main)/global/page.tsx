import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireCompletedProfile } from "@/lib/auth";

export default async function GlobalPage() {
	await requireCompletedProfile();

	return <ProtectedPlaceholder title="Global mode" description="Cross-campus posts and filters will land here." />;
}
