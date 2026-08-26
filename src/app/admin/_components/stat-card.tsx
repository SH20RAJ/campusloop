import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type StatCardProps = {
	label: string;
	value: number | string;
	icon: LucideIcon;
	accent?: "primary" | "blue" | "green" | "orange" | "red" | "violet";
	href?: string;
	hint?: string;
};

const accents: Record<NonNullable<StatCardProps["accent"]>, string> = {
	primary: "bg-primary/10 text-primary border-primary/10",
	blue: "bg-blue-500/10 text-blue-500 border-blue-500/10",
	green: "bg-emerald-500/10 text-emerald-500 border-emerald-500/10",
	orange: "bg-orange-500/10 text-orange-500 border-orange-500/10",
	red: "bg-red-500/10 text-red-500 border-red-500/10",
	violet: "bg-violet-500/10 text-violet-500 border-violet-500/10",
};

export function StatCard({ label, value, icon: Icon, accent = "primary", href, hint }: StatCardProps) {
	const body = (
		<div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md h-full">
			<div className="space-y-1 min-w-0">
				<span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
				<div className="text-2xl md:text-3xl font-extrabold text-foreground truncate">{value}</div>
				{hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
			</div>
			<div className={`rounded-lg p-3 border shrink-0 ${accents[accent]}`}>
				<Icon className="h-5 w-5" />
			</div>
		</div>
	);

	return href ? (
		<Link href={href} className="block">
			{body}
		</Link>
	) : (
		body
	);
}
