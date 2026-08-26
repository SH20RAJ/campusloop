"use client";

import { AnimatePresence,motion } from "framer-motion";
import { BarChart3,Plus,Trash2 } from "lucide-react";

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
        <div className="mx-4 sm:mx-5 mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <BarChart3 className="size-4 text-emerald-500" /> Voting Options
            </span>
            {options.length < 6 && (
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-500 transition-all hover:bg-emerald-500/20 active:scale-95 cursor-pointer"
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
                <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-xs font-black text-emerald-500 border border-emerald-500/20 shadow-xs">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  required={index < 2}
                  maxLength={80}
                  onChange={(e) => onChange(index, e.target.value)}
                  className="h-10 flex-1 rounded-xl border border-border/60 bg-card px-3.5 text-xs font-medium outline-none transition-all placeholder:text-muted-foreground/60 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 shadow-xs"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    aria-label={`Remove option ${index + 1}`}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer active:scale-95"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <p className="text-[10px] font-semibold text-muted-foreground flex items-center justify-between">
            <span>Minimum 2 options required</span>
            <span className="tabular-nums font-bold">{options.filter((o) => o.trim()).length}/6 options</span>
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
