"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Globe,
  AlertTriangle,
  ArrowRight,
  Users,
  ChevronDown,
  Image as ImageIcon,
  X,
  Loader2,
  Lock,
  BarChart3,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCommunities } from "@/hooks/use-communities";
import { useProfile } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PollOptionsEditor } from "@/components/post/poll-options-editor";
import { PostComposerToolbar } from "@/components/post/post-composer-toolbar";
import { uploadImageToImgBB } from "@/lib/upload";

export type PostType = "NORMAL" | "CONFESSION" | "POLL" | "QUESTION";

const POST_TYPES: { id: PostType; label: string; icon: typeof FileText; color: string }[] = [
  { id: "NORMAL", label: "Post", icon: FileText, color: "text-foreground" },
  { id: "CONFESSION", label: "Confession", icon: Lock, color: "text-pink-500" },
  { id: "POLL", label: "Poll", icon: BarChart3, color: "text-blue-500" },
  { id: "QUESTION", label: "Question", icon: HelpCircle, color: "text-orange-500" },
];

const TRENDING_TAGS = ["#LateNightTea", "#Confessions", "#CanteenGossip", "#ExamStress", "#LibraryVibes", "#HostelLife"];
const MAX_CHARS = 2000;

export function PostComposer({ communityId: initialCommunityId }: { communityId?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Composer State - Global by default
  const [postType, setPostType] = useState<PostType>("NORMAL");
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("GLOBAL");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(initialCommunityId || "NONE");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Image Upload State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { communities } = useCommunities();
  const { profile } = useProfile();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full min-h-[160px] sm:min-h-[190px] px-4 py-3 text-sm leading-relaxed outline-none prose prose-sm dark:prose-invert max-w-none placeholder:text-muted-foreground/40",
      },
    },
    onUpdate: ({ editor }) => setCharCount(editor.getText().length),
  });

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      toast.loading("Uploading photo...", { id: "img-upload" });
      const uploaded = await uploadImageToImgBB(file);
      setUploadedImages((prev) => [...prev, uploaded.displayUrl || uploaded.url]);
      toast.success("Photo attached! 📸", { id: "img-upload" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image", { id: "img-upload" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage(index: number) {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }

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

      toast.success("Post published! 🎉");
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
    <form onSubmit={handleSubmit} className="space-y-4 select-none">
      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* ─── Minimal Composer Shell ─── */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        {/* Top Minimal Bar: Profile + Scope Segment */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-8 shrink-0 border border-border/60">
              <AvatarImage src={profile?.avatarUrl || ""} />
              <AvatarFallback className="text-[10px] font-bold">
                {profile?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-foreground">
                {isAnonymous || isConfession ? "Anonymous Student" : profile?.displayName || "Student"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {profile?.institution?.name?.split(",")[0] || "Campus"}
              </p>
            </div>
          </div>

          {/* Scope Segment: Global by Default */}
          <div className="flex shrink-0 rounded-xl bg-muted/60 p-0.5 text-[10px] font-bold border border-border/50">
            <button
              type="button"
              onClick={() => setScope("GLOBAL")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                scope === "GLOBAL" ? "bg-background text-primary shadow-2xs font-black" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="size-3" /> Global
            </button>
            <button
              type="button"
              onClick={() => setScope("CAMPUS")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                scope === "CAMPUS" ? "bg-background text-primary shadow-2xs font-black" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <School className="size-3" /> My College
            </button>
          </div>
        </div>

        {/* Post Type Selector Pills */}
        <div className="flex items-center gap-1.5 px-4 pt-3 overflow-x-auto no-scrollbar">
          {POST_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = postType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setPostType(type.id);
                  if (type.id === "CONFESSION") setIsAnonymous(true);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shrink-0",
                  isSelected
                    ? "bg-primary/10 text-primary border-primary/30 shadow-2xs"
                    : "bg-muted/20 text-muted-foreground border-border/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("size-3.5", type.color)} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Hub Selector (Optional) */}
        {communities && communities.length > 0 && (
          <div className="px-4 pt-2.5">
            <div className="relative flex items-center">
              <Users className="pointer-events-none absolute left-3 size-3 text-muted-foreground" />
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border/60 bg-muted/20 py-2 pl-8 pr-8 text-xs font-semibold text-foreground outline-none hover:bg-muted/40 transition-colors"
              >
                <option value="NONE">General Campus Feed</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    c/{c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Formatting Toolbar */}
        <div className="px-4 pt-3 flex items-center justify-between gap-2">
          <PostComposerToolbar editor={editor} />

          <button
            type="button"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border/70 bg-muted/30 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            {isUploadingImage ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <ImageIcon className="size-3.5 text-rose-500" />
            )}
            <span>Photo</span>
          </button>
        </div>

        {/* Editor Body */}
        <EditorContent editor={editor} />

        {/* Image Attachments */}
        {uploadedImages.length > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {uploadedImages.map((imgUrl, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden border border-border size-20 shadow-xs">
                <img src={imgUrl} alt="Attached" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/75 text-white flex items-center justify-center cursor-pointer hover:bg-destructive"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Poll Options (If selected) */}
        {postType === "POLL" && (
          <div className="px-4 pb-3">
            <PollOptionsEditor
              options={pollOptions}
              onChange={handleOptionChange}
              onAdd={addPollOption}
              onRemove={removePollOption}
            />
          </div>
        )}

        {/* Hashtags Strip */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-border/40 bg-muted/10 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">Tags:</span>
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertTag(tag)}
              className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Anonymity Switch + Meter */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymous || isConfession}
              disabled={isConfession}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="size-4 rounded accent-primary cursor-pointer"
            />
            <span className="font-bold text-foreground">Post Anonymously</span>
          </label>

          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", overLimit ? "bg-destructive" : "bg-primary")}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className={cn("text-[10px] font-mono font-bold", overLimit ? "text-destructive" : "text-muted-foreground")}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-bold text-destructive flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || overLimit || isUploadingImage}
        className="w-full h-11 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Publishing...</span>
          </>
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
