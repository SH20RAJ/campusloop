"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnonymityNoticeProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  forcedByType?: boolean;
}

export function AnonymityNotice({ enabled, onToggle, forcedByType }: AnonymityNoticeProps) {
  const active = enabled || forcedByType;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Lock className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">Post anonymously 🙈</p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">
              {forcedByType ? "Confessions are always anonymous" : "Your handle stays hidden from the feed"}
            </p>
          </div>
        </div>

        {/* Modern toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label="Post anonymously"
          disabled={forcedByType}
          onClick={() => onToggle(!enabled)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full border transition-colors cursor-pointer",
            active ? "border-primary bg-primary" : "border-border bg-muted",
            forcedByType && "opacity-70 cursor-not-allowed"
          )}
        >
          <motion.span
            animate={{ x: active ? 20 : 3 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow-sm"
          />
        </button>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5 shrink-0" /> Anti-Doxxing &amp; Moderation Notice
            </p>
            <p className="text-[10.5px] font-medium leading-relaxed text-amber-600/90 dark:text-amber-300/90">
              Anonymous posts hide your student handle from public view. Sharing phone numbers, personal emails,
              or targeted harassment will result in an automated ban.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
