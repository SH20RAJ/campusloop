"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Globe,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Hash,
  Users,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { useCommunities } from "@/hooks/use-communities";
import { useProfile } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostTypeSelector, type PostType } from "@/components/post/post-type-selector";
import { PollOptionsEditor } from "@/components/post/poll-options-editor";
import { AnonymityNotice } from "@/components/post/anonymity-notice";
import { PostComposerToolbar } from "@/components/post/post-composer-toolbar";

const TRENDING_TAGS = ["#LateNightTea", "#Confessions", "#CanteenGossip", "#ExamStress", "#LibraryVibes", "#HostelLife"];
const MAX_CHARS = 2000;

export function PostComposer({ communityId: initialCommunityId }: { communityId?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Composer Form State
  const [postType, setPostType] = useState<PostType>("NORMAL");
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(initialCommunityId || "NONE");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const { communities } = useCommunities();
  const { profile } = useProfile();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full min-h-[220px] px-5 pb-5 pt-3 text-sm outline-none prose prose-sm dark:prose-invert max-w-none",
      },
    },
    onUpdate: ({ editor }) => setCharCount(editor.getText().length),
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

  function insertTag(tag: string) {
    editor?.commands.focus();
    editor?.commands.insertContent(`${tag} `);
  }

  const isConfession = postType === "CONFESSION";
  const overLimit = charCount > MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ─── Composer Card ─── */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl shadow-black/[0.03]">
        {/* Identity & Destination Row */}
        <div className="flex items-center gap-3 px-5 pt-5">
          <Avatar className="size-10 shrink-0 border border-border/60 shadow-sm">
            <AvatarImage src={profile?.avatarUrl || ""} />
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
              {profile?.displayName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">
              {profile?.displayName || "You"}
              {(isAnonymous || isConfession) && (
                <span className="ml-1.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-500">
                  ANON
                </span>
              )}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground">
              posting in{" "}
              {selectedCommunityId !== "NONE"
                ? `c/${communities?.find((c) => c.id === selectedCommunityId)?.name ?? "sub-hub"}`
                : "campus feed"}
            </p>
          </div>

          {/* Audience Scope Segmented */}
          <div className="flex shrink-0 rounded-xl bg-muted/40 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setScope("CAMPUS")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1 transition-all cursor-pointer",
                scope === "CAMPUS" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              )}
            >
              <School className="size-3" /> Campus
            </button>
            <button
              type="button"
              onClick={() => setScope("GLOBAL")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1 transition-all cursor-pointer",
                scope === "GLOBAL" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              )}
            >
              <Globe className="size-3" /> India
            </button>
          </div>
        </div>

        {/* Type Selector */}
        <div className="px-5 pt-4">
          <PostTypeSelector
            value={postType}
            onChange={(type) => {
              setPostType(type);
              if (type === "CONFESSION") setIsAnonymous(true);
            }}
          />
        </div>

        {/* Publish Destination */}
        <div className="px-5 pt-3">
          <div className="relative flex items-center">
            <Users className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              aria-label="Publish destination"
              className="w-full cursor-pointer appearance-none rounded-xl border border-border/50 bg-muted/20 py-2 pl-9 pr-8 text-xs font-semibold text-foreground outline-none transition-colors focus:border-primary/40"
            >
              <option value="NONE">🎓 My Campus Feed (General)</option>
              {communities?.map((c) => (
                <option key={c.id} value={c.id}>
                  c/{c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 text-muted-foreground">▾</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 pt-4">
          <PostComposerToolbar editor={editor} />
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />

        {/* Trending Hashtags */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 bg-muted/10 px-5 py-3">
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <Hash className="size-3" /> Trending
          </span>
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertTag(tag)}
              className="rounded-lg border border-border/50 bg-card px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary active:scale-95 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Poll Options */}
        {postType === "POLL" && (
          <PollOptionsEditor
            options={pollOptions}
            onChange={handleOptionChange}
            onAdd={addPollOption}
            onRemove={removePollOption}
          />
        )}

        {/* Footer: anonymity + counter */}
        <div className="border-t border-border/40 px-5 py-4 space-y-3">
          <AnonymityNotice
            enabled={isAnonymous}
            onToggle={setIsAnonymous}
            forcedByType={isConfession}
          />

          <div className="flex items-center justify-end">
            <span
              className={cn(
                "text-[10px] font-bold tabular-nums",
                overLimit ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Error Callout */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading || overLimit}
        whileTap={{ scale: 0.97 }}
        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <Sparkles className="size-4 animate-spin text-white" />
            <span>Publishing to Campus Loop...</span>
          </>
        ) : (
          <>
            <span>Publish Post (+5 LP)</span>
            <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
              <ArrowRight className="size-4" />
            </motion.div>
          </>
        )}
      </motion.button>
    </form>
  );
}
