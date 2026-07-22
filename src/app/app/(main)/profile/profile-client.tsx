"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  School,
  Shield,
  User,
  MessageSquare,
  Sparkles,
  Award,
  Zap,
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Trophy,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { EditProfileDialog } from "./edit-profile-dialog";
import { toast } from "sonner";
import type { FeedPost } from "@/hooks/use-feed";
import type { UserProfile, Institution } from "@/db/schema";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"posts" | "badges" | "perks">("posts");
  const [copiedHandle, setCopiedHandle] = useState(false);

  const points = profile.points || 0;
  const referrals = profile.referralCount || 0;

  // Rank Calculation & Next Tier
  let badgeTitle = "Campus Newbie";
  let badgeColor = "bg-slate-500/10 text-slate-500 border-slate-500/20";
  let nextTierPoints = 50;
  let nextTierTitle = "Loop Starter";

  if (points >= 501) {
    badgeTitle = "Campus Legend";
    badgeColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
    nextTierPoints = 1000;
    nextTierTitle = "Campus Icon";
  } else if (points >= 151) {
    badgeTitle = "Campus Talker";
    badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    nextTierPoints = 500;
    nextTierTitle = "Campus Legend";
  } else if (points >= 51) {
    badgeTitle = "Loop Starter";
    badgeColor = "bg-primary/10 text-primary border-primary/20";
    nextTierPoints = 150;
    nextTierTitle = "Campus Talker";
  }

  const progressPercent = Math.min(100, Math.round((points / nextTierPoints) * 100));

  function handleCopyHandle() {
    const handleUrl = `https://campusloop.space/@${profile.username}`;
    navigator.clipboard.writeText(handleUrl);
    setCopiedHandle(true);
    toast.success(`Copied handle link: ${handleUrl}`);
    setTimeout(() => setCopiedHandle(false), 2000);
  }

  function handleShareVibe() {
    const college = profile.institution?.name?.split(",")[0] || "Campus";
    const shareText = `⚡️ Check out @${profile.username}'s CampusLoop Vibe Card:\n• Campus: ${college}\n• Rank: ${badgeTitle}\n• Loop Points: ${points} LP 👑\n• Referrals: ${referrals}\n\nView profile: https://campusloop.space/@${profile.username} 🔥`;

    navigator.clipboard.writeText(shareText);
    toast.success("Vibe Card copypasta copied! Share it on your story or WhatsApp status 🚀");
  }

  return (
    <div className="min-h-screen pb-20 text-foreground">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <h1 className="text-xs font-bold text-foreground tracking-tight">@{profile.username} Profile</h1>

          <button
            onClick={handleShareVibe}
            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
          >
            <Share2 className="size-3.5" /> Share
          </button>
        </div>
      </div>

      <main className="space-y-6 max-w-2xl mx-auto px-4 pt-4">
        {/* Sleek Hero Profile Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-border/60 shadow-md shrink-0">
                <AvatarImage src={profile.avatarUrl || ""} />
                <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                  {profile.displayName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-black tracking-tight text-foreground">{profile.displayName}</h2>
                  {(points >= 150 || profile.role === "ADMIN") && (
                    <span title="Automatic Verified Campus Star (Unlocked at 150+ LP)">
                      <svg className="size-4 text-blue-500 fill-blue-500/20 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                  )}
                  {profile.role === "ADMIN" && <Shield className="size-4 text-rose-500" />}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyHandle}
                    className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/30 px-2 py-0.5 rounded-lg border border-border/40"
                    title="Click to copy profile link"
                  >
                    <span>@{profile.username}</span>
                    {copiedHandle ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  </button>
                </div>

                {profile.institution && (
                  <Link
                    href={`/app/college/${profile.institution.slug || profile.institution.id}`}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 pt-0.5"
                  >
                    <School className="size-3.5" />
                    {profile.institution.name.split(",")[0]}
                  </Link>
                )}
              </div>
            </div>

            {/* Actions (Edit / Sign out / Message) */}
            <div className="flex items-center gap-2 shrink-0">
              {isOwnProfile ? (
                <>
                  <EditProfileDialog
                    initialDisplayName={profile.displayName}
                    initialBio={profile.bio}
                    initialUsername={profile.username}
                    initialAvatarUrl={profile.avatarUrl}
                  />
                  <a
                    href="/handler/sign-out"
                    className="flex items-center justify-center gap-1 rounded-xl border border-border/60 bg-muted/20 h-9 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="size-3.5" />
                  </a>
                </>
              ) : (
                <Link
                  href={`/app/chat?userId=${profile.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white h-9 px-4 text-xs font-bold shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <MessageSquare className="size-3.5" /> Message
                </Link>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed border-t border-border/40 pt-3">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}

          {/* Gamified Level & Progress Bar */}
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-foreground">
                <Trophy className="size-4 text-amber-500" /> {badgeTitle}
              </span>
              <span className="text-primary font-black">{points} LP</span>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden border border-border/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                <span>Current Tier</span>
                <span>Next Tier: {nextTierTitle} ({points}/{nextTierPoints} LP)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab("posts")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all cursor-pointer border",
              activeTab === "posts"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}
          >
            Posts ({formattedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all cursor-pointer border",
              activeTab === "badges"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}
          >
            LP Perks & Ranks
          </button>
        </div>

        {/* Tab 1: Posts */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {formattedPosts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={currentUserId || profile.id} />
            ))}
            {formattedPosts.length === 0 && (
              <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2">
                <p>No posts published yet.</p>
                {isOwnProfile && (
                  <Link href="/app/post/new" className="text-primary hover:underline font-bold inline-block">
                    Create your first post on CampusLoop!
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: LP Perks & Ranks */}
        {activeTab === "badges" && (
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Loop Points (LP) Earn Rules</h3>
            <div className="grid gap-2 sm:grid-cols-2 text-xs font-semibold text-muted-foreground">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 flex justify-between items-center">
                <span>Invite Classmate</span>
                <span className="text-primary font-black">+20 LP</span>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 flex justify-between items-center">
                <span>Create Campus Thread</span>
                <span className="text-primary font-black">+5 LP</span>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 flex justify-between items-center">
                <span>Post Canteen Reply</span>
                <span className="text-primary font-black">+2 LP</span>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 flex justify-between items-center">
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
