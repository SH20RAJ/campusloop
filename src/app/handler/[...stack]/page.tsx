import { StackHandler } from "@stackframe/stack";
import { Suspense } from "react";

export default function Handler(props: {
	params: Promise<{ stack: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	return (
		<Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>}>
			<StackHandler {...props} fullPage />
		</Suspense>
	);
}
