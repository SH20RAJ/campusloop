"use client";

import { ArticleCard } from "@/components/articles/article-card";
import { ArticleCommentsSection } from "@/components/articles/article-comments-section";
import { BrandedQrModal } from "@/components/common/branded-qr-modal";
import { MarkdownContent } from "@/components/common/markdown-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Copy,
  Edit3,
  Eye,
  Flame,
  Globe,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ArticleReaderClientProps {
  article: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    content: string;
    excerpt?: string | null;
    coverImageUrl?: string | null;
    category?: string | null;
    tags?: string[] | null;
    readingTimeMinutes?: number | null;
    viewsCount?: number | null;
    upvotesCount?: number | null;
    downvotesCount?: number | null;
    publishedAt?: Date | string | null;
    createdAt: Date | string;
    authorId: string;
    author?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      bio?: string | null;
      branch?: string | null;
      course?: string | null;
      points?: number | null;
      institution?: {
        name: string;
        slug: string;
      } | null;
    } | null;
    institution?: {
      name: string;
      slug: string;
    } | null;
  };
  currentProfile?: {
    id: string;
    username: string;
    role?: string | null;
  } | null;
  initialUserVote?: number;
  initialIsFollowingAuthor?: boolean;
  relatedArticles?: any[];
}

export function ArticleReaderClient({
  article,
  currentProfile,
  initialUserVote = 0,
  initialIsFollowingAuthor = false,
  relatedArticles = [],
}: ArticleReaderClientProps) {
  const router = useRouter();

  const [userVote, setUserVote] = useState(initialUserVote);
  const [upvotes, setUpvotes] = useState(article.upvotesCount || 0);
  const [downvotes, setDownvotes] = useState(article.downvotesCount || 0);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowingAuthor);
  const [showQrModal, setShowQrModal] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isOwner = currentProfile?.id === article.authorId || currentProfile?.role === "ADMIN";
  const authorName = article.author?.displayName || "Student Writer";
  const authorUsername = article.author?.username || "student";
  const isVerified = (article.author?.points || 0) >= 150;
  const collegeName = article.institution?.name || article.author?.institution?.name || "Campus";

  // Track scroll progress for top reading bar
  useEffect(() => {
    function handleScroll() {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentProgress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleVote(value: 1 | -1) {
    if (!currentProfile) {
      toast.info("Please sign in to upvote articles");
      return;
    }

    sounds.pop();
    haptics.light();

    const previousVote = userVote;
    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;

    // Optimistic UI update
    if (userVote === value) {
      // Toggle off
      setUserVote(0);
      if (value === 1) setUpvotes((u) => Math.max(0, u - 1));
      if (value === -1) setDownvotes((d) => Math.max(0, d - 1));
    } else {
      setUserVote(value);
      if (value === 1) {
        setUpvotes((u) => u + 1);
        if (previousVote === -1) setDownvotes((d) => Math.max(0, d - 1));
      } else {
        setDownvotes((d) => d + 1);
        if (previousVote === 1) setUpvotes((u) => Math.max(0, u - 1));
      }
    }

    try {
      const res = await fetch(`/api/articles/${article.slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = (await res.json()) as Record<string, any>;
      if (!res.ok) throw new Error(data.error);

      setUserVote(data.userVote);
      setUpvotes(data.upvotesCount);
      setDownvotes(data.downvotesCount);
    } catch {
      setUserVote(previousVote);
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      toast.error("Failed to update vote");
    }
  }

  async function handleFollowToggle() {
    if (!currentProfile) {
      toast.info("Please sign in to follow authors");
      return;
    }

    const nextState = !isFollowing;
    setIsFollowing(nextState);
    haptics.light();

    try {
      if (nextState) {
        toast.success(`Following @${authorUsername}`);
        await fetch(`/api/profile/${authorUsername}/follow`, { method: "POST" });
      } else {
        toast.info(`Unfollowed @${authorUsername}`);
        await fetch(`/api/profile/${authorUsername}/follow`, { method: "DELETE" });
      }
    } catch {
      setIsFollowing(!nextState);
      toast.error("Failed to update follow status");
    }
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Published";

  return (
    <div className="min-h-screen pb-36 border-x border-border/30 bg-background max-w-3xl mx-auto select-none">
      {/* ─── Reading Progress Bar ─── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-linear-to-r from-primary via-purple-500 to-indigo-600 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ─── Top Header Bar ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Go back"
        >
          <ArrowLeft className="size-4.5" />
        </button>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href={`/app/articles/${article.slug}/edit`}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
            >
              <Edit3 className="size-3.5" />
              <span>Edit</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black transition-all cursor-pointer active:scale-95"
            title="Cute QR Code Share"
          >
            <QrCode className="size-3.5" />
            <span>QR Share</span>
          </button>
        </div>
      </header>

      <main className="p-5 md:p-8 space-y-7">
        {/* ─── Article Header ─── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-primary border border-primary/20">
              {article.category || "General"}
            </span>
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="size-3" />
              <span>{article.readingTimeMinutes || 3} min read</span>
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-base md:text-lg font-medium text-muted-foreground leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Author Card Header */}
          <div className="flex items-center justify-between gap-3 pt-2 border-y border-border/30 py-3.5">
            <Link
              href={`/@${authorUsername}`}
              className="flex items-center gap-3 min-w-0 group cursor-pointer"
            >
              <Avatar className="size-11 shrink-0 border-2 border-border/50">
                <AvatarImage src={article.author?.avatarUrl || ""} />
                <AvatarFallback className="text-sm font-black bg-primary/10 text-primary">
                  {authorName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors flex items-center gap-1 truncate">
                  <span>{authorName}</span>
                  {isVerified && <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />}
                </p>
                <p className="text-xs text-muted-foreground truncate font-medium">
                  @{authorUsername} · {collegeName.split(",")[0]}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              {currentProfile && currentProfile.id !== article.authorId && (
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollowToggle}
                  className={cn(
                    "h-8 px-3.5 rounded-full text-xs font-black transition-all cursor-pointer",
                    isFollowing
                      ? "border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                      : "bg-foreground text-background hover:opacity-90"
                  )}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Cover Image Banner ─── */}
        {article.coverImageUrl && (
          <div className="overflow-hidden rounded-3xl border border-border/40 bg-muted/30 shadow-md">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="aspect-[21/9] w-full object-cover"
            />
          </div>
        )}

        {/* ─── Article Body (Rich Typography) ─── */}
        <article className="select-text text-base leading-relaxed">
          <MarkdownContent content={article.content} />
        </article>

        {/* ─── Tags List ─── */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/app/search?q=${encodeURIComponent(tag)}`}
                className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
              >
                #{tag.replace(/^#/, "")}
              </Link>
            ))}
          </div>
        )}

        {/* ─── Author Bio Box ─── */}
        <div className="rounded-3xl border border-border/40 bg-card/60 p-6 space-y-4 mt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 border-2 border-primary/20">
                <AvatarImage src={article.author?.avatarUrl || ""} />
                <AvatarFallback className="text-lg font-black bg-primary/10 text-primary">
                  {authorName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-base font-black text-foreground flex items-center gap-1.5">
                  <span>Written by {authorName}</span>
                  {isVerified && <ShieldCheck className="size-4 text-blue-500" />}
                </h4>
                <p className="text-xs text-muted-foreground">
                  @{authorUsername} · {collegeName}
                </p>
              </div>
            </div>

            <Link
              href={`/@${authorUsername}`}
              className="px-3.5 py-1.5 rounded-full border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all shrink-0"
            >
              View Profile
            </Link>
          </div>

          {article.author?.bio && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {article.author.bio}
            </p>
          )}
        </div>

        {/* ─── Threaded Article Comments Section ─── */}
        <ArticleCommentsSection
          articleSlug={article.slug}
          currentProfile={currentProfile}
        />

        {/* ─── Related Articles ─── */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-border/30">
            <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <span>More Reads from Campus</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── Floating Bottom Reaction & Share Dock ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 rounded-full border border-border/50 bg-background/90 px-4 py-2 backdrop-blur-2xl shadow-2xl">
        {/* Upvote Button */}
        <button
          type="button"
          onClick={() => handleVote(1)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95",
            userVote === 1
              ? "bg-primary text-primary-foreground shadow-xs font-black"
              : "hover:bg-muted text-foreground"
          )}
        >
          <ThumbsUp className={cn("size-4", userVote === 1 && "fill-current")} />
          <span>{upvotes}</span>
        </button>

        {/* Downvote Button */}
        <button
          type="button"
          onClick={() => handleVote(-1)}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95",
            userVote === -1
              ? "bg-destructive/20 text-destructive font-black"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          title="Downvote"
        >
          <ThumbsDown className={cn("size-3.5", userVote === -1 && "fill-current")} />
        </button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Views Count */}
        <div className="flex items-center gap-1 px-2 text-xs font-bold text-muted-foreground">
          <Eye className="size-3.5" />
          <span>{article.viewsCount || 0}</span>
        </div>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* QR Share Modal Trigger */}
        <button
          type="button"
          onClick={() => setShowQrModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black transition-all cursor-pointer active:scale-95"
          title="Share Branded QR Card"
        >
          <QrCode className="size-4" />
          <span className="hidden sm:inline">QR Card</span>
        </button>

        {/* Native Share */}
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: article.title,
                text: `Read "${article.title}" by @${authorUsername} on CampusLoop!`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Article link copied! 📋");
            }
          }}
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Share Article"
        >
          <Share2 className="size-4" />
        </button>
      </div>

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
    </div>
  );
}
