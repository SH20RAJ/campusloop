"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon } from "lucide-react";

export function PostComposer() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [postType, setPostType] = useState("NORMAL");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = formData.get("body") as string;
    const isAnonymous = formData.get("isAnonymous") === "on";

    // Validate poll options if type is POLL
    let options: string[] = [];
    if (postType === "POLL") {
      options = pollOptions.filter(opt => opt.trim().length > 0);
      if (options.length < 2) {
        setError("Polls must have at least 2 options");
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          type: postType,
          isAnonymous,
          scope: "CAMPUS",
          options: postType === "POLL" ? options : undefined,
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

  function handleOptionChange(index: number, value: string) {
    setPollOptions(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  function addPollOption() {
    if (pollOptions.length >= 6) return; // Limit to 6 options max
    setPollOptions(prev => [...prev, ""]);
  }

  function removePollOption(index: number) {
    if (pollOptions.length <= 2) return; // Require at least 2 options
    setPollOptions(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <textarea
          name="body"
          placeholder="What's happening on campus?"
          required
          rows={4}
          className="flex min-h-[120px] w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
        <label htmlFor="type" className="text-sm font-medium text-foreground">Post Type</label>
        <select 
          id="type" 
          name="type" 
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="rounded-md bg-background px-3 py-1 text-sm outline-none border border-input focus:border-ring"
        >
          <option value="NORMAL">Normal</option>
          <option value="CONFESSION">Confession</option>
          <option value="POLL">Poll</option>
          <option value="QUESTION">Question</option>
        </select>
      </div>

      {/* Dynamic Poll Options */}
      {postType === "POLL" && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Poll Options</h3>
            {pollOptions.length < 6 && (
              <button 
                type="button" 
                onClick={addPollOption}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
              >
                <PlusIcon className="h-3.5 w-3.5" /> Add Option
              </button>
            )}
          </div>

          <div className="space-y-2">
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  required={index < 2}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePollOption(index)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
