import { StackHandler } from "@stackframe/stack";

export default function Handler(props: {
	params: Promise<{ stack: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	return <StackHandler {...props} fullPage />;
}
