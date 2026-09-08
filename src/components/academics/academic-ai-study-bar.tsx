"use client";

import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  buildAcademicStudyPrompt,
  getChatGptStudyUrl,
  getClaudeStudyUrl,
} from "@/lib/academics/ai-prompts";
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
    pageUrl:
      pageUrl || (typeof window !== "undefined" ? window.location.href : undefined),
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

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 flex-wrap",
          className
        )}
      >
        <button
          type="button"
          onClick={() => handleOpenAi(chatGptUrl, "ChatGPT")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
          title="Study this material with ChatGPT"
        >
          <Bot className="size-3.5" />
          <span>Ask ChatGPT</span>
          <ExternalLink className="size-2.5 opacity-70" />
        </button>

        <button
          type="button"
          onClick={() => handleOpenAi(claudeUrl, "Claude")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer active:scale-95"
          title="Study this material with Claude"
        >
          <Sparkles className="size-3.5" />
          <span>Ask Claude</span>
          <ExternalLink className="size-2.5 opacity-70" />
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-full border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title="Copy study prompt"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-3xl border border-indigo-500/30 bg-linear-to-br from-indigo-500/8 via-card to-purple-500/8 p-4 sm:p-5 space-y-3.5 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white font-bold shadow-sm">
            <Sparkles className="size-4.5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-foreground">
                Study with AI Agents
              </h3>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                Instant Tutor
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pre-loaded with verified syllabus context, analogies, formula cheat sheets &amp; exam solutions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPromptPreview(!showPromptPreview)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>{showPromptPreview ? "Hide Prompt" : "View Prompt"}</span>
          {showPromptPreview ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleOpenAi(chatGptUrl, "ChatGPT")}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Bot className="size-4" />
          <span>Teach Me on ChatGPT</span>
          <ExternalLink className="size-3 opacity-80" />
        </button>

        <button
          type="button"
          onClick={() => handleOpenAi(claudeUrl, "Claude")}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="size-4" />
          <span>Teach Me on Claude</span>
          <ExternalLink className="size-3 opacity-80" />
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-card hover:bg-muted border border-border/70 text-foreground transition-all cursor-pointer active:scale-95 ml-auto"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-emerald-400">Prompt Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5 text-muted-foreground" />
              <span>Copy Master Prompt</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Prompt Preview */}
      {showPromptPreview && (
        <div className="relative mt-2 p-3.5 rounded-2xl bg-neutral-950/90 border border-border/40 text-[11px] font-mono text-neutral-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
          {prompt}
        </div>
      )}
    </div>
  );
}
