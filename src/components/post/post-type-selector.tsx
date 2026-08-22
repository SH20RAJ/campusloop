"use client";

import { motion } from "framer-motion";
import { MessageSquare, Lock, BarChart3, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PostType = "NORMAL" | "CONFESSION" | "POLL" | "QUESTION";

const POST_TYPES: Array<{
  id: PostType;
  label: string;
  icon: typeof MessageSquare;
  color: string;
  activeBg: string;
}> = [
  { id: "NORMAL", label: "Thought", icon: MessageSquare, color: "text-blue-500", activeBg: "bg-blue-500/10 border-blue-500/30 text-blue-500" },
  { id: "CONFESSION", label: "Confess", icon: Lock, color: "text-pink-500", activeBg: "bg-pink-500/10 border-pink-500/30 text-pink-500" },
  { id: "POLL", label: "Poll", icon: BarChart3, color: "text-emerald-500", activeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" },
  { id: "QUESTION", label: "Ask", icon: HelpCircle, color: "text-amber-500", activeBg: "bg-amber-500/10 border-amber-500/30 text-amber-500" },
];

interface PostTypeSelectorProps {
  value: PostType;
  onChange: (type: PostType) => void;
}

export function PostTypeSelector({ value, onChange }: PostTypeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-border/50 bg-muted/30 p-1.5 backdrop-blur-sm">
      {POST_TYPES.map((t) => {
        const Icon = t.icon;
        const isSelected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2.5 px-2 text-[11px] font-bold transition-all cursor-pointer select-none active:scale-95",
              isSelected ? t.color : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {isSelected && (
              <motion.span
                layoutId="post-type-pill"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className={cn(
                  "absolute inset-0 rounded-xl border shadow-sm bg-card",
                  t.activeBg
                )}
              />
            )}
            <Icon className="relative z-10 size-4 sm:size-3.5 shrink-0" />
            <span className="relative z-10 truncate text-[11px]">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
