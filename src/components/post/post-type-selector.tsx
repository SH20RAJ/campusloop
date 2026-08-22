"use client";

import { motion } from "framer-motion";
import { MessageSquare, Lock, BarChart3, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PostType = "NORMAL" | "CONFESSION" | "POLL" | "QUESTION";

const POST_TYPES: Array<{ id: PostType; label: string; icon: typeof MessageSquare }> = [
  { id: "NORMAL", label: "Thought", icon: MessageSquare },
  { id: "CONFESSION", label: "Confession", icon: Lock },
  { id: "POLL", label: "Poll", icon: BarChart3 },
  { id: "QUESTION", label: "Question", icon: HelpCircle },
];

interface PostTypeSelectorProps {
  value: PostType;
  onChange: (type: PostType) => void;
}

export function PostTypeSelector({ value, onChange }: PostTypeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-2xl border border-border/50 bg-muted/40 p-1">
      {POST_TYPES.map((t) => {
        const Icon = t.icon;
        const isSelected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold transition-colors cursor-pointer",
              isSelected ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isSelected && (
              <motion.span
                layoutId="post-type-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-xl border border-primary/30 bg-card shadow-sm"
              />
            )}
            <Icon className="relative z-10 size-3.5 shrink-0" />
            <span className="relative z-10">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
