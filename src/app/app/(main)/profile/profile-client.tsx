"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Shield,
  MessageSquare,
  Copy,
  Trophy,
  Edit3,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  MapPin,
  TrendingUp,
  Upload,
  Loader2,
  ArrowLeft,
  Share2,
  Camera,
  Check,
  Flame,
  Calendar,
  Sparkles,
  X,
  Eye,
  Move,
} from "lucide-react";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { toast } from "sonner";
import type { FeedPost } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import { getCloutTier } from "@/lib/gamification";
import { slugifyBranch, getBranchIcon } from "@/lib/academic-constants";

interface ProfileClientViewProps {
  profile: {
    id: string;
    username: string;
    displayName: string;
    officialName?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    headline?: string | null;
    bio?: string | null;
    gender?: string | null;
    dob?: string | null;
    isDobPrivate?: boolean | null;
    course?: string | null;
    branch?: string | null;
    year?: number | null;
    points?: number | null;
    role?: string | null;
    status?: string | null;
    photos?: string[] | null;
    interests?: string[] | null;
    referralCount?: number | null;
    createdAt?: Date | string | null;
    institution?: {
      id: string;
      name: string;
      slug: string;
      state?: string | null;
      district?: string | null;
    } | null;
  };
  formattedPosts: FeedPost[];
  isOwnProfile: boolean;
  currentUserId?: string;
}

