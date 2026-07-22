"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, Trash2Icon, Bold, Italic, List, Heading2, Sparkles } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function PostComposer({ communityId }: { communityId?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [postType, setPostType] = useState("NORMAL");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "w-full min-h-[140px] bg-muted/20 border border-border/60 rounded-xl px-4 py-3 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none prose prose-sm dark:prose-invert max-w-none transition-colors",
      },
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const body = editor?.getText() || "";
    const formData = new FormData(e.currentTarget);
    const anon = formData.get("isAnonymous") === "on";

    if (!body.trim()) {
      setError("Post body cannot be empty");
      setIsLoading(false);
      return;
    }

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
        body: JSON.stringify({ body, type: postType, isAnonymous: anon, scope: "CAMPUS", options: postType === "POLL" ? options : undefined, communityId }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to create post");
      }

      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function handleOptionChange(index: number, value: string) {
    setPollOptions(prev => { const copy = [...prev]; copy[index] = value; return copy; });
  }

  function addPollOption() {
    if (pollOptions.length >= 6) return;
    setPollOptions(prev => [...prev, ""]);
  }

  function removePollOption(index: number) {
    if (pollOptions.length <= 2) return;
    setPollOptions(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        {editor && (
          <div className="flex items-center gap-0.5 border border-border/60 border-b-0 rounded-t-lg bg-muted/25 px-2.5 py-1.5">
            <FormatButton icon={Bold} action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
            <FormatButton icon={Italic} action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
            <FormatButton icon={Heading2} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} />
            <div className="w-px h-3.5 bg-border mx-1" />
            <FormatButton icon={List} action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Trending</span>
        {["#LateNightTea", "#Confessions", "#ExamStress", "#LibraryVibes", "#HostelLife", "#CampusMatches"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => editor?.commands.focus() && editor.commands.insertContent(`${tag} `)}
            className="rounded-full bg-muted/50 hover:bg-primary/10 border border-border/70 hover:border-primary/20 text-muted-foreground hover:text-primary px-2.5 py-0.5 text-[10.5px] font-semibold transition-all active:scale-95 cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <label htmlFor="type" className="text-xs font-semibold text-foreground">Type</label>
        </div>
        <select
          id="type"
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="rounded-lg bg-background border border-border/80 px-2.5 py-1 text-xs outline-none focus:border-primary/40 cursor-pointer"
        >
          <option value="NORMAL">Normal</option>
          <option value="CONFESSION">Confession</option>
          <option value="POLL">Poll</option>
          <option value="QUESTION">Question</option>
        </select>
      </div>

      {postType === "POLL" && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Poll Options</span>
            {pollOptions.length < 6 && (
              <button type="button" onClick={addPollOption} className="flex items-center gap-1 text-[10px] text-primary font-bold hover:underline cursor-pointer">
                <PlusIcon className="h-3 w-3" /> Add
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
                  className="flex h-8 flex-1 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
                />
                {pollOptions.length > 2 && (
                  <button type="button" onClick={() => removePollOption(index)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-4 py-2.5">
        <span className="text-xs font-semibold text-foreground">Post Anonymously</span>
        <input id="isAnonymous" name="isAnonymous" type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary cursor-pointer" />
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-primary text-white h-10 text-sm font-bold shadow-sm shadow-primary/10 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}

function FormatButton({ icon: Icon, action, active }: { icon: React.ComponentType<{ className?: string }>; action: () => void; active: boolean }) {
  return (
    <button
      type="button"
      onClick={action}
      className={`p-1.5 rounded-md transition-all cursor-pointer ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
