"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";
import { Plus, X, ChevronLeft, ChevronRight, Send, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Story {
  id: string;
  mediaUrl: string | null;
  text: string | null;
  backgroundColor: string | null;
  createdAt: string;
  expiresAt: string;
}

interface UserWithStories {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  stories: Story[];
}

interface MyProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

interface StoryRingProps {
  users: UserWithStories[];
  mutateStories: () => void;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

const GRADIENTS = [
  { id: "purple-indigo", class: "bg-gradient-to-tr from-violet-600 to-indigo-600", label: "Classic Indigo" },
  { id: "orange-rose", class: "bg-gradient-to-tr from-orange-500 to-rose-500", label: "Sunset Glow" },
  { id: "emerald-teal", class: "bg-gradient-to-tr from-emerald-500 to-teal-700", label: "Neon Emerald" },
  { id: "pink-purple", class: "bg-gradient-to-tr from-pink-500 to-purple-600", label: "Barbie Magic" },
  { id: "midnight", class: "bg-gradient-to-tr from-neutral-900 to-neutral-800", label: "Midnight Onyx" },
];

export function StoryRing({ users, mutateStories }: StoryRingProps) {
  const { data: profile } = useSWR<MyProfile>("/api/profile/me", fetcher);
  const router = useRouter();

  // Compose Story state
  const [composeOpen, setComposeOpen] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [selectedGrad, setSelectedGrad] = useState(GRADIENTS[0].class);
  const [isPosting, setIsPosting] = useState(false);

  // Playback state
  const [activeUserIdx, setActiveUserIdx] = useState<number | null>(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  const handleClosePlayback = useCallback(() => {
    setActiveUserIdx(null);
    setActiveStoryIdx(0);
    setProgress(0);
    if (progressTimer.current) clearInterval(progressTimer.current);
  }, []);

  const handleNextStory = useCallback(() => {
    if (activeUserIdx === null) return;
    const currentUser = users[activeUserIdx];

    if (activeStoryIdx + 1 < currentUser.stories.length) {
      setActiveStoryIdx((prev) => prev + 1);
    } else if (activeUserIdx + 1 < users.length) {
      // Go to next user
      setActiveUserIdx(activeUserIdx + 1);
      setActiveStoryIdx(0);
    } else {
      // All stories finished
      handleClosePlayback();
    }
  }, [activeUserIdx, activeStoryIdx, users, handleClosePlayback]);

  const handlePrevStory = useCallback(() => {
    if (activeUserIdx === null) return;

    if (activeStoryIdx > 0) {
      setActiveStoryIdx((prev) => prev - 1);
    } else if (activeUserIdx > 0) {
      // Go to previous user
      const prevUserIdx = activeUserIdx - 1;
      setActiveUserIdx(prevUserIdx);
      // Start at last story of previous user
      setActiveStoryIdx(users[prevUserIdx].stories.length - 1);
    } else {
      // Already at first story of first user, reset progress
      setProgress(0);
    }
  }, [activeUserIdx, activeStoryIdx, users]);

  // Auto-advance stories
  useEffect(() => {
    if (activeUserIdx === null) return;

    const currentUser = users[activeUserIdx];
    if (!currentUser || !currentUser.stories[activeStoryIdx]) return;

    setProgress(0);
    const interval = 50; // Update progress every 50ms
    const duration = 5000; // 5 seconds per story
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + step));
    }, interval);

    progressTimer.current = timer;

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [activeUserIdx, activeStoryIdx, users]);

  // Advance when the current story's progress completes
  useEffect(() => {
    if (progress >= 100 && activeUserIdx !== null) {
      handleNextStory();
    }
  }, [progress, activeUserIdx, handleNextStory]);

  const handlePostStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyText.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: storyText,
          backgroundColor: selectedGrad,
        }),
      });

      if (!res.ok) throw new Error("Failed to post story");

      setStoryText("");
      setComposeOpen(false);
      mutateStories();
    } catch {
      toast.error("Failed to post story. Vibe check failed.");
    } finally {
      setIsPosting(false);
    }
  };

  // Find if "Me" has active stories
  const myStoriesGroup = profile ? users.find(u => u.id === profile.id) : null;

  return (
    <div className="flex w-full gap-4.5 overflow-x-auto px-4 py-5 scrollbar-hide select-none border-b border-border/40">
      {/* ─── Profile / Add Story Button ─── */}
      {profile && (
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-primary to-orange-500 shadow-md">
            <button
              onClick={() => {
                if (myStoriesGroup) {
                  const myIdx = users.findIndex(u => u.id === profile.id);
                  setActiveUserIdx(myIdx);
                  setActiveStoryIdx(0);
                } else {
                  router.push("/app/stories/new");
                }
              }}
              className="rounded-full bg-background p-[2px] cursor-pointer outline-none relative"
            >
              <Avatar className="h-14 w-14 border border-border">
                <AvatarImage src={profile.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {profile.displayName[0]}
                </AvatarFallback>
              </Avatar>
              {!myStoriesGroup && (
                <div className="absolute -bottom-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary border-2 border-background text-white shadow-sm transition-transform active:scale-90">
                  <Plus className="h-3 w-3 font-bold" />
                </div>
              )}
            </button>
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {myStoriesGroup ? "Your Story" : "Add Vibe"}
          </span>
        </div>
      )}

      {/* ─── Story Ring Users ─── */}
      {users
        .filter((u) => u.id !== profile?.id)
        .map((u) => {
          const userIndex = users.findIndex(user => user.id === u.id);
          return (
            <div key={u.id} className="flex flex-col items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setActiveUserIdx(userIndex);
                  setActiveStoryIdx(0);
                }}
                className="relative rounded-full p-[2.5px] bg-gradient-to-tr from-primary via-orange-500 to-amber-300 shadow-sm cursor-pointer outline-none active:scale-95 transition-transform"
              >
                <div className="rounded-full bg-background p-[2px]">
                  <Avatar className="h-14 w-14 border border-border">
                    <AvatarImage src={u.avatarUrl || ""} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {u.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </button>
              <span className="text-[10px] font-semibold text-muted-foreground truncate w-14 text-center">
                {u.displayName.split(" ")[0]}
              </span>
            </div>
          );
        })}

      {/* ─── Compose Modal ─── */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Create a Story
              </h3>
              <button
                onClick={() => setComposeOpen(false)}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Story Card Preview */}
            <div
              className={cn(
                "w-full aspect-[9/16] rounded-2xl p-6 flex flex-col justify-between text-white shadow-inner relative overflow-hidden transition-all duration-300",
                selectedGrad
              )}
            >
              {/* Header inside card preview */}
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 border border-white/20">
                  <AvatarImage src={profile?.avatarUrl || ""} />
                  <AvatarFallback className="text-[10px] text-primary bg-white">
                    {profile?.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-bold">{profile?.displayName}</p>
                  <p className="text-[8px] text-white/70">Just now</p>
                </div>
              </div>

              {/* Story text container */}
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-lg font-bold tracking-tight leading-relaxed max-w-[200px] break-words whitespace-pre-wrap">
                  {storyText || "Type something..."}
                </p>
              </div>

              {/* Footer inside card preview */}
              <div className="text-[9px] text-center text-white/50 tracking-widest font-semibold uppercase">
                CAMPUSLOOP STORY
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePostStory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Story Content
                </label>
                <input
                  type="text"
                  maxLength={100}
                  required
                  placeholder="What's the vibe today?"
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs focus:ring-1 focus:ring-ring outline-none"
                />
                <span className="text-[9px] text-muted-foreground block text-right">
                  {storyText.length}/100
                </span>
              </div>

              {/* Background gradient selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Choose Color Gradient
                </label>
                <div className="flex gap-2.5 items-center justify-between">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGrad(g.class)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-transform cursor-pointer hover:scale-105 active:scale-95",
                        g.class,
                        selectedGrad === g.class ? "border-white scale-110 shadow-md shadow-black/20" : "border-transparent"
                      )}
                      title={g.label}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPosting || !storyText.trim()}
                className="w-full bg-gradient-to-r from-primary to-orange-500 text-white font-bold h-9 rounded-xl gap-1.5 cursor-pointer shadow-md shadow-primary/10"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Post Vibe
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Playback Fullscreen Overlay ─── */}
      {activeUserIdx !== null && users[activeUserIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 md:bg-opacity-80 md:backdrop-blur-md animate-in fade-in select-none">
          <div className="relative w-full max-w-lg aspect-[9/16] h-full md:h-[90vh] md:max-h-[850px] bg-neutral-950 flex flex-col justify-between p-4 md:rounded-3xl overflow-hidden shadow-2xl">
            {/* Background Story Content Card */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col justify-between p-6 text-white transition-all duration-300",
                users[activeUserIdx].stories[activeStoryIdx]?.backgroundColor || "bg-neutral-900"
              )}
            >
              {/* Top Area: Progress Bar + User details */}
              <div className="w-full space-y-4">
                {/* Story indicators */}
                <div className="flex gap-1.5 w-full">
                  {users[activeUserIdx].stories.map((s, idx) => (
                    <div
                      key={s.id}
                      className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-white transition-all duration-75"
                        style={{
                          width:
                            idx < activeStoryIdx
                              ? "100%"
                              : idx === activeStoryIdx
                              ? `${progress}%`
                              : "0%",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* User Header */}
                <div className="flex items-center justify-between w-full relative z-10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/20">
                      <AvatarImage src={users[activeUserIdx].avatarUrl || ""} />
                      <AvatarFallback className="text-sm font-bold bg-white text-primary">
                        {users[activeUserIdx].displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-extrabold">{users[activeUserIdx].displayName}</p>
                      <p className="text-[9px] text-white/70">
                        @{users[activeUserIdx].username} • {new Date(users[activeUserIdx].stories[activeStoryIdx]?.createdAt ?? "2026-01-01T00:00:00Z").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClosePlayback}
                    className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white cursor-pointer outline-none transition-colors border border-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Center Area: Text Content */}
              <div className={cn(
                "flex-1 flex flex-col justify-center px-4 relative z-10",
                !(users[activeUserIdx].stories[activeStoryIdx]?.backgroundColor || "").includes("text-") && "items-center text-center",
                (users[activeUserIdx].stories[activeStoryIdx]?.backgroundColor || "").includes("text-left") && "items-start text-left",
                (users[activeUserIdx].stories[activeStoryIdx]?.backgroundColor || "").includes("text-right") && "items-end text-right",
                (users[activeUserIdx].stories[activeStoryIdx]?.backgroundColor || "").includes("text-center") && "items-center text-center"
              )}>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-relaxed max-w-[285px] break-words whitespace-pre-wrap select-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                  {users[activeUserIdx].stories[activeStoryIdx]?.text || ""}
                </h2>
              </div>

              {/* Bottom Area: Reply & Action Buttons */}
              <div className="w-full space-y-2 z-20">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Reply to ${users[activeUserIdx].displayName.split(" ")[0]}...`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        const val = e.currentTarget.value.trim();
                        e.currentTarget.value = "";
                        toast.success(`Reply sent to @${users[activeUserIdx].username}!`);
                        router.push(`/app/chat?userId=${users[activeUserIdx].id}`);
                      }
                    }}
                    className="flex-1 h-9 rounded-full border border-white/30 bg-black/40 px-3.5 text-xs text-white placeholder:text-white/60 outline-none focus:border-white/60 focus:bg-black/60 backdrop-blur-md transition-all"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success(`Sent ❤️ to @${users[activeUserIdx].username}!`);
                    }}
                    className="h-9 w-9 rounded-full border border-white/30 bg-black/40 hover:bg-rose-500 hover:border-rose-400 flex items-center justify-center text-white backdrop-blur-md transition-all cursor-pointer active:scale-90"
                    title="Like Story"
                  >
                    <Heart className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentStoryId = users[activeUserIdx].stories[activeStoryIdx]?.id;
                      if (currentStoryId) {
                        const link = `https://campusloop.space/app/story/${currentStoryId}`;
                        navigator.clipboard.writeText(link);
                        toast.success("Story link copied to clipboard!");
                      }
                    }}
                    className="h-9 w-9 rounded-full border border-white/30 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-md transition-all cursor-pointer active:scale-90"
                    title="Share Story"
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>

                <div className="text-[9px] text-center text-white/40 tracking-widest font-bold uppercase select-none">
                  CAMPUSLOOP STORY
                </div>
              </div>
            </div>

            {/* Left / Right Nav Area overlays (Tappable regions) */}
            <div className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize" onClick={handlePrevStory} />
            <div className="absolute inset-y-0 right-0 w-1/4 cursor-e-resize" onClick={handleNextStory} />

            {/* Back & Next Arrows for Desktop */}
            <button
              onClick={handlePrevStory}
              className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-black/30 border border-white/10 text-white hover:bg-black/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextStory}
              className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-black/30 border border-white/10 text-white hover:bg-black/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
