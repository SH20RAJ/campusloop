"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, Lock, UserCheck } from "lucide-react";
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
      <div className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all",
        active
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border/50 bg-muted/20"
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors shadow-xs",
            active ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-muted text-muted-foreground border border-border/40"
          )}>
            {active ? <Lock className="size-4" /> : <UserCheck className="size-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>{active ? "Anonymous Post 🙈" : "Public Campus Post 👤"}</span>
            </p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">
              {forcedByType
                ? "Confessions are strictly 100% anonymous"
                : active
                ? "Your handle stays hidden from the campus feed"
                : "Your student profile handle will be attached"}
            </p>
          </div>
        </div>

        {/* Modern iOS-style toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label="Post anonymously"
          disabled={forcedByType}
          onClick={() => onToggle(!enabled)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full border transition-colors cursor-pointer select-none",
            active ? "border-amber-500 bg-amber-500" : "border-border/80 bg-muted/80",
            forcedByType && "opacity-75 cursor-not-allowed"
          )}
        >
          <motion.span
            animate={{ x: active ? 20 : 3 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow-md"
          />
        </button>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3.5 space-y-1 backdrop-blur-xs">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <ShieldAlert className="size-3.5 shrink-0" /> Anti-Doxxing &amp; Moderation Notice
              </p>
              <p className="text-[10.5px] font-medium leading-relaxed text-amber-700/90 dark:text-amber-300/90">
                Anonymous posts hide your identity from fellow students. Sharing phone numbers, personal emails, or targeted harassment will result in an instant automated ban.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
