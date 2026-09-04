"use client";

import { ArrowUpRight, BookOpen, Clock, Eye, QrCode, ShieldCheck, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandedQrModal } from "@/components/common/branded-qr-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    excerpt?: string | null;
    coverImageUrl?: string | null;
    category?: string | null;
    tags?: string[] | null;
    readingTimeMinutes?: number | null;
    viewsCount?: number | null;
    upvotesCount?: number | null;
    publishedAt?: Date | string | null;
    author?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      points?: number | null;
      branch?: string | null;
      institution?: {
        name: string;
        shortName?: string | null;
      } | null;
    } | null;
    institution?: {
      name: string;
    } | null;
  };
  featured?: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  GENERAL: { label: "General", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  TECH_AND_CODE: { label: "Tech & Code", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  PLACEMENTS: { label: "Placements", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  CAMPUS_LIFE: { label: "Campus Life", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  RESEARCH: { label: "Research", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  INTERNSHIPS: { label: "Internships", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  PROJECTS: { label: "Projects", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  GUIDES: { label: "Guides", color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  OPINION: { label: "Opinion", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
};

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const [showQrModal, setShowQrModal] = useState(false);

  const catInfo = CATEGORY_LABELS[article.category || "GENERAL"] || CATEGORY_LABELS.GENERAL;
  const authorName = article.author?.displayName || "Campus Writer";
  const authorUsername = article.author?.username || "student";
  const isVerified = (article.author?.points || 0) >= 150;
  const collegeShort =
    article.institution?.name?.split(",")[0] || article.author?.institution?.name?.split(",")[0] || "Campus";

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    : "Recent";

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/40 bg-card/60 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-xl select-none",
          featured ? "md:grid md:grid-cols-12 md:gap-6" : ""
        )}
      >
        {/* Cover Image */}
        <Link
          href={`/app/articles/${article.slug}`}
          className={cn(
            "relative block overflow-hidden bg-muted/40",
            featured ? "md:col-span-6 aspect-16/10 md:aspect-auto md:h-full" : "aspect-16/9 w-full"
          )}
        >
          {article.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/15 via-purple-500/10 to-indigo-500/5 p-6">
              <BookOpen className="size-12 text-primary/30 group-hover:scale-110 transition-transform" />
            </div>
          )}

          {/* Category Tag Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-xs",
                catInfo.color
              )}
            >
              {catInfo.label}
            </span>
          </div>

          {/* Reading Time Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
            <Clock className="size-3" />
            <span>{article.readingTimeMinutes || 3} min</span>
          </div>
        </Link>

        {/* Content Details */}
        <div
          className={cn("flex flex-1 flex-col justify-between p-5", featured ? "md:col-span-6 md:p-6" : "")}
        >
          <div className="space-y-2.5">
            {/* Author Header */}
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/@${authorUsername}`}
                className="flex items-center gap-2 min-w-0 hover:opacity-85 transition-opacity"
              >
                <Avatar className="size-6 shrink-0 border border-border/40">
                  <AvatarImage src={article.author?.avatarUrl || ""} />
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {authorName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                    <span>{authorName}</span>
                    {isVerified && <ShieldCheck className="size-3 text-[#a170ff] shrink-0" />}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    @{authorUsername} · {collegeShort}
                  </p>
                </div>
              </Link>

              <span className="text-[10px] text-muted-foreground/80 font-medium shrink-0">
                {formattedDate}
              </span>
            </div>

            {/* Title & Excerpt */}
            <Link
              href={`/app/articles/${article.slug}`}
              className="block group-hover:text-primary transition-colors"
            >
              <h3
                className={cn(
                  "font-black text-foreground tracking-tight line-clamp-2 leading-snug",
                  featured ? "text-lg md:text-xl" : "text-base"
                )}
              >
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
            </Link>

            {/* Tags preview */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-muted-foreground/80 bg-muted/40 px-2 py-0.5 rounded-md"
                  >
                    #{tag.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Metrics & Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3">
            <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1">
                <ThumbsUp className="size-3 text-primary" />
                <span>{article.upvotesCount || 0}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                <span>{article.viewsCount || 0}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                title="Share Cute QR Code"
                className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <QrCode className="size-3.5" />
              </button>

              <Link
                href={`/app/articles/${article.slug}`}
                className="flex items-center gap-1 text-xs font-black text-primary hover:underline pl-1 cursor-pointer"
              >
                <span>Read</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Cute Branded QR Code Modal */}
      <BrandedQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={article.title}
        subtitle={`By @${authorUsername} • ${article.readingTimeMinutes || 3} min read`}
        badgeText="Campus Article"
        shortUrl={`https://campusloop.space/a/${article.slug}`}
        category="article"
      />
    </>
  );
}
