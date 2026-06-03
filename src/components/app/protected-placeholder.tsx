import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProtectedPlaceholderProps = {
	title: string;
	description: string;
};

export function ProtectedPlaceholder({ title, description }: ProtectedPlaceholderProps) {
	return (
		<main className="min-h-screen bg-muted/30 px-4 py-10">
			<div className="mx-auto max-w-3xl">
				<Card>
					<CardHeader>
						<CardTitle>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-3">
						<Button asChild>
							<Link href="/app/campus">Campus</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/app/post/new">Create post</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
