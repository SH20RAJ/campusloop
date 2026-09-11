"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Bold,
  Check,
  Code,
  Edit3,
  Eye,
  FileText,
  Globe,
  HelpCircle,
  Italic,
  Link2,
  List,
  Lock,
  MessageSquare,
  Quote,
  RotateCcw,
  School,
  Sparkles,
  VenetianMask,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedIcon, AnimateShieldCheck } from "@/components/ui/animated-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/ui/rich-text";
import { MAX_POST_CHARS } from "@/constants/feed";
import type { Institution, Post, UserProfile } from "@/db/schema";
import { updatePost } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl, getCollegeShortName } from "@/lib/utils";

interface PostEditClientProps {
  post: Omit<Post, "createdAt" | "updatedAt"> & {
    createdAt: string | Date;
    updatedAt: string | Date;
    author?: UserProfile | null;
    institution?: Institution | null;
    community?: { id: string; name: string } | null;
  };
  currentUserId?: string;
}

export function PostEditClient({ post, currentUserId }: PostEditClientProps) {
  const router = useRouter();

  const [title, setTitle] = useState(post.title || "");
  const [body, setBody] = useState(post.body || "");
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">(post.scope as "CAMPUS" | "GLOBAL");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isDirty =
    body !== post.body || (title || "") !== (post.title || "") || scope !== post.scope;

  const charCount = body.length;
  const isOverLimit = charCount > MAX_POST_CHARS;
  const charRemaining = MAX_POST_CHARS - charCount;

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(220, textareaRef.current.scrollHeight)}px`;
    }
  }, [body, activeTab]);

  // Warn user on window beforeunload if dirty
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Insert markdown helper tokens
  function insertFormatting(prefix: string, suffix: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    const replacement = `${prefix}${selectedText || "text"}${suffix}`;

    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);
    sounds.tap();
    haptics.light();

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 50);
  }

  // Handle Save
  async function handleSave() {
    if (isSaving) return;
    if (!body.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }
    if (isOverLimit) {
      toast.error(`Post exceeds maximum length of ${MAX_POST_CHARS} characters`);
      return;
    }

    setIsSaving(true);
    sounds.tap();
    haptics.medium();

    const saveToastId = toast.loading("Saving changes...");

    try {
      await updatePost(post.id, {
        body: body.trim(),
        title: title.trim() || null,
        scope,
      });

      sounds.pop();
      haptics.success();
      toast.success("Post updated successfully!", { id: saveToastId });

      // Navigate back to post details with refresh
      router.push(`/app/post/${post.id}`);
      router.refresh();
    } catch (err) {
      console.error("Failed to update post:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update post", { id: saveToastId });
    } finally {
      setIsSaving(false);
    }
  }

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to save
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (isDirty && !isOverLimit) {
        handleSave();
      }
    }
  }

  const authorName = post.isAnonymous
    ? post.pseudonym || "Anonymous Student"
    : post.author?.displayName || "Student";
  const authorHandle = post.isAnonymous ? "anonymous" : post.author?.username || "campusloop";
  const collegeName = getCollegeShortName(post.institution);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Sticky Editor Header ─── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                setShowDiscardDialog(true);
              } else {
                router.back();
              }
            }}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-foreground tracking-tight">Edit Post</span>
              {post.isEdited && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">
                  Previously Edited
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Update your content, title, or visibility scope
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setTitle(post.title || "");
                setBody(post.body || "");
                setScope(post.scope as "CAMPUS" | "GLOBAL");
                sounds.tap();
                toast.info("Changes reset to original version");
              }}
              disabled={isSaving}
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty || !body.trim() || isOverLimit}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-2 text-xs rounded-full shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5">
                <span className="size-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <AnimatedIcon icon={Sparkles} animation="pop" size={14} />
                <span>Save Changes</span>
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* ─── Main Editor Container ─── */}
      <div className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Post Metadata Card */}
        <div className="p-3.5 rounded-2xl border border-border/50 bg-muted/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {post.isAnonymous ? (
              <div className="flex size-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25 shrink-0">
                <VenetianMask className="size-4" />
              </div>
            ) : (
              <Avatar className="size-9 border border-border/40 shrink-0">
                <AvatarImage src={getAvatarUrl(post.author?.avatarUrl, authorHandle)} />
                <AvatarFallback className="text-xs font-bold bg-muted">
                  {authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                  {authorName}
                </span>
                {collegeName && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                    {collegeName}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Originally published {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {post.type === "CONFESSION" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Lock className="size-3" />
                <span>Confession</span>
              </span>
            )}
            {post.type === "QUESTION" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1">
                <HelpCircle className="size-3" />
                <span>Question</span>
              </span>
            )}
            {post.type === "MEME" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Sparkles className="size-3" />
                <span>Meme</span>
              </span>
            )}
            {post.type === "NORMAL" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <MessageSquare className="size-3" />
                <span>Discussion</span>
              </span>
            )}
          </div>
        </div>

        {/* Title Input (Optional) */}
        <div className="space-y-1.5">
          <label htmlFor="post-title" className="text-xs font-semibold text-muted-foreground">
            Post Title <span className="text-[11px] opacity-70">(optional)</span>
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add an eye-catching title..."
            maxLength={120}
            className="w-full rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Tab Switcher: Write vs Live Preview */}
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/30">
            <button
              type="button"
              onClick={() => {
                setActiveTab("write");
                sounds.tap();
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "write"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Edit3 className="size-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("preview");
                sounds.tap();
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="size-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {/* Character Count Badge */}
          <div
            className={cn(
              "text-xs font-semibold flex items-center gap-1 transition-colors",
              isOverLimit
                ? "text-destructive font-black"
                : charRemaining < 150
                  ? "text-amber-500"
                  : "text-muted-foreground"
            )}
          >
            <span>{charCount.toLocaleString()}</span>
            <span className="opacity-50">/</span>
            <span>{MAX_POST_CHARS.toLocaleString()}</span>
          </div>
        </div>

        {/* Tab 1: Write Area */}
        {activeTab === "write" ? (
          <div className="space-y-2">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 flex-wrap p-1.5 rounded-xl border border-border/40 bg-muted/20 text-muted-foreground">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Bold (**text**)"
              >
                <Bold className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Italic (*text*)"
              >
                <Italic className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("`", "`")}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Code (`code`)"
              >
                <Code className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Quote (> quote)"
              >
                <Quote className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="List (- item)"
              >
                <List className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("[", "](https://)")}
                className="p-1.5 rounded-lg hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Link ([title](url))"
              >
                <Link2 className="size-3.5" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's happening on campus? Write your thoughts, questions, or updates..."
              className={cn(
                "w-full min-h-[240px] rounded-2xl border bg-muted/15 p-4 text-sm sm:text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none transition-all font-sans",
                isOverLimit
                  ? "border-destructive focus:border-destructive ring-1 ring-destructive"
                  : "border-border/60 focus:border-primary"
              )}
            />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Supports Markdown formatting, hashtags, and media links</span>
              <span className="hidden sm:inline-block opacity-75">Press Cmd+Enter to save</span>
            </div>
          </div>
        ) : (
          /* Tab 2: Live Preview */
          <div className="p-4 sm:p-5 rounded-2xl border border-border/50 bg-card min-h-[240px]">
            {title && (
              <h2 className="text-base sm:text-lg font-black text-foreground mb-3 leading-snug">
                {title}
              </h2>
            )}
            {body.trim() ? (
              <RichText content={body} collegeName={collegeName} />
            ) : (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No content to preview yet. Start typing in the Write tab!
              </div>
            )}
          </div>
        )}

        {/* ─── Scope / Audience Setting ─── */}
        <div className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-3">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Globe className="size-3.5 text-primary" />
            <span>Campus Visibility Scope</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setScope("CAMPUS");
                sounds.tap();
              }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                scope === "CAMPUS"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/40 hover:bg-muted/50 text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg shrink-0",
                  scope === "CAMPUS" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <School className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-foreground">My College Only</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  Visible to {collegeName || "your college"} students
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setScope("GLOBAL");
                sounds.tap();
              }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                scope === "GLOBAL"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/40 hover:bg-muted/50 text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg shrink-0",
                  scope === "GLOBAL" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Globe className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-foreground">All Colleges (Global)</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  Featured on the national campus feed
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Discard Confirmation Modal ─── */}
      <AnimatePresence>
        {showDiscardDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2.5 text-amber-500">
                <AlertCircle className="size-5" />
                <h3 className="font-bold text-sm text-foreground">Discard unsaved changes?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have unsaved edits on this post. Leaving now will discard your modifications.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiscardDialog(false)}
                  className="text-xs font-semibold"
                >
                  Keep Editing
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setShowDiscardDialog(false);
                    router.back();
                  }}
                  className="text-xs font-bold"
                >
                  Discard Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
