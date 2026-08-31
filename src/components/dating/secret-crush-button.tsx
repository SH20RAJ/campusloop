"use client";

import { Heart, Loader2, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SecretCrushButtonProps {
  targetId: string;
  targetName: string;
  className?: string;
}

export function SecretCrushButton({ targetId, targetName, className }: SecretCrushButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleCrush() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dating/crush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });

      const data = (await res.json()) as { error?: string; matched?: boolean };
      if (!res.ok) {
        throw new Error(data.error || "Failed to add secret crush");
      }

      if (data.matched) {
        toast.success(`💘 IT'S A MUTUAL MATCH! You and ${targetName} both secretly liked each other!`);
      } else {
        toast.success(`Locked in! 🔒 ${targetName} will never know unless they crush on you too.`);
      }

      setShowConfirm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add crush");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 h-9 px-2.5 sm:px-3.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0 border border-primary/20",
          className
        )}
        title={`Secret Crush on ${targetName}`}
      >
        <Sparkles className="size-4 sm:size-3.5 text-primary shrink-0" />
        <span className="hidden sm:inline">Secret Crush</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowConfirm(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border/40 bg-card p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-md shadow-primary/25">
              <Sparkles className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">Secret Crush on {targetName}?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your intent is <strong>100% hidden</strong>. {targetName} will <strong>never</strong> know you
                crushed on them unless they secretly crush on you too!
              </p>
            </div>

            <Link
              href="/app/crush"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-muted/50 p-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lock className="size-3 text-primary" />
              <span>Uses 1 secret crush slot • Safe &amp; intent-hidden</span>
            </Link>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-full border border-border/50 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCrush}
                className="flex-1 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                <span>Lock In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
