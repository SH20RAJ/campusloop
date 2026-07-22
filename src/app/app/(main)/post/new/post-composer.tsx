"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  PlusIcon,
  Trash2Icon,
  Bold,
  Italic,
  List,
  Heading2,
  Sparkles,
  School,
  Globe,
  Users,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Lock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

export function PostComposer({ communityId: initialCommunityId }: { communityId?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Composer Form State
  const [postType, setPostType] = useState<"NORMAL" | "CONFESSION" | "POLL" | "QUESTION">("NORMAL");
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(initialCommunityId || "NONE");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Fetch communities list for sub-hub publishing
  const { data: communitiesData } = useSWR<Community[]>("/api/communities", fetcher);
  const communities = Array.isArray(communitiesData) ? communitiesData : [];

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full min-h-[160px] bg-muted/20 border border-border/60 rounded-2xl px-4 py-3.5 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none prose prose-sm dark:prose-invert max-w-none transition-colors",
      },
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const body = editor?.getText() || "";
    const anon = isAnonymous || postType === "CONFESSION";

    if (!body.trim()) {
      setError("Post content cannot be empty.");
      setIsLoading(false);
      return;
    }

    let options: string[] = [];
    if (postType === "POLL") {
      options = pollOptions.filter((opt) => opt.trim().length > 0);
      if (options.length < 2) {
        setError("Polls must have at least 2 voting options.");
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
          scope,
          isAnonymous: anon,
          options: postType === "POLL" ? options : undefined,
          communityId: selectedCommunityId !== "NONE" ? selectedCommunityId : undefined,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post.");
      }

      toast.success("Post published! Earned +5 Loop Points (LP) 🎉");
      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while publishing.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleOptionChange(index: number, value: string) {
    setPollOptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  function addPollOption() {
    if (pollOptions.length >= 6) return;
    setPollOptions((prev) => [...prev, ""]);
  }

  function removePollOption(index: number) {
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Interactive Post Type Selector Tabs */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Select Post Type
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "NORMAL", label: "Thought", icon: MessageSquare, desc: "Standard thread" },
            { id: "CONFESSION", label: "Confession", icon: Lock, desc: "100% Anonymous" },
            { id: "POLL", label: "Poll", icon: BarChart3, desc: "Campus vote" },
            { id: "QUESTION", label: "Question", icon: HelpCircle, desc: "Ask students" },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = postType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setPostType(t.id as typeof postType);
                  if (t.id === "CONFESSION") setIsAnonymous(true);
                }}
                className={cn(
                  "flex flex-col items-start p-3 rounded-2xl border transition-all text-left cursor-pointer",
                  isSelected
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "bg-card/60 border-border/60 hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Icon className="size-3.5 shrink-0" />
                  <span>{t.label}</span>
                </div>
                <span className="text-[9.5px] opacity-75 mt-0.5">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Destination (Campus vs Sub-Hub & Scope) */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Destination Sub-Hub */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Publish Destination
          </label>
          <select
            value={selectedCommunityId}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary/40 cursor-pointer"
          >
            <option value="NONE">🎓 My Campus Feed (General)</option>
            {communities?.map((c) => (
              <option key={c.id} value={c.id}>
                c/{c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Audience Scope */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Audience Scope
          </label>
          <div className="flex rounded-xl bg-muted/30 p-1 border border-border/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setScope("CAMPUS")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 rounded-lg transition-all cursor-pointer",
                scope === "CAMPUS" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground"
              )}
            >
              <School className="size-3.5" /> Campus Only
            </button>
            <button
              type="button"
              onClick={() => setScope("GLOBAL")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1 rounded-lg transition-all cursor-pointer",
                scope === "GLOBAL" ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground"
              )}
            >
              <Globe className="size-3.5" /> All India
            </button>
          </div>
        </div>
      </div>

      {/* 3. Text Editor Box with Formatting Toolbar */}
      <div className="space-y-2">
        {editor && (
          <div className="flex items-center gap-0.5 border border-border/60 border-b-0 rounded-t-xl bg-muted/25 px-3 py-2">
            <FormatButton icon={Bold} action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
            <FormatButton icon={Italic} action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
            <FormatButton icon={Heading2} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} />
            <div className="w-px h-3.5 bg-border/60 mx-1.5" />
            <FormatButton icon={List} action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* 4. Trending Hashtag Helper Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">
          Trending Topics:
        </span>
        {["#LateNightTea", "#Confessions", "#CanteenGossip", "#ExamStress", "#LibraryVibes", "#HostelLife"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => editor?.commands.focus() && editor.commands.insertContent(`${tag} `)}
            className="rounded-lg bg-muted/40 hover:bg-primary/10 border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-primary px-2.5 py-0.5 text-[10.5px] font-semibold transition-all active:scale-95 cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 5. Poll Options (Conditional) */}
      {postType === "POLL" && (
        <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BarChart3 className="size-3.5 text-primary" /> Voting Options
            </span>
            {pollOptions.length < 6 && (
              <button
                type="button"
                onClick={addPollOption}
                className="flex items-center gap-1 text-[10px] text-primary font-bold hover:underline cursor-pointer"
              >
                <PlusIcon className="size-3" /> Add Option
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
                  className="flex h-9 flex-1 rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium placeholder:text-muted-foreground outline-none focus:border-primary/40"
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePollOption(index)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Anonymous Post Toggle & Safety Warning */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">Post Anonymously 🙈</span>
          </div>
          <input
            id="isAnonymous"
            name="isAnonymous"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        {isAnonymous && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold space-y-1 animate-in fade-in">
            <p className="font-bold flex items-center gap-1">
              <AlertTriangle className="size-3.5 shrink-0" /> Anti-Doxxing & Moderation Notice
            </p>
            <p className="text-[10.5px] leading-relaxed text-amber-600/90 dark:text-amber-300/90 font-medium">
              Anonymous posts hide your student handle from public view. Sharing phone numbers, personal emails, or targeted harassment will result in an automated ban.
            </p>
          </div>
        )}
      </div>

      {/* Error Callout */}
      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive font-semibold">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-primary text-white h-11 text-xs font-extrabold shadow-md shadow-primary/20 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
      >
        {isLoading ? (
          <span>Publishing to Campus Loop...</span>
        ) : (
          <>
            <span>Publish Post (+5 LP)</span>
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}

function FormatButton({
  icon: Icon,
  action,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={action}
      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
        active ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      <Icon className="size-3.5" />
    </button>
  );
}
