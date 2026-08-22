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
  ChevronDown,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
          "w-full min-h-[200px] sm:min-h-[240px] px-4 sm:px-5 pb-5 pt-3 text-sm leading-relaxed outline-none prose prose-sm dark:prose-invert max-w-none placeholder:text-muted-foreground/50",
      },
    },
    onUpdate: ({ editor }) => setCharCount(editor.getText().length),
  });

  async function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    if (isLoading || overLimit) return;

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
  const progressPercent = Math.min((charCount / MAX_CHARS) * 100, 100);

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-4 pb-20 sm:pb-0">
      {/* ─── Main Glass Composer Card ─── */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/[0.04]">
        {/* Header: Author + Scope Switcher */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border/30">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-10 shrink-0 border border-border/60 shadow-sm">
              <AvatarImage src={profile?.avatarUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {profile?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>{profile?.displayName || "Student"}</span>
                {(isAnonymous || isConfession) && (
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-extrabold text-amber-500">
                    ANON 🙈
                  </span>
                )}
              </p>
              <p className="text-[10px] font-semibold text-muted-foreground truncate">
                {profile?.institution?.slug ? `@${profile.institution.slug}` : "Campus Member"}
              </p>
            </div>
          </div>

          {/* Scope Segmented Selector */}
          <div className="flex shrink-0 rounded-2xl bg-muted/60 p-1 text-[10px] font-bold border border-border/40 shadow-xs">
            <button
              type="button"
              onClick={() => setScope("CAMPUS")}
              className={cn(
                "flex items-center gap-1 rounded-xl px-2.5 py-1 transition-all cursor-pointer select-none",
                scope === "CAMPUS" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <School className="size-3" /> Campus
            </button>
            <button
              type="button"
              onClick={() => setScope("GLOBAL")}
              className={cn(
                "flex items-center gap-1 rounded-xl px-2.5 py-1 transition-all cursor-pointer select-none",
                scope === "GLOBAL" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="size-3" /> Global
            </button>
          </div>
        </div>

        {/* Post Type Tabs */}
        <div className="px-4 sm:px-5 pt-4">
          <PostTypeSelector
            value={postType}
            onChange={(type) => {
              setPostType(type);
              if (type === "CONFESSION") setIsAnonymous(true);
            }}
          />
        </div>

        {/* Publish Destination Sub-hub Selector */}
        <div className="px-4 sm:px-5 pt-3">
          <div className="relative flex items-center">
            <Users className="pointer-events-none absolute left-3.5 size-3.5 text-primary" />
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              aria-label="Publish destination"
              className="w-full cursor-pointer appearance-none rounded-2xl border border-border/60 bg-muted/30 py-2.5 pl-10 pr-9 text-xs font-semibold text-foreground outline-none transition-all hover:bg-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            >
              <option value="NONE">🎓 My Campus Feed (General)</option>
              {communities?.map((c) => (
                <option key={c.id} value={c.id}>
                  c/{c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-muted-foreground" />
          </div>
        </div>

        {/* Rich-Text Formatting Toolbar */}
        <div className="px-4 sm:px-5 pt-3">
          <PostComposerToolbar editor={editor} />
        </div>

        {/* Tiptap Editor Content */}
        <EditorContent editor={editor} />

        {/* Trending Tags Bar (Horizontal Scrollable on Mobile) */}
        <div className="flex items-center gap-2 border-t border-border/40 bg-muted/10 px-4 sm:px-5 py-3 overflow-x-auto no-scrollbar">
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground pr-1">
            <Hash className="size-3 text-primary" /> Trending:
          </span>
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertTag(tag)}
              className="rounded-xl border border-border/60 bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-95 cursor-pointer shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Poll Options Builder (If Poll selected) */}
        {postType === "POLL" && (
          <PollOptionsEditor
            options={pollOptions}
            onChange={handleOptionChange}
            onAdd={addPollOption}
            onRemove={removePollOption}
          />
        )}

        {/* Footer: Anonymity + Character Meter */}
        <div className="border-t border-border/40 px-4 sm:px-5 py-4 space-y-3">
          <AnonymityNotice
            enabled={isAnonymous}
            onToggle={setIsAnonymous}
            forcedByType={isConfession}
          />

          <div className="flex items-center justify-between pt-1">
            <div className="h-1.5 flex-1 max-w-[140px] bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  overLimit ? "bg-destructive" : progressPercent > 80 ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

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

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive shadow-sm"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Submit Button */}
      <div className="hidden sm:block">
        <motion.button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isLoading || overLimit}
          whileTap={{ scale: 0.98 }}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
      </div>

      {/* Mobile Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 block sm:hidden border-t border-border/50 bg-background/90 p-3 backdrop-blur-xl shadow-2xl">
        <motion.button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isLoading || overLimit}
          whileTap={{ scale: 0.97 }}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-xs font-bold text-white shadow-lg shadow-primary/25 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Sparkles className="size-4 animate-spin text-white" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <span>Publish Post (+5 LP)</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
