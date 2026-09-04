"use client";

import {
  Bookmark,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sounds } from "@/lib/sounds";

interface AcademicAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionReason?: "SAVE" | "VOTE" | "COMMENT" | "UPLOAD" | "AI";
  returnTo?: string;
}

export function AcademicAuthModal({
  isOpen,
  onClose,
  actionReason = "SAVE",
  returnTo,
}: AcademicAuthModalProps) {
  const reasonText = {
    SAVE: {
      title: "Save to Your Personal Study Vault",
      subtitle: "Never lose a syllabus paper or formula sheet before exam night.",
      icon: Bookmark,
      color: "text-amber-500",
      bg: "bg-amber-500/15",
    },
    VOTE: {
      title: "Vote & Verify Syllabus Accuracy",
      subtitle: "Help your batchmates find the best notes and earn Loop Points.",
      icon: ThumbsUp,
      color: "text-indigo-400",
      bg: "bg-indigo-500/15",
    },
    COMMENT: {
      title: "Ask Doubts & Post Formula Corrections",
      subtitle: "Connect with branch toppers and verified seniors directly.",
      icon: MessageSquare,
      color: "text-purple-400",
      bg: "bg-purple-500/15",
    },
    UPLOAD: {
      title: "Share Notes & Earn 20 LP per Upload",
      subtitle: "Become the campus legend by contributing PYQs and lab manuals.",
      icon: UploadCloud,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
    },
    AI: {
      title: "Unlock Campus AI Study Cram Assistant",
      subtitle: "Instant 15-minute exam summaries, key formulas, and chapter breakdowns.",
      icon: Sparkles,
      color: "text-cyan-400",
      bg: "bg-cyan-500/15",
    },
  }[actionReason];

  const CurrentIcon = reasonText.icon;
  const signInUrl = `/handler/sign-in${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-indigo-500/30 bg-card rounded-3xl shadow-2xl">
        <div className="relative p-6 space-y-5">
          {/* Top glow */}
          <div className="absolute -top-12 -right-12 size-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`flex size-10 items-center justify-center rounded-2xl ${reasonText.bg} ${reasonText.color} border border-border/40 shadow-xs`}>
                <CurrentIcon className="size-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  Student Verification
                </span>
                <h3 className="text-base font-black text-foreground">{reasonText.title}</h3>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{reasonText.subtitle}</p>

          {/* Benefits List */}
          <div className="space-y-2 rounded-2xl bg-muted/30 p-3.5 border border-border/40 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <span className="flex size-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-500 shrink-0">
                <Zap className="size-3 fill-current" />
              </span>
              <span>Instant +50 Loop Points (LP) Welcome Bonus</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex size-5 items-center justify-center rounded-md bg-indigo-500/15 text-indigo-400 shrink-0">
                <Bookmark className="size-3" />
              </span>
              <span>Offline mobile sync across all 8 semesters</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex size-5 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400 shrink-0">
                <GraduationCap className="size-3" />
              </span>
              <span>Verified Student Badge &amp; College Hub Access</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <Link
              href={signInUrl}
              onClick={() => {
                sounds.tap();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Sign In with College Email</span>
              <ChevronRight className="size-4" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-center text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Continue Browsing as Guest
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
