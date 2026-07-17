"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon, Bold, Italic, List, Heading2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function PostComposer({ communityId }: { communityId?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [postType, setPostType] = useState("NORMAL");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "min-h-[140px] w-full rounded-b-lg border border-input bg-transparent px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring outline-none prose prose-sm dark:prose-invert max-w-none",
      },
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const body = editor?.getText() || "";
    const formData = new FormData(e.currentTarget);
    const isAnonymous = formData.get("isAnonymous") === "on";

    if (!body.trim()) {
      setError("Post body cannot be empty");
      setIsLoading(false);
      return;
    }

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
          communityId,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to create post");
      }

      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
      <div className="flex flex-col">
        {editor && (
          <div className="flex items-center gap-1 border border-input border-b-0 rounded-t-lg bg-muted/30 px-3 py-1.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                editor.isActive("bold") ? "bg-muted text-foreground" : ""
              }`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                editor.isActive("italic") ? "bg-muted text-foreground" : ""
              }`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                editor.isActive("heading", { level: 2 }) ? "bg-muted text-foreground" : ""
              }`}
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <div className="w-[1px] h-4 bg-border mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                editor.isActive("bulletList") ? "bg-muted text-foreground" : ""
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* Suggested Hashtags */}
      <div className="space-y-1.5 px-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Trending Hashtags</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            "#LateNightTea",
            "#Confessions",
            "#ExamStress",
            "#LibraryVibes",
            "#HostelLife",
            "#CampusMatches"
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (editor) {
                  editor.commands.focus();
                  editor.commands.insertContent(`${tag} `);
                }
              }}
              className="rounded-full bg-muted/65 hover:bg-primary/10 border border-border/80 hover:border-primary/20 text-muted-foreground hover:text-primary px-3 py-1 text-[10.5px] font-semibold transition-all active:scale-95 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
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
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
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
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
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
        className="flex w-full items-center justify-center rounded-lg bg-primary h-10 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
