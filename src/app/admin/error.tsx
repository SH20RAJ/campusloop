"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function AdminError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("[admin] page error:", error);
	}, [error]);

	return (
		<div className="mx-auto max-w-lg mt-24 rounded-2xl border border-border bg-card p-10 text-center space-y-4 shadow-sm">
			<div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
				<TriangleAlert className="size-6" />
			</div>
			<h2 className="text-lg font-bold text-foreground">This section couldn&apos;t load</h2>
			<p className="text-xs text-muted-foreground leading-relaxed">
				A data source returned an unexpected response. Retrying usually fixes it — nothing was lost.
				{error.digest && <span className="block mt-1 opacity-60">ref: {error.digest}</span>}
			</p>
			<div className="flex items-center justify-center gap-2 pt-1">
				<button
					onClick={reset}
					className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
				>
					<RefreshCw className="h-3.5 w-3.5" /> Reload
				</button>
				<a
					href="/admin"
					className="rounded-lg border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
				>
					Go to Dashboard
				</a>
			</div>
		</div>
	);
}
