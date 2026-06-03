import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireCompletedProfile } from "@/lib/auth";

export default async function ProfilePage() {
	await requireCompletedProfile();

	return <ProtectedPlaceholder title="Profile" description="Your public student profile will land here." />;
}
