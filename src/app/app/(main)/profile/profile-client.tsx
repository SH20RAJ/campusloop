"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  School,
  Shield,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Trophy,
  Share2,
  Edit3,
  Flame,
  Calendar,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { toast } from "sonner";
import type { FeedPost } from "@/hooks/use-feed";
import type { UserProfile, Institution } from "@/db/schema";
import { cn } from "@/lib/utils";
import { getCloutTier } from "@/lib/gamification";

interface ProfileClientViewProps {
  profile: UserProfile & { institution?: Institution | null };
  formattedPosts: FeedPost[];
  isOwnProfile: boolean;
  currentUserId?: string;
}

export function ProfileClientView({
  profile,
  formattedPosts,
  isOwnProfile,
  currentUserId,
}: ProfileClientViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "replies" | "clout">("posts");
  const [copiedHandle, setCopiedHandle] = useState(false);

  const points = profile.points || 0;
  const referrals = profile.referralCount || 0;
  const tier = getCloutTier(points);

  const progressPercent = Math.min(100, Math.round((points / (tier.maxPoints + 1)) * 100));

  function handleCopyHandle() {
    const handleUrl = `https://campusloop.space/@${profile.username}`;
    navigator.clipboard.writeText(handleUrl);
    setCopiedHandle(true);
    toast.success(`Copied profile link: ${handleUrl}`);
    setTimeout(() => setCopiedHandle(false), 2000);
  }

  function handleShareVibe() {
    const college = profile.institution?.name?.split(",")[0] || "Campus";
    const shareText = `⚡️ Check out @${profile.username}'s CampusLoop Vibe Card:\n• Campus: ${college}\n• Rank: ${tier.tierName} (Level ${tier.level})\n• Loop Points: ${points} LP 👑\n\nView profile: https://campusloop.space/@${profile.username} 🔥`;

    navigator.clipboard.writeText(shareText);
    toast.success("Vibe Card copied! Share on your WhatsApp Status or Story 🚀");
  }

  return (
    <div className="min-h-screen pb-24 text-foreground">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-xs">
        <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <h1 className="text-xs font-black text-foreground tracking-tight flex items-center gap-1">
            <span>@{profile.username}</span>
            {points >= 150 && (
              <svg className="size-3.5 text-blue-500 fill-blue-500/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
          </h1>

          <button
            type="button"
            onClick={handleShareVibe}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20"
          >
            <Share2 className="size-3.5" /> Share
          </button>
        </div>
      </div>

      <main className="space-y-5 max-w-2xl mx-auto px-4 pt-4">
        {/* ─── Hero Profile Header Banner & Card ─── */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/20 p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="size-20 sm:size-24 border-3 border-background shadow-xl shrink-0">
                  <AvatarImage src={profile.avatarUrl || ""} />
                  <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                    {profile.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {points >= 150 && (
                  <span
                    className="absolute -bottom-1 -right-1 size-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md border-2 border-background"
                    title="Verified Campus Star (150+ LP)"
                  >
                    ✓
                  </span>
                )}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground truncate">
                    {profile.displayName}
                  </h2>
                  {profile.role === "ADMIN" && <Shield className="size-4 text-rose-500 shrink-0" />}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyHandle}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/40 px-2.5 py-0.5 rounded-lg border border-border/50"
                    title="Click to copy profile link"
                  >
                    <span>@{profile.username}</span>
                    {copiedHandle ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  </button>

                  <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {tier.tierName}
                  </span>
                </div>

                {profile.institution && (
                  <Link
                    href={`/app/college/${profile.institution.slug || profile.institution.id}`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 pt-1 truncate"
                  >
                    <School className="size-3.5 shrink-0" />
                    <span className="truncate">{profile.institution.name.split(",")[0]}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Actions (Edit Profile / Sign out / Message) */}
            <div className="flex items-center gap-2 shrink-0">
              {isOwnProfile ? (
                <>
                  <Link
                    href="/app/profile/edit"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground h-9 px-3.5 text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <Edit3 className="size-3.5" /> Edit Profile
                  </Link>
                  <a
                    href="/handler/sign-out"
                    className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/20 size-9 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="size-4" />
                  </a>
                </>
              ) : (
                <Link
                  href={`/app/chat?userId=${profile.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground h-9 px-4 text-xs font-bold shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                >
                  <MessageSquare className="size-3.5" /> Message
                </Link>
              )}
            </div>
          </div>

          {/* Academic Year / Course Badge Strip */}
          {(profile.course || profile.branch || profile.year) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {profile.course && (
                <span className="text-[11px] font-bold bg-muted/50 border border-border/60 px-2.5 py-0.5 rounded-lg text-foreground">
                  🎓 {profile.course}
                </span>
              )}
              {profile.branch && (
                <span className="text-[11px] font-bold bg-muted/50 border border-border/60 px-2.5 py-0.5 rounded-lg text-muted-foreground">
                  🔬 {profile.branch}
                </span>
              )}
              {profile.year && (
                <span className="text-[11px] font-bold bg-muted/50 border border-border/60 px-2.5 py-0.5 rounded-lg text-muted-foreground">
                  📅 Year {profile.year}
                </span>
              )}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-foreground/90 font-medium leading-relaxed border-t border-border/40 pt-3">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}

          {/* Interests Tags */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.interests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-[10px] font-bold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Gamified Level & Loop Points Meter */}
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-foreground">
                <Trophy className="size-4 text-amber-500" /> {tier.tierName} (Level {tier.level})
              </span>
              <span className="text-primary font-black flex items-center gap-1">
                <Flame className="size-3.5 text-rose-500" /> {points} LP
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                <span>Invited: {referrals} peers</span>
                <span>
                  {points >= 1000
                    ? "Max Tier Achieved 👑"
                    : `${tier.maxPoints + 1 - points} LP to Next Tier`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Profile Navigation Tabs ─── */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border",
              activeTab === "posts"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}
          >
            Posts ({formattedPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clout")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border",
              activeTab === "clout"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}
          >
            LP Clout & Perks
          </button>
        </div>

        {/* ─── Tab 1: Posts ─── */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {formattedPosts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={currentUserId || profile.id} />
            ))}
            {formattedPosts.length === 0 && (
              <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2 p-6">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-primary">
                  <Sparkles className="size-6" />
                </div>
                <p className="font-bold text-foreground">No posts published yet.</p>
                {isOwnProfile && (
                  <Link
                    href="/app/post/new"
                    className="inline-block py-2 px-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/95 transition-all cursor-pointer mt-2"
                  >
                    Create your first post on CampusLoop!
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab 2: LP Clout Perks & Rules ─── */}
        {activeTab === "clout" && (
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Trophy className="size-4 text-amber-500" /> Loop Points (LP) Rewards & Perks
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Earn Loop Points to unlock Verified Campus Star status, gain clout in your college leaderboard, and unlock special matchmaking privileges.
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
    </div>
  );
}
