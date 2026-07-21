"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, School, Shield, User, MessageSquare, Users, Sparkles, Share2, Award, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    <>
      {/* Navbar */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-semibold hidden sm:inline">Back</span>
          </button>
          
          <h1 className="text-sm font-bold text-foreground">Profile</h1>
          
          <div className="w-8" />
        </div>
      </div>

      <main className="space-y-6">
        {/* Profile Header */}
        <div className="border-b border-border/40 pb-6">
          <div className="space-y-4">
            {/* Avatar + Name + Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border border-border/50">
                  <AvatarImage src={profile.avatarUrl || ""} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                    {profile.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      {profile.displayName}
                    </h2>
                    {profile.role === "ADMIN" && (
                      <Shield className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">@{profile.username}</p>
                  {profile.officialName && (
                    <p className="text-[8px] text-muted-foreground/70 mt-1">Official: {profile.officialName}</p>
                  )}
                  <div className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border mt-2 ${badgeColor}`}>
                    {badgeIcon}
                    {badgeTitle}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
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
                      className="flex items-center justify-center gap-1 rounded-lg border border-border/50 h-8 px-3 text-[10px] font-semibold text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </a>
                  </>
                ) : (
                  <Link
                    href={`/app/chat?userId=${profile.id}`}
                    className="flex items-center justify-center gap-1 rounded-lg bg-primary text-white h-8 px-3 text-[10px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Message</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-foreground/80 font-medium">
                {profile.bio}
              </p>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase">College</p>
                <p className="text-xs text-foreground font-medium truncate">{profile.institution?.name?.split(",")[0] || "N/A"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase">Role</p>
                <p className="text-xs text-foreground font-medium">{profile.role === "ADMIN" ? "Admin" : "Student"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase">Referrals</p>
                <p className="text-xs text-foreground font-bold">{profile.referralCount || 0}</p>
              </div>
            </div>

            {/* Share Button */}
            {isOwnProfile && (
              <button
                onClick={handleShareVibe}
                className="w-full text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors py-2"
              >
                ↗ Share Vibe Card
              </button>
            )}
          </div>
        </div>

        {/* Gamification Section */}
        {isOwnProfile && (
          <div className="border-b border-border/40 pb-6 space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Vibe Points: <span className="text-primary">{points} LP</span></h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/40 bg-card p-3">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase mb-2">Earn Points</p>
                <div className="space-y-1 text-[9px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Referral</span>
                    <span className="text-primary font-semibold">+20 LP</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Post</span>
                    <span className="text-primary font-semibold">+5 LP</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Comment</span>
                    <span className="text-primary font-semibold">+2 LP</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Vote</span>
                    <span className="text-primary font-semibold">+1 LP</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/40 bg-card p-3">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase mb-2">Your Rank</p>
                <div className="flex items-center gap-2">
                  {badgeIcon}
                  <div>
                    <p className="text-xs font-bold text-foreground">{badgeTitle}</p>
                    <p className="text-[8px] text-muted-foreground">{points} LP earned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            {isOwnProfile ? "Your Posts" : `Posts`}
          </h3>
          
          {formattedPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs font-medium">
              {isOwnProfile ? "No posts yet" : "No posts"}
            </div>
          ) : (
            <div className="space-y-3">
              {formattedPosts.map((post) => (
                <FeedCard key={post.id} post={post as any} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
