"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { createPost, type CreatePostState } from "./actions";

const postTypes = [
	{ value: "NORMAL", label: "Normal post" },
	{ value: "ANONYMOUS", label: "Anonymous post" },
	{ value: "CONFESSION", label: "Confession" },
	{ value: "POLL", label: "Poll" },
	{ value: "QUESTION", label: "Question" },
	{ value: "MEME", label: "Meme" },
	{ value: "EVENT", label: "Event" },
	{ value: "LOST_FOUND", label: "Lost & Found" },
];

const scopes = [
	{ value: "CAMPUS", label: "Campus" },
	{ value: "STATE", label: "State" },
	{ value: "INDIA", label: "India" },
	{ value: "GLOBAL", label: "Global" },
];

export function PostComposer() {
	const [state, action, isPending] = useActionState<CreatePostState, FormData>(createPost, {});
	const [type, setType] = useState("NORMAL");
	const [anonymous, setAnonymous] = useState(false);
	const [optionCount, setOptionCount] = useState(2);
	const forcesAnonymous = type === "CONFESSION" || type === "ANONYMOUS";

	return (
		<form action={action} className="space-y-5">
			<Card>
				<CardHeader>
					<CardTitle>Create a campus loop</CardTitle>
					<CardDescription>
						Confessions are anonymous to students, but CampusLoop can take action against abuse.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-5">
					<div className="grid gap-2">
						<Label>Post type</Label>
						<Select
							name="type"
							value={type}
							onValueChange={(value) => {
								setType(value);
								if (value === "CONFESSION" || value === "ANONYMOUS") {
									setAnonymous(true);
								}
							}}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{postTypes.map((postType) => (
									<SelectItem key={postType.value} value={postType.value}>
										{postType.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label>Scope</Label>
						<Select name="scope" defaultValue="CAMPUS">
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{scopes.map((scope) => (
									<SelectItem key={scope.value} value={scope.value}>
										{scope.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="title">Title</Label>
						<Input id="title" name="title" maxLength={120} placeholder="Optional, but useful for questions and events" />
					</div>

					<div className="grid gap-2">
						<Label htmlFor="body">Body</Label>
						<Textarea id="body" name="body" minLength={8} required placeholder="What should your campus know?" />
					</div>

					<div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
						<div>
							<Label htmlFor="anonymous">Post anonymously</Label>
							<p className="mt-1 text-xs text-muted-foreground">
								Your identity is hidden from students, but retained privately for safety.
							</p>
						</div>
						<Switch
							id="anonymous"
							name="isAnonymous"
							checked={forcesAnonymous || anonymous}
							disabled={forcesAnonymous}
							onCheckedChange={setAnonymous}
						/>
					</div>

					{type === "POLL" ? (
						<div className="grid gap-3 rounded-xl border bg-slate-50 p-4">
							<Label>Poll options</Label>
							{Array.from({ length: optionCount }).map((_, index) => (
								<Input key={index} name="pollOption" placeholder={`Option ${index + 1}`} required={index < 2} />
							))}
							<Button
								type="button"
								variant="outline"
								className="w-fit"
								disabled={optionCount >= 8}
								onClick={() => setOptionCount((count) => Math.min(8, count + 1))}
							>
								Add option
							</Button>
						</div>
					) : null}
				</CardContent>
			</Card>

			{state.error ? (
				<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{state.error}
				</div>
			) : null}

			<Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={isPending}>
				{isPending ? "Checking safety..." : "Publish"}
			</Button>
		</form>
	);
}
