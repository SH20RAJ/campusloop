"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";
import {
AlignCenter,
AlignLeft,
AlignRight,
ImagePlus,
Loader2,
MapPin,
Music2,
Palette,
Send,
SlidersHorizontal,
Smile,
Trash2,
Type,
X
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
  { id: "midnight", class: "bg-gradient-to-tr from-neutral-950 to-neutral-900", label: "Midnight Onyx" },
  { id: "neon-cyan", class: "bg-gradient-to-tr from-cyan-500 to-blue-600", label: "Electric Ocean" },
  { id: "golden-hour", class: "bg-gradient-to-tr from-amber-300 via-orange-400 to-rose-500", label: "Golden Hour" },
  { id: "cyberpunk", class: "bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-500", label: "Cyberpunk Neon" },
  { id: "synthwave", class: "bg-gradient-to-tr from-rose-500 via-purple-700 to-indigo-900", label: "Retro Synthwave" },
  { id: "aurora", class: "bg-gradient-to-tr from-teal-400 via-emerald-600 to-indigo-950", label: "Northern Lights" },
  { id: "cherry-velvet", class: "bg-gradient-to-tr from-red-600 to-rose-950", label: "Cherry Velvet" },
  { id: "dark-carbon", class: "bg-gradient-to-tr from-zinc-900 via-black to-zinc-950", label: "Dark Carbon" },
];

const FONTS = [
  { id: "sans", class: "font-sans", name: "Modern Sans" },
  { id: "serif", class: "font-serif", name: "Editorial Serif" },
  { id: "mono", class: "font-mono", name: "Typewriter Mono" },
  { id: "impact", class: "font-black tracking-tight uppercase", name: "Headline Bold" },
  { id: "script", class: "font-medium italic tracking-wide", name: "Playful Script" },
];

const TEXT_SIZES = [
  { id: "sm", label: "S", class: "text-base sm:text-lg" },
  { id: "md", label: "M", class: "text-lg sm:text-xl" },
  { id: "lg", label: "L", class: "text-2xl sm:text-3xl font-extrabold" },
  { id: "xl", label: "XL", class: "text-3xl sm:text-4xl font-black" },
];

const HIGHLIGHT_STYLES = [
  { id: "none", label: "None", class: "" },
  { id: "glass", label: "Glass", class: "bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl" },
  { id: "solid-black", label: "Black", class: "bg-black text-white px-4 py-2.5 rounded-2xl shadow-xl" },
  { id: "solid-white", label: "White", class: "bg-white text-black px-4 py-2.5 rounded-2xl shadow-xl" },
];

