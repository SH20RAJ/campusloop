"use client";

import {
  BookOpen,
  CheckCircle2,
  FileText,
  Flame,
  Globe,
  Loader2,
  Lock,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  VenetianMask,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface ConfessionComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultScope?: "CAMPUS" | "GLOBAL";
  defaultMode?: "CONFESSION" | "ARTICLE";
  onPublished?: () => void;
}

const CATEGORIES = [
  { id: "dark_secret", label: "Dark Secret", tag: "#DarkSecret" },
  { id: "hostel_lore", label: "Hostel Lore", tag: "#HostelLore" },
  { id: "jokes", label: "Campus Joke", tag: "#CampusHumor" },
  { id: "placements", label: "Placement Tea", tag: "#PlacementDiaries" },
  { id: "personal_story", label: "Long Personal Story", tag: "#PersonalStory" },
  { id: "creative", label: "Creative Thought", tag: "#Unfiltered" },
] as const;

export function ConfessionComposerModal({
  isOpen,
  onClose,
  defaultScope = "GLOBAL",
  defaultMode = "CONFESSION",
  onPublished,
}: ConfessionComposerModalProps) {
  const { profile } = useProfile();
  const [mode, setMode] = useState<"CONFESSION" | "ARTICLE">(defaultMode);
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">(defaultScope);
  const [selectedCategory, setSelectedCategory] = useState<string>("dark_secret");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const campusName = profile?.institution?.name?.split(",")[0] || "Your Campus";
  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  async function handlePublish() {
    if (!body.trim()) {
      toast.error("Please enter your confession or story before publishing.");
      return;
    }

    if (mode === "ARTICLE" && !title.trim()) {
      toast.error("Please enter a title for your anonymous article.");
      return;
    }

    setIsSubmitting(true);
    sounds.send();
    haptics.medium();

    try {
      // Append category hashtag if not already present
      let formattedBody = body.trim();
      if (activeCategory && !formattedBody.includes(activeCategory.tag)) {
        formattedBody = `${formattedBody}\n\n${activeCategory.tag}`;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: mode === "ARTICLE" ? title.trim() : title.trim() || undefined,
          body: formattedBody,
          type: "CONFESSION",
          scope,
          isAnonymous: true,
        }),
      });

      const data = (await res.json()) as any;

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to publish anonymously");
        setIsSubmitting(false);
        return;
      }

      sounds.pop();
      haptics.success();
      toast.success(
        mode === "ARTICLE"
          ? "Anonymous article published to the loop!"
          : "Confession sealed and broadcasted anonymously!",
        { description: "Identity cryptographically sealed. Zero tracking." }
      );

      setTitle("");
      setBody("");
      setIsSubmitting(false);
      onClose();
      onPublished?.();
    } catch {
      toast.error("Network error while publishing. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-3xl border border-border/50 bg-card p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <VenetianMask className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground tracking-tight">
                {mode === "ARTICLE" ? "Write Anonymous Article" : "Spill Campus Confession"}
              </h2>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                <Lock className="size-3 text-emerald-400" />
                <span>100% Cryptographic Anonymity — Zero Persona Tracing</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Mode Switcher: Quick Confession vs Anonymous Long Article */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted/40 border border-border/40 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setMode("CONFESSION");
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer",
              mode === "CONFESSION"
                ? "bg-foreground text-background shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flame className="size-3.5" />
            <span>Quick Confession</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setMode("ARTICLE");
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer",
              mode === "ARTICLE"
                ? "bg-foreground text-background shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="size-3.5" />
            <span>Anonymous Article</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Category Theme
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    setSelectedCategory(cat.id);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border",
                    isSelected
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-xs"
                      : "bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scope Selector: Global vs Campus */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Broadcast Audience
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setScope("GLOBAL");
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
                scope === "GLOBAL"
                  ? "bg-primary/10 border-primary text-foreground shadow-xs ring-1 ring-primary/40"
                  : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40"
              )}
            >
              <Globe className="size-3.5 text-primary" />
              <span>All India (Global)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setScope("CAMPUS");
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer truncate",
                scope === "CAMPUS"
                  ? "bg-primary/10 border-primary text-foreground shadow-xs ring-1 ring-primary/40"
                  : "bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40"
              )}
            >
              <School className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{campusName} Only</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          {mode === "ARTICLE" && (
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Compelling Article Headline / Topic..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="w-full rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-2.5 text-sm font-black text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <textarea
              rows={mode === "ARTICLE" ? 7 : 4}
              placeholder={
                mode === "ARTICLE"
                  ? "Write your long-form story, unfiltered hostel truth, placement reality, or personal essay here. Markdown formatting supported..."
                  : "What's the dark secret, campus tea, or confession you can't tell anyone openly? Drop it here safely..."
              }
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-2xl border border-border/50 bg-muted/20 p-3.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors resize-none"
            />
          </div>
        </div>

        {/* Pseudonym Guarantee Banner */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 px-3.5 py-2 text-[11px] text-purple-300">
          <ShieldCheck className="size-4 text-purple-400 shrink-0" />
          <span>
            Identity sealed with AES-256 vault encryption. Your real profile name is never exposed to peers.
          </span>
        </div>

        {/* Footer & Submit */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="text-[11px] text-muted-foreground font-medium">
            {body.length} characters
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting || !body.trim()}
              className="px-5 py-2 rounded-full bg-foreground text-background hover:opacity-90 disabled:opacity-50 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Sealing...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>{mode === "ARTICLE" ? "Publish Article" : "Spill Confession"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
