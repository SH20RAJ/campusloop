"use client";

import { PollOptionsEditor } from "@/components/post/poll-options-editor";
import { PostComposerToolbar } from "@/components/post/post-composer-toolbar";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";
import { useCommunities } from "@/hooks/use-communities";
import { useProfile } from "@/hooks/use-profile";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { EditorContent,useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
AlertTriangle,
BarChart3,
Check,
ChevronDown,
Globe,
HelpCircle,
Image as ImageIcon,
Loader2,
Lock,
School,
Users,
VenetianMask,
X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef,useState } from "react";
import { toast } from "sonner";

export type PostType = "NORMAL" | "CONFESSION" | "POLL" | "QUESTION";

const TRENDING_TAGS = ["#LateNightTea", "#Confessions", "#CanteenGossip", "#ExamStress", "#LibraryVibes", "#HostelLife"];
const MAX_CHARS = 2000;

export function PostComposer({ communityId: initialCommunityId }: { communityId?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const [postType, setPostType] = useState<PostType>("NORMAL");
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

  const firstName = profile?.displayName?.split(" ")[0];

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "w-full min-h-[140px] sm:min-h-[170px] px-4 py-3 text-base leading-relaxed outline-none prose prose-base dark:prose-invert max-w-none",
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

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  const isConfession = postType === "CONFESSION";
  const anonActive = isAnonymous || isConfession;
  const overLimit = charCount > MAX_CHARS;
  const progressPercent = Math.min((charCount / MAX_CHARS) * 100, 100);

  const addOns: {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
  }[] = [
    {
      id: "photo",
      label: "Attach photo",
      icon: ImageIcon,
      color: "text-emerald-500",
      active: uploadedImages.length > 0,
      onClick: openFilePicker,
      disabled: isUploadingImage,
    },
    {
      id: "gif",
      label: "Attach GIF",
      icon: () => (
        <span className="text-[10px] font-black text-primary border border-primary/30 bg-primary/10 rounded-md px-1 py-0.5 leading-none">
          GIF
        </span>
      ),
      color: "text-primary",
      onClick: () => setShowGifPicker(true),
    },
    {
      id: "poll",
      label: "Poll",
      icon: BarChart3,
      color: "text-blue-500",
      active: postType === "POLL",
      onClick: () => setPostType((t) => (t === "POLL" ? "NORMAL" : "POLL")),
    },
    {
      id: "question",
      label: "Question",
      icon: HelpCircle,
      color: "text-orange-500",
      active: postType === "QUESTION",
      onClick: () => setPostType((t) => (t === "QUESTION" ? "NORMAL" : "QUESTION")),
    },
    {
      id: "confession",
      label: "Confession",
      icon: Lock,
      color: "text-pink-500",
      active: isConfession,
      onClick: () => {
        setPostType((t) => (t === "CONFESSION" ? "NORMAL" : "CONFESSION"));
        setIsAnonymous(true);
      },
    },
    {
      id: "anon",
      label: "Anonymous",
      icon: VenetianMask,
      color: "text-violet-500",
      active: anonActive,
      onClick: () => {
        if (!isConfession) setIsAnonymous((a) => !a);
      },
      disabled: isConfession,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3 select-none">
      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* ─── Create Post Card (Facebook-style) ─── */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        {/* Identity row: avatar + name + audience pill */}
        <div className="flex items-start gap-3 px-4 pt-4">
          <Avatar
            className={cn(
              "size-10 shrink-0 border transition-all",
              anonActive ? "border-violet-500/60 opacity-80 grayscale" : "border-border/60"
            )}
          >
            <AvatarImage src={anonActive ? "" : profile?.avatarUrl || ""} />
            <AvatarFallback className="text-xs font-bold">
              {anonActive ? "🎭" : profile?.displayName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">
              {anonActive ? "Anonymous Student" : profile?.displayName || "Student"}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {/* Audience pill w/ dropdown (FB privacy-selector style) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAudienceMenu((s) => !s)}
                  className="flex items-center gap-1 rounded-lg bg-muted/70 px-2 py-1 text-[11px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  {scope === "GLOBAL" ? <Globe className="size-3" /> : <School className="size-3" />}
                  {scope === "GLOBAL" ? "All Colleges" : "My College"}
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>

                {showAudienceMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowAudienceMenu(false)} />
                    <div className="absolute left-0 top-8 z-40 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                      {(
                        [
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
                        ]
                      ).map((opt) => (
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
                            <span className="block truncate text-xs font-bold text-foreground">{opt.label}</span>
                            <span className="block truncate text-[10px] text-muted-foreground">{opt.desc}</span>
                          </span>
                          {scope === opt.id && <Check className="size-3.5 shrink-0 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Community pill */}
              {communities && communities.length > 0 && (
                <div className="relative flex items-center">
                  <Users className="pointer-events-none absolute left-2 size-3 text-muted-foreground" />
                  <select
                    value={selectedCommunityId}
                    onChange={(e) => setSelectedCommunityId(e.target.value)}
                    className="appearance-none rounded-lg bg-muted/70 py-1 pl-6.5 pr-6 text-[11px] font-bold text-foreground outline-none transition-colors hover:bg-muted cursor-pointer max-w-40 truncate"
                  >
                    <option value="NONE">Main Feed</option>
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        c/{c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 size-3 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Big borderless editor */}
        <div className="relative">
          {charCount === 0 && (
            <span className="pointer-events-none absolute left-4 top-3 text-base text-muted-foreground/50">
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

        {/* Image attachments — FB-style large grid */}
        {uploadedImages.length > 0 && (
          <div className={cn("gap-1.5 px-4 pb-3", uploadedImages.length === 1 ? "flex" : "grid grid-cols-2")}>
            {uploadedImages.map((imgUrl, i) => (
              <div
                key={i}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border",
                  uploadedImages.length === 1 ? "max-h-80 w-full" : "aspect-square"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt="Attached" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-destructive cursor-pointer"
                  aria-label="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Poll options */}
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

        {/* Formatting + trending tags strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-border/20 px-4 py-2">
          <PostComposerToolbar
            editor={editor}
            onOpenGifPicker={() => setShowGifPicker(true)}
            onOpenStickerPicker={() => setShowStickerPicker(true)}
          />
          <div className="flex items-center gap-1.5">
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertTag(tag)}
                className="shrink-0 text-[11px] font-semibold text-primary/80 transition-colors hover:text-primary cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* "Add to your post" row (FB-style) */}
        <div className="mx-4 mb-3 mt-1 flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2">
          <span className="hidden text-xs font-bold text-foreground sm:block">Add to your post</span>
          <div className="flex flex-1 items-center justify-around gap-1 sm:flex-none sm:justify-end sm:gap-0.5">
            {/* eslint-disable-next-line react-hooks/refs -- fileInputRef is only touched inside click handlers */}
            {addOns.map((addon) => (
              <button
                key={addon.id}
                type="button"
                disabled={addon.disabled}
                onClick={addon.onClick}
                title={addon.label}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-all cursor-pointer active:scale-90 disabled:cursor-not-allowed disabled:opacity-40",
                  addon.active ? "bg-muted ring-1 ring-border" : "hover:bg-muted/60"
                )}
              >
                {addon.id === "photo" && isUploadingImage ? (
                  <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                  <addon.icon className={cn("size-5", addon.color)} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Char meter (only when close to limit) */}
        {charCount > MAX_CHARS - 400 && (
          <div className="flex items-center justify-end gap-2 px-4 pb-2 text-xs">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", overLimit ? "bg-destructive" : "bg-primary")}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className={cn("font-mono text-[10px] font-bold", overLimit ? "text-destructive" : "text-muted-foreground")}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        )}

        {/* Anonymity hint */}
        {anonActive && (
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-2xl bg-violet-500/10 px-3 py-2 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
            <VenetianMask className="size-4 shrink-0" />
            Your identity is sealed — this will show as “Anonymous Student”.
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-border/20 p-3">
          <button
            type="submit"
            disabled={isLoading || overLimit || isUploadingImage || (charCount === 0 && uploadedImages.length === 0)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>{isConfession ? "Confess Anonymously" : "Post"} · +5 LP</span>
            )}
          </button>
        </div>
      </div>

      {/* GIF Picker Modal */}
      <GifPickerModal
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={(url) => setUploadedImages((prev) => [...prev, url])}
      />

      {/* Sticker Picker Modal */}
      <StickerPickerModal
        isOpen={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelectSticker={(sticker) => setUploadedImages((prev) => [...prev, sticker.url])}
      />

      {/* Error notice */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-bold text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
