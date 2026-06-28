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
      router.refresh(); // Tell Next.js to revalidate server-side data if any
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
          className="rounded-3xl border border-white/10 bg-black/20 p-4 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <label htmlFor="type" className="text-sm font-medium">Post Type</label>
        <select 
          id="type" 
          name="type" 
          className="rounded-lg bg-black/40 px-3 py-1 text-sm outline-none border border-transparent focus:border-primary"
        >
          <option value="NORMAL">Normal</option>
          <option value="CONFESSION">Confession</option>
          <option value="POLL">Poll</option>
          <option value="QUESTION">Question</option>
        </select>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <label htmlFor="isAnonymous" className="text-sm font-medium">Post Anonymously</label>
        <input 
          id="isAnonymous" 
          name="isAnonymous" 
          type="checkbox" 
          className="h-5 w-5 rounded border-white/10 bg-black/40 text-primary focus:ring-primary"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
