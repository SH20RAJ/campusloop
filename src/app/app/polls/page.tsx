import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireCompletedProfile } from "@/lib/auth";

export default async function PollsPage() {
	await requireCompletedProfile();

	return <ProtectedPlaceholder title="Polls" description="Campus and global poll voting will land here." />;
}
