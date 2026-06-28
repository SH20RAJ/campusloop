"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostComposer() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = formData.get("body") as string;
    const type = formData.get("type") as string;
    const isAnonymous = formData.get("isAnonymous") === "on";

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          type,
          isAnonymous,
          scope: "CAMPUS",
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to create post");
      }

      router.push("/app/campus");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <textarea
          name="body"
          placeholder="What's happening on campus?"
          required
          rows={5}
          className="flex min-h-[120px] w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
        <label htmlFor="type" className="text-sm font-medium text-foreground">Post Type</label>
        <select 
          id="type" 
          name="type" 
          className="rounded-md bg-background px-3 py-1 text-sm outline-none border border-input focus:border-ring"
        >
          <option value="NORMAL">Normal</option>
          <option value="CONFESSION">Confession</option>
          <option value="POLL">Poll</option>
          <option value="QUESTION">Question</option>
        </select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
        <label htmlFor="isAnonymous" className="text-sm font-medium text-foreground">Post Anonymously</label>
        <input 
          id="isAnonymous" 
          name="isAnonymous" 
          type="checkbox" 
          className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-lg bg-primary h-10 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
