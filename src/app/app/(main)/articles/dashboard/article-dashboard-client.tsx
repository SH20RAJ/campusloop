"use client";

import { BrandedQrModal } from "@/components/common/branded-qr-modal";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  Edit3,
  Eye,
  FileEdit,
  FileText,
  Flame,
  LayoutDashboard,
  PenTool,
  Plus,
  QrCode,
  Share2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ArticleDashboardClientProps {
  publishedArticles: any[];
  draftArticles: any[];
  stats: {
    totalViews: number;
    totalUpvotes: number;
    publishedCount: number;
    draftsCount: number;
  };
}

export function ArticleDashboardClient({
  publishedArticles: initialPublished,
  draftArticles: initialDrafts,
  stats: initialStats,
}: ArticleDashboardClientProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");
  const [published, setPublished] = useState(initialPublished);
  const [drafts, setDrafts] = useState(initialDrafts);
  const [selectedArticleForQr, setSelectedArticleForQr] = useState<any | null>(null);

  async function handleDelete(article: any) {
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return;

    haptics.medium();
    try {
      const res = await fetch(`/api/articles/${article.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Article deleted");
      if (article.status === "PUBLISHED") {
        setPublished((prev) => prev.filter((a) => a.id !== article.id));
      } else {
        setDrafts((prev) => prev.filter((a) => a.id !== article.id));
      }
    } catch {
      toast.error("Failed to delete article");
    }
  }

  const currentList = activeTab === "published" ? published : drafts;

  return (
    <div className="min-h-screen pb-28 border-x border-border/30 bg-background max-w-4xl mx-auto select-none">
      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/app/articles")}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Back to Articles Hub"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-4 text-primary" />
            <h1 className="text-base font-black text-foreground tracking-tight">
              Articles Dashboard
            </h1>
          </div>
        </div>

        <Link
          href="/app/articles/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="size-3.5 stroke-[3]" />
          <span>New Article</span>
        </Link>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* ─── Stats Overview Grid ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-border/40 bg-card/60 p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold">Total Reads</span>
              <Eye className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-black text-foreground">{initialStats.totalViews}</p>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/60 p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold">Total Upvotes</span>
              <ThumbsUp className="size-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-foreground">{initialStats.totalUpvotes}</p>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/60 p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold">Published</span>
              <BookOpen className="size-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-foreground">{initialStats.publishedCount}</p>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/60 p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-bold">Drafts</span>
              <FileEdit className="size-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-foreground">{initialStats.draftsCount}</p>
          </div>
        </div>

        {/* ─── Tab Switcher ─── */}
        <div className="flex items-center justify-between border-b border-border/30 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveTab("published");
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "published"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              Published ({published.length})
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveTab("drafts");
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "drafts"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              Drafts ({drafts.length})
            </button>
          </div>
        </div>

        {/* ─── Articles List ─── */}
        {currentList.length > 0 ? (
          <div className="divide-y divide-border/20 space-y-3">
            {currentList.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 pb-2 rounded-2xl hover:bg-muted/20 p-3 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {item.category || "General"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {item.readingTimeMinutes || 3} min read
                    </span>
                    {item.status === "DRAFT" && (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        Draft
                      </span>
                    )}
                  </div>

                  <Link
                    href={
                      item.status === "PUBLISHED"
                        ? `/app/articles/${item.slug}`
                        : `/app/articles/${item.slug}/edit`
                    }
                    className="text-base font-black text-foreground hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                  >
                    {item.title}
                  </Link>

                  {item.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.excerpt}
                    </p>
                  )}

                  {item.status === "PUBLISHED" && (
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3" />
                        <span>{item.viewsCount || 0} reads</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="size-3 text-primary" />
                        <span>{item.upvotesCount || 0} upvotes</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "PUBLISHED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedArticleForQr(item)}
                        className="flex size-8 items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Cute QR Code Share"
                      >
                        <QrCode className="size-3.5" />
                      </button>

                      <Link
                        href={`/app/articles/${item.slug}`}
                        className="flex size-8 items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="View Article"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </>
                  )}

                  <Link
                    href={`/app/articles/${item.slug}/edit`}
                    className="flex size-8 items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Edit Article"
                  >
                    <Edit3 className="size-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="flex size-8 items-center justify-center rounded-xl border border-border/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    title="Delete Article"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-border/60 p-8">
            <FileText className="size-10 text-muted-foreground/40" />
            <p className="text-xs font-bold text-foreground">
              {activeTab === "published" ? "No published articles yet" : "No drafts saved"}
            </p>
            <Link
              href="/app/articles/new"
              className="px-4 py-2 rounded-full bg-primary text-white text-xs font-black hover:opacity-95 transition-all shadow-sm"
            >
              Write an Article
            </Link>
          </div>
        )}
      </div>

      {/* Cute Branded QR Code Modal */}
      {selectedArticleForQr && (
        <BrandedQrModal
          isOpen={Boolean(selectedArticleForQr)}
          onClose={() => setSelectedArticleForQr(null)}
          title={selectedArticleForQr.title}
          subtitle={`${selectedArticleForQr.readingTimeMinutes || 3} min read • Verified Student Article`}
          badgeText="Campus Article"
          shortUrl={`https://campusloop.space/a/${selectedArticleForQr.slug}`}
          category="article"
        />
      )}
    </div>
  );
}
