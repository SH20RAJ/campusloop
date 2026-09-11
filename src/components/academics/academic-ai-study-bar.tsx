"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { buildAcademicStudyPrompt, getChatGptStudyUrl, getClaudeStudyUrl } from "@/lib/academics/ai-prompts";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AcademicAiStudyBarProps {
  title: string;
  subjectCode: string;
  courseCode?: string;
  department?: string;
  semester?: number | string;
  description?: string;
  materialUrl: string;
  pageUrl?: string;
  collegeName?: string;
  compact?: boolean;
  className?: string;
}

// Crisp SVGs for AI Agents
function ChatGptIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6669zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6848zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.1449-2.0837l2.5486-1.4716 2.5533 1.4716v2.9338l-2.5533 1.4716-2.5486-1.4716z" />
    </svg>
  );
}

function ClaudeIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.5 3.75a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 0 1.5H5.25v3.75a.75.75 0 0 1-1.5 0V9.75H0a.75.75 0 0 1 0-1.5h3.75V4.5a.75.75 0 0 1 .75-.75Zm15 0a.75.75 0 0 1 .75.75v3.75H24a.75.75 0 0 1 0 1.5h-3.75v3.75a.75.75 0 0 1-1.5 0V9.75H15a.75.75 0 0 1 0-1.5h3.75V4.5a.75.75 0 0 1 .75-.75ZM12 7.5a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5H6.75a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 12 7.5Z" />
    </svg>
  );
}

export function AcademicAiStudyBar({
  title,
  subjectCode,
  courseCode,
  department,
  semester,
  description,
  materialUrl,
  pageUrl,
  collegeName,
  compact = false,
  className,
}: AcademicAiStudyBarProps) {
  const [copied, setCopied] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const prompt = buildAcademicStudyPrompt({
    title,
    subjectCode,
    courseCode,
    department,
    semester,
    description,
    materialUrl,
    pageUrl: pageUrl || (typeof window !== "undefined" ? window.location.href : undefined),
    collegeName,
  });

  const chatGptUrl = getChatGptStudyUrl(prompt);
  const claudeUrl = getClaudeStudyUrl(prompt);

  const handleCopy = () => {
    sounds.pop();
    haptics.success();
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Structured AI study prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenAi = (url: string, agentName: string) => {
    sounds.tap();
    haptics.medium();
    toast.info(`Opening ${agentName} with verified course prompt...`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ─── Compact Pill Layout (Used in lists and cards) ───
  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
        <button
          type="button"
          onClick={() => handleOpenAi(chatGptUrl, "ChatGPT")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          title="Study this material with ChatGPT"
        >
          <ChatGptIcon className="size-3.5" />
          <span>Ask ChatGPT</span>
          <ExternalLink className="size-2.5 opacity-70" />
        </button>

        <button
          type="button"
          onClick={() => handleOpenAi(claudeUrl, "Claude")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-all cursor-pointer active:scale-95"
          title="Study this material with Claude"
        >
          <ClaudeIcon className="size-3.5" />
          <span>Ask Claude</span>
          <ExternalLink className="size-2.5 opacity-70" />
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-full border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title="Copy master study prompt"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    );
  }

  // ─── MINIMAL PROFESSIONAL STUDY WITH AI UI ───
  return (
    <div className={cn("rounded-2xl border border-border/40 bg-card/40 p-4 sm:p-5 space-y-3.5 select-none", className)}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-muted border border-border/50 text-foreground shrink-0">
            <Sparkles className="size-4 sm:size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                Study with AI Agents
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                Context-Ready
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              Pre-loaded with {subjectCode} syllabus, formula cheat sheets &amp; exam solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Minimal High-Contrast Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => handleOpenAi(chatGptUrl, "ChatGPT")}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-foreground text-background font-bold text-xs sm:text-sm hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-xs"
        >
          <ChatGptIcon className="size-4 shrink-0" />
          <span>Study on ChatGPT</span>
          <ExternalLink className="size-3 opacity-70 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => handleOpenAi(claudeUrl, "Claude")}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border/50 font-bold text-xs sm:text-sm active:scale-98 transition-all cursor-pointer"
        >
          <ClaudeIcon className="size-4 shrink-0" />
          <span>Study on Claude</span>
          <ExternalLink className="size-3 opacity-70 shrink-0" />
        </button>
      </div>

      {/* Bottom Actions: Prompt Preview & Copy Prompt */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/20 text-xs">
        <button
          type="button"
          onClick={() => setShowPromptPreview(!showPromptPreview)}
          className="inline-flex items-center gap-1.5 py-1 text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
        >
          <span>{showPromptPreview ? "Hide study prompt" : "View study prompt"}</span>
          {showPromptPreview ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>Copy Prompt</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Prompt Preview */}
      {showPromptPreview && (
        <div className="relative p-3 rounded-xl bg-muted/40 border border-border/40 text-[11px] font-mono text-muted-foreground leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap select-all">
          {prompt}
        </div>
      )}
    </div>
  );
}