const POPULAR_SONGS = [
  { title: "Dil Nu", artist: "AP Dhillon" },
  { title: "Husn", artist: "Anuv Jain" },
  { title: "Wonderwall", artist: "Oasis" },
  { title: "cold/mess", artist: "Prateek Kuhad" },
  { title: "Starboy", artist: "The Weeknd" },
  { title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars" },
  { title: "Midnight City", artist: "M83" },
];

const STICKER_CATEGORIES = [
  {
    name: "Campus & Vibe",
    items: ["🔥", "🎓", "☕", "💻", "📚", "🚀", "💯", "🍿", "🍕", "⚡", "🏎️", "🏆"],
  },
  {
    name: "Mood & Secrets",
    items: ["🤫", "👀", "💀", "😭", "❤️", "🌅", "🌙", "🌧️", "🎧", "🧠", "🎯", "🎉"],
  },
];

const ALIGNMENTS = ["center", "left", "right"] as const;
type Alignment = (typeof ALIGNMENTS)[number];

const MAX_CHARS = 160;

export function StoryCreator({ profile }: StoryCreatorProps) {
  const router = useRouter();

  const [storyText, setStoryText] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [gradIndex, setGradIndex] = useState(0);
  const [fontIndex, setFontIndex] = useState(0);
  const [textSizeIndex, setTextSizeIndex] = useState(1); // default M
  const [highlightStyleIndex, setHighlightStyleIndex] = useState(0); // default none
  const [textAlign, setTextAlign] = useState<Alignment>("center");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // Extra rich stickers
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [customLocationInput, setCustomLocationInput] = useState("");
  const [selectedSong, setSelectedSong] = useState<{ title: string; artist: string } | null>(null);
  const [customSongInput, setCustomSongInput] = useState("");

  const [activeTray, setActiveTray] = useState<"none" | "stickers" | "palette" | "music" | "location" | "text_format">("none");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedGrad = GRADIENTS[gradIndex];
  const selectedFont = FONTS[fontIndex];
  const selectedTextSize = TEXT_SIZES[textSizeIndex];
  const selectedHighlight = HIGHLIGHT_STYLES[highlightStyleIndex];

  const collegeShortName = profile.institution?.name ? profile.institution.name.split(",")[0].trim() : "Campus";
  const defaultLocations = [
    collegeShortName,
    "Central Library",
    "Inner Circle",
    "Main Building Lawn",
    "Hostel Lounge",
    "Sharma Ji Canteen",
    "CAT Lab",
  ];

  // Lock body scroll while the fullscreen editor is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function cycleAlignment() {
    sounds.tap();
    haptics.light();
    setTextAlign((prev) => ALIGNMENTS[(ALIGNMENTS.indexOf(prev) + 1) % ALIGNMENTS.length]);
  }

  function cycleFont() {
    sounds.tap();
    haptics.light();
    setFontIndex((prev) => (prev + 1) % FONTS.length);
  }

  function cycleGradient() {
    sounds.pop();
    haptics.light();
    setGradIndex((prev) => (prev + 1) % GRADIENTS.length);
  }

  function toggleSticker(sticker: string) {
    sounds.pop();
    haptics.light();
    setSelectedStickers((prev) => {
      if (prev.includes(sticker)) return prev.filter((s) => s !== sticker);
      if (prev.length >= 4) {
        toast.warning("Max 4 stickers — keep it aesthetic");
        return prev;
      }
      return [...prev, sticker];
    });
  }

  function handleSelectSong(song: { title: string; artist: string }) {
    sounds.ting();
    haptics.success();
    setSelectedSong(song);
    setActiveTray("none");
    toast.success(`Attached "${song.title}" vibe! 🎵`);
  }

  function handleSelectLocation(loc: string) {
    sounds.ting();
    haptics.success();
    setSelectedLocation(loc);
    setActiveTray("none");
    toast.success(`Tagged ${loc}! 📍`);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.pop();
    haptics.light();
    setIsUploadingImage(true);
    try {
      toast.loading("Uploading your photo...", { id: "story-img" });
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
    if (!storyText.trim() && !mediaUrl && selectedStickers.length === 0 && !selectedSong && !selectedLocation) {
      toast.warning("Add some text, a song, or a photo first!");
      return;
    }
    if (isPosting) return;

    sounds.send();
    haptics.success();
    setIsPosting(true);

    // Assemble rich text elements
    const parts: string[] = [];
    if (selectedLocation) parts.push(`📍 ${selectedLocation}`);
    if (selectedSong) parts.push(`🎵 ${selectedSong.title} — ${selectedSong.artist}`);
    if (selectedStickers.length > 0) parts.push(selectedStickers.join(" "));
    if (storyText.trim()) parts.push(storyText.trim());

    const fullText = parts.join("\n\n");

    const storyPayload = {
      text: fullText || null,
      mediaUrl: mediaUrl || null,
      backgroundColor: `${selectedGrad.class} ${selectedFont.class} text-${textAlign}`,
    };

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyPayload),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData?.error || "Failed to post story");
      }

      toast.success("Campus vibe shared! Visible for 24 hours ⏳");
      mutate("/api/stories");
      router.push("/app");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post story");
      setIsPosting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none touch-manipulation">
      {/* 9:16 Responsive Story Canvas */}
      <div
        className={cn(
          "relative w-full h-full md:h-[680px] md:w-[390px] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-colors duration-300",
          mediaUrl ? "bg-black" : selectedGrad.class
        )}
      >
        {/* Background Image Preview */}
        {mediaUrl && (
          <>
            <img
              src={mediaUrl}
              alt="Story Background"
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0 pointer-events-none" />
          </>
        )}

        {/* ─── Top Control Toolbar ─── */}
        <div className="relative z-20 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between gap-2">
          {/* Close / Discard Button */}
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              router.back();
            }}
            className="size-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90"
            aria-label="Close story creator"
          >
            <X className="size-4.5" />
          </button>

          {/* Quick Editing Actions Strip */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
            {/* Font Toggle */}
            <button
              type="button"
              onClick={cycleFont}
              className="size-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer active:scale-90"
              title={`Font: ${selectedFont.name}`}
            >
              <Type className="size-4" />
            </button>

            {/* Alignment Toggle */}
            <button
              type="button"
              onClick={cycleAlignment}
              className="size-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer active:scale-90"
              title="Text Alignment"
            >
              {textAlign === "center" ? (
                <AlignCenter className="size-4" />
              ) : textAlign === "left" ? (
                <AlignLeft className="size-4" />
              ) : (
                <AlignRight className="size-4" />
              )}
            </button>

            {/* Text Format Tray Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveTray((prev) => (prev === "text_format" ? "none" : "text_format"));
              }}
              className={cn(
                "size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-90",
                activeTray === "text_format" ? "bg-white text-black" : "text-white hover:bg-white/20"
              )}
              title="Text Size & Highlights"
            >
              <SlidersHorizontal className="size-4" />
            </button>

            {/* Palette Toggle */}
            {!mediaUrl && (
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setActiveTray((prev) => (prev === "palette" ? "none" : "palette"));
                }}
                className={cn(
                  "size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-90",
                  activeTray === "palette" ? "bg-white text-black" : "text-white hover:bg-white/20"
                )}
                title="Color Themes"
              >
                <Palette className="size-4" />
              </button>
            )}

            {/* Stickers Tray */}
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveTray((prev) => (prev === "stickers" ? "none" : "stickers"));
              }}
              className={cn(
                "size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-90",
                activeTray === "stickers" ? "bg-white text-black" : "text-white hover:bg-white/20"
              )}
              title="Stickers"
            >
              <Smile className="size-4" />
            </button>

            {/* Music Vibe Tray */}
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveTray((prev) => (prev === "music" ? "none" : "music"));
              }}
              className={cn(
                "size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-90",
                selectedSong || activeTray === "music" ? "bg-emerald-500 text-white" : "text-white hover:bg-white/20"
              )}
              title="Add Music Vibe"
            >
              <Music2 className="size-4" />
            </button>

            {/* Location Tag Tray */}
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveTray((prev) => (prev === "location" ? "none" : "location"));
              }}
              className={cn(
                "size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-90",
                selectedLocation || activeTray === "location" ? "bg-sky-500 text-white" : "text-white hover:bg-white/20"
              )}
              title="Tag Campus Location"
            >
              <MapPin className="size-4" />
            </button>

            {/* Photo Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="size-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer active:scale-90 disabled:opacity-50"
              title="Add Photo"
            >
              {isUploadingImage ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* ─── Center Interactive Canvas ─── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto">
          {/* Attached Campus Location Tag Pill */}
          {selectedLocation && (
            <div className="mb-3 animate-in zoom-in-90 fade-in duration-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white border border-white/25 text-xs font-bold shadow-lg backdrop-blur-md">
                <MapPin className="size-3 text-rose-400" />
                <span>{selectedLocation}</span>
                <button
                  type="button"
                  onClick={() => setSelectedLocation(null)}
                  className="hover:text-rose-400 ml-0.5 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </span>
            </div>
          )}

          {/* Attached Music Vibe Sticker */}
          {selectedSong && (
            <div className="mb-3 animate-in zoom-in-90 fade-in duration-200">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 text-white border border-white/25 text-xs font-bold shadow-xl backdrop-blur-md">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-3 bg-emerald-400 animate-pulse" />
                  <span className="w-0.5 h-2 bg-emerald-400 animate-pulse delay-75" />
                  <span className="w-0.5 h-3.5 bg-emerald-400 animate-pulse delay-150" />
                </div>
                <span>{selectedSong.title} — {selectedSong.artist}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSong(null)}
                  className="hover:text-rose-400 ml-0.5 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          )}

          {/* Attached Stickers Row */}
          {selectedStickers.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              {selectedStickers.map((sticker) => (
                <button
                  key={sticker}
                  onClick={() => toggleSticker(sticker)}
                  className="text-3xl hover:scale-125 transition-transform active:scale-95 cursor-pointer filter drop-shadow-lg"
                  title="Click to remove sticker"
                >
                  {sticker}
                </button>
              ))}
            </div>
          )}

          {/* Primary Story Textarea */}
          <div className={cn("w-full flex justify-center", selectedHighlight.class)}>
            <textarea
              ref={textareaRef}
              value={storyText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setStoryText(e.target.value);
                }
              }}
              placeholder="Type your campus vibe..."
              maxLength={MAX_CHARS}
              rows={3}
              className={cn(
                "w-full bg-transparent text-white placeholder:text-white/60 focus:outline-none resize-none drop-shadow-2xl leading-relaxed transition-all",
                selectedFont.class,
                selectedTextSize.class,
                textAlign === "center" && "text-center",
                textAlign === "left" && "text-left",
                textAlign === "right" && "text-right"
              )}
            />
          </div>

          {/* Delete Photo Button if photo is loaded */}
          {mediaUrl && (
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setMediaUrl(null);
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white/80 hover:text-white border border-white/20 text-xs font-semibold backdrop-blur-md cursor-pointer transition-colors"
            >
              <Trash2 className="size-3" />
              <span>Remove Photo</span>
            </button>
          )}
        </div>

        {/* ─── Expandable Secondary Trays ─── */}

        {/* 1. Text Formatting Tray (Size & Highlights) */}
        {activeTray === "text_format" && (
          <div className="relative z-30 p-4 bg-black/90 backdrop-blur-xl border-t border-white/15 animate-in slide-in-from-bottom duration-200 space-y-3 text-white">
            <div className="flex items-center justify-between text-xs font-bold text-white/80">
              <span>Text Sizing</span>
              <span>Backdrop Highlight</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Text Size Pills */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                {TEXT_SIZES.map((size, idx) => (
                  <button
                    key={size.id}
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setTextSizeIndex(idx);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer",
                      textSizeIndex === idx ? "bg-white text-black shadow-xs" : "text-white/70 hover:text-white"
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>

              {/* Highlight Style Pills */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                {HIGHLIGHT_STYLES.map((hl, idx) => (
                  <button
                    key={hl.id}
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setHighlightStyleIndex(idx);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      highlightStyleIndex === idx ? "bg-white text-black shadow-xs" : "text-white/70 hover:text-white"
                    )}
                  >
                    {hl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Color Palette Tray */}
        {activeTray === "palette" && (
          <div className="relative z-30 p-4 bg-black/90 backdrop-blur-xl border-t border-white/15 animate-in slide-in-from-bottom duration-200 space-y-2">
            <p className="text-xs font-bold text-white/80">Canvas Gradient Themes</p>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
              {GRADIENTS.map((grad, idx) => (
                <button
                  key={grad.id}
                  onClick={() => {
                    sounds.pop();
                    haptics.light();
                    setGradIndex(idx);
                  }}
                  className={cn(
                    "size-10 rounded-full shrink-0 border-2 transition-transform active:scale-90 cursor-pointer",
                    grad.class,
                    gradIndex === idx ? "border-white scale-110 shadow-lg" : "border-transparent opacity-80"
                  )}
                  title={grad.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. Stickers Tray */}
        {activeTray === "stickers" && (
          <div className="relative z-30 p-4 bg-black/90 backdrop-blur-xl border-t border-white/15 animate-in slide-in-from-bottom duration-200 space-y-3 max-h-52 overflow-y-auto">
            {STICKER_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-1.5">
                <p className="text-[11px] font-bold text-white/60">{category.name}</p>
                <div className="grid grid-cols-6 gap-2">
                  {category.items.map((sticker) => {
                    const isSelected = selectedStickers.includes(sticker);
                    return (
                      <button
                        key={sticker}
                        onClick={() => toggleSticker(sticker)}
                        className={cn(
                          "h-10 rounded-xl flex items-center justify-center text-2xl transition-transform active:scale-90 cursor-pointer",
                          isSelected ? "bg-white/25 scale-110" : "hover:bg-white/10"
                        )}
                      >
                        {sticker}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Music Vibe Tray */}
        {activeTray === "music" && (
          <div className="relative z-30 p-4 bg-black/90 backdrop-blur-xl border-t border-white/15 animate-in slide-in-from-bottom duration-200 space-y-3 max-h-60 overflow-y-auto text-white">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Music2 className="size-3.5 text-emerald-400" />
                <span>Add Song Vibe</span>
              </p>
            </div>

            {/* Custom Song Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type custom song (e.g. Dil Nu — AP Dhillon)..."
                value={customSongInput}
                onChange={(e) => setCustomSongInput(e.target.value)}
                className="flex-1 h-9 rounded-xl bg-white/10 border border-white/20 px-3 text-xs text-white placeholder:text-white/50 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (customSongInput.trim()) {
                    handleSelectSong({ title: customSongInput.trim(), artist: "Vibe" });
                    setCustomSongInput("");
                  }
                }}
                disabled={!customSongInput.trim()}
                className="h-9 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Popular Campus Hits */}
            <div className="space-y-1 pt-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-white/50">Campus Favorites</p>
              <div className="space-y-1">
                {POPULAR_SONGS.map((song) => (
                  <button
                    key={song.title}
                    onClick={() => handleSelectSong(song)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="text-xs font-bold group-hover:text-emerald-400 transition-colors">{song.title}</p>
                      <p className="text-[10px] text-white/60">{song.artist}</p>
                    </div>
                    <Music2 className="size-3.5 text-white/40 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. Campus Location Tray */}
        {activeTray === "location" && (
          <div className="relative z-30 p-4 bg-black/90 backdrop-blur-xl border-t border-white/15 animate-in slide-in-from-bottom duration-200 space-y-3 max-h-60 overflow-y-auto text-white">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <MapPin className="size-3.5 text-rose-400" />
                <span>Tag Campus Venue</span>
              </p>
            </div>

            {/* Custom Location Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type location (e.g. Lab 4, Nescafe)..."
                value={customLocationInput}
                onChange={(e) => setCustomLocationInput(e.target.value)}
                className="flex-1 h-9 rounded-xl bg-white/10 border border-white/20 px-3 text-xs text-white placeholder:text-white/50 focus:outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (customLocationInput.trim()) {
                    handleSelectLocation(customLocationInput.trim());
                    setCustomLocationInput("");
                  }
                }}
                disabled={!customLocationInput.trim()}
                className="h-9 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Tag
              </button>
            </div>

            {/* Suggested Campus Spots */}
            <div className="space-y-1 pt-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-white/50">Campus Spots</p>
              <div className="flex flex-wrap gap-1.5">
                {defaultLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleSelectLocation(loc)}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors cursor-pointer"
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Bottom Share Bar ─── */}
        <div className="relative z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
          {/* User Preview */}
          <div className="flex items-center gap-2">
            <Avatar className="size-8 border border-white/30">
              <AvatarImage src={profile.avatarUrl || ""} />
              <AvatarFallback className="text-xs font-bold bg-white text-black">
                {profile.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="leading-none">
              <p className="text-xs font-bold text-white">{profile.displayName.split(" ")[0]}</p>
              <p className="text-[10px] text-white/70">Your Campus Story</p>
            </div>
          </div>

          {/* Share Vibe Action */}
          <button
            type="button"
            onClick={handleShare}
            disabled={isPosting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-black hover:bg-white/90 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-60"
          >
            {isPosting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <span>Share Vibe</span>
                <Send className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
