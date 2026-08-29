"use client";

import { recordCommunityInviteShare } from "@/app/app/(main)/communities/actions";
import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { PostComposer } from "@/app/app/(main)/post/new/post-composer";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import { FeedPost } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import { confirmOptimisticPost,optimisticAddPost,revertOptimisticPost } from "@/lib/feed-mutations";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
BarChart3,
Check,
Clock,
Compass,
Flame,
Globe,
Image as ImageIcon,
Loader2,
Lock,
MessageSquare,
Settings,
Share2,
ShieldCheck,
Smile,
TrendingUp,
Trophy,
Users,
VenetianMask
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React,{ useMemo,useState } from "react";
import { toast } from "sonner";


export interface CommunityDetailProps {
  community: {
    id: string;
    slug?: string | null;
    name: string;
    description?: string | null;
    category?: string;
    privacy?: string;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    points?: number;
    rules?: string | null;
    allowAnonymousPosts?: boolean;
    creatorId: string;
    createdAt: Date;
    creator?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
    } | null;
  };
  initialPosts: FeedPost[];
  initialMembersCount: number;
  initialIsMember: boolean;
  isAdmin: boolean;
  relatedCommunities?: Array<{
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    category: string;
    avatarUrl?: string | null;
    membersCount: number;
    isMember?: boolean;
  }>;
  membersList?: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      headline?: string | null;
      points?: number | null;
    };
  }>;
}

