"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Image as ImageIcon, Loader2, Lock, UserCheck, UserX, Wand2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface CapsuleBuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  capsuleId: string;
  capsuleTitle: string;
  onEntryBuried?: (entry: any) => void;
}

export function CapsuleBuryModal({
  isOpen,
  onClose,
  capsuleId,
  capsuleTitle,
  onEntryBuried,
}: CapsuleBuryModalProps) {
  const [entryType, setEntryType] = useState<"LETTER" | "PREDICTION" | "PHOTO">("LETTER");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [pseudonym, setPseudonym] = useState("anonymous_student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both a title and message");
      return;
    }

    setIsSubmitting(true);
    sounds.tap();
    haptics.light();

    try {
      const res = await fetch(`/api/capsules/${capsuleId}/bury`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          entryType,
          mediaUrl: mediaUrl.trim() || null,
          isAnonymous,
          pseudonym: isAnonymous ? pseudonym.trim() || "anonymous_student" : null,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to bury memory");
      }

      const { entry } = (await res.json()) as { entry: any };

      sounds.archive();
      haptics.success();
      toast.success("Memory sealed in the Time Capsule! ⏳");
      onEntryBuried?.(entry);
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to bury memory");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-wider mb-1">
                <Lock className="size-3.5" />
                <span>Bury in Time Capsule</span>
              </div>
              <h3 className="text-base font-black text-foreground line-clamp-1">{capsuleTitle}</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Sealed until unlock date. No one on campus can read this until the vault opens!
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "LETTER", label: "Letter to Future", icon: FileText },
              { id: "PREDICTION", label: "Campus Prediction", icon: Wand2 },
              { id: "PHOTO", label: "Photo Memory", icon: ImageIcon },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = entryType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setEntryType(t.id as any);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/40 text-foreground ring-1 ring-amber-500/30"
                      : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className={cn("size-4", isSelected ? "text-amber-500" : "")} />
                  <span className="text-xs font-bold leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Subject / Headline *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  entryType === "PREDICTION"
                    ? "e.g. In 2027, who will be the first founder from our batch?"
                    : entryType === "PHOTO"
                      ? "e.g. 3 AM Maggi run during End-Sems"
                      : "e.g. A letter to myself before graduating"
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Your Secret Message / Prediction *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write honestly. What do you hope will happen? What will you miss most? What were you feeling right at this moment in college?"
                rows={4}
                className="w-full rounded-xl border border-border/80 bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                required
              />
            </div>

            {entryType === "PHOTO" && (
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Photo URL</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/30">
              <div className="flex items-center gap-2">
                {isAnonymous ? (
                  <UserX className="size-4 text-amber-500" />
                ) : (
                  <UserCheck className="size-4 text-emerald-500" />
                )}
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {isAnonymous ? "Anonymous Pseudonym" : "Verified Identity"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isAnonymous
                      ? "Your real name will never be attached when unsealed"
                      : "Your profile name will appear when the capsule unlocks"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setIsAnonymous(!isAnonymous);
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer",
                  isAnonymous
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {isAnonymous ? "Anon On" : "Show Name"}
              </button>
            </div>

            {isAnonymous && (
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Anonymous Pseudonym</label>
                <input
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="e.g. midnight_coder_26"
                  className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 text-white text-xs font-black hover:bg-amber-600 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Sealing Memory...</span>
                  </>
                ) : (
                  <>
                    <Lock className="size-3.5" />
                    <span>Bury in Vault</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
