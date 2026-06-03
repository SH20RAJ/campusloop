import Link from "next/link";

import { cn } from "@/lib/utils";

const tabs = [
	{ value: "latest", label: "Latest" },
	{ value: "trending", label: "Trending" },
	{ value: "confessions", label: "Confessions" },
	{ value: "polls", label: "Polls" },
	{ value: "questions", label: "Questions" },
] as const;

export function FeedTabs({ active, basePath }: { active: string; basePath: string }) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-1">
			{tabs.map((tab) => (
				<Link
					key={tab.value}
					href={`${basePath}?tab=${tab.value}`}
					className={cn(
						"rounded-full border bg-white px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:text-slate-950",
						active === tab.value && "border-slate-950 bg-slate-950 text-white hover:text-white",
					)}
				>
					{tab.label}
				</Link>
			))}
		</div>
	);
}
