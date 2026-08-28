"use client";

import { cn } from "@/lib/utils";
import { Heart,Loader2,Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";


interface SecretCrushButtonProps {
  targetId: string;
  targetName: string;
  className?: string;
}

export function SecretCrushButton({
  targetId,
  targetName,
  className,
}: SecretCrushButtonProps) {
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
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-2xs",
          className
        )}
        title="Add to your Secret Crush vault"
      >
        <Heart className="size-3.5 fill-rose-500/20" />
        <span>Secret Crush</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowConfirm(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border/40 bg-card p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="size-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-md">
              <Heart className="size-6 fill-white" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">
                Secret Crush on {targetName}?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your intent is <strong>100% hidden</strong>. {targetName} will <strong>never</strong> know you crushed on them unless they secretly crush on you too!
              </p>
            </div>

            <Link
              href="/app/crush"
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-muted/50 p-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lock className="size-3 text-rose-500" />
              <span>Uses 1 secret crush slot • Expand to 50 with LP Clout</span>
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
                className="flex-1 py-2 rounded-full bg-foreground text-background hover:opacity-90 text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Heart className="size-3.5 fill-rose-500 text-rose-500" />}
                <span>Lock In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

