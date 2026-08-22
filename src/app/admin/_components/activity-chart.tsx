"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export type ActivityDatum = {
	day: string;
	posts: number;
	comments: number;
	signups: number;
};

export function ActivityChart({ data }: { data: ActivityDatum[] }) {
	return (
		<div className="h-64 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
					<defs>
						<linearGradient id="gPosts" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
							<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
						</linearGradient>
						<linearGradient id="gComments" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
							<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
						</linearGradient>
						<linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
							<stop offset="95%" stopColor="#f97316" stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
					<XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
					<YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
					<Tooltip
						contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(128,128,128,.25)" }}
					/>
					<Legend wrapperStyle={{ fontSize: 11 }} />
					<Area type="monotone" dataKey="posts" stroke="#3b82f6" fill="url(#gPosts)" strokeWidth={2} />
					<Area type="monotone" dataKey="comments" stroke="#10b981" fill="url(#gComments)" strokeWidth={2} />
					<Area type="monotone" dataKey="signups" stroke="#f97316" fill="url(#gSignups)" strokeWidth={2} />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
