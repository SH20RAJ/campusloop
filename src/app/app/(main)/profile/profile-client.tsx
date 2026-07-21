"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, School, Shield, User, MessageSquare, Users, Sparkles, Share2, Award, Zap } from "lucide-react";
import Link from "next/link";
import { FeedCard } from "@/components/ui/feed-card";
import { EditProfileDialog } from "./edit-profile-dialog";
import { toast } from "sonner";
import type { FeedPost } from "@/hooks/use-feed";
import type { UserProfile, Institution } from "@/db/schema";

interface ProfileClientViewProps {
  profile: UserProfile & { institution?: Institution | null };
  formattedPosts: FeedPost[];
  isOwnProfile: boolean;
}

export function ProfileClientView({
  profile,
  formattedPosts,
  isOwnProfile,
}: ProfileClientViewProps) {
  const points = profile.points || 0;
  
  // Calculate Rank
  let badgeTitle = "Campus Newbie";
  let badgeColor = "bg-slate-500/10 text-slate-500 border-slate-500/20";
  let badgeIcon = <User className="h-3 w-3" />;
  
  if (points >= 501) {
    badgeTitle = "Campus Legend";
    badgeColor = "bg-red-500/10 text-red-500 border-red-500/20";
    badgeIcon = <Award className="h-3 w-3 animate-bounce" />;
  } else if (points >= 151) {
    badgeTitle = "Campus Talker";
    badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    badgeIcon = <Sparkles className="h-3 w-3" />;
  } else if (points >= 51) {
    badgeTitle = "Loop Starter";
    badgeColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
    badgeIcon = <Zap className="h-3 w-3" />;
  }

  function handleShareVibe() {
    const college = profile.institution?.name?.split(",")[0] || "Campus";
    const rank = points >= 501 ? "🔥 Campus Legend" : points >= 151 ? "👑 Campus Talker" : points >= 51 ? "⚡ Loop Starter" : "Campus Newbie";
    const shareText = `⚡️ My CampusLoop Vibe Card:\n• Campus: ${college}\n• Rank: ${rank}\n• Loop Points: ${points} LP 👑\n• Referrals: ${profile.referralCount || 0}\n\nJoin the tea party: https://campusloop.space/join?invite=${profile.username} 🔥`;
    
    navigator.clipboard.writeText(shareText);
    toast.success("Vibe Card copied! Share it on your Instagram story or WhatsApp status to invite friends 🚀");
  }

  return (
    <main className="space-y-6">
      {/* Profile Card Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        {/* Glow accent */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20 border border-border/80 shadow-md">
              <AvatarImage src={profile.avatarUrl || ""} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                {profile.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-black tracking-tight text-foreground flex items-center justify-center sm:justify-start gap-1">
                  {profile.displayName}
                  {profile.role === "ADMIN" && (
                    <span title="Admin User">
                      <Shield className="h-4 w-4 text-red-500 fill-red-500/10" />
                    </span>
                  )}
                </h2>
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColor} self-center`}>
                  {badgeIcon}
                  {badgeTitle}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs text-muted-foreground font-semibold justify-center sm:justify-start">
                <span>@{profile.username}</span>
                {profile.officialName && (
                  <>
                    <span className="hidden sm:inline text-muted-foreground/45">•</span>
                    <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border" title="Name verified from official email ID">
                      Official: {profile.officialName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
                  className="flex items-center gap-2 rounded-xl border border-input h-9 px-4 text-xs font-bold hover:bg-muted text-destructive hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </a>
              </>
            ) : (
              <Link
                href={`/app/chat?userId=${profile.id}`}
                className="flex items-center gap-2 rounded-xl bg-primary text-white h-9 px-4 text-xs font-bold hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" /> Message
              </Link>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-foreground/90 border-t border-border/40 pt-4 font-medium italic">
            "{profile.bio}"
          </p>
        )}

        <div className="grid gap-3 pt-2 text-xs text-muted-foreground sm:grid-cols-3 border-t border-border/40">
          <span className="flex items-center gap-1.5 font-medium">
            <School className="h-4 w-4 shrink-0 text-muted-foreground/60" /> {profile.institution?.name}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <User className="h-4 w-4 shrink-0 text-muted-foreground/60" /> {profile.role === "ADMIN" ? "Administrator" : "Student Member"}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="h-4 w-4 shrink-0 text-primary" />
            <span><strong className="text-foreground">{profile.referralCount || 0}</strong> Referrals</span>
          </span>
        </div>

        {isOwnProfile && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleShareVibe}
              className="flex items-center gap-1 text-[10px] font-extrabold text-primary hover:underline cursor-pointer"
            >
              <Share2 className="h-3 w-3" /> Share Vibe Card
            </button>
          </div>
        )}
      </div>

      {/* Gamification Vibe Points (Breakdown Card) */}
      {isOwnProfile && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute right-[-10%] bottom-[-20%] h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Gamification & Vibe Points
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
              Badge: {badgeTitle}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 relative z-10">
            {/* Points card */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Vibe Balance</span>
                <p className="text-3xl font-black text-foreground">{points} <span className="text-primary text-xl font-bold">LP</span></p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 font-semibold leading-relaxed">
                Collect Loop Points (LP) by creating posts, replying to comments, voting on polls, and inviting classmates!
              </p>
            </div>

            {/* How to earn card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">How to earn points</span>
              <ul className="space-y-1.5 text-xs text-foreground font-bold">
                <li className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground font-semibold">Classmate Invite Referral</span>
                  <span className="text-primary">+20 LP</span>
                </li>
                <li className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground font-semibold">Drop a Post / Confession</span>
                  <span className="text-primary">+5 LP</span>
                </li>
                <li className="flex justify-between border-b border-border/40 pb-1">
                  <span className="text-muted-foreground font-semibold">Reply / Write Comment</span>
                  <span className="text-primary">+2 LP</span>
                </li>
                <li className="flex justify-between pb-0">
                  <span className="text-muted-foreground font-semibold">Vote on Poll / Heart Post</span>
                  <span className="text-primary">+1 LP</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* User's Posts Feed */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
          {isOwnProfile ? "Your Posts" : `${profile.displayName}'s Posts`}
        </h3>
        
        <div className="space-y-4">
          {formattedPosts.map((post) => (
            <FeedCard key={post.id} post={post as any} />
          ))}
          {formattedPosts.length === 0 && (
            <div className="text-center py-12 border border-dashed rounded-2xl border-border bg-card text-muted-foreground text-xs font-semibold">
              {isOwnProfile ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
