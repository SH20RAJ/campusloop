"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";
import {
AlignCenter,
AlignLeft,
AlignRight,
ImagePlus,
Loader2,
Palette,
Send,
Smile,
Trash2,
Type,
X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect,useRef,useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface StoryCreatorProps {
  profile: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
    institution?: { name: string } | null;
  };
}


const GRADIENTS = [
  { id: "purple-indigo", class: "bg-gradient-to-tr from-violet-600 to-indigo-600", label: "Classic Indigo" },
  { id: "orange-rose", class: "bg-gradient-to-tr from-orange-500 to-rose-500", label: "Sunset Glow" },
  { id: "emerald-teal", class: "bg-gradient-to-tr from-emerald-500 to-teal-700", label: "Neon Emerald" },
  { id: "pink-purple", class: "bg-gradient-to-tr from-pink-500 to-purple-600", label: "Barbie Magic" },
  { id: "midnight", class: "bg-gradient-to-tr from-neutral-900 to-neutral-800", label: "Midnight Onyx" },
  { id: "neon-cyan", class: "bg-gradient-to-tr from-cyan-500 to-blue-600", label: "Electric Ocean" },
  { id: "sunset-yellow", class: "bg-gradient-to-tr from-amber-200 via-orange-400 to-rose-500 text-neutral-900", label: "Golden Hour" },
];

const FONTS = [
  { id: "sans", class: "font-sans", name: "Modern" },
  { id: "serif", class: "font-serif", name: "Elegant" },
  { id: "mono", class: "font-mono", name: "Typewriter" },
];

const ALIGNMENTS = ["center", "left", "right"] as const;
type Alignment = (typeof ALIGNMENTS)[number];

const STICKERS = ["🔥", "👀", "🤫", "💯", "❤️", "🍿", "🎓", "🎉", "😭", "💀", "🚀", "☕"];

const MAX_CHARS = 120;

