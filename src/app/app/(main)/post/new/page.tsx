import { requireCompletedProfile } from "@/lib/auth";

import { PostComposer } from "./post-composer";

export default async function NewPostPage() {
	await requireCompletedProfile();

	return (
		<main className="mx-auto max-w-2xl px-4 py-6">
			<div className="mb-6">
				<p className="text-sm font-semibold text-emerald-700">Create</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight">Start a campus conversation</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Post normally, ask a question, run a poll, or confess anonymously with the safety system watching the edges.
				</p>
			</div>
			<PostComposer />
		</main>
	);
}
