import { SignUp } from "@stackframe/stack";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function SignUpPage() {
	const user = await getCurrentUser();

	if (user) {
		redirect("/app");
	}

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%),linear-gradient(180deg,#ffffff,#f5f7fb)] px-4 py-10 text-foreground">
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
				<Link href="/" className="mb-8 text-sm font-semibold text-muted-foreground">
					CampusLoop
				</Link>
				<div className="rounded-2xl border bg-background/92 p-4 shadow-xl shadow-black/5 backdrop-blur">
					<SignUp automaticRedirect fullPage={false} />
				</div>
				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already verified?{" "}
					<Link href="/sign-in" className="font-semibold text-foreground underline-offset-4 hover:underline">
						Sign in
					</Link>
				</p>
			</div>
		</main>
	);
}
