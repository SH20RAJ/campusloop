import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireCompletedProfile } from "@/lib/auth";

export default async function ConfessionsPage() {
	await requireCompletedProfile();

	return <ProtectedPlaceholder title="Confessions" description="Anonymous campus and India confessions will land here." />;
}
