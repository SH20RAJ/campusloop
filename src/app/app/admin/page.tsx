import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireModeratorProfile } from "@/lib/auth";

export default async function AdminPage() {
	await requireModeratorProfile();

	return <ProtectedPlaceholder title="Admin moderation" description="Reports, audit logs, and moderation actions will land here." />;
}
