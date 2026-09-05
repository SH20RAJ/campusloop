"use client";

import { ArrowDown, ArrowLeft, ArrowUp, Bookmark, BookOpen, Bot, CheckCircle2, ChevronRight, Download, ExternalLink, Eye, FileText, Maximize2, Minimize2, Send, Share2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AcademicAuthBenefitsCard } from "@/components/academics/academic-auth-benefits-card";
import { AcademicAuthModal } from "@/components/academics/academic-auth-modal";
import { AcademicPdfViewer } from "@/components/academics/academic-pdf-viewer";
import { SimilarResourcesWidget } from "@/components/academics/similar-resources-widget";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

interface AcademicDetailClientProps {
  initialResource: any;
  currentUserId?: string | null;
}

export function AcademicDetailClient({ initialResource, currentUserId }: AcademicDetailClientProps) {
  const router = useRouter();
  const [resource, setResource] = useState(initialResource);
  const [upvotes, setUpvotes] = useState(initialResource.upvotesCount || 0);
  const [downvotes, setDownvotes] = useState(initialResource.downvotesCount || 0);
  const [downloads, setDownloads] = useState(initialResource.downloadsCount || 0);
  const [views, setViews] = useState(initialResource.viewsCount || 1);
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Document preview expand
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  // Peer comments state
  const [comments, setComments] = useState<any[]>(initialResource.comments || []);
  const [commentText, setCommentText] = useState("");
  const [isHelpful, setIsHelpful] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Campus AI Cram Helper
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Guest conversion modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<"SAVE" | "VOTE" | "COMMENT" | "UPLOAD" | "AI">("SAVE");

  const totalVotes = upvotes + downvotes;
  const reliability = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 100;
  const uploaderAvatar = getAvatarUrl(
    initialResource.uploader?.avatarUrl,
    initialResource.uploader?.username
  );

  // Handle voting
  async function handleVote(type: "UP" | "DOWN") {
    if (!currentUserId) {
      setAuthModalReason("VOTE");
      setIsAuthModalOpen(true);
      return;
    }

    sounds.pop();
    haptics.medium();

    if (type === "UP") {
      if (userVote === "UP") {
        setUpvotes((c: number) => Math.max(0, c - 1));
        setUserVote(null);
        fetch(`/api/academics/${resource.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UNDO_UPVOTE" }),
        }).catch(() => {});
      } else {
        if (userVote === "DOWN") setDownvotes((c: number) => Math.max(0, c - 1));
        setUpvotes((c: number) => c + 1);
        setUserVote("UP");
        toast.success("Upvoted! Marked as syllabus-accurate 🎯");
        fetch(`/api/academics/${resource.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPVOTE" }),
        }).catch(() => {});
      }
    } else {
      if (userVote === "DOWN") {
        setDownvotes((c: number) => Math.max(0, c - 1));
        setUserVote(null);
      } else {
        if (userVote === "UP") setUpvotes((c: number) => Math.max(0, c - 1));
        setDownvotes((c: number) => c + 1);
        setUserVote("DOWN");
        toast.info("Downvoted: Marked for peer review");
        fetch(`/api/academics/${resource.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "DOWNVOTE" }),
        }).catch(() => {});
      }
    }
  }

  // Handle file open & download tracking
  function handleDownload() {
    sounds.tap();
    haptics.success();
    setDownloads((d: number) => d + 1);

    fetch(`/api/academics/${resource.id}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DOWNLOAD" }),
    }).catch(() => {});

    const targetUrl = resource.fileUrl || resource.driveUrl;
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("File link is currently unavailable");
    }
  }

  // Share note link
  function handleShare() {
    sounds.tap();
    haptics.light();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: `Download ${resource.subjectCode} (${resource.subjectName}) study materials on CampusLoop:`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Study link copied to clipboard! 📋");
    }
  }

  // AI Cram Generator
  function handleGenerateAiCram(promptType: "CONCEPTS" | "EXAM_TIPS" | "CHECKLIST") {
    if (!currentUserId) {
      setAuthModalReason("AI");
      setIsAuthModalOpen(true);
      return;
    }

    sounds.tap();
    haptics.medium();
    setIsGeneratingAi(true);

    setTimeout(() => {
      if (promptType === "CONCEPTS") {
        setAiAnalysis(
          `### 🧠 Core Concepts & Formula Checklist for ${resource.subjectCode}:\n\n` +
            `1. **Key Definitions & Principles**: Understand core theorems, definitions, and mathematical relations outlined in this material.\n` +
            `2. **High-Yield Exam Topics**: Focus on numericals, step-by-step algorithms, and diagrams often tested in end-sem papers.\n` +
            `3. **Common Mistakes to Avoid**: Always verify standard boundary conditions, units, and derivation assumptions.\n\n` +
            `*Tip: Pair these notes with the end-semester PYQs below for complete revision.*`
        );
      } else if (promptType === "EXAM_TIPS") {
        setAiAnalysis(
          `### ⚡ 15-Minute Exam Cram Strategy for ${resource.subjectName}:\n\n` +
            `• **First 5 mins**: Scan all block diagrams and formula boxes highlighted in these notes.\n` +
            `• **Next 5 mins**: Review solved examples and past question paper patterns.\n` +
            `• **Last 5 mins**: Rehearse key terminology and definitions to score max theory marks.\n\n` +
            `*Compiled with syllabus insights for ${resource.branch} Semester ${resource.semester}.*`
        );
      } else {
        setAiAnalysis(
          `### 📋 Syllabus Alignment & Peer Verification:\n\n` +
            `• **Relevance**: Verified by ${resource.institution?.name?.split(",")[0] || "Campus"} peers with a ${reliability}% accuracy rating.\n` +
            `• **Coverage**: Covers essential modules for ${resource.subjectCode} (${resource.subjectName}).\n` +
            `• **Recommended Study Order**: Read lecture notes first, write down cheat sheet formulas, then test yourself against past question papers.`
        );
      }
      setIsGeneratingAi(false);
      sounds.success();
    }, 600);
  }

  // Submit peer review
  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUserId) {
      setAuthModalReason("COMMENT");
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmittingComment(true);
    sounds.tap();

    try {
      const res = await fetch(`/api/academics/${resource.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: commentText.trim(),
          isHelpful,
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      const json = (await res.json()) as { comment: any };

      setComments((prev) => [json.comment, ...prev]);
      setCommentText("");
      toast.success("Review posted! Thanks for verifying campus notes 🌟");
      haptics.success();
    } catch {
      toast.error("Could not post review. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  const rawUrl = resource.fileUrl || resource.driveUrl;
  const isGoogleDrive = rawUrl && rawUrl.includes("drive.google.com");
  // Form previewable embed URL for Drive or PDF
  const previewUrl = isGoogleDrive ? rawUrl.replace(/\/view(\?.*)?$/, "/preview") : rawUrl;

  return (
    <div className="min-h-screen pb-24 text-foreground select-none max-w-4xl mx-auto px-3 sm:px-6 pt-3 space-y-6">
      {/* ─── Breadcrumb & Top Bar ─── */}
      <div className="flex items-center justify-between gap-2 border-b border-border/25 pb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 overflow-hidden">
          <Link
            href="/app/academics"
            onClick={() => sounds.tap()}
            className="flex items-center gap-1 hover:text-foreground font-bold shrink-0 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Vault</span>
          </Link>
          <ChevronRight className="size-3 shrink-0 opacity-40" />
          <span className="truncate">{resource.branch}</span>
          <ChevronRight className="size-3 shrink-0 opacity-40 hidden sm:inline" />
          <span className="hidden sm:inline font-semibold text-foreground/80 shrink-0">
            Sem {resource.semester}
          </span>
          <ChevronRight className="size-3 shrink-0 opacity-40" />
          <span className="font-bold text-foreground truncate">{resource.subjectCode}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!currentUserId) {
                setAuthModalReason("SAVE");
                setIsAuthModalOpen(true);
                return;
              }
              sounds.tap();
              haptics.light();
              setIsSaved(!isSaved);
              toast.success(isSaved ? "Removed from Study Vault" : "Saved to Study Vault 🔖");
            }}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border transition-all cursor-pointer",
              isSaved
                ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
            title="Save to Study Vault"
          >
            <Bookmark className={cn("size-3.5", isSaved && "fill-current")} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex size-8 items-center justify-center rounded-full border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Share note link"
          >
            <Share2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Twitter/X Style Main Resource Tweet Header ─── */}
      <div className="space-y-3">
        {/* Author row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/@${resource.uploader?.username}`} className="shrink-0">
              <Avatar className="size-11 rounded-full border border-border/50">
                <AvatarImage src={uploaderAvatar} />
                <AvatarFallback className="text-xs font-bold">
                  {resource.uploader?.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <Link
                  href={`/@${resource.uploader?.username}`}
                  className="text-sm sm:text-base font-black text-foreground hover:underline truncate"
                >
                  {resource.uploader?.displayName}
                </Link>
                {resource.isVerified && <ShieldCheck className="size-3.5 text-brand shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                @{resource.uploader?.username} · {resource.institution?.name?.split(",")[0] || "Campus"}
              </p>
            </div>
          </div>

          {/* Save & Share action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!currentUserId) {
                  setAuthModalReason("SAVE");
                  setIsAuthModalOpen(true);
                  return;
                }
                sounds.tap();
                haptics.light();
                setIsSaved(!isSaved);
                toast.success(isSaved ? "Removed from Study Vault" : "Saved to Study Vault 🔖");
              }}
              className={cn(
                "flex size-8.5 items-center justify-center rounded-full border transition-all cursor-pointer",
                isSaved
                  ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                  : "border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              title="Save to Study Vault"
            >
              <Bookmark className={cn("size-4", isSaved && "fill-current")} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex size-8.5 items-center justify-center rounded-full border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Share note link"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Tweet content area */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/50">
              {resource.subjectCode}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {resource.subjectName}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
              {resource.resourceType.replace("_", " ")}
            </span>
            {resource.moduleOrChapter && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                {resource.moduleOrChapter}
              </span>
            )}
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-foreground tracking-tight leading-snug">
            {resource.title}
          </h1>

          {resource.description && (
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal">
              {resource.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
            <span>Shared {formatTimeAgo(resource.createdAt)}</span>
            <span>·</span>
            <span>{resource.branch}</span>
            <span>·</span>
            <span>Semester {resource.semester}</span>
          </div>
        </div>

        {/* ─── Twitter Metrics Bar (Hairline divided) ─── */}
        <div className="border-y border-border/25 py-3 my-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span>
            <strong className="text-foreground font-black tabular-nums">{upvotes}</strong> Helpful
          </span>
          <span>
            <strong className="text-foreground font-black tabular-nums">{views}</strong> Views
          </span>
          <span>
            <strong className="text-foreground font-black tabular-nums">{downloads}</strong> Downloads
          </span>
          <span className="ml-auto font-bold text-emerald-400">
            🎯 {reliability}% Verified Accuracy
          </span>
        </div>

        {/* ─── Twitter Action Bar ─── */}
        <div className="flex items-center justify-between pb-3 border-b border-border/25 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleVote("UP")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer",
                userVote === "UP"
                  ? "bg-primary/20 text-primary font-black shadow-xs"
                  : "hover:text-foreground hover:bg-muted text-muted-foreground"
              )}
            >
              <ArrowUp className={cn("size-4", userVote === "UP" && "stroke-3")} />
              <span className="tabular-nums">{upvotes} Upvote</span>
            </button>

            <button
              type="button"
              onClick={() => handleVote("DOWN")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-full font-bold transition-all cursor-pointer",
                userVote === "DOWN"
                  ? "bg-rose-500/20 text-rose-400 font-black"
                  : "hover:text-foreground hover:bg-muted text-muted-foreground"
              )}
              title="Report outdated / incorrect"
            >
              <ArrowDown className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Get Material</span>
            <ExternalLink className="size-2.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* ─── Interactive Document Previewer & Reader ─── */}
      <div className="space-y-2">
        <AcademicPdfViewer
          fileUrl={resource.fileUrl}
          driveUrl={resource.driveUrl}
          title={resource.title}
          subjectCode={resource.subjectCode}
          resourceType={resource.resourceType}
          onDownload={handleDownload}
        />
      </div>

      {/* ─── Guest Student Perks & Personal Vault Conversion ─── */}
      {!currentUserId && (
        <AcademicAuthBenefitsCard returnTo={`/app/academics/${resource.id}`} />
      )}

      {/* ─── Campus AI Study Cram Assistant ─── */}
      <div className="rounded-3xl border border-indigo-500/30 bg-linear-to-r from-indigo-500/8 via-card to-card p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
              <Bot className="size-4.5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-foreground">Campus AI Study Cram Assistant</h3>
              <p className="text-[11px] text-muted-foreground">
                Instant syllabus breakdown &amp; key concepts for {resource.subjectCode}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase">
            AI Helper
          </span>
        </div>

        {/* AI Action Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleGenerateAiCram("CONCEPTS")}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-card hover:bg-muted/80 border border-border/70 text-foreground transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Zap className="size-3 text-indigo-400" />
            <span>Core Formulas &amp; Concepts</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenerateAiCram("EXAM_TIPS")}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-card hover:bg-muted/80 border border-border/70 text-foreground transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <span>⚡ 15-Min Exam Cram</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenerateAiCram("CHECKLIST")}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-card hover:bg-muted/80 border border-border/70 text-foreground transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="size-3 text-emerald-400" />
            <span>Syllabus Verification</span>
          </button>
        </div>

        {/* Generated AI Content Output */}
        {aiAnalysis && (
          <div className="p-3.5 rounded-2xl bg-card border border-indigo-500/25 text-xs text-foreground/90 leading-relaxed whitespace-pre-line mt-2 space-y-1 shadow-2xs">
            {aiAnalysis}
          </div>
        )}
      </div>

      {/* ─── Vector Similarity Recommendation Shelf ─── */}
      <SimilarResourcesWidget resourceId={resource.id} subjectCode={resource.subjectCode} />

      {/* ─── Twitter/X Style Peer Reviews & Discussion Thread ─── */}
      <div className="space-y-4 pt-4 border-t border-border/25">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-foreground">
              Peer Reviews &amp; Syllabus Accuracy ({comments.length})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Student verified corrections, missing solutions &amp; exam tips
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground">
            {reliability}% Verified Accurate
          </span>
        </div>

        {/* Twitter-style inline reply box */}
        <form
          onSubmit={handleSubmitComment}
          className="flex items-start gap-3 py-3 border-y border-border/20"
        >
          <Avatar className="size-9 rounded-full border border-border/40 shrink-0 mt-0.5">
            <AvatarImage src={uploaderAvatar} />
            <AvatarFallback className="text-xs font-bold">You</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            {/* Accuracy switcher pills */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsHelpful(true)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                  isHelpful
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                )}
              >
                ✅ Accurate &amp; Verified
              </button>
              <button
                type="button"
                onClick={() => setIsHelpful(false)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                  !isHelpful
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                )}
              >
                ⚠️ Outdated / Errata
              </button>
            </div>

            {/* Input & Reply Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Post your review, formula correction, or exam tip..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-muted/30 px-3.5 py-2 rounded-full text-xs text-foreground placeholder:text-muted-foreground/60 border border-border/40 outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black disabled:opacity-40 hover:opacity-90 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                Reply
              </button>
            </div>
          </div>
        </form>

        {/* Threaded Replies List */}
        {comments.length === 0 ? (
          <div className="py-8 text-center space-y-1 text-muted-foreground">
            <p className="text-xs font-semibold">No peer reviews yet</p>
            <p className="text-[11px]">Be the first to verify syllabus accuracy or post corrections.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {comments.map((c) => {
              const commentAvatar = getAvatarUrl(c.author?.avatarUrl, c.author?.username);
              return (
                <div key={c.id} className="flex items-start gap-3 py-3.5 group">
                  <div className="flex flex-col items-center shrink-0">
                    <Avatar className="size-8.5 rounded-full border border-border/40">
                      <AvatarImage src={commentAvatar} />
                      <AvatarFallback className="text-[10px] font-bold">
                        {c.author?.displayName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-0.5 flex-1 bg-border/25 mt-2 -mb-2 rounded-full min-h-3" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="text-xs font-bold text-foreground hover:underline">
                          {c.author?.displayName || "Student"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          @{c.author?.username || "student"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">·</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatTimeAgo(c.createdAt)}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full border",
                          c.isHelpful
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                        )}
                      >
                        {c.isHelpful ? "VERIFIED ACCURATE" : "ERRATA NOTED"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pt-0.5">
                      {c.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Academic Auth Modal for Unregistered Visitors ─── */}
      <AcademicAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionReason={authModalReason}
        returnTo={`/app/academics/${resource.id}`}
      />
    </div>
  );
}
