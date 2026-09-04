"use client";

import { BookOpen, Download, ExternalLink, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { DeckAcademicResource } from "./deck-types";

interface DeckAcademicDropCardProps {
  resource: DeckAcademicResource;
}

export function DeckAcademicDropCard({ resource }: DeckAcademicDropCardProps) {
  const previewUrl = resource.slug
    ? `/app/academics/${resource.slug}`
    : `/app/academics`;

  function handleDownload() {
    const url = resource.fileUrl || resource.driveUrl;
    if (!url) {
      toast.error("File preview is loading...");
      return;
    }
    window.open(url, "_blank");
    toast.success("Opening document...");
  }

  return (
    <article className="relative w-full max-w-xl mx-auto rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl p-5 sm:p-6 flex flex-col justify-between max-h-[calc(100dvh-5rem)] overflow-y-auto no-scrollbar select-none transition-all">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <GraduationCap className="size-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-foreground">Academic Vault Drop 📚</h3>
              <p className="text-[11px] text-muted-foreground">{resource.institutionName || "Campus Study Vault"}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20 uppercase">
            {resource.resourceType || "Notes"}
          </span>
        </div>

        {/* Resource Hero Container */}
        <div className="p-4 rounded-2xl border border-border/50 bg-gradient-to-br from-amber-500/10 via-transparent to-primary/5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-foreground/10 text-foreground">
              {resource.subjectCode}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {resource.branch} · Sem {resource.semester}
            </span>
          </div>

          <h4 className="font-black text-base text-foreground leading-snug">
            {resource.title || resource.subjectName}
          </h4>

          <p className="text-xs text-muted-foreground line-clamp-2">
            Subject: <strong className="text-foreground">{resource.subjectName}</strong>. Complete exam-ready materials, solutions, and lab references verified by campus seniors.
          </p>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Download className="size-3 text-primary" /> {resource.downloadsCount || 0} downloads
            </span>
            <span>·</span>
            <span>Zero login required to view</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <Link
            href={previewUrl}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all shadow-xs"
          >
            <BookOpen className="size-3.5" />
            <span>Open &amp; Read PDF</span>
          </Link>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs transition-colors cursor-pointer"
          >
            <ExternalLink className="size-3.5" />
            <span>Direct Link</span>
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <div className="pt-4 border-t border-border/30 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
        <span>Swipe down to continue your loop</span>
        <span className="text-primary font-bold">↓</span>
      </div>
    </article>
  );
}
