import { requireCurrentUser } from "@/lib/auth";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
	await requireCurrentUser();

	return children;
}
