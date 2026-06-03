import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireCompletedProfile } from "@/lib/auth";

export default async function CampusPage() {
	await requireCompletedProfile();

	return <ProtectedPlaceholder title="Campus feed" description="Your institution feed will land here in the feed phase." />;
}
