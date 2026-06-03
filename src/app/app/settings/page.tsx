import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireCompletedProfile } from "@/lib/auth";

export default async function SettingsPage() {
	await requireCompletedProfile();

	return <ProtectedPlaceholder title="Settings" description="Profile, privacy, and future match/chat controls will land here." />;
}
