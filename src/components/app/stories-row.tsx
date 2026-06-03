const stories = ["Campus Buzz", "Freshers", "Hostel", "Events", "Placements", "Lost & Found"];

export function StoriesRow() {
	return (
		<div className="flex gap-3 overflow-x-auto pb-2">
			{stories.map((story, index) => (
				<div key={story} className="w-24 shrink-0">
					<div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/10">
						{index + 1}
					</div>
					<p className="mt-2 truncate text-center text-xs font-medium text-muted-foreground">{story}</p>
				</div>
			))}
		</div>
	);
}
