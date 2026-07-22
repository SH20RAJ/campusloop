"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Send, Sparkles, Layout, Type, AlignLeft, AlignCenter, AlignRight, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface StoryCreatorProps {
  profile: {
    displayName: string;
    avatarUrl: string | null;
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
  { id: "sans", class: "font-sans", name: "Modern Sans" },
  { id: "serif", class: "font-serif", name: "Elegant Serif" },
  { id: "mono", class: "font-mono", name: "Retro Code" },
];

const STICKERS = ["🔥", "👀", "🤫", "💯", "❤️", "🍿", "🎓", "🎉", "😭", "💀", "✨"];

export function StoryCreator({ profile }: StoryCreatorProps) {
  const router = useRouter();
  
  const [storyText, setStoryText] = useState("");
  const [selectedGrad, setSelectedGrad] = useState(GRADIENTS[0].class);
  const [selectedFont, setSelectedFont] = useState(FONTS[0].class);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddSticker(sticker: string) {
    if (selectedStickers.includes(sticker)) {
      setSelectedStickers(prev => prev.filter(s => s !== sticker));
    } else {
      if (selectedStickers.length < 3) {
        setSelectedStickers(prev => [...prev, sticker]);
      } else {
        toast.warning("Maximum 3 stickers allowed! Keep it clean.");
      }
    }
  }

  async function handlePostStory(e: React.FormEvent) {
    e.preventDefault();
    if (!storyText.trim() || isPosting) return;

    setIsPosting(true);
    setError(null);

    // Combine text and stickers for rich visual rendering
    const stickersStr = selectedStickers.join(" ");
    const fullText = stickersStr ? `${stickersStr}\n\n${storyText}` : storyText;

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: fullText,
          backgroundColor: `${selectedGrad} ${selectedFont} text-${textAlign}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to post story");
      }

      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsPosting(false);
    }
  }

  return (
    <div className="flex flex-col space-y-5 max-w-3xl mx-auto px-4 py-4 select-none pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <button
          onClick={() => router.push("/app")}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Feed
        </button>
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Vibe Story Creator
        </h2>
        <div className="w-12" />
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid gap-6 md:grid-cols-2 items-center">
        {/* Live Canvas Preview */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Live 9:16 Story Preview
          </span>
          
          <div
            className={cn(
              "w-full max-w-[260px] aspect-[9/16] rounded-2xl p-5 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden transition-all duration-300 border border-white/10",
              selectedGrad.split(" ")[0]
            )}
          >
            {/* Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center gap-2 relative z-10">
              <Avatar className="h-7 w-7 border border-white/20">
                <AvatarImage src={profile.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-white text-primary font-bold">
                  {profile.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold leading-none truncate">{profile.displayName}</p>
                <p className="text-[8.5px] text-white/70 mt-0.5">Just now</p>
              </div>
            </div>

            {/* Content text */}
            <div className={cn(
              "flex-1 flex flex-col items-center justify-center text-center px-1 py-3 relative z-10",
              selectedFont,
              textAlign === "left" ? "text-left items-start" : textAlign === "right" ? "text-right items-end" : "text-center items-center"
            )}>
              {selectedStickers.length > 0 && (
                <div className="flex gap-1.5 mb-3 text-xl select-none">
                  {selectedStickers.map(s => <span key={s}>{s}</span>)}
                </div>
              )}
              <p className="text-lg font-extrabold tracking-tight leading-relaxed max-w-[220px] break-words whitespace-pre-wrap drop-shadow-xs">
                {storyText || "What's the vibe today?"}
              </p>
            </div>

            {/* Footer Brand */}
            <div className="text-[8.5px] text-center text-white/50 tracking-widest font-bold uppercase relative z-10 select-none">
              CAMPUSLOOP VIBE
            </div>
          </div>
        </div>

        {/* Creator Controls & Inputs */}
        <form onSubmit={handlePostStory} className="rounded-2xl border border-border/60 bg-background p-5 shadow-xs space-y-4">
          {/* Story Text Box */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Type className="h-3.5 w-3.5" /> Story Text
            </label>
            <textarea
              maxLength={100}
              required
              rows={3}
              placeholder="Drop a vibe, canteen gossip, or campus update..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="flex min-h-[75px] w-full rounded-xl border border-border/60 bg-muted/20 p-3 text-xs placeholder:text-muted-foreground outline-none focus:border-primary resize-none font-medium leading-relaxed"
            />
            <span className="text-[9px] text-muted-foreground block text-right font-semibold">
              {storyText.length}/100 chars
            </span>
          </div>

          {/* Background Canvas Gradient Picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Layout className="h-3.5 w-3.5" /> Canvas Gradient
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGrad(g.class)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 shadow-xs",
                    g.class.split(" ")[0],
                    selectedGrad === g.class ? "border-primary scale-110" : "border-transparent opacity-80"
                  )}
                  title={g.label}
                />
              ))}
            </div>
          </div>

          {/* Typography & Alignment Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Font Style</span>
              <div className="flex flex-col gap-1">
                {FONTS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFont(f.class)}
                    className={cn(
                      "text-left text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex justify-between items-center",
                      selectedFont === f.class ? "bg-primary/10 text-primary border-primary" : "bg-muted/10 border-border/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{f.name}</span>
                    {selectedFont === f.class && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Alignment</span>
              <div className="flex gap-1 bg-muted/20 p-1 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setTextAlign("left")}
                  className={cn(
                    "flex-1 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors text-xs",
                    textAlign === "left" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground"
                  )}
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign("center")}
                  className={cn(
                    "flex-1 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors text-xs",
                    textAlign === "center" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground"
                  )}
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign("right")}
                  className={cn(
                    "flex-1 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors text-xs",
                    textAlign === "right" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground"
                  )}
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sticker Badges */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Vibe Badges (Max 3)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STICKERS.map(sticker => {
                const isSelected = selectedStickers.includes(sticker);
                return (
                  <button
                    key={sticker}
                    type="button"
                    onClick={() => handleAddSticker(sticker)}
                    className={cn(
                      "text-xs py-1 px-2 rounded-lg border transition-all cursor-pointer active:scale-95",
                      isSelected ? "bg-primary/10 border-primary text-primary font-bold" : "bg-muted/10 border-border/60 hover:bg-muted/20"
                    )}
                  >
                    {sticker}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Trigger */}
          <Button
            type="submit"
            disabled={isPosting || !storyText.trim()}
            className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-xl gap-1.5 text-xs cursor-pointer hover:opacity-95 transition-opacity shadow-xs"
          >
            {isPosting ? "Publishing Vibe..." : "Post Vibe to Campus"}
            <Send className="h-3.5 w-3.5 shrink-0" />
          </Button>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-2.5 flex items-center gap-2 text-xs text-destructive font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
