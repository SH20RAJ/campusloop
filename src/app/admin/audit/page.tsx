import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";

import { resolveAdminSession } from "../_lib/guard";
import { getAuditPage } from "../_lib/queries";

export const metadata: Metadata = {
	title: "Audit Log | CampusLoop Admin",
};

interface PageProps {
	searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 50;

function actionTone(action: string) {
	if (action.includes("DELETE") || action.includes("BAN")) return "text-red-500 bg-red-500/10 border-red-500/20";
	if (action.includes("REVEAL")) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
	if (action.includes("PUBLISH") || action.includes("APPROVE")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
	return "text-muted-foreground bg-muted border-border";
}

export default async function AuditLogPage({ searchParams }: PageProps) {
	const { db } = await resolveAdminSession();
	const params = await searchParams;
	const page = Math.max(1, Number(params.page) || 1);

	const [{ rows, total }] = await Promise.all([getAuditPage(db, PAGE_SIZE, (page - 1) * PAGE_SIZE)]);
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<header>
				<h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
					<ScrollText className="h-6 w-6 text-blue-500" /> Moderation Audit Log
				</h2>
				<p className="text-muted-foreground text-sm">
					Immutable trail of every privileged action — including anonymous identity reveals ({total} total).
				</p>
			</header>

			<div className="rounded-xl border border-border bg-card overflow-hidden">
				<div className="w-full overflow-x-auto">
					<table className="w-full text-left text-sm text-muted-foreground">
						<thead className="bg-muted text-xs uppercase text-foreground">
							<tr>
								<th className="px-5 py-3">Action</th>
								<th className="px-5 py-3">Moderator</th>
								<th className="px-5 py-3">Target</th>
								<th className="px-5 py-3">When</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.id} className="border-b border-border hover:bg-muted/50">
									<td className="px-5 py-3">
										<span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${actionTone(row.action)}`}>
											{row.action.replaceAll("_", " ")}
										</span>
										{row.reason && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{row.reason}</p>}
									</td>
									<td className="px-5 py-3 text-xs text-foreground font-medium">
										{row.moderatorUsername ? `@${row.moderatorUsername}` : row.moderatorName || "—"}
									</td>
									<td className="px-5 py-3 text-xs">
										{row.targetType === "POST" ? (
											<Link href={`/app/post/${row.targetId}`} target="_blank" className="font-mono text-[10px] text-primary hover:underline">
												{row.targetId.slice(0, 13)}…
											</Link>
										) : (
											<span className="font-mono text-[10px]">{row.targetId.slice(0, 13)}…</span>
										)}
									</td>
									<td className="px-5 py-3 text-xs whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</td>
								</tr>
							))}
							{rows.length === 0 && (
								<tr>
									<td colSpan={4} className="px-5 py-10 text-center">No audit entries yet.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{totalPages > 1 && (
					<div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/40">
						<span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
						<div className="flex gap-2">
							<Link
								href={`/admin/audit?page=${page - 1}`}
								aria-disabled={page <= 1}
								className={`p-1.5 rounded border border-border ${page <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-muted"}`}
							>
								<ChevronLeft className="h-4 w-4" />
							</Link>
							<Link
								href={`/admin/audit?page=${page + 1}`}
								aria-disabled={page >= totalPages}
								className={`p-1.5 rounded border border-border ${page >= totalPages ? "opacity-40 pointer-events-none" : "hover:bg-muted"}`}
							>
								<ChevronRight className="h-4 w-4" />
							</Link>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
