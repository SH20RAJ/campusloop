import { ProtectedPlaceholder } from "@/components/app/protected-placeholder";
import { requireCompletedProfile } from "@/lib/auth";

export default async function NewPostPage() {
	await requireCompletedProfile();

	return <ProtectedPlaceholder title="Create post" description="The post composer will land here in the create-post phase." />;
}