export function ProfileClientView({
  profile,
  formattedPosts: initialPosts,
  isOwnProfile,
  currentUserId,
}: ProfileClientViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "photos" | "clout">("posts");
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showPhotoLightbox, setShowPhotoLightbox] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const pfpInputRef = useRef<HTMLInputElement | null>(null);

  // Crop Modal States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropMode, setCropMode] = useState<"avatar" | "banner">("avatar");

  // ─── Infinite Scroll for Profile Posts ───
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setHasMore(initialPosts.length >= 20);
  }, [initialPosts]);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(`/api/feed?authorId=${profile.id}&page=${nextPage}&limit=20`);
      if (!res.ok) throw new Error("Failed to load more posts");
      const newPosts = (await res.json()) as FeedPost[];

      if (newPosts.length === 0 || newPosts.length < 20) {
        setHasMore(false);
      }

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, profile.id]);

  useEffect(() => {
    const sentinel = observerRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.2, rootMargin: "100px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMorePosts]);

  const points = profile.points || 0;
  const referrals = profile.referralCount || 0;
  const tier = getCloutTier(points);

  const candidatePhotos =
    profile.photos && profile.photos.length > 0
      ? profile.photos
      : profile.avatarUrl
      ? [profile.avatarUrl]
      : [];

  const branchSlug = profile.branch ? slugifyBranch(profile.branch) : null;
  const branchIcon = getBranchIcon(profile.branch || profile.course);

  const institutionName = profile.institution?.name || "Indian Institute of Technology";
  const campusShort = institutionName.split(",")[0];
  const campusLocation = profile.institution?.state
    ? `${profile.institution.district || ""}, ${profile.institution.state}`
    : "India";

  function handleCopyHandle() {
    const handleUrl = `https://campusloop.space/@${profile.username}`;
    navigator.clipboard.writeText(handleUrl);
    setCopiedHandle(true);
    toast.success(`Copied profile link: ${handleUrl}`);
    setTimeout(() => setCopiedHandle(false), 2000);
  }

  function handleShareVibe() {
    const branchText = profile.branch ? `• Discipline: ${profile.branch}\n` : "";
    const shareText = `⚡️ Connect with @${profile.username} on CampusLoop:\n• Campus: ${campusShort}\n${branchText}• Clout Rank: ${tier.tierName} (Level ${tier.level})\n• Loop Points: ${points} LP 🔥\n\nView student profile: https://campusloop.space/@${profile.username}`;

    navigator.clipboard.writeText(shareText);
    toast.success("Profile link & Vibe Card copied! Share on WhatsApp 🚀");
  }

  function handleBannerFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropImageUrl(reader.result);
        setCropMode("banner");
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  }

  function handlePfpFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropImageUrl(reader.result);
        setCropMode("avatar");
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (pfpInputRef.current) pfpInputRef.current.value = "";
  }

  async function handleCropCompleted(croppedUrl: string) {
    if (cropMode === "banner") {
      try {
        await fetch("/api/profile/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bannerUrl: croppedUrl }),
        });
        toast.success("Cover banner updated! 🎨");
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await fetch("/api/profile/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: croppedUrl }),
        });
        toast.success("Profile photo updated! 📸");
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <div className="min-h-screen pb-24 text-foreground select-none">
      {/* Image Crop & Resize Modal */}
      {cropModalOpen && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageUrl={cropImageUrl}
          mode={cropMode}
          onCropComplete={handleCropCompleted}
        />
      )}

      {/* Hidden Banner File Input */}
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleBannerFileSelected}
      />

      {/* Hidden PFP File Input */}
      <input
        ref={pfpInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePfpFileSelected}
      />

      {/* ─── Sticky Minimal Top Header Bar ─── */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-xs">
        <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" /> Back
          </button>

          <h1 className="text-xs font-black text-foreground tracking-tight flex items-center gap-1">
            <span>@{profile.username}</span>
            {points >= 150 && (
              <span className="text-blue-500 font-bold" title="Verified Student">
                ✓
              </span>
            )}
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareVibe}
              className="flex items-center gap-1 text-[11px] font-bold text-foreground hover:text-primary transition-colors cursor-pointer bg-muted/40 hover:bg-muted px-2.5 py-1 rounded-xl border border-border/60"
            >
              <Share2 className="size-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      <main className="space-y-4 max-w-2xl mx-auto px-3 sm:px-4 pt-3">
        {/* ─── LinkedIn-Style Profile Hero Card ─── */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          {/* Cover Banner Photo */}
          <div className="relative h-32 sm:h-44 w-full bg-gradient-to-r from-orange-500/25 via-primary/30 to-amber-500/25 overflow-hidden">
            {profile.bannerUrl ? (
              <img
                src={profile.bannerUrl}
                alt="Profile Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            )}

            {/* Banner Change Button for Owner */}
            {isOwnProfile && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {profile.bannerUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCropImageUrl(profile.bannerUrl || "");
                      setCropMode("banner");
                      setCropModalOpen(true);
                    }}
                    className="size-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md"
                    title="Reposition / Crop Banner"
                  >
                    <Move className="size-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="size-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md"
                  title="Change cover banner"
                >
                  <Camera className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Profile Header Main Info (Overlapping Avatar) */}
          <div className="px-5 pb-5 pt-0 relative space-y-4">
            {/* Avatar & Action Buttons Row */}
            <div className="flex items-end justify-between -mt-14 sm:-mt-16 gap-3">
              {/* Clickable Profile Picture */}
              <div className="relative group">
                <div
                  onClick={() => {
                    if (isOwnProfile) setShowAvatarMenu(true);
                  }}
                  className="relative size-24 sm:size-28 rounded-full border-4 border-card shadow-2xl cursor-pointer overflow-hidden bg-background group-hover:opacity-95 transition-opacity"
                >
                  <Avatar className="size-full">
                    <AvatarImage src={profile.avatarUrl || ""} />
                    <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                      {profile.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Camera overlay indicator on hover */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="size-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Verified Blue Star Badge */}
                {points >= 150 && (
                  <span
                    className="absolute bottom-1 right-1 size-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-card text-xs font-black"
                    title="Verified Campus Star (150+ LP)"
                  >
                    ✓
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pb-1">
                {isOwnProfile ? (
                  <>
                    <Link
                      href="/app/profile/edit"
                      className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary text-primary-foreground h-9 px-4 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <Edit3 className="size-3.5" /> Edit Profile
                    </Link>

                    <SignOutButton
                      variant="icon"
                      className="flex items-center justify-center rounded-2xl border border-border/70 bg-muted/20 size-9 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    />
                  </>
                ) : (
                  <Link
                    href={`/app/chat?userId=${profile.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary text-primary-foreground h-9 px-5 text-xs font-bold shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    <MessageSquare className="size-3.5" /> Message
                  </Link>
                )}
              </div>
            </div>

            {/* Name, Headline & College Details */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {profile.displayName}
                </h2>
                {profile.role === "ADMIN" && (
                  <span className="rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[9px] font-black px-2 py-0.5 flex items-center gap-1">
                    <Shield className="size-3" /> ADMIN
                  </span>
                )}
                <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-2.5 py-0.5">
                  {tier.tierName} (Lvl {tier.level})
                </span>
              </div>

              {/* Headline / Student One-Liner */}
              <p className="text-xs sm:text-sm font-semibold text-foreground/90 leading-snug">
                {profile.headline ||
                  (profile.branch && profile.course
                    ? `${profile.course} in ${profile.branch} @ ${campusShort}`
                    : `Student @ ${campusShort}`)}
              </p>

              {/* Handle & Location row */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5 font-medium">
                <button
                  type="button"
                  onClick={handleCopyHandle}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Click to copy handle"
                >
                  <span>@{profile.username}</span>
                  {copiedHandle ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                </button>

                <span>•</span>

                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-muted-foreground/70" /> {campusLocation}
                </span>

                <span>•</span>

                <span className="text-primary font-bold flex items-center gap-1">
                  <Flame className="size-3 text-rose-500" /> {points} Loop Points
                </span>
              </div>
            </div>

            {/* Quick Stats Pill Bar */}
            <div className="flex items-center gap-4 py-2 px-3.5 rounded-2xl bg-muted/30 border border-border/50 text-xs font-semibold text-muted-foreground">
              <span className="text-foreground">
                <strong className="text-foreground font-black">{posts.length}</strong> Posts
              </span>
              <span>•</span>
              <span className="text-foreground">
                <strong className="text-foreground font-black">{candidatePhotos.length}</strong> Photos
              </span>
              <span>•</span>
              <span className="text-foreground">
                <strong className="text-foreground font-black">{referrals}</strong> Invited Peers
              </span>
            </div>
          </div>
        </div>

        {/* ─── LinkedIn-Style Education & Academic Card ─── */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="size-4 text-primary" /> Campus & Academic Discipline
            </h3>
            {isOwnProfile && (
              <Link href="/app/profile/edit" className="text-muted-foreground hover:text-primary transition-colors">
                <Edit3 className="size-3.5" />
              </Link>
            )}
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-xl shrink-0 shadow-2xs">
              {branchIcon}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              {profile.institution && (
                <Link
                  href={`/app/college/${profile.institution.slug || profile.institution.id}`}
                  className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors block truncate"
                >
                  {institutionName}
                </Link>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                {profile.course && <span>{profile.course}</span>}
                {profile.course && profile.branch && <span>·</span>}
                {profile.branch && branchSlug && (
                  <Link
                    href={`/app/branch/${branchSlug}`}
                    className="text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>{profile.branch}</span>
                    <ArrowUpRight className="size-3" />
                  </Link>
                )}
              </div>

              {profile.year && (
                <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 pt-0.5">
                  <Calendar className="size-3" /> Year {profile.year} Student
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── LinkedIn-Style About & Bio Card ─── */}
        {profile.bio && (
          <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-primary" /> About
              </h3>
              {isOwnProfile && (
                <Link href="/app/profile/edit" className="text-muted-foreground hover:text-primary transition-colors">
                  <Edit3 className="size-3.5" />
                </Link>
              )}
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed font-medium whitespace-pre-wrap">
              {profile.bio}
            </p>

            {/* Interest Tags */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                {profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-bold text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── LinkedIn-Style Clout Analytics Card ─── */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-amber-500" /> Campus Clout & Analytics
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground">Level {tier.level}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span>{tier.tierName}</span>
              <span className="text-primary font-black">
                {points} / {tier.maxPoints + 1} LP
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden border border-border/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((points / (tier.maxPoints + 1)) * 100))}%` }}
              />
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground">
              {points >= 1000
                ? "Maximum Legend rank reached! 👑"
                : `${tier.maxPoints + 1 - points} LP needed to unlock next rank`}
            </p>
          </div>
        </div>

        {/* ─── Profile Navigation Tabs ─── */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-1 text-xs font-bold pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={cn(
              "px-4 py-2 rounded-2xl transition-all cursor-pointer border",
              activeTab === "posts"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}
          >
            Activity ({posts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={cn(
              "px-4 py-2 rounded-2xl transition-all cursor-pointer border flex items-center gap-1.5",
              activeTab === "photos"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}
          >
            <Camera className="size-3.5" /> Gallery ({candidatePhotos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clout")}
            className={cn(
              "px-4 py-2 rounded-2xl transition-all cursor-pointer border",
              activeTab === "clout"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}
          >
            LP Perks
          </button>
        </div>

        {/* ─── Tab Content ─── */}
        {activeTab === "posts" && (
          <div className="space-y-3.5">
            {posts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={currentUserId || profile.id} />
            ))}

            {posts.length === 0 && (
              <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2 p-6">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-primary">
                  <Sparkles className="size-6" />
                </div>
                <p className="font-bold text-foreground">No posts published yet.</p>
                {isOwnProfile && (
                  <Link
                    href="/app/post/new"
                    className="inline-block py-2 px-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer mt-2"
                  >
                    Share your first thought on CampusLoop!
                  </Link>
                )}
              </div>
            )}

            {/* Infinite Scroll Trigger Sentinel */}
            {hasMore && (
              <div ref={observerRef} className="py-6 flex items-center justify-center">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading more campus posts...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {candidatePhotos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setShowPhotoLightbox(photoUrl)}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-border/80 shadow-xs bg-muted/30 group cursor-pointer"
                >
                  <img
                    src={photoUrl}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 bg-primary/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md backdrop-blur-md">
                      Avatar
                    </span>
                  )}
                </div>
              ))}
            </div>

            {isOwnProfile && (
              <div className="pt-2 text-center">
                <Link
                  href="/app/profile/edit"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-border bg-card text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
                >
                  <Camera className="size-3.5 text-primary" /> Manage Dating & Profile Photos
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "clout" && (
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Trophy className="size-4 text-amber-500" /> Loop Points (LP) Rules & Privileges
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Earn Loop Points to unlock Verified Campus Star status, top your college leaderboard, and unlock unlimited matching.
            </p>

            <div className="grid gap-2 sm:grid-cols-2 text-xs font-semibold text-muted-foreground pt-1">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex justify-between items-center">
                <span>Invite Classmate</span>
                <span className="text-primary font-black">+20 LP</span>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex justify-between items-center">
                <span>Create Campus Thread</span>
                <span className="text-primary font-black">+5 LP</span>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex justify-between items-center">
                <span>Post Canteen Reply</span>
                <span className="text-primary font-black">+2 LP</span>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 flex justify-between items-center">
                <span>Upvote / Poll Vote</span>
                <span className="text-primary font-black">+1 LP</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Profile Picture Click Action Modal ─── */}
      {showAvatarMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in select-none"
          onClick={() => setShowAvatarMenu(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Camera className="size-4 text-primary" /> Profile Photo Options
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarMenu(false)}
                className="size-7 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAvatarMenu(false);
                    setShowPhotoLightbox(profile.avatarUrl || null);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 text-xs font-bold text-foreground flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Eye className="size-4 text-blue-500" />
                  <span>View Full-Size Photo</span>
                </button>
              )}

              {isOwnProfile && (
                <>
                  {profile.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarMenu(false);
                        setCropImageUrl(profile.avatarUrl || "");
                        setCropMode("avatar");
                        setCropModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 text-xs font-bold text-foreground flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Move className="size-4 text-primary" />
                      <span>Resize &amp; Crop Avatar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarMenu(false);
                      pfpInputRef.current?.click();
                    }}
                    className="w-full py-2.5 px-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Upload className="size-4" />
                    <span>Upload &amp; Crop New Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const seed = Math.random().toString(36).substring(7);
                      const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
                      await fetch("/api/profile/me", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatarUrl: newAvatar }),
                      });
                      toast.success("Generated new avatar! 🎨");
                      setShowAvatarMenu(false);
                      router.refresh();
                    }}
                    className="w-full py-2.5 px-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 text-xs font-bold text-foreground flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="size-4 text-amber-500" />
                    <span>Generate Random Avatar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Lightbox Modal ─── */}
      {showPhotoLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowPhotoLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setShowPhotoLightbox(null)}
            className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
          <img
            src={showPhotoLightbox}
            alt="Full Photo"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
