"use client";

import {
  Archive,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Crown,
  Edit3,
  Eye,
  Flame,
  FolderPlus,
  Gamepad2,
  GraduationCap,
  Landmark,
  Laptop,
  Layers,
  Loader2,
  MapPin,
  MessageSquare,
  MoreVertical,
  Move,
  PenTool,
  Plus,
  QrCode,
  Rocket,
  Share2,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { archivePost, deletePost } from "@/app/app/(main)/post/actions";
import { AcademicPlaylistCard } from "@/components/academics/academic-playlist-card";
import { ArticleCard } from "@/components/articles/article-card";
import { BrandedQrModal } from "@/components/common/branded-qr-modal";
import { AcademicCard } from "@/components/communities/academic-card";
import { SecretCrushButton } from "@/components/dating/secret-crush-button";
import { FollowButton } from "@/components/profile/follow-button";
import { ProfileHighlights } from "@/components/profile/profile-highlights";
import { ProfileSocialLinks } from "@/components/profile/profile-social-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { getBranchIcon, slugifyBranch } from "@/constants";
import type { FeedPost } from "@/hooks/use-feed";
import { fetcher } from "@/lib/api";
import { getCloutTier } from "@/lib/gamification";
import { cn } from "@/lib/utils";

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
    anonymousUsername?: string | null;
    feedVisibility?: string | null;
    photos?: string[] | null;
    interests?: string[] | null;
    referralCount?: number | null;
    socialLinks?: {
      platforms?: Record<string, string>;
      custom?: { label: string; url: string }[];
    } | null;

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
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  isFollowedByViewer?: boolean;
}

