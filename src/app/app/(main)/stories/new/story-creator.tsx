"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Send, Sparkles, Layout, Type, AlignLeft, AlignCenter, AlignRight, Check, AlertCircle } from "lucide-react";

interface StoryCreatorProps {
  profile: any;
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
        alert("Maximum 3 stickers allowed! Keep it clean.");
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
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsPosting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] space-y-6 max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <button
          onClick={() => router.push("/app")}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </button>
        <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
          Vibe Creator
        </h2>
        <div className="w-16" /> {/* Spacer to center title */}
      </div>

      {/* Main Workspace Split Grid */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Left Side: Live Preview Canvas */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Live Canvas Preview
          </span>
          
          <div
            className={cn(
              "w-full max-w-[320px] aspect-[9/16] rounded-3xl p-6 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden transition-all duration-300 border border-white/10",
              selectedGrad.split(" ")[0]
            )}
          >
            {/* Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center gap-2.5 relative z-10">
              <Avatar className="h-8 w-8 border border-white/20">
                <AvatarImage src={profile.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-white text-primary font-bold">
                  {profile.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[11px] font-black leading-none truncate">{profile.displayName}</p>
                <p className="text-[9px] text-white/70">Just now</p>
              </div>
            </div>

            {/* Content text */}
            <div className={cn(
              "flex-1 flex flex-col items-center justify-center text-center px-2 py-4 relative z-10",
              selectedFont,
              textAlign === "left" ? "text-left items-start" : textAlign === "right" ? "text-right items-end" : "text-center items-center"
            )}>
              {selectedStickers.length > 0 && (
                <div className="flex gap-2 mb-4 animate-bounce text-2xl select-none">
                  {selectedStickers.map(s => <span key={s}>{s}</span>)}
                </div>
              )}
              <p className="text-xl font-extrabold tracking-tight leading-relaxed max-w-[240px] break-words whitespace-pre-wrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                {storyText || "What's the vibe today?"}
              </p>
            </div>

            {/* Footer Brand */}
            <div className="text-[9px] text-center text-white/40 tracking-widest font-black uppercase relative z-10 select-none">
              CAMPUSLOOP VIBE
            </div>
          </div>
        </div>

        {/* Right Side: Creator Controls & Inputs */}
        <form onSubmit={handlePostStory} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          {/* Story Text Box */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Type className="h-3.5 w-3.5" /> Story Text
            </label>
            <textarea
              maxLength={100}
              required
              rows={3}
              placeholder="Spill some tea, drop a vibe, or ask an anonymous question..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="flex min-h-[80px] w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-medium leading-relaxed"
            />
            <span className="text-[9px] text-muted-foreground block text-right font-bold">
              {storyText.length}/100 characters
            </span>
          </div>

          {/* Background Gradient Picker */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Layout className="h-3.5 w-3.5" /> Background Canvas
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
              {GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGrad(g.class)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 shadow-sm",
                    g.class.split(" ")[0],
                    selectedGrad === g.class ? "border-primary scale-110 ring-2 ring-primary/20" : "border-transparent"
                  )}
                  title={g.label}
                />
              ))}
            </div>
          </div>

          {/* Typography Customization */}
          <div className="grid grid-cols-2 gap-4">
            {/* Font Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Font Style</span>
              <div className="flex flex-col gap-1.5">
                {FONTS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFont(f.class)}
                    className={cn(
                      "text-left text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex justify-between items-center",
                      selectedFont === f.class ? "bg-primary/5 text-primary border-primary" : "bg-muted/10 border-border hover:bg-muted/20"
                    )}
                  >
                    <span>{f.name}</span>
                    {selectedFont === f.class && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Align Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Alignment</span>
              <div className="flex gap-1 bg-muted/20 p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setTextAlign("left")}
                  className={cn(
                    "flex-1 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors",
                    textAlign === "left" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign("center")}
                  className={cn(
                    "flex-1 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors",
                    textAlign === "center" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign("right")}
                  className={cn(
                    "flex-1 h-8 rounded-md flex items-center justify-center cursor-pointer transition-colors",
                    textAlign === "right" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <AlignRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stickers/Reaction Badges */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Add Vibe Badges (Max 3)
            </span>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map(sticker => {
                const isSelected = selectedStickers.includes(sticker);
                return (
                  <button
                    key={sticker}
                    type="button"
                    onClick={() => handleAddSticker(sticker)}
                    className={cn(
                      "text-sm h-8 px-2.5 rounded-lg border transition-all cursor-pointer active:scale-95",
                      isSelected ? "bg-primary/10 border-primary text-primary font-bold scale-105" : "bg-muted/10 border-border hover:bg-muted/20"
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
            className="w-full bg-gradient-to-r from-primary to-orange-500 text-white font-bold h-10.5 rounded-xl gap-1.5 shadow-md shadow-primary/10 text-xs cursor-pointer hover:opacity-95 transition-opacity"
          >
            {isPosting ? "Publishing Vibe..." : "Post Vibe to Campus"}
            <Send className="h-3.5 w-3.5 shrink-0" />
          </Button>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-2 text-xs text-destructive font-bold">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