export function CommunityDetailClient({
  community,
  initialPosts,
  initialMembersCount,
  initialIsMember,
  isAdmin,
  relatedCommunities = [],
  membersList = [],
}: CommunityDetailProps) {
  const router = useRouter();
  const { profile } = useProfile();

  const [activeTab, setActiveTab] = useState<"trending" | "latest" | "polls" | "members" | "rules">("trending");
  const [redditSort, setRedditSort] = useState<"hot" | "new" | "top" | "rising" | "discussed">("hot");
  const [topTimeWindow, setTopTimeWindow] = useState<"today" | "week" | "month" | "all">("all");
  const [isMember, setIsMember] = useState(initialIsMember);
  const [membersCount, setMembersCount] = useState(initialMembersCount);
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [copied, setCopied] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  // Quick Composer State
  const [quickText, setQuickText] = useState("");
  const [isQuickPosting, setIsQuickPosting] = useState(false);
  // Full composer (photos, GIFs, polls, confessions) opened as a modal
  const [showFullComposer, setShowFullComposer] = useState(false);

  const identifier = community.slug || community.id;

  async function handleOpenCommunityChat() {
    if (isOpeningChat) return;
    setIsOpeningChat(true);
    sounds.tap();
    haptics.light();

    try {
      const res = await fetch(`/api/communities/${community.id}/chat`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to open community chat room");
      }
      const data = (await res.json()) as { conversationId: string };
      router.push(`/app/chat/${data.conversationId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to open chat room");
    } finally {
      setIsOpeningChat(false);
    }
  }

  const parsedRules = useMemo(() => {
    if (!community.rules) return [];
    try {
      return JSON.parse(community.rules) as Array<{ title: string; description: string }>;
    } catch {
      return [];
    }
  }, [community.rules]);

  // Reddit-Style Algorithmic Community Feed Sorting
  const filteredPosts = useMemo(() => {
    const list = [...posts];
    if (activeTab === "polls") {
      return list.filter((p) => p.type === "POLL" || p.type === "QUESTION");
    }

    const now = Date.now();

    switch (redditSort) {
      case "new":
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      case "rising":
        return list.sort((a, b) => {
          const ageA = Math.max(1, (now - new Date(a.createdAt).getTime()) / (3600 * 1000));
          const ageB = Math.max(1, (now - new Date(b.createdAt).getTime()) / (3600 * 1000));
          const velA = (a.votesCount * 3 + a.commentsCount * 4 + 1) / ageA;
          const velB = (b.votesCount * 3 + b.commentsCount * 4 + 1) / ageB;
          return velB - velA;
        });

      case "discussed":
        return list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));

      case "top": {
        let maxAgeMs = Infinity;
        if (topTimeWindow === "today") maxAgeMs = 24 * 3600 * 1000;
        else if (topTimeWindow === "week") maxAgeMs = 7 * 24 * 3600 * 1000;
        else if (topTimeWindow === "month") maxAgeMs = 30 * 24 * 3600 * 1000;

        const timeFiltered = list.filter((p) => now - new Date(p.createdAt).getTime() <= maxAgeMs);
        const candidates = timeFiltered.length > 0 ? timeFiltered : list;
        return candidates.sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
      }

      case "hot":
      default:
        return list.sort((a, b) => {
          const ageHoursA = Math.max(1, (now - new Date(a.createdAt).getTime()) / (3600 * 1000));
          const ageHoursB = Math.max(1, (now - new Date(b.createdAt).getTime()) / (3600 * 1000));
          const scoreA = (a.votesCount * 2 + a.commentsCount * 3 + 5) / Math.pow(ageHoursA, 0.7);
          const scoreB = (b.votesCount * 2 + b.commentsCount * 3 + 5) / Math.pow(ageHoursB, 0.7);
          return scoreB - scoreA;
        });
    }
  }, [posts, activeTab, redditSort, topTimeWindow]);


  async function handleShareInvite() {
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/app/communities/${identifier}`
      : `https://campusloop.space/app/communities/${identifier}`;

    const shareText = `🚀 Join c/${community.name} on CampusLoop!\n${community.description || "Campus sub-hub for students."}\n\n👉 ${shareUrl}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Community invite link copied! +10 LP awarded 🚀");
      setTimeout(() => setCopied(false), 2500);
      recordCommunityInviteShare(community.id).catch(() => {});
    }
  }

  async function handleQuickPost(e: React.FormEvent) {
    e.preventDefault();
    const text = quickText.trim();
    if (!text || isQuickPosting) return;

    setIsQuickPosting(true);
    setQuickText("");

    const tempId = `temp_${Date.now()}`;
    const optimisticPost: FeedPost = {
      id: tempId,
      authorId: profile?.id || "temp_author",
      institutionId: profile?.institutionId || "inst_global",
      communityId: community.id,
      body: text,
      type: "NORMAL",
      scope: "CAMPUS",
      isAnonymous: false,
      pseudonym: null,
      title: null,
      status: "PUBLISHED",
      riskScore: 0,
      isEdited: false,
      repostOfId: null,
      repostComment: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      votesCount: 0,
      commentsCount: 0,
      userVote: 0,
      author: profile as unknown as FeedPost["author"],
      institution: (profile?.institution || {
        id: profile?.institutionId || "inst_global",
        name: "Campus",
      }) as unknown as FeedPost["institution"],
      community: { id: community.id, name: community.name },
    };

    // Prepend to local community posts stream immediately
    setPosts((prev) => [optimisticPost, ...prev]);
    // Prepend to global / campus feed if viewer visits /app
    optimisticAddPost(optimisticPost);
    toast.success("Posted to community! 🎉");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text,
          type: "NORMAL",
          scope: "CAMPUS",
          isAnonymous: false,
          communityId: community.id,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to publish post");
      }

      const serverPost = (await res.json()) as { id: string; createdAt?: string | Date };
      const confirmed = {
        ...optimisticPost,
        id: serverPost.id,
        createdAt: new Date(serverPost.createdAt || Date.now()),
      };
      setPosts((prev) => prev.map((p) => (p.id === tempId ? confirmed : p)));
      confirmOptimisticPost(tempId, confirmed);
    } catch (err: unknown) {
      console.error("Community post failed:", err);
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      revertOptimisticPost(tempId);
      toast.error(err instanceof Error ? err.message : "Failed to publish post.");
    } finally {
      setIsQuickPosting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen bg-background text-foreground pb-24 border-x border-border/30 select-none">
      {/* ─── Sticky Twitter/X Top Navigation Bar ─── */}
      <header className="sticky top-0 z-40 bg-background/80 px-4 py-2.5 backdrop-blur-xl border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-foreground truncate max-w-[220px] sm:max-w-xs">
                c/{community.name}
              </h1>
              {community.privacy === "PRIVATE" ? (
                <Lock className="size-3 text-muted-foreground" />
              ) : (
                <Globe className="size-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-normal">
              {membersCount} {membersCount === 1 ? "member" : "members"} · {posts.length} discussions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href={`/app/communities/${identifier}/settings`}
              className="flex size-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              title="Community Settings"
            >
              <Settings className="size-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleShareInvite}
            className="flex size-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            title="Share Community"
          >
            {copied ? <Check className="size-3.5 text-primary" /> : <Share2 className="size-3.5" />}
          </button>
        </div>
      </header>

      {/* ─── Hero Banner Area (Matching /app/profile) ─── */}
      <div className="relative h-36 sm:h-48 w-full bg-neutral-900 overflow-hidden">
        {community.bannerUrl ? (
          <img
            src={community.bannerUrl}
            alt={`${community.name} Banner`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-neutral-900 via-neutral-950 to-neutral-900 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          </div>
        )}
      </div>

      {/* ─── Community Avatar & Action Row ─── */}
      <div className="px-4 sm:px-5">
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-3">
          <Avatar className="size-24 sm:size-28 rounded-full border-4 border-background bg-card shadow-md shrink-0">
            <AvatarImage src={community.avatarUrl || ""} alt={community.name} className="object-cover" />
            <AvatarFallback className="bg-neutral-800 text-foreground text-2xl font-black">
              {community.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 pb-1">
            <button
              type="button"
              onClick={handleOpenCommunityChat}
              disabled={isOpeningChat}
              className="h-9 px-4 text-xs font-black rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 shrink-0"
              title={`Join c/${community.name} Discord-style group chat`}
            >
              {isOpeningChat ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <MessageSquare className="size-3.5" />
              )}
              <span>Chat Room</span>
            </button>
            <JoinCommunityButton
              communityId={community.id}
              initialIsMember={isMember}
              onMembershipChange={(joined) => {
                setIsMember(joined);
                setMembersCount((c) => Math.max(joined ? c + 1 : c - 1, 0));
              }}
              className={cn(
                "h-9 px-5 text-sm font-black rounded-full transition-all cursor-pointer shadow-xs active:scale-95",
                isMember
                  ? "border border-border/80 bg-transparent text-foreground hover:border-destructive/60 hover:text-destructive hover:bg-destructive/5"
                  : "bg-foreground text-background hover:opacity-90"
              )}
            />
          </div>
        </div>

        {/* Community Info & Bio */}
        <div className="space-y-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {community.name}
            </h1>
            <p className="text-xs font-bold text-primary mt-0.5">
              {community.category} · Campus Sub-Hub
            </p>
          </div>

          {community.description && (
            <p className="text-[14px] text-foreground/90 font-normal leading-relaxed">
              {community.description}
            </p>
          )}

          {/* Twitter-Style Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <Users className="size-3.5" />
              <span className="font-bold text-foreground">{membersCount}</span> Members
            </button>

            <div className="flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              <span className="font-bold text-foreground">{posts.length}</span> Discussions
            </div>

            <div className="flex items-center gap-1">
              <ShieldCheck className="size-3.5" />
              <span>
                Moderated by{" "}
                <Link
                  href={`/app/profile/${community.creator?.username || ""}`}
                  className="font-bold text-foreground hover:underline"
                >
                  @{community.creator?.username || "student"}
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Twitter/X Sticky Segmented Tabs ─── */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-[53px] z-30 flex items-center justify-around mt-4">
        {[
          { key: "trending", label: "Trending" },
          { key: "latest", label: "Latest" },
          { key: "polls", label: "Polls & Q&A" },
          { key: "members", label: `Members (${membersCount})` },
          { key: "rules", label: "Rules & Bylaws" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              "relative flex-1 py-3 text-center text-sm transition-colors cursor-pointer flex flex-col items-center justify-center font-bold",
              activeTab === tab.key ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground font-medium"
            )}
          >
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 h-1 w-12 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab Content Views ─── */}
      {activeTab === "members" ? (
        /* ─── Members Directory Tab ─── */
        <div className="divide-y divide-border/30">
          {membersList.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No public member list available.
            </div>
          ) : (
            membersList.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                <Link href={`/app/profile/${m.user.username}`} className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-full border border-border/40">
                    <AvatarImage src={m.user.avatarUrl || ""} />
                    <AvatarFallback className="bg-muted text-xs font-bold">
                      {m.user.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground hover:underline">
                        {m.user.displayName}
                      </span>
                      {m.role === "ADMIN" && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                          ADMIN
                        </span>
                      )}
                      {m.role === "MODERATOR" && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          MOD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{m.user.username}</p>
                  </div>
                </Link>
                {m.user.points != null && (
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Trophy className="size-3 text-primary" /> {m.user.points} LP
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      ) : activeTab === "rules" ? (
        /* ─── Rules & Bylaws Tab ─── */
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-black text-foreground">Community Bylaws & Guidelines</h2>
            <p className="text-xs text-muted-foreground">
              Rules enforced by the student administrators to keep discussions safe and constructive.
            </p>
          </div>

          {parsedRules.length === 0 ? (
            <div className="rounded-2xl border border-border/30 p-5 text-sm text-muted-foreground text-center">
              No formal rules drafted yet. Standard CampusLoop community guidelines apply.
            </div>
          ) : (
            <div className="space-y-2.5">
              {parsedRules.map((rule, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-border/30 bg-card/30 space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    {idx + 1}. {rule.title}
                  </p>
                  {rule.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {rule.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Share Box */}
          <div className="rounded-2xl border border-border/30 bg-card/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">Invite friends to c/{community.name}</p>
              <p className="text-[11px] text-muted-foreground">Earn +10 Loop Points per successful invite</p>
            </div>
            <button
              type="button"
              onClick={handleShareInvite}
              className="px-3.5 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      ) : (
        /* ─── Feed Tabs (Trending, Latest, Polls) ─── */
        <div className="flex flex-col">
          {/* ─── Inline Quick Composer Row (Twitter Style) ─── */}
          {isMember ? (
            <form onSubmit={handleQuickPost} className="border-b border-border/30 px-4 py-3 bg-card/20">
              <div className="flex gap-3 items-start">
                <Avatar className="size-10 rounded-full border border-border/40 shrink-0 mt-0.5">
                  <AvatarImage src={profile?.avatarUrl || ""} />
                  <AvatarFallback className="bg-muted text-xs font-bold">
                    {profile?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    rows={quickText ? 2 : 1}
                    placeholder={`Post to c/${community.name}...`}
                    value={quickText}
                    onChange={(e) => setQuickText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleQuickPost(e);
                      }
                    }}
                    className="w-full bg-transparent text-[15px] placeholder:text-muted-foreground/70 font-normal outline-none resize-none pt-2"
                  />
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/20">
                    {/* Rich composer entry points — same tools as /app/post/new */}
                    <div className="flex items-center gap-0.5">
                      {[
                        { id: "photo", label: "Add photo", icon: ImageIcon, color: "text-emerald-500 hover:bg-emerald-500/10" },
                        { id: "gif", label: "Add GIF", icon: Smile, color: "text-primary hover:bg-primary/10" },
                        { id: "poll", label: "Create poll", icon: BarChart3, color: "text-blue-500 hover:bg-blue-500/10" },
                        { id: "anon", label: "Post anonymously", icon: VenetianMask, color: "text-violet-500 hover:bg-violet-500/10" },
                      ].map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          title={tool.label}
                          aria-label={tool.label}
                          onClick={() => setShowFullComposer(true)}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full transition-all cursor-pointer active:scale-90",
                            tool.color,
                          )}
                        >
                          <tool.icon className="size-4.5" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isQuickPosting || !quickText.trim()}
                      className="px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isQuickPosting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="border-b border-border/30 p-4 bg-muted/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Join c/{community.name}</p>
                <p className="text-[11px] text-muted-foreground">Post questions, participate in polls, and connect.</p>
              </div>
              <JoinCommunityButton
                communityId={community.id}
                initialIsMember={false}
                className="h-8 px-4 text-xs font-bold rounded-full bg-foreground text-background hover:opacity-90"
                onMembershipChange={(joined) => {
                  setIsMember(joined);
                  setMembersCount((c) => Math.max(joined ? c + 1 : c - 1, 0));
                }}
              />
            </div>
          )}

          {/* ─── Reddit-Style Feed Sort Options Bar ─── */}
          <div className="border-b border-border/30 px-4 py-2 bg-muted/15 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => {
                  setRedditSort("hot");
                  setActiveTab("trending");
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  redditSort === "hot"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Flame className="size-3.5" />
                <span>Hot</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRedditSort("new");
                  setActiveTab("latest");
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  redditSort === "new"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Clock className="size-3.5" />
                <span>New</span>
              </button>

              <button
                type="button"
                onClick={() => setRedditSort("top")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  redditSort === "top"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Trophy className="size-3.5" />
                <span>Top</span>
              </button>

              <button
                type="button"
                onClick={() => setRedditSort("rising")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  redditSort === "rising"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <TrendingUp className="size-3.5" />
                <span>Rising</span>
              </button>

              <button
                type="button"
                onClick={() => setRedditSort("discussed")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  redditSort === "discussed"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <MessageSquare className="size-3.5" />
                <span>Discussed</span>
              </button>
            </div>

            {/* Reddit Top Time-Window Selector */}
            {redditSort === "top" && (
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span className="text-muted-foreground">Range:</span>
                {(["today", "week", "month", "all"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTopTimeWindow(range)}
                    className={cn(
                      "px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px] transition-all cursor-pointer",
                      topTimeWindow === range
                        ? "bg-foreground text-background font-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {range === "today" ? "24h" : range === "week" ? "Week" : range === "month" ? "Month" : "All"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Feed Posts Stream */}
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-bold text-foreground">No posts here yet</p>
              <p className="text-xs text-muted-foreground">
                Be the first to start a discussion in c/{community.name}!
              </p>
            </div>
          ) : (
            <div>
              {filteredPosts.map((post, idx) => (
                <div key={post.id}>
                  <FeedCard post={post} currentUserId={profile?.id} />

                  {/* ─── Algorithmic In-Stream Suggestion: Related Communities (at index 2) ─── */}
                  {idx === 2 && relatedCommunities.length > 0 && (
                    <div className="p-4 border-b border-border/30 bg-muted/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                          <Compass className="size-3.5 text-primary" /> Related Campus Hubs
                        </span>
                        <Link href="/app/communities" className="text-xs text-primary font-bold hover:underline">
                          See all
                        </Link>
                      </div>


                      <div className="grid gap-2 sm:grid-cols-2">
                        {relatedCommunities.slice(0, 2).map((rel) => (
                          <Link
                            key={rel.id}
                            href={`/app/communities/${rel.slug || rel.id}`}
                            className="p-3 rounded-2xl border border-border/30 bg-background/60 hover:bg-background transition-colors flex items-center gap-3"
                          >
                            <Avatar className="size-9 rounded-full border border-border/40 shrink-0">
                              <AvatarImage src={rel.avatarUrl || ""} />
                              <AvatarFallback className="bg-muted text-xs font-bold">
                                {rel.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate">c/{rel.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{rel.membersCount} members</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    
      {/* ─── Full Composer Modal — same tools as /app/post/new, locked to this hub ─── */}
      {showFullComposer && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-0 backdrop-blur-sm sm:p-6"
          onClick={() => setShowFullComposer(false)}
        >
          <div
            className="w-full max-w-2xl sm:my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <PostComposer
              variant="modal"
              communityId={community.id}
              lockedCommunityName={community.name}
              onCancel={() => setShowFullComposer(false)}
              onPublished={(post) => {
                setPosts((prev) => [post, ...prev]);
                setShowFullComposer(false);
              }}
              onPublishConfirmed={(tempId, realPost) => {
                setPosts((prev) =>
                  realPost
                    ? prev.map((p) => (p.id === tempId ? realPost : p))
                    : prev.filter((p) => p.id !== tempId),
                );
              }}
            />
          </div>
        </div>
      )}
</main>
  );
}
