"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Check,
  ChevronDown,
  Flame,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Lock,
  School,
  Smile,
  Sparkles,
  Type,
  Users,
  VenetianMask,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { PollOptionsEditor } from "@/components/post/poll-options-editor";
import { PostComposerToolbar } from "@/components/post/post-composer-toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import {
  detectMentionTrigger,
  MentionSuggestions,
  type TriggerContext,
} from "@/components/ui/mention-autocomplete";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";
import { useCommunities } from "@/hooks/use-communities";
import type { FeedPost } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { confirmOptimisticPost, optimisticAddPost, revertOptimisticPost } from "@/lib/feed-mutations";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import type { TrendingHashtag } from "@/lib/trending-hashtags";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

export type PostType = "NORMAL" | "CONFESSION" | "POLL" | "QUESTION";

const MAX_CHARS = 2000;

const POST_TYPES: { id: PostType; label: string; icon: React.ElementType; accent: string }[] = [
  { id: "NORMAL", label: "Post", icon: Type, accent: "text-primary" },
  { id: "POLL", label: "Poll", icon: BarChart3, accent: "text-blue-500" },
  { id: "QUESTION", label: "Question", icon: HelpCircle, accent: "text-orange-500" },
  { id: "CONFESSION", label: "Confession", icon: Lock, accent: "text-pink-500" },
];

interface PostComposerProps {
  communityId?: string;
  /** "page" is the full /app/post/new screen; "modal" embeds it in a dialog. */
  variant?: "page" | "modal";
  /**
   * Preselects the composer type, so the "Confess" button on /app/confessions
   * lands on a confession rather than a blank post.
   */
  initialType?: PostType;
  /** Community name to lock the composer to, hiding the audience picker. */
  lockedCommunityName?: string;
  onPublished?: (post: FeedPost) => void;
  /**
   * Fired when the server settles the publish, so embedders can reconcile their
   * own list: the confirmed post on success, or null when it was reverted.
   */
  onPublishConfirmed?: (tempId: string, realPost: FeedPost | null) => void;
  onCancel?: () => void;
}

