"use client";

import { ArrowLeft, Bookmark, Edit3, Heart, MessageSquare, QrCode, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArticleCommentsSection } from "@/components/articles/article-comments-section";
import { BrandedQrModal } from "@/components/common/branded-qr-modal";
import { MarkdownContent } from "@/components/common/markdown-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

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
  const _router = useRouter();

  const [userVote, setUserVote] = useState(initialUserVote);
  const [upvotes, setUpvotes] = useState(article.upvotesCount || 0);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowingAuthor);
  const [showQrModal, setShowQrModal] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const isOwner = currentProfile?.id === article.authorId || currentProfile?.role === "ADMIN";

  // Track reading scroll progress
  useEffect(() => {
    function handleScroll() {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleVote(value: number) {
    sounds.tap();
    haptics.medium();

    const previousVote = userVote;
    const nextVote = previousVote === value ? 0 : value;

    setUserVote(nextVote);
    setUpvotes((prev) => prev + (nextVote === 1 ? 1 : previousVote === 1 ? -1 : 0));

    try {
      const res = await fetch(`/api/articles/${article.slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: nextVote }),
      });
      if (!res.ok) throw new Error();
      if (nextVote === 1) {
        sounds.tap();
      }
    } catch {
      setUserVote(previousVote);
      setUpvotes((prev) => prev + (previousVote === 1 ? 1 : nextVote === 1 ? -1 : 0));
      toast.error("Failed to update reaction");
    }
  }

  async function handleToggleFollow() {
    if (!currentProfile) {
      toast.error("Please sign in to follow authors");
      return;
    }
    if (currentProfile.id === article.authorId) return;

    sounds.tap();
    haptics.light();
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    try {
      const res = await fetch(`/api/users/${article.author?.username}/follow`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success(nextState ? `Followed @${article.author?.username} ✨` : "Unfollowed");
    } catch {
      setIsFollowing(!nextState);
      toast.error("Failed to update follow status");
    }
  }

  const shortShareUrl = `https://campusloop.space/a/${article.slug}`;

  return (
    <div className="relative min-h-screen bg-background pb-32 select-none">
      {/* ─── Top Reading Progress Bar ─── */}
      <div
        className="fixed top-14 left-0 h-1 bg-primary z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 space-y-8">
        {/* ─── Top Category & Back Row ─── */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <Link
            href="/app/articles"
            className="flex items-center gap-1.5 font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Campus Editorial</span>
          </Link>

          <div className="flex items-center gap-2">
            {article.category && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider border border-primary/20">
                {article.category.replace("_", " ")}
              </span>
            )}
            {isOwner && (
              <Link
                href={`/app/articles/${article.slug}/edit`}
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-colors"
              >
                <Edit3 className="size-3" />
                <span>Edit</span>
              </Link>
            )}
          </div>
        </div>

        {/* ─── Article Header (Medium / Hashnode Headline) ─── */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
              {article.subtitle}
            </p>
          )}

          {/* Author Byline Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-y border-border/30 py-4">
            <div className="flex items-center gap-3">
              <Link href={`/@${article.author?.username}`}>
                <Avatar className="size-11 border-2 border-primary/40 shadow-xs">
                  <AvatarImage src={article.author?.avatarUrl || ""} />
                  <AvatarFallback className="text-sm font-bold bg-muted text-foreground">
                    {article.author?.displayName?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/@${article.author?.username}`}
                    className="text-sm font-black text-foreground hover:underline"
                  >
                    {article.author?.displayName}
                  </Link>
                  {currentProfile?.id !== article.authorId && (
                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      className={cn(
                        "text-xs font-bold transition-colors cursor-pointer",
                        isFollowing
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-primary hover:underline"
                      )}
                    >
                      {isFollowing ? "Following" : "· Follow"}
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                  {article.institution?.name && <span>{article.institution.name.split(",")?.[0]} ·</span>}
                  <span>{article.readingTimeMinutes || 4} min read ·</span>
                  <span>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Share Triggers */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/50 bg-muted/40 hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Download QR Card"
              >
                <QrCode className="size-3.5" />
                <span>QR Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shortShareUrl);
                  toast.success("Short link copied! 📋");
                }}
                className="p-2 rounded-full border border-border/50 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Copy share link"
              >
                <Share2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Cover Image ─── */}
        {article.coverImageUrl && (
          <div className="overflow-hidden rounded-3xl border border-border/40 shadow-sm">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* ─── Long-Form Markdown / Content Body ─── */}
        <div className="pt-2 text-foreground">
          <MarkdownContent content={article.content} />
        </div>

        {/* ─── Tags Strip ─── */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 border-t border-border/30">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/app/articles?tag=${tag}`}
                className="px-3.5 py-1.5 rounded-2xl bg-muted/50 hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground border border-border/40 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* ─── Author Bio Card ─── */}
        <div className="rounded-3xl border border-border/30 bg-card p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar className="size-14 border border-border/40">
                <AvatarImage src={article.author?.avatarUrl || ""} />
                <AvatarFallback className="text-base font-bold">
                  {article.author?.displayName?.[0] || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base font-black text-foreground">
                  Written by {article.author?.displayName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  @{article.author?.username} · {article.author?.points || 0} Loop Points
                </p>
                {article.author?.bio && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.author.bio}</p>
                )}
              </div>
            </div>

            {currentProfile?.id !== article.authorId && (
              <button
                type="button"
                onClick={handleToggleFollow}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 shrink-0",
                  isFollowing
                    ? "border border-border/60 bg-muted hover:bg-muted/80 text-foreground"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                )}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* ─── Threaded Comments & Replies ─── */}
        <div className="pt-6">
          <ArticleCommentsSection articleSlug={article.slug} currentProfile={currentProfile} />
        </div>

        {/* ─── Recommended Reads ─── */}
        {relatedArticles.length > 0 && (
          <div className="pt-8 space-y-4 border-t border-border/30">
            <h3 className="text-lg font-black text-foreground">More from CampusLoop</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/app/articles/${rel.slug}`}
                  className="rounded-2xl border border-border/40 bg-card p-4 space-y-2 hover:border-primary/40 transition-all group block shadow-2xs"
                >
                  <h4 className="text-sm font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{rel.excerpt || rel.subtitle}</p>
                  <p className="text-[11px] text-muted-foreground pt-1 font-semibold">
                    By @{rel.author?.username} · {rel.readingTimeMinutes || 3} min read
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* ─── Sticky Bottom Floating Reading Bar ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full border border-border/50 bg-background/90 px-4 py-2 shadow-2xl backdrop-blur-2xl">
        <button
          type="button"
          onClick={() => handleVote(1)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer active:scale-90",
            userVote === 1
              ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart
            className={cn("size-4", userVote === 1 && "fill-rose-500 text-rose-500")}
            fill={userVote === 1 ? "currentColor" : "none"}
          />
          <span>{upvotes}</span>
        </button>

        <div className="h-4 w-px bg-border/40 mx-1" />

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("discussion-comments");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <MessageSquare className="size-4" />
          <span>Discuss</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsBookmarked(!isBookmarked);
            toast.success(isBookmarked ? "Removed from reading list" : "Saved to reading list 🔖");
          }}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Save to reading list"
        >
          <Bookmark className={cn("size-4", isBookmarked && "fill-primary text-primary")} />
        </button>

        <button
          type="button"
          onClick={() => setShowQrModal(true)}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Download QR Card"
        >
          <QrCode className="size-4" />
        </button>
      </div>

      {/* ─── Branded QR Modal ─── */}
      <BrandedQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={article.title}
        subtitle={`By @${article.author?.username} · ${article.institution?.name?.split(",")?.[0] || "CampusLoop"}`}
        badgeText="Verified Student Editorial"
        shortUrl={shortShareUrl}
        category="article"
        avatarUrl={article.author?.avatarUrl}
      />
    </div>
  );
}
