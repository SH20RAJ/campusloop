"use client";

import { archivePost,deletePost } from "@/app/app/(main)/post/actions";
import { SecretCrushButton } from "@/components/dating/secret-crush-button";
import { FollowButton } from "@/components/profile/follow-button";
import { ProfileHighlights } from "@/components/profile/profile-highlights";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { getBranchIcon,slugifyBranch } from "@/constants";
import type { FeedPost } from "@/hooks/use-feed";
import { getCloutTier } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import {
Archive,
ArrowLeft,
ArrowUpRight,
Calendar,
Camera,
Edit3,
Eye,
Flame,
Globe,
GraduationCap,
Loader2,
MessageSquare,
Move,
School,
Share2,
Shield,
ShieldCheck,
Trash2,
TrendingUp,
Trophy,
Upload,
VenetianMask,
X
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback,useEffect,useRef,useState } from "react";
import { toast } from "sonner";

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
  const [followers, setFollowers] = useState(followersCount);
  const [activeTab, setActiveTab] = useState<"posts" | "photos" | "clout" | "archived">("posts");
  const [archivedPosts, setArchivedPosts] = useState<FeedPost[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showPhotoLightbox, setShowPhotoLightbox] = useState<string | null>(null);
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

      {/* ─── Sticky Minimal Top Header Bar ─── */}
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
              className="flex items-center gap-1 text-[11px] font-bold text-foreground hover:text-primary transition-colors cursor-pointer bg-muted/50 hover:bg-muted px-3 py-1 rounded-xl"
            >
              <Share2 className="size-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      <main className="w-full max-w-2xl mx-auto border-x border-border/30 min-h-screen">
        {/* ─── Profile Hero (Full-width Twitter Style) ─── */}
        <div className="relative">
          {/* Cover Banner Photo - Full-Width Edge-to-Edge */}
          <div className="relative h-36 sm:h-52 w-full bg-aurora-mesh overflow-hidden">
            {profile.bannerUrl && (
              <img
                src={profile.bannerUrl}
                alt="Profile Banner"
                className="w-full h-full object-cover"
              />
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

          {/* Profile Header Main Info */}
          <div className="px-4 pb-4 pt-0 relative space-y-3">
            {/* Avatar & Action Pill Row (Twitter-style responsive) */}
            <div className="flex items-end justify-between -mt-11 sm:-mt-14 gap-2">
              {/* Clickable Circular Profile Picture */}
              <div className="relative group shrink-0">
                <div
                  onClick={() => {
                    if (isOwnProfile) setShowAvatarMenu(true);
                  }}
                  className="relative size-22 sm:size-28 rounded-full border-4 border-background shadow-xl cursor-pointer overflow-hidden bg-background group-hover:opacity-95 transition-opacity"
                >
                  <Avatar className="size-full rounded-full">
                    <AvatarImage src={profile.avatarUrl || ""} className="rounded-full object-cover" />
                    <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary rounded-full">
                      {profile.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Camera overlay on hover */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="size-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Switch / Edit circular badge */}
                <span
                  onClick={() => {
                    if (isOwnProfile) pfpInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 size-7 rounded-full bg-black text-white flex items-center justify-center shadow-md border-2 border-background text-[11px] font-black cursor-pointer hover:scale-110 transition-transform"
                  title="Switch / Update Photo"
                >
                  ⇄
                </span>
              </div>

              {/* Action Buttons: Responsive, Twitter-style */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end pb-1">
                {isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    {points < 150 && (
                      <Link
                        href="/app/settings"
                        className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-all cursor-pointer"
                      >
                        <span>Get Verified</span>
                      </Link>
                    )}
                    <Link
                      href="/app/profile/edit"
                      className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-all cursor-pointer"
                    >
                      <Edit3 className="size-3.5" />
                      <span>Edit Profile</span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <SecretCrushButton
                      targetId={profile.id}
                      targetName={profile.displayName}
                    />
                    <Link
                      href={`/app/chat?userId=${profile.id}`}
                      className="h-9 px-3.5 rounded-full border border-border/70 bg-card hover:bg-muted text-xs font-bold text-foreground shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      title="Message"
                    >
                      <MessageSquare className="size-3.5" />
                      <span className="hidden xs:inline">Message</span>
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
            </div>

            {/* Display Name & Role */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {profile.displayName}
                </h2>
                {profile.role === "ADMIN" && (
                  <span className="rounded-full bg-destructive/10 text-destructive text-[9px] font-black px-2 py-0.5 flex items-center gap-1">
                    <Shield className="size-3" /> ADMIN
                  </span>
                )}
                {points >= 150 && (
                  <span title="Verified Campus Star">
                    <ShieldCheck className="size-5 text-[#1d9bf0] shrink-0" />
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground font-medium">@{profile.username}</p>

              {/* Bio */}
              <p className="text-xs sm:text-sm font-normal text-foreground leading-relaxed pt-1 whitespace-pre-wrap break-words">
                {profile.bio || (profile.headline || `Student @ ${campusShort}. Exploring campus vibes and connecting with fellow peers.`)}
              </p>

              {/* Twitter-Style Metadata Row (College, Branch, Year, Link) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1.5">
                {profile.institution && (
                  <Link
                    href={`/app/college/${profile.institution.slug || profile.institution.id}`}
                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1 truncate max-w-full"
                  >
                    <School className="size-3.5 shrink-0 text-primary/70" />
                    <span className="truncate">{institutionName}</span>
                  </Link>
                )}

                {profile.branch && branchSlug && (
                  <Link
                    href={`/app/branch/${branchSlug}`}
                    className="hover:underline inline-flex items-center gap-1 text-foreground/80 font-medium truncate max-w-full"
                  >
                    <GraduationCap className="size-3.5 shrink-0 text-primary/70" />
                    <span>{profile.course ? `${profile.course} · ` : ""}{profile.branch}</span>
                  </Link>
                )}

                {profile.year && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Calendar className="size-3.5 shrink-0" />
                    Year {profile.year} Student
                  </span>
                )}

                {/* Vanity link */}
                <Link
                  href={`/@${profile.username}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  <Globe className="size-3.5 shrink-0" />
                  <span>campusloop.space/@{profile.username}</span>
                </Link>
              </div>

              {/* Stats Row: Following / Followers / Friends / LP Clout */}
              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-1.5 flex-wrap">
                <Link href={`/@${profile.username}/following`} className="hover:underline">
                  <strong className="text-foreground font-black">{followingCount}</strong> Following
                </Link>
                <Link href={`/@${profile.username}/followers`} className="hover:underline">
                  <strong className="text-foreground font-black">{followers}</strong> Followers
                </Link>
                <Link href={`/@${profile.username}/friends`} className="hover:underline">
                  <strong className="text-foreground font-black">{friendsCount}</strong> Friends
                </Link>
                <span className="text-amber-500 font-bold">
                  🔥 <strong className="text-foreground font-black">{points}</strong> LP Clout
                </span>
              </div>
            </div>

            {/* Full-width [ Edit profile ] Button (Exact match to Reference 1 & 2) */}
            {isOwnProfile && (
              <div className="pt-2">
                <Link
                  href="/app/profile/edit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border/70 bg-card py-2.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted/40 transition-all cursor-pointer"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit profile</span>
                </Link>
              </div>
            )}

            {/* Custom Anonymous Username Badge (Private to Student) */}
            {isOwnProfile && profile.anonymousUsername && (
              <div className="flex items-center gap-1.5 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                  <VenetianMask className="size-3.5 text-primary" />
                  <span>Anonymous Persona: @{profile.anonymousUsername}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">(only visible to you)</span>
              </div>
            )}


            {/* Campus Tags / Interest Badges (Exact match to Reference 2 Center Screen) */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {profile.interests.map((tag, idx) => {
                  const tagStyles = [
                    "badge-tag-peach",
                    "badge-tag-cyan",
                    "badge-tag-purple",
                    "badge-tag-rose",
                    "badge-tag-emerald",
                  ];
                  const styleClass = tagStyles[idx % tagStyles.length];
                  return (
                    <span
                      key={tag}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                        styleClass
                      )}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Instagram-Style Story Highlights & Archive ─── */}
        <ProfileHighlights
          userId={profile.id}
          username={profile.username}
          isOwnProfile={isOwnProfile}
        />

        {/* ─── Campus & Academic Discipline Card (Minimal & Clean) ─── */}
        <div className="mx-4 my-3 rounded-2xl border border-border/40 bg-card/60 p-4 space-y-3">
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

          <div className="flex items-start gap-3.5 pt-0.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-lg shrink-0">
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

        {/* ─── Campus Clout Analytics Card ─── */}
        <div className="mx-4 my-3 rounded-2xl border border-border/40 bg-card/60 p-4 space-y-2.5">
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
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary via-orange-500 to-amber-500 transition-all duration-500"
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

        {/* ─── Profile Navigation Underline Tabs (Twitter Style) ─── */}
        <div className="flex border-b border-border/30 bg-background text-xs font-bold mt-2">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={cn(
              "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold",
              activeTab === "posts"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Activity ({posts.length})</span>
            {activeTab === "posts" && (
              <span className="absolute bottom-0 inset-x-8 h-1 rounded-full bg-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={cn(
              "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1.5",
              activeTab === "photos"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Camera className="size-3.5" />
            <span>Gallery ({candidatePhotos.length})</span>
            {activeTab === "photos" && (
              <span className="absolute bottom-0 inset-x-8 h-1 rounded-full bg-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clout")}
            className={cn(
              "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold",
              activeTab === "clout"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>LP Perks</span>
            {activeTab === "clout" && (
              <span className="absolute bottom-0 inset-x-8 h-1 rounded-full bg-primary" />
            )}
          </button>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setActiveTab("archived")}
              className={cn(
                "flex-1 py-3 text-center relative transition-colors cursor-pointer text-xs font-bold inline-flex items-center justify-center gap-1.5",
                activeTab === "archived"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Archive className="size-3.5" />
              <span>Archive ({archivedPosts.length})</span>
              {activeTab === "archived" && (
                <span className="absolute bottom-0 inset-x-8 h-1 rounded-full bg-primary" />
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

        {/* ─── Archived Posts Tab (Private to Student) ─── */}
        {activeTab === "archived" && (
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Archive className="size-4" />
              </div>
              <p>
                <strong className="text-foreground font-bold">Private Post Archive:</strong> These posts are hidden from public campus feeds and your public profile. Only you can view, restore, or delete them.
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
                      toast.success("Generated new avatar!");
                      setShowAvatarMenu(false);
                      router.refresh();
                    }}
                    className="w-full py-2.5 px-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/50 text-xs font-bold text-foreground flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Flame className="size-4 text-amber-500" />
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