export function StoryCreator({ profile }: StoryCreatorProps) {
  const router = useRouter();

  const [storyText, setStoryText] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [gradIndex, setGradIndex] = useState(0);
  const [fontIndex, setFontIndex] = useState(0);
  const [textAlign, setTextAlign] = useState<Alignment>("center");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [activeTray, setActiveTray] = useState<"none" | "stickers" | "palette">("none");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedGrad = GRADIENTS[gradIndex];
  const selectedFont = FONTS[fontIndex];

  // Lock body scroll while the fullscreen editor is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function cycleAlignment() {
    setTextAlign((prev) => ALIGNMENTS[(ALIGNMENTS.indexOf(prev) + 1) % ALIGNMENTS.length]);
  }

  function toggleSticker(sticker: string) {
    setSelectedStickers((prev) => {
      if (prev.includes(sticker)) return prev.filter((s) => s !== sticker);
      if (prev.length >= 3) {
        toast.warning("Max 3 stickers — keep it clean");
        return prev;
      }
      return [...prev, sticker];
    });
  }


  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      toast.loading("Adding your photo...", { id: "story-img" });
      const res = await uploadImageToImgBB(file);
      setMediaUrl(res.displayUrl || res.url);
      toast.success("Photo added 📸", { id: "story-img" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image", { id: "story-img" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleShare() {
    if (!storyText.trim() && !mediaUrl && selectedStickers.length === 0) {
      toast.warning("Add some text, a sticker, or a photo first!");
      return;
    }
    if (isPosting) return;

    setIsPosting(true);
    const stickersStr = selectedStickers.join(" ");
    const fullText = stickersStr
      ? storyText.trim()
        ? `${stickersStr}\n\n${storyText.trim()}`
        : stickersStr
      : storyText.trim();

    const storyPayload = {
      text: fullText || null,
      mediaUrl: mediaUrl || null,
      backgroundColor: `${selectedGrad.class} ${selectedFont.class} text-${textAlign}`,
    };

    // Optimistic Update: Immediately inject story into global SWR cache
    const optimisticStoryItem = {
      id: `temp-${Date.now()}`,
      mediaUrl: storyPayload.mediaUrl,
      text: storyPayload.text,
      backgroundColor: storyPayload.backgroundColor,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mutate(
      "/api/stories",
      (currentGroups: any[] = []) => {
        const existingIdx = currentGroups.findIndex((g) => g?.user?.id === profile.id);
        if (existingIdx >= 0) {
          const updated = [...currentGroups];
          updated[existingIdx] = {
            ...updated[existingIdx],
            stories: [optimisticStoryItem, ...(updated[existingIdx].stories || [])],
          };
          return updated;
        }
        return [
          {
            user: {
              id: profile.id,
              displayName: profile.displayName,
              username: profile.username,
              avatarUrl: profile.avatarUrl,
              institution: profile.institution,
            },
            stories: [optimisticStoryItem],
          },
          ...currentGroups,
        ];
      },
      false
    );

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyPayload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Failed to post story");
      }

      toast.success("Story shared! Live for 24h 🔥");
      mutate("/api/stories");
      router.push("/app");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      mutate("/api/stories");
      setIsPosting(false);
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black select-none h-screen h-[100dvh] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] touch-manipulation">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* ─── Canvas ─── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden py-2">
        <div
          className={cn(
            "relative flex h-full w-full flex-col overflow-hidden sm:aspect-[9/16] sm:h-[min(100%,44rem)] sm:w-auto sm:rounded-3xl",
            !mediaUrl && selectedGrad.class
          )}
          onClick={() => {
            setActiveTray("none");
            textareaRef.current?.focus();
          }}
        >
          {mediaUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl} alt="Story media" className="absolute inset-0 h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/70" />
            </>
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          )}

          {/* Top overlay bar */}
          <div className="relative z-10 flex items-center justify-between px-3 pt-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push("/app");
              }}
              className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 cursor-pointer"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFontIndex((i) => (i + 1) % FONTS.length);
                  toast.dismiss();
                  toast(`Font: ${FONTS[(fontIndex + 1) % FONTS.length].name}`, { duration: 900 });
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 cursor-pointer",
                  selectedFont.class
                )}
                aria-label="Change font"
                title={`Font: ${selectedFont.name}`}
              >
                <Type className="size-4.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cycleAlignment();
                }}
                className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 cursor-pointer"
                aria-label="Change alignment"
              >
                {textAlign === "left" ? (
                  <AlignLeft className="size-4.5" />
                ) : textAlign === "right" ? (
                  <AlignRight className="size-4.5" />
                ) : (
                  <AlignCenter className="size-4.5" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTray((t) => (t === "stickers" ? "none" : "stickers"));
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-colors cursor-pointer",
                  activeTray === "stickers" ? "bg-white text-black" : "bg-black/40 text-white hover:bg-black/60"
                )}
                aria-label="Stickers"
              >
                <Smile className="size-4.5" />
              </button>

              {!mediaUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTray((t) => (t === "palette" ? "none" : "palette"));
                  }}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-colors cursor-pointer",
                    activeTray === "palette" ? "bg-white text-black" : "bg-black/40 text-white hover:bg-black/60"
                  )}
                  aria-label="Background"
                >
                  <Palette className="size-4.5" />
                </button>
              )}

              <button
                type="button"
                disabled={isUploadingImage}
                onClick={(e) => {
                  e.stopPropagation();
                  if (mediaUrl) {
                    setMediaUrl(null);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 cursor-pointer disabled:opacity-60"
                aria-label={mediaUrl ? "Remove photo" : "Add photo"}
              >
                {isUploadingImage ? (
                  <Loader2 className="size-4.5 animate-spin" />
                ) : mediaUrl ? (
                  <Trash2 className="size-4.5" />
                ) : (
                  <ImagePlus className="size-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Author chip */}
          <div className="relative z-10 flex items-center gap-2 px-4 pt-3">
            <Avatar className="size-7 border border-white/40">
              <AvatarImage src={profile.avatarUrl || ""} />
              <AvatarFallback className="bg-white text-[10px] font-black text-primary">
                {profile.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[11px] font-bold leading-none text-white drop-shadow-md">{profile.displayName}</p>
              <p className="mt-0.5 text-[9px] text-white/80">Your story · 24h</p>
            </div>
          </div>

          {/* Editable text area — the canvas IS the editor */}
          <div
            className={cn(
              "relative z-10 flex flex-1 flex-col justify-center px-6",
              textAlign === "left" ? "items-start" : textAlign === "right" ? "items-end" : "items-center"
            )}
          >
            {selectedStickers.length > 0 && (
              <div className="mb-3 flex gap-2 text-4xl drop-shadow-lg">
                {selectedStickers.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSticker(s);
                    }}
                    className="cursor-pointer transition-transform hover:scale-110 active:scale-90"
                    title="Tap to remove"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={storyText}
              maxLength={MAX_CHARS}
              onChange={(e) => setStoryText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Tap to type..."
              rows={3}
              className={cn(
                "w-full resize-none bg-transparent text-2xl font-black leading-snug tracking-tight text-white caret-white outline-none placeholder:text-white/60 drop-shadow-lg",
                selectedFont.class,
                textAlign === "left" ? "text-left" : textAlign === "right" ? "text-right" : "text-center"
              )}
            />

            {storyText.length > MAX_CHARS - 30 && (
              <span className="mt-1 text-[10px] font-bold text-white/70">
                {storyText.length}/{MAX_CHARS}
              </span>
            )}
          </div>

          {/* Sticker tray */}
          {activeTray === "stickers" && (
            <div
              className="relative z-20 mx-3 mb-3 flex flex-wrap justify-center gap-2 rounded-2xl bg-black/50 p-3 backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {STICKERS.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => toggleSticker(sticker)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl text-2xl transition-all cursor-pointer active:scale-90",
                    selectedStickers.includes(sticker) ? "bg-white/25 ring-2 ring-white" : "hover:bg-white/10"
                  )}
                >
                  {sticker}
                </button>
              ))}
            </div>
          )}

          {/* Gradient palette tray */}
          {activeTray === "palette" && !mediaUrl && (
            <div
              className="relative z-20 mx-3 mb-3 flex items-center justify-center gap-2.5 rounded-2xl bg-black/50 p-3 backdrop-blur-xl overflow-x-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {GRADIENTS.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGradIndex(i)}
                  className={cn(
                    "size-9 shrink-0 rounded-full border-2 transition-all cursor-pointer active:scale-90",
                    g.class.split(" ")[0],
                    g.class.includes("from-") ? g.class : "",
                    gradIndex === i ? "scale-110 border-white" : "border-white/30 opacity-80 hover:opacity-100"
                  )}
                  title={g.label}
                />
              ))}
            </div>
          )}

          {/* Brand watermark */}
          <div className="relative z-10 pb-2 text-center text-[8.5px] font-black uppercase tracking-widest text-white/60">
            CampusLoop Vibe ⚡️
          </div>
        </div>
      </div>

      {/* ─── Bottom Share Bar ─── */}
      <div className="flex items-center justify-between gap-3 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-2">
        <div className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 backdrop-blur-md">
          <Avatar className="size-7 border border-white/30">
            <AvatarImage src={profile.avatarUrl || ""} />
            <AvatarFallback className="bg-white text-[10px] font-black text-primary">
              {profile.displayName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-bold text-white">Your story</span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          disabled={isPosting || isUploadingImage}
          className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-black shadow-lg transition-all hover:bg-white/90 active:scale-95 cursor-pointer disabled:opacity-60"
        >
          {isPosting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sharing...
            </>
          ) : (
            <>
              Share <Send className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