export function PostComposer({
  communityId: initialCommunityId,
  variant = "page",
  initialType,
  lockedCommunityName,
  onPublished,
  onPublishConfirmed,
  onCancel,
}: PostComposerProps) {
  const router = useRouter();
  const isModal = variant === "modal";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);

  const [postType, setPostType] = useState<PostType>(initialType ?? "NORMAL");
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("GLOBAL");
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(initialCommunityId || "NONE");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { communities } = useCommunities();
  const { profile } = useProfile();

  const { data: trendingHashtagsData } = useSWR<{ trending: TrendingHashtag[] }>(
    "/api/hashtags/trending?limit=14",
    fetcher,
    { dedupingInterval: 30000 }
  );
  const trendingTags = trendingHashtagsData?.trending || [];

  const firstName = profile?.displayName?.split(" ")[0];
  const [mentionTrigger, setMentionTrigger] = useState<TriggerContext | null>(null);

  async function handleUploadFiles(files: File[]) {
    const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validImageFiles.length === 0) return;

    setIsUploadingImage(true);
    try {
      toast.loading(
        validImageFiles.length > 1 ? `Uploading ${validImageFiles.length} photos...` : "Uploading photo...",
        { id: "img-upload" }
      );
      for (const file of validImageFiles) {
        const uploaded = await uploadImageToImgBB(file);
        setUploadedImages((prev) => [...prev, uploaded.displayUrl || uploaded.url]);
      }
      sounds.pop();
      haptics.success();
      toast.success(validImageFiles.length > 1 ? "Photos attached 📸" : "Photo attached 📸", {
        id: "img-upload",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image", {
        id: "img-upload",
      });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: cn(
          "w-full outline-none prose prose-lg dark:prose-invert max-w-none",
          "px-5 py-4 text-[17px] leading-relaxed",
          isModal ? "min-h-[120px]" : "min-h-[180px] sm:min-h-[220px]"
        ),
      },
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        // 1. Direct Files (e.g. Gboard sticker / mobile keyboard pasted photo)
        const files = Array.from(clipboardData.files || []);
        const directImageFiles = files.filter((f) => f.type.startsWith("image/"));
        if (directImageFiles.length > 0) {
          event.preventDefault();
          handleUploadFiles(directImageFiles);
          return true;
        }

        // 2. Clipboard Items
        const items = Array.from(clipboardData.items || []);
        const itemImageFiles = items
          .filter((item) => item.type.startsWith("image/"))
          .map((item) => item.getAsFile())
          .filter((f): f is File => f !== null);

        if (itemImageFiles.length > 0) {
          event.preventDefault();
          handleUploadFiles(itemImageFiles);
          return true;
        }

        // 3. HTML Content / Web Sticker / GIF
        const html = clipboardData.getData("text/html");
        if (html) {
          const match = html.match(/<img[^>]+src="([^">]+)"/i);
          if (match && match[1] && /^https?:\/\//i.test(match[1])) {
            const imgSrc = match[1];
            if (
              /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(imgSrc) ||
              imgSrc.includes("giphy.com") ||
              imgSrc.includes("tenor.com")
            ) {
              event.preventDefault();
              setUploadedImages((prev) => [...prev, imgSrc]);
              toast.success("Sticker / GIF attached! 📸");
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        if (imageFiles.length > 0) {
          event.preventDefault();
          handleUploadFiles(imageFiles);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      setCharCount(editor.getText().length);
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(0, from, "\n");
      setMentionTrigger(detectMentionTrigger(textBefore, textBefore.length));
    },
  });

  function handleSelectSuggestion(replacement: string, trigger: TriggerContext) {
    if (!editor) return;
    const { from } = editor.state.selection;
    const lengthToReplace = trigger.query.length + 1; // including @ or #
    const rangeStart = Math.max(0, from - lengthToReplace);
    editor.chain().focus().deleteRange({ from: rangeStart, to: from }).insertContent(replacement).run();
    setMentionTrigger(null);
  }

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    handleUploadFiles(files);
  }

  function handleRemoveImage(index: number) {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }

  const isConfession = postType === "CONFESSION";
  const anonActive = isAnonymous || isConfession;
  const overLimit = charCount > MAX_CHARS;
  const hasContent = charCount > 0 || uploadedImages.length > 0;
  const canPost = hasContent && !overLimit && !isLoading && !isUploadingImage;

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (isLoading || overLimit) return;

    setIsLoading(true);
    setError(null);

    let body = editor?.getText() || "";
    const anon = isAnonymous || postType === "CONFESSION";

    if (uploadedImages.length > 0) {
      const imageMarkdown = uploadedImages.map((img) => `\n\n![Image](${img})`).join("");
      body = `${body.trim()}${imageMarkdown}`;
    }

    if (!body.trim()) {
      setError("Post content cannot be empty.");
      setIsLoading(false);
      return;
    }

    let options: string[] = [];
    if (postType === "POLL") {
      options = pollOptions.filter((opt) => opt.trim().length > 0);
      if (options.length < 2) {
        setError("Polls must have at least 2 options.");
        setIsLoading(false);
        return;
      }
    }

    const tempId = `temp_${Date.now()}`;
    const optimisticPost: FeedPost = {
      id: tempId,
      authorId: profile?.id || "temp_author",
      institutionId: profile?.institutionId || "inst_global",
      body,
      type: postType,
      scope,
      isAnonymous: anon,
      pseudonym: anon ? profile?.anonymousUsername || "Anonymous Student" : null,
      title: null,
      status: "PUBLISHED",
      riskScore: 0,
      isEdited: false,
      repostOfId: null,
      repostComment: null,
      communityId: selectedCommunityId !== "NONE" ? selectedCommunityId : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      votesCount: 0,
      commentsCount: 0,
      userVote: 0,
      author: (anon ? null : profile) as unknown as FeedPost["author"],
      institution: (profile?.institution || {
        id: profile?.institutionId || "inst_global",
        name: "Campus",
      }) as unknown as FeedPost["institution"],
      pollOptions:
        postType === "POLL"
          ? options.map((text, i) => ({ id: `opt_${i}`, text, votesCount: 0, userVoted: false }))
          : undefined,
    };

    // Show it at the top of the feed straight away
    optimisticAddPost(optimisticPost);
    sounds.pop();
    haptics.success();

    const toastId = `publish_${tempId}`;
    toast.loading("Publishing your post...", { id: toastId });

    if (isModal) {
      onPublished?.(optimisticPost);
    } else {
      router.push("/app");
    }

    fetch("/api/posts", {
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
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData?.error || "Failed to publish post");
        }
        const serverPost = (await res.json()) as { id: string; createdAt?: string | Date };

        const confirmed = {
          ...optimisticPost,
          id: serverPost.id,
          createdAt: new Date(serverPost.createdAt || Date.now()),
        };
        confirmOptimisticPost(tempId, confirmed);
        onPublishConfirmed?.(tempId, confirmed);

        // Only now do we have a real id to link to.
        toast.success("Post published", {
          id: toastId,
          description: "+5 LP earned · it's live at the top of your feed",
          action: {
            label: "View post",
            onClick: () => router.push(`/app/post/${serverPost.id}`),
          },
        });
      })
      .catch((err) => {
        console.error("Post publishing error:", err);
        revertOptimisticPost(tempId);
        onPublishConfirmed?.(tempId, null);
        toast.error(err instanceof Error ? err.message : "Failed to publish post.", { id: toastId });
      })
      .finally(() => {
        setIsLoading(false);
      });
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

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function insertTag(tag: string) {
    editor?.commands.focus();
    editor?.commands.insertContent(`${tag} `);
  }

  function selectPostType(next: PostType) {
    haptics.light();
    setPostType((current) => {
      const resolved = current === next && next !== "NORMAL" ? "NORMAL" : next;
      if (resolved === "CONFESSION") setIsAnonymous(true);
      return resolved;
    });
  }

  // ── Circular character meter (Twitter-style ring) ──
  const ringRadius = 9;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = Math.min(charCount / MAX_CHARS, 1);
  const remaining = MAX_CHARS - charCount;

  const mediaActions = [
    {
      id: "photo",
      label: "Photo",
      icon: ImageIcon,
      color: "text-emerald-500 hover:bg-emerald-500/10",
      onClick: openFilePicker,
      disabled: isUploadingImage,
      loading: isUploadingImage,
    },
    {
      id: "gif",
      label: "GIF",
      icon: Sparkles,
      color: "text-primary hover:bg-primary/10",
      onClick: () => setShowGifPicker(true),
    },
    {
      id: "sticker",
      label: "Sticker",
      icon: Smile,
      color: "text-amber-500 hover:bg-amber-500/10",
      onClick: () => setShowStickerPicker(true),
    },
    {
      id: "format",
      label: "Formatting",
      icon: Type,
      color: cn("hover:bg-muted", showFormatting ? "text-foreground" : "text-muted-foreground"),
      onClick: () => setShowFormatting((s) => !s),
    },
    {
      id: "anon",
      label: anonActive ? "Anonymous on" : "Go anonymous",
      icon: VenetianMask,
      color: cn(
        "hover:bg-violet-500/10",
        anonActive ? "text-violet-500" : "text-muted-foreground hover:text-violet-500"
      ),
      onClick: () => {
        if (!isConfession) {
          haptics.light();
          setIsAnonymous((a) => !a);
        }
      },
      disabled: isConfession,
    },
  ];

  function handleContainerPaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData?.items || []);
    const imageFiles = items
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null);

    if (imageFiles.length > 0) {
      e.preventDefault();
      handleUploadFiles(imageFiles);
    }
  }

  return (
    <form onSubmit={handleSubmit} onPaste={handleContainerPaste} className="select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleImageFileChange}
      />

      <div
        className={cn(
          "flex flex-col bg-background",
          isModal ? "rounded-3xl overflow-hidden bg-card border border-border/50 shadow-2xl" : "min-h-screen"
        )}
      >
        {/* ─── Sticky top bar (Twitter / X minimalist style) ─── */}
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/30 bg-background/85 px-4 py-2.5 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : router.back())}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Cancel"
            title="Cancel"
          >
            {isModal ? <X className="size-4.5" /> : <ArrowLeft className="size-4.5" />}
          </button>

          <p className="flex-1 text-center text-sm font-black tracking-tight text-foreground truncate">
            {lockedCommunityName
              ? `Post to c/${lockedCommunityName}`
              : isConfession
                ? "Anonymous Confession"
                : postType === "POLL"
                  ? "Campus Poll"
                  : postType === "QUESTION"
                    ? "Ask Campus"
                    : "New Post"}
          </p>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary shadow-2xs">
              <Zap className="size-3" /> +5 LP
            </span>

            <button
              type="submit"
              disabled={!canPost}
              className={cn(
                "flex h-8.5 min-w-[70px] items-center justify-center gap-1.5 rounded-full px-4 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-xs",
                canPost
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              )}
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <span>{isConfession ? "Confess" : "Post"}</span>
              )}
            </button>
          </div>
        </div>

        {/* ─── Post type segmented chips ─── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-border/30 px-4 py-2.5">
          {POST_TYPES.map((t) => {
            const active = postType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectPostType(t.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black transition-all cursor-pointer active:scale-95",
                  active
                    ? "bg-foreground text-background shadow-2xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <t.icon className={cn("size-3.5", active ? "" : t.accent)} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ─── Identity + audience row (Twitter style) ─── */}
        <div className="flex items-start gap-3 px-4 pt-4">
          <Avatar
            className={cn(
              "size-11 shrink-0 border-2 transition-all",
              anonActive ? "border-violet-500/60 opacity-80 grayscale" : "border-border/50"
            )}
          >
            <AvatarImage src={anonActive ? "" : profile?.avatarUrl || ""} />
            <AvatarFallback className="text-xs font-bold">
              {anonActive ? "🎭" : profile?.displayName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-black text-foreground">
              {anonActive
                ? profile?.anonymousUsername
                  ? `@${profile.anonymousUsername}`
                  : "Anonymous Student"
                : profile?.displayName || "Student"}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {lockedCommunityName ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary">
                  <Users className="size-3" /> c/{lockedCommunityName}
                </span>
              ) : (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAudienceMenu((s) => !s)}
                      className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[11px] font-black text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                    >
                      {scope === "GLOBAL" ? <Globe className="size-3" /> : <School className="size-3" />}
                      {scope === "GLOBAL" ? "All Colleges" : "My College"}
                      <ChevronDown className="size-3 opacity-70" />
                    </button>

                    {showAudienceMenu && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowAudienceMenu(false)} />
                        <div className="absolute left-0 top-8 z-40 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                          {[
                            {
                              id: "GLOBAL" as const,
                              icon: Globe,
                              label: "All Colleges",
                              desc: "Every campus across India",
                            },
                            {
                              id: "CAMPUS" as const,
                              icon: School,
                              label: "My College",
                              desc: profile?.institution?.name?.split(",")[0] || "Only your campus",
                            },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setScope(opt.id);
                                setShowAudienceMenu(false);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted cursor-pointer"
                            >
                              <opt.icon className="size-4 shrink-0 text-muted-foreground" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-bold text-foreground">
                                  {opt.label}
                                </span>
                                <span className="block truncate text-[10px] text-muted-foreground">
                                  {opt.desc}
                                </span>
                              </span>
                              {scope === opt.id && <Check className="size-3.5 shrink-0 text-primary" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {communities && communities.length > 0 && (
                    <div className="relative flex items-center">
                      <Users className="pointer-events-none absolute left-2.5 size-3 text-muted-foreground" />
                      <select
                        value={selectedCommunityId}
                        onChange={(e) => setSelectedCommunityId(e.target.value)}
                        className="max-w-40 cursor-pointer appearance-none truncate rounded-full bg-muted/60 py-1 pl-7 pr-6 text-[11px] font-black text-foreground outline-none transition-colors hover:bg-muted"
                      >
                        <option value="NONE">Main Feed</option>
                        {communities.map((c) => (
                          <option key={c.id} value={c.id}>
                            c/{c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 size-3 text-muted-foreground" />
                    </div>
                  )}
                </>
              )}

              {anonActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-black text-violet-500">
                  <VenetianMask className="size-3" /> Anonymous
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Editor ─── */}
        <div className="relative flex-1">
          <MentionSuggestions
            trigger={mentionTrigger}
            onSelect={handleSelectSuggestion}
            onClose={() => setMentionTrigger(null)}
            className="top-12 left-5"
          />
          {charCount === 0 && (
            <span className="pointer-events-none absolute left-5 top-4 text-[17px] text-muted-foreground/45">
              {isConfession
                ? "Confess it. Nobody will ever know it's you... 🤫"
                : postType === "QUESTION"
                  ? "Ask your campus anything..."
                  : postType === "POLL"
                    ? "What should the campus vote on?"
                    : `What's on your mind${firstName ? `, ${firstName}` : ""}?`}
            </span>
          )}
          <EditorContent editor={editor} />
        </div>

        {/* ─── Media grid (Instagram style) ─── */}
        {uploadedImages.length > 0 && (
          <div
            className={cn(
              "gap-1.5 px-4 pb-3",
              uploadedImages.length === 1 ? "flex" : "grid grid-cols-3 sm:grid-cols-4"
            )}
          >
            {uploadedImages.map((imgUrl, i) => (
              <div
                key={`${imgUrl}-${i}`}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/60 bg-muted",
                  uploadedImages.length === 1 ? "max-h-[420px] w-full" : "aspect-square"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt="Attached" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition-colors hover:bg-destructive cursor-pointer"
                  aria-label="Remove image"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            {isUploadingImage && (
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {/* ─── Poll options ─── */}
        {postType === "POLL" && (
          <PollOptionsEditor
            options={pollOptions}
            onChange={handleOptionChange}
            onAdd={addPollOption}
            onRemove={removePollOption}
          />
        )}

        {/* ─── Optional rich-text toolbar ─── */}
        {showFormatting && (
          <div className="px-4 pb-2">
            <PostComposerToolbar
              editor={editor}
              onOpenGifPicker={() => setShowGifPicker(true)}
              onOpenStickerPicker={() => setShowStickerPicker(true)}
            />
          </div>
        )}

        {/* ─── Trending tags ─── */}
        {trendingTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-border/25 px-4 py-2.5">
            <span className="mr-0.5 flex shrink-0 items-center gap-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              <Flame className="size-3 text-primary" /> Trending
            </span>
            {trendingTags.map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => insertTag(item.tag)}
                title={`${item.category} (${item.formattedCount})`}
                className="inline-flex shrink-0 cursor-pointer select-none items-center gap-0.5 rounded-full border border-border/40 bg-muted/40 px-2.5 py-1 text-xs font-bold text-foreground transition-all hover:border-primary/50 hover:bg-muted active:scale-95"
              >
                <span className="font-black text-primary">#</span>
                <span>{item.tag.replace(/^#/, "")}</span>
              </button>
            ))}
          </div>
        )}

        {/* ─── Anonymity notice ─── */}
        {anonActive && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-2xl bg-violet-500/10 px-3 py-2 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
            <VenetianMask className="size-4 shrink-0" />
            {profile?.anonymousUsername ? (
              <span>
                Identity sealed — posting as{" "}
                <strong className="font-black">@{profile.anonymousUsername}</strong>.
              </span>
            ) : (
              <span>Identity sealed — posting with an anonymous handle.</span>
            )}
          </div>
        )}

        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-bold text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─── Sticky bottom action bar (Twitter style) ─── */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-1 border-t border-border/30 bg-background/90 px-3 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-1">
            {mediaActions.map((action) => (
              <button
                key={action.id}
                type="button"
                title={action.label}
                aria-label={action.label}
                disabled={action.disabled}
                onClick={action.onClick}
                className={cn(
                  "flex size-9 cursor-pointer items-center justify-center rounded-full transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-40",
                  action.color
                )}
              >
                {action.loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <action.icon className="size-5" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {charCount > 0 && (
              <div className="flex items-center gap-1.5">
                {remaining <= 200 && (
                  <span
                    className={cn(
                      "font-mono text-[11px] font-bold tabular-nums",
                      overLimit ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {remaining}
                  </span>
                )}
                <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
                  <circle
                    cx="12"
                    cy="12"
                    r={ringRadius}
                    fill="none"
                    strokeWidth="2.5"
                    className="stroke-muted"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r={ringRadius}
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringCircumference * (1 - ringProgress)}
                    className={cn(
                      "transition-all duration-200",
                      overLimit
                        ? "stroke-destructive"
                        : remaining <= 200
                          ? "stroke-amber-500"
                          : "stroke-primary"
                    )}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      <GifPickerModal
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={(url) => setUploadedImages((prev) => [...prev, url])}
      />

      <StickerPickerModal
        isOpen={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelectSticker={(sticker) => setUploadedImages((prev) => [...prev, sticker.url])}
      />
    </form>
  );
}
