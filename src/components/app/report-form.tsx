import { Button } from "@/components/ui/button";

import { reportContentAction } from "@/app/app/(main)/safety/actions";

const reasons = [
	"Harassment or bullying",
	"Hate speech",
	"Doxxing/private info",
	"Threat or violence",
	"Sexual content",
	"Spam",
	"Impersonation",
	"Other",
];

export function ReportForm({
	targetType,
	targetId,
	label = "Report",
}: {
	targetType: "POST" | "COMMENT" | "USER";
	targetId: string;
	label?: string;
}) {
	return (
		<details className="group relative">
			<summary className="list-none">
				<Button type="button" size="sm" variant="ghost" className="h-8 rounded-full text-muted-foreground">
					{label}
				</Button>
			</summary>
			<form action={reportContentAction} className="absolute right-0 z-20 mt-2 w-72 rounded-xl border bg-white p-3 shadow-xl">
				<input type="hidden" name="targetType" value={targetType} />
				<input type="hidden" name="targetId" value={targetId} />
				<label className="grid gap-1 text-xs font-medium">
					Reason
					<select name="reason" className="h-9 rounded-md border bg-background px-2 text-sm">
						{reasons.map((reason) => (
							<option key={reason}>{reason}</option>
						))}
					</select>
				</label>
				<label className="mt-2 grid gap-1 text-xs font-medium">
					Details
					<textarea name="details" rows={3} className="rounded-md border bg-background p-2 text-sm" placeholder="Optional context" />
				</label>
				<Button className="mt-3 w-full rounded-lg">Submit report</Button>
			</form>
		</details>
	);
}