export function ProfileClientView({
  profile,
  formattedPosts: initialPosts,
  isOwnProfile,
  currentUserId,
  followersCount = 0,
  followingCount = 0,
  friendsCount = 0,
  isFollowedByViewer = false,
}: ProfileClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams?.get("tab");

  const [followers, setFollowers] = useState(followersCount);
  const [activeTab, setActiveTab] = useState<
    "posts" | "articles" | "academics" | "photos" | "clout" | "archived"
  >(
    initialTabParam === "academics" || initialTabParam === "notes"
      ? "academics"
      : initialTabParam === "articles"
        ? "articles"
        : initialTabParam === "photos" || initialTabParam === "gallery"
          ? "photos"
          : initialTabParam === "clout" || initialTabParam === "perks"
            ? "clout"
            : "posts"
  );
  const [archivedPosts, setArchivedPosts] = useState<FeedPost[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showPhotoLightbox, setShowPhotoLightbox] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Sync tab with URL query parameter on navigation
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "academics" || tabParam === "notes") {
      setActiveTab("academics");
    } else if (tabParam === "articles") {
      setActiveTab("articles");
    } else if (tabParam === "photos" || tabParam === "gallery") {
      setActiveTab("photos");
    } else if (tabParam === "clout" || tabParam === "perks") {
      setActiveTab("clout");
    } else if (tabParam === "archived") {
      setActiveTab("archived");
    }
  }, [searchParams]);

  function handleTabChange(tab: "posts" | "articles" | "academics" | "photos" | "clout" | "archived") {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "posts") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState({}, "", url.toString());
    }
  }

  // Fetched unconditionally so the Articles tab shows a real count instead of
  // "(0)" until someone opens it. The payload excludes article bodies.
  const { data: userArticlesData, isLoading: isLoadingArticles } = useSWR<{ articles: any[] }>(
    `/api/articles/user/${profile.username}`,
    fetcher,
    { dedupingInterval: 60000 }
  );
  const userArticles = userArticlesData?.articles || [];

  // Fetch shared notes & study playlists
  const { data: userAcademicsData, isLoading: isLoadingAcademics } = useSWR<{
    resources: any[];
    playlists: any[];
    totalCount: number;
  }>(`/api/profile/${profile.username}/academics`, fetcher, { dedupingInterval: 30000 });
  const userResources = userAcademicsData?.resources || [];
  const userPlaylists = userAcademicsData?.playlists || [];
  const userAcademicsCount = userAcademicsData?.totalCount || 0;
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const pfpInputRef = useRef<HTMLInputElement | null>(null);

  // Crop Modal States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropMode, setCropMode] = useState<"avatar" | "banner">("avatar");

  const loadArchivedPosts = useCallback(async () => {
    if (!isOwnProfile) return;
    setIsLoadingArchived(true);
    try {
      const res = await fetch("/api/posts/archived");
      if (res.ok) {
        const data = (await res.json()) as FeedPost[];
        setArchivedPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingArchived(false);
    }
  }, [isOwnProfile]);

  useEffect(() => {
    if (activeTab === "archived") {
      loadArchivedPosts();
    }
  }, [activeTab, loadArchivedPosts]);

  async function handleRestorePost(postId: string) {
    try {
      await archivePost(postId);
      toast.success("Post restored to public feeds! 🚀");
      setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
      router.refresh();
    } catch {
      toast.error("Failed to restore post");
    }
  }

  async function handleDeleteArchivedPost(postId: string) {
    try {
      await deletePost(postId);
      toast.success("Post deleted permanently");
      setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
      router.refresh();
    } catch {
      toast.error("Failed to delete post");
    }
  }

  // ─── Infinite Scroll for Profile Posts ───
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);

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
    if (!sentinelNode || !hasMore || activeTab !== "posts") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.2, rootMargin: "250px" }
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [sentinelNode, hasMore, isLoadingMore, loadMorePosts, activeTab]);

  const points = profile.points || 0;
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

  async function handleShareVibe() {
    const branchText = profile.branch ? `• Discipline: ${profile.branch}\n` : "";
    const shareText = `⚡️ Connect with @${profile.username} on CampusLoop:\n• Campus: ${campusShort}\n${branchText}• Clout Rank: ${tier.tierName} (Level ${tier.level})\n• Loop Points: ${points} LP 🔥`;
    const profileUrl = `https://campusloop.space/@${profile.username}`;

    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName} on CampusLoop`,
          text: shareText,
          url: profileUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    navigator.clipboard.writeText(`${shareText}\n\nView student profile: ${profileUrl}`);
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
    <div className="min-h-screen pb-28 text-foreground select-none touch-manipulation">
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

      {/* ─── Sticky Minimal Top Header Bar (Exact Parity with Image 2) ─── */}
      <div className="sticky top-0 z-30 border-b border-border/20 bg-background/85 backdrop-blur-xl">
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
            {points >= 150 ? (
              <span title="Verified Student">
                <ShieldCheck className="size-3.5 text-purple-400 shrink-0" />
              </span>
            ) : (
              <span className="text-blue-500 font-bold" title="Student">
                ✓
              </span>
            )}
          </h1>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Share Cute QR Code"
            >
              <QrCode className="size-3.5" /> <span>QR Card</span>
            </button>

            <button
              type="button"
              onClick={handleShareVibe}
              className="flex items-center gap-1 text-[11px] font-bold text-foreground hover:text-purple-400 transition-colors cursor-pointer bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-xl"
            >
              <Share2 className="size-3.5" /> <span>Share</span>
            </button>

            <button
              type="button"
              onClick={handleShareVibe}
              className="size-7 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="More options"
            >
              <MoreVertical className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="w-full max-w-2xl mx-auto border-x border-border/30 min-h-screen">
        {/* ─── LinkedIn / Twitter Style Profile Cover Banner ─── */}
        <div className="relative h-32 sm:h-44 w-full bg-linear-to-r from-purple-900/50 via-indigo-900/40 to-card overflow-hidden border-b border-border/20">
          {profile.bannerUrl ? (
            <img src={profile.bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-tr from-purple-950/60 via-[#12111d] to-indigo-950/40 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
            </div>
          )}

          {/* Banner Edit / Camera Controls for Owner */}
          {isOwnProfile && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              {profile.bannerUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCropImageUrl(profile.bannerUrl || "");
                    setCropMode("banner");
                    setCropModalOpen(true);
                  }}
                  className="size-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md"
                  title="Reposition Banner"
                >
                  <Move className="size-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="size-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md"
                title="Change Cover Banner"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ─── Profile Header Main Info ─── */}
        <div className="px-4 pb-2 space-y-3.5">
          {/* Avatar & User Info Row with LinkedIn-style negative margin overlap */}
          <div className="flex items-start gap-3.5 sm:gap-4 -mt-10 sm:-mt-12 relative z-10">
            {/* Clickable Circular Profile Picture with Online Status */}
            <div className="relative shrink-0 group">
              <div
                onClick={() => {
                  if (isOwnProfile) setShowAvatarMenu(true);
                }}
                className="relative size-20 sm:size-24 rounded-full border-4 border-background overflow-hidden bg-background cursor-pointer group-hover:opacity-95 transition-opacity shadow-xl"
              >
                <Avatar className="size-full">
                  <AvatarImage src={profile.avatarUrl || ""} className="object-cover size-full" />
                  <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                    {profile.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="size-4 text-white" />
                  </div>
                )}
              </div>

              {/* Online indicator badge at bottom right */}
              <span
                className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-500 border-2 border-background ring-1 ring-emerald-400"
                title="Online on CampusLoop"
              />
            </div>

            {/* User Details Column */}
            <div className="min-w-0 flex-1 space-y-1 pt-11 sm:pt-13">
              {/* Row 1: Name + Verified Check + Action Pill */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground truncate">
                    {profile.displayName}
                  </h2>
                  {points >= 150 ? (
                    <span title="Verified Campus Student">
                      <ShieldCheck className="size-4.5 text-purple-400 shrink-0" />
                    </span>
                  ) : (
                    <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
                  )}
                </div>

                {/* Action Button: Edit Profile (Own) or Message/Follow (Viewer) */}
                {isOwnProfile ? (
                  <Link
                    href="/app/profile/edit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 hover:bg-muted px-3 py-1 text-xs font-bold text-foreground transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Edit3 className="size-3 text-muted-foreground" />
                    <span>Edit Profile</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <SecretCrushButton targetId={profile.id} targetName={profile.displayName} />
                    <Link
                      href={`/app/chat?userId=${profile.id}`}
                      className="size-8 rounded-full border border-border/70 bg-card hover:bg-muted flex items-center justify-center text-foreground transition-all cursor-pointer"
                      title="Direct Message"
                    >
                      <MessageSquare className="size-3.5" />
                    </Link>
                    <FollowButton
                      username={profile.username}
                      displayName={profile.displayName}
                      initialIsFollowing={isFollowedByViewer}
                      onChange={(nowFollowing, counts) =>
                        setFollowers((prev) =>
                          counts ? counts.followersCount : Math.max(prev + (nowFollowing ? 1 : -1), 0)
                        )
                      }
                    />
                  </div>
                )}
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-[13px] text-foreground/90 font-normal leading-relaxed pt-0.5 whitespace-pre-wrap wrap-break-word">
                {profile.bio ||
                  profile.headline ||
                  "Building, learning, and exploring.\nBigger dreams, better code."}
              </p>

              {/* Social / Coding / Portfolio Links */}
              <ProfileSocialLinks links={profile.socialLinks} />
            </div>
          </div>

          {/* ─── Interest Badges (Exact match to Image 2) ─── */}
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold shadow-2xs">
              <Laptop className="size-3.5 text-amber-400" />
              <span>Tech & Coding</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-bold shadow-2xs">
              <Rocket className="size-3.5 text-teal-400" />
              <span>Startups & AI</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold shadow-2xs">
              <Coffee className="size-3.5 text-purple-400" />
              <span>Late Night Tea</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold shadow-2xs">
              <Building2 className="size-3.5 text-rose-400" />
              <span>Hostel Life</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold shadow-2xs">
              <Gamepad2 className="size-3.5 text-emerald-400" />
              <span>Gaming & Esports</span>
            </div>
          </div>
        </div>

        {/* ─── Instagram-Style Story Highlights & Archive (5 Circles Parity) ─── */}
        <ProfileHighlights userId={profile.id} username={profile.username} isOwnProfile={isOwnProfile} />

        {/* ─── Campus & Academic Discipline Card (Exact Parity with Image 2) ─── */}
        <div className="mx-4 my-2.5 rounded-2xl border border-border/40 bg-[#0d0d16]/80 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="size-4 text-purple-400" /> Campus & Academic Discipline
            </h3>
            <ChevronRight className="size-4 text-muted-foreground/60" />
          </div>

          <div className="flex items-start gap-3.5 pt-0.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#141424] border border-white/5 text-purple-400 text-lg shrink-0">
              <Landmark className="size-5 text-purple-300" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-bold text-foreground truncate">{institutionName}</p>

              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span>{profile.course || "B.Tech"}</span>
                <span>·</span>
                <Link
                  href={branchSlug ? `/app/branch/${branchSlug}` : "#"}
                  className="text-purple-400 font-bold hover:underline inline-flex items-center gap-0.5"
                >
                  <span>{profile.branch || "Computer Science & Engineering"}</span>
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground/70" /> Year {profile.year || 2} Student
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 text-muted-foreground/70" />{" "}
                  {profile.institution?.district || "Mesra"}, {profile.institution?.state || "Jharkhand"}
                </span>
              </div>
            </div>
          </div>

          {/* Hash Tag Chips at Bottom */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-muted-foreground">
              #{profile.course ? profile.course.replace(/[^a-zA-Z0-9]/g, "") : "BTech"}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-muted-foreground">
              #
              {profile.branch
                ? slugifyBranch(profile.branch).toUpperCase().replace(/-/g, "").slice(0, 6)
                : "CSE"}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-muted-foreground">
              #
              {profile.institution?.slug
                ? profile.institution.slug.toUpperCase().replace(/-/g, "").slice(0, 10)
                : "BITSMesra"}
            </span>
            {isOwnProfile && (
              <Link
                href="/app/profile/edit"
                className="size-7 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                title="Add discipline tags"
              >
                <Plus className="size-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* ─── Campus Clout Analytics Card (Exact Parity with Image 2) ─── */}
        <div className="mx-4 my-2.5 rounded-2xl border border-border/40 bg-[#0d0d16]/80 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-amber-400" /> Campus Clout & Analytics
            </h3>
            <span className="text-xs font-bold text-muted-foreground">Level {tier.level || 3}</span>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Left Gold Star Medal Icon */}
            <div className="size-12 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Star className="size-6 fill-amber-400 text-amber-400" />
            </div>

            {/* Center Titles */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-foreground">{tier.tierName || "Gold Star"}</h4>
                <span className="text-sm font-black text-purple-400">
                  {points} / {tier.maxPoints + 1} LP
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Keep contributing!</p>
            </div>
          </div>

          {/* Progress Bar with vibrant purple-to-orange gradient */}
          <div className="h-2.5 w-full rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-purple-500 via-pink-500 to-amber-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(10, Math.round((points / (tier.maxPoints + 1)) * 100)))}%`,
              }}
            />
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-0.5">
            <p className="text-xs font-medium text-muted-foreground">
              {points >= 1000
                ? "Maximum Legend rank reached! 👑"
                : `${Math.max(0, tier.maxPoints + 1 - points)} LP needed to unlock next rank`}
            </p>

            <button
              type="button"
              onClick={() => handleTabChange("clout")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/40 border border-purple-600/40 text-purple-300 hover:bg-purple-900/50 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Crown className="size-3 text-purple-400" />
              <span>View Perks</span>
            </button>
          </div>
        </div>

        {/* ─── Shared Notes & Study Materials Overview Card ─── */}
        {(userResources.length > 0 || userPlaylists.length > 0) && (
          <div className="mx-4 my-2.5 rounded-2xl border border-border/40 bg-[#0d0d16]/80 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderPlus className="size-4 text-indigo-400" /> Shared Notes &amp; Study Materials (
                {userAcademicsCount})
              </h3>
              <button
                type="button"
                onClick={() => handleTabChange("academics")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="size-3" />
              </button>
            </div>

            {/* Quick Playlists preview if any */}
            {userPlaylists.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userPlaylists.slice(0, 2).map((pl: any) => (
                  <Link
                    key={pl.id}
                    href={`/app/academics/playlists/${pl.slug}`}
                    className="p-2.5 rounded-xl border border-border/40 bg-white/5 hover:bg-white/10 transition-colors block"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400">
                      {pl.category?.replace("_", " ") || "Stack"}
                    </span>
                    <h4 className="text-xs font-bold text-foreground truncate mt-1">{pl.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {pl.itemsCount || 0} materials · ★ {pl.starsCount || 0}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick Notes preview */}
            {userResources.length > 0 && (
              <div className="divide-y divide-border/20 rounded-xl border border-border/30 bg-white/5 overflow-hidden">
                {userResources.slice(0, 3).map((res: any) => (
                  <Link
                    key={res.id}
                    href={`/app/academics/${res.id}`}
                    className="flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold">
                        <span className="font-mono text-foreground/80">{res.subjectCode}</span>
                        <span>·</span>
                        <span className="text-indigo-400 uppercase">{res.resourceType}</span>
                        <span>·</span>
                        <span>Sem {res.semester}</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground truncate">{res.title}</h4>
                    </div>
                    <ArrowUpRight className="size-3.5 text-muted-foreground/60 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Profile Navigation Underline Tabs (Exact Parity with Image 2) ─── */}
        <div className="flex border-b border-border/30 bg-background text-xs font-bold mt-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange("posts")}
            className={cn(
              "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold shrink-0 px-3",
              activeTab === "posts" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Activity ({posts.length})</span>
            {activeTab === "posts" && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-purple-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("articles")}
            className={cn(
              "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 px-3",
              activeTab === "articles" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Articles ({userArticles.length})</span>
            {activeTab === "articles" && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-purple-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("academics")}
            className={cn(
              "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 px-3",
              activeTab === "academics" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Notes ({userAcademicsCount})</span>
            {activeTab === "academics" && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-purple-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("photos")}
            className={cn(
              "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 px-3",
              activeTab === "photos" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Gallery ({candidatePhotos.length})</span>
            {activeTab === "photos" && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-purple-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("clout")}
            className={cn(
              "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold shrink-0 px-3",
              activeTab === "clout" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>LP Perks</span>
            {activeTab === "clout" && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-purple-500" />
            )}
          </button>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => handleTabChange("archived")}
              className={cn(
                "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 px-3",
                activeTab === "archived" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Archive ({archivedPosts.length})</span>
              {activeTab === "archived" && (
                <span className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-purple-500" />
              )}
            </button>
          )}
        </div>

        {/* ─── Tab Content ─── */}
        {activeTab === "posts" && (
          <div className="divide-y divide-border/30">
            {posts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={currentUserId || profile.id} />
            ))}

            {posts.length === 0 && (
              <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2 p-6">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-primary">
                  <Flame className="size-6" />
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
              <div ref={setSentinelNode} className="py-6 flex items-center justify-center">
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

        {/* ─── Articles Tab Content ─── */}
        {activeTab === "articles" && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="size-4 text-primary" /> Published Long Reads
              </h3>
              {isOwnProfile && (
                <Link
                  href="/app/articles/new"
                  className="flex items-center gap-1 text-xs font-black text-primary hover:underline bg-primary/10 px-3 py-1 rounded-full border border-primary/20"
                >
                  <PenTool className="size-3" />
                  <span>Write Article (+15 LP)</span>
                </Link>
              )}
            </div>

            {isLoadingArticles ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                <div className="h-56 bg-muted/30 rounded-3xl" />
                <div className="h-56 bg-muted/30 rounded-3xl" />
              </div>
            ) : userArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userArticles.map((art) => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2 p-6">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-primary">
                  <BookOpen className="size-6" />
                </div>
                <p className="font-bold text-foreground">No articles published yet.</p>
                <p className="text-[11px] text-muted-foreground">
                  {isOwnProfile
                    ? "Share placement tips, tech roadmaps, and campus journalism with your batch."
                    : `@${profile.username} hasn't published any articles yet.`}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/app/articles/new"
                    className="inline-block py-2 px-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer mt-2"
                  >
                    Write your first article
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Shared Notes & Study Playlists Tab Content ─── */}
        {activeTab === "academics" && (
          <div className="p-4 space-y-6">
            {/* Header banner if own profile */}
            {isOwnProfile && (
              <div className="rounded-3xl border border-indigo-500/30 bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-foreground">Your Academic Contributions</p>
                  <p className="text-[11px] text-muted-foreground">
                    You earn +20 LP for sharing notes and +5 LP whenever classmates star your playlists.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/app/academics/playlists/new"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 transition-colors shadow-xs cursor-pointer"
                  >
                    <FolderPlus className="size-3" />
                    <span>New Stack</span>
                  </Link>
                  <Link
                    href="/app/academics"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Upload Notes</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Playlists Section */}
            {userPlaylists.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Study Playlists &amp; Bundles ({userPlaylists.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userPlaylists.map((pl: any) => (
                    <AcademicPlaylistCard key={pl.id} playlist={pl} />
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Resources Section */}
            {userResources.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Uploaded Notes, PYQs &amp; Books ({userResources.length})
                  </h3>
                </div>
                <div className="divide-y divide-border/30 rounded-2xl border border-border/50 bg-card overflow-hidden">
                  {userResources.map((res: any) => (
                    <AcademicCard key={res.id} item={res} currentUserId={currentUserId} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingAcademics && userPlaylists.length === 0 && userResources.length === 0 && (
              <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2 p-6">
                <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                  <FolderPlus className="size-6" />
                </div>
                <p className="font-bold text-foreground">No shared notes or study playlists yet.</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  {isOwnProfile
                    ? "Share lecture notes, question banks, or curate a study playlist for your batch!"
                    : `@${profile.username} has not uploaded any study materials yet.`}
                </p>
                {isOwnProfile && (
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Link
                      href="/app/academics/playlists/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-indigo-500/40 text-indigo-400 text-xs font-bold hover:bg-indigo-500/10 transition-colors shadow-xs cursor-pointer"
                    >
                      <FolderPlus className="size-3.5" />
                      <span>Create Playlist</span>
                    </Link>
                    <Link
                      href="/app/academics"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Upload Notes</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {isLoadingAcademics && (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-indigo-400" />
                <span className="text-xs font-medium">Loading academic vault materials...</span>
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
              Earn Loop Points to unlock Verified Campus Star status, top your college leaderboard, and unlock
              unlimited matching.
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

        {/* ─── Archived Posts Tab (Private to Student) ─── */}
        {activeTab === "archived" && (
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Archive className="size-4" />
              </div>
              <p>
                <strong className="text-foreground font-bold">Private Post Archive:</strong> These posts are
                hidden from public campus feeds and your public profile. Only you can view, restore, or delete
                them.
              </p>
            </div>

            {isLoadingArchived ? (
              <div className="py-12 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span>Loading your archived posts...</span>
              </div>
            ) : archivedPosts.length > 0 ? (
              archivedPosts.map((post) => (
                <div key={post.id} className="relative group">
                  <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
                    <div className="p-3 bg-muted/30 border-b border-border/40 flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Archive className="size-3.5" /> Archived Post
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestorePost(post.id)}
                          className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer"
                        >
                          Restore to Public
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArchivedPost(post.id)}
                          className="px-3 py-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="size-3" /> Delete
                        </button>
                      </div>
                    </div>
                    <FeedCard post={post} currentUserId={currentUserId || profile.id} disableNavigation />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2 p-6">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Archive className="size-6" />
                </div>
                <p className="font-bold text-foreground">No archived posts.</p>
                <p>You can archive any of your posts anytime using the 3-dot menu on any post.</p>
              </div>
            )}
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
                    className="w-full py-2.5 px-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs hover:opacity-90 active:scale-95"
                  >
                    <Camera className="size-4" />
                    <span>Upload Real Photo (+50 LP)</span>
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
                      toast.info("Illustration set. Profiles with real photos get 3x more campus matches!");
                      setShowAvatarMenu(false);
                      router.refresh();
                    }}
                    className="w-full py-2 px-3.5 rounded-2xl border border-border/60 text-muted-foreground hover:text-foreground text-[11px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors opacity-70 hover:opacity-100"
                  >
                    <span>Use Cartoon Illustration (Lower Reach)</span>
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

      {/* ─── Branded Cute QR Code Modal ─── */}
      <BrandedQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={profile.displayName}
        subtitle={`@${profile.username} • ${profile.institution?.name || "Verified Student"}`}
        badgeText="Verified Student Network"
        shortUrl={`https://campusloop.space/@${profile.username}`}
        avatarUrl={profile.avatarUrl}
        category="profile"
      />
    </div>
  );
}
