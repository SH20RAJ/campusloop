"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Plus, Trash2 } from "lucide-react";

interface PollOptionsEditorProps {
  options: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function PollOptionsEditor({ options, onChange, onAdd, onRemove }: PollOptionsEditorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="mx-5 mb-4 rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <BarChart3 className="size-3.5 text-primary" /> Voting Options
            </span>
            {options.length < 6 && (
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary transition-all hover:bg-primary/20 active:scale-95 cursor-pointer"
              >
                <Plus className="size-3" /> Add Option
              </button>
            )}
          </div>

          <div className="space-y-2">
            {options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-2"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-black text-primary">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  required={index < 2}
                  maxLength={80}
                  onChange={(e) => onChange(index, e.target.value)}
                  className="h-9 flex-1 rounded-xl border border-border/60 bg-card px-3 text-xs font-medium outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    aria-label={`Remove option ${index + 1}`}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <p className="text-[10px] font-medium text-muted-foreground">
            {options.filter((o) => o.trim()).length}/6 options · minimum 2 required
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
