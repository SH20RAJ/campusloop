"use client";

import { X, Send, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteThoughts: string;
  setQuoteThoughts: (val: string) => void;
  isReposting: boolean;
  onExecuteRepost: (withCommentary: boolean) => void;
  originalPostAuthorHandle: string;
}

export function FeedCardRepostModal({
  isOpen,
  onClose,
  quoteThoughts,
  setQuoteThoughts,
  isReposting,
  onExecuteRepost,
  originalPostAuthorHandle,
}: RepostModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Repeat2 className="size-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">Reshare Post</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Add your thoughts (Optional quote):
          </label>
          <textarea
            value={quoteThoughts}
            onChange={(e) => setQuoteThoughts(e.target.value)}
            placeholder={`What do you think about @${originalPostAuthorHandle}'s post?`}
            rows={3}
            className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none font-medium"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onExecuteRepost(false)}
            disabled={isReposting}
            className="flex-1 text-xs font-semibold h-9 rounded-xl border border-border/60 cursor-pointer"
          >
            Instant Repost
          </Button>

          <Button
            type="button"
            onClick={() => onExecuteRepost(true)}
            disabled={isReposting || !quoteThoughts.trim()}
            className="flex-1 text-xs font-semibold h-9 rounded-xl bg-primary text-primary-foreground gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="size-3.5" /> Quote Repost
          </Button>
        </div>
      </div>
    </div>
  );
}
