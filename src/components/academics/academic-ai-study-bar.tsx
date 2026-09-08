"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  ExternalLink,
  FileCode,
  FileText,
  GraduationCap,
  Layers,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CuteAiMascot } from "@/components/academics/cute-ai-mascot";
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

  // ─── FULL IMAGE 3 TARGET SPECIFICATION UI/UX ───
  return (
    <div className={cn("space-y-3 select-none", className)}>
      {/* ─── Top Master Card: Study with AI Agents (Matching Image 3) ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#180d2e] via-[#120a22] to-[#0d0718] p-4 sm:p-5 shadow-2xl">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -right-8 -top-8 size-44 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="relative z-10 space-y-4">
          {/* Header Row: Title & Mascot */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] shrink-0">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Study with AI Agents
                  </h2>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/35 uppercase tracking-wider">
                    Instant Tutor
                  </span>
                </div>
              </div>

              <p className="text-xs text-purple-200/70 leading-relaxed max-w-sm">
                Pre-loaded with verified syllabus, context, analogies, formula cheat sheets &amp; exam solutions.
              </p>
            </div>

            {/* Mascot Visual on Right (Matching Image 3) */}
            <div className="hidden xs:flex flex-col items-center shrink-0 -mt-2">
              <CuteAiMascot className="size-20 sm:size-24" />
              <span className="text-[9px] font-semibold text-purple-300/80 -mt-1 tracking-tight text-center">
                Learn Smarter<br />Not Harder ♡
              </span>
            </div>
          </div>

          {/* Action Buttons: Green ChatGPT & Orange Claude (Matching Image 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleOpenAi(chatGptUrl, "ChatGPT")}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <ChatGptIcon className="size-4 shrink-0" />
              <span>Teach Me on ChatGPT</span>
              <ExternalLink className="size-3.5 opacity-80 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleOpenAi(claudeUrl, "Claude")}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <ClaudeIcon className="size-4 shrink-0" />
              <span>Teach Me on Claude</span>
              <ExternalLink className="size-3.5 opacity-80 shrink-0" />
            </button>
          </div>

          {/* Bottom Bar: Example Prompt Toggle & Copy Master Prompt (Matching Image 3) */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowPromptPreview(!showPromptPreview)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-purple-200/80 hover:text-white bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 transition-all cursor-pointer"
            >
              <span>{showPromptPreview ? "Hide Example Prompt" : "View Example Prompt"}</span>
              {showPromptPreview ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-purple-300" />
                  <span>Copy Master Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Expandable Prompt Preview Drawer */}
          {showPromptPreview && (
            <div className="relative mt-2 p-3.5 rounded-2xl bg-black/70 border border-purple-500/30 text-[11px] font-mono text-purple-200 leading-relaxed max-h-44 overflow-y-auto whitespace-pre-wrap select-all">
              {prompt}
            </div>
          )}
        </div>
      </div>

      {/* ─── 4-Grid of Cute Feature Cards (Directly Below AI Card in Image 3) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Card 1: Syllabus Based */}
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/70 to-[#120a22] p-3.5 flex flex-col justify-between space-y-3 shadow-md hover:border-purple-500/50 transition-all">
          <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <FileText className="size-4" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Syllabus</p>
            <p className="text-xs font-black text-white">Based</p>
          </div>
        </div>

        {/* Card 2: Formula Cheat Sheets */}
        <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/70 to-[#081528] p-3.5 flex flex-col justify-between space-y-3 shadow-md hover:border-sky-500/50 transition-all">
          <div className="flex size-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Layers className="size-4" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Formula</p>
            <p className="text-xs font-black text-white">Cheat Sheets</p>
          </div>
        </div>

        {/* Card 3: PYQs & Solutions */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/70 to-[#071f18] p-3.5 flex flex-col justify-between space-y-3 shadow-md hover:border-emerald-500/50 transition-all">
          <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <p className="text-xs font-black text-white">PYQs &amp;</p>
            <p className="text-xs font-black text-white">Solutions</p>
          </div>
        </div>

        {/* Card 4: Concept Explainers */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/70 to-[#220a15] p-3.5 flex flex-col justify-between space-y-3 shadow-md hover:border-rose-500/50 transition-all">
          <div className="flex size-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Lightbulb className="size-4" />
          </div>
          <div>
            <p className="text-xs font-black text-white">Concept</p>
            <p className="text-xs font-black text-white">Explainers</p>
          </div>
        </div>
      </div>

      {/* ─── Campus AI Study Cram Assistant Banner (Matching Image 3) ─── */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 p-3.5 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
            <Sparkles className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white truncate">Campus AI Study Cram Assistant</p>
            <p className="text-[11px] text-muted-foreground truncate">Your 24/7 study buddy is almost here!</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider text-purple-300">
          <span>COMING SOON</span>
          <ChevronRight className="size-3" />
        </div>
      </div>
    </div>
  );
}
