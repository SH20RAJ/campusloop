"use client";

import { useState } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/db/schema";
import { Heart, X, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<any>;
});

type MatchResult = {
  matched: boolean;
  conversationId?: string;
  matchedUser?: UserProfile;
};

export default function DatingPage() {
  const { data: candidates, error, isLoading, mutate } = useSWR<UserProfile[]>(
    "/api/dating/profiles",
    fetcher
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeResult, setSwipeResult] = useState<MatchResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const currentCandidate = candidates && currentIndex < candidates.length ? candidates[currentIndex] : null;

  async function handleSwipe(direction: "LIKE" | "PASS") {
    if (!currentCandidate || actionLoading) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/dating/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          targetId: currentCandidate.id, 
          direction 
        }),
      });

      if (!res.ok) throw new Error("Swipe failed");

      const result = await res.json() as MatchResult;
      
      if (result.matched) {
        setSwipeResult(result);
      } else {
        // Advance to next card
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  function handleCloseMatch() {
    setSwipeResult(null);
    setCurrentIndex(prev => prev + 1);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Campus Matches
        </h2>
        <p className="text-sm text-muted-foreground">Swipe right to match and start a chat session.</p>
      </div>

      {/* Card Arena */}
      <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl border border-border bg-card shadow-lg flex flex-col justify-between overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-center p-6 text-destructive">
            Failed to load candidates.
          </div>
        ) : currentCandidate ? (
          <>
            {/* Candidate Header / Pic */}
            <div className="relative flex-1 bg-gradient-to-b from-primary/5 to-primary/10 flex flex-col items-center justify-center p-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl mb-4">
                <AvatarImage src={currentCandidate.avatarUrl || ""} />
                <AvatarFallback className="text-3xl">{currentCandidate.displayName[0]}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-foreground">{currentCandidate.displayName}</h3>
              <p className="text-xs text-muted-foreground">@{currentCandidate.username}</p>
            </div>

            {/* Candidate Bio / Info */}
            <div className="px-6 py-4 border-t border-border space-y-3 bg-card shrink-0">
              <p className="text-sm text-foreground/90 leading-relaxed text-center italic">
                "{currentCandidate.bio || "Hey! I'm using CampusLoop."}"
              </p>
            </div>

            {/* Swipe Action Buttons */}
            <div className="flex items-center justify-center gap-6 py-6 border-t border-border bg-card shrink-0">
              <button
                onClick={() => handleSwipe("PASS")}
                disabled={actionLoading}
                className="flex items-center justify-center h-12 w-12 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleSwipe("LIKE")}
                disabled={actionLoading}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Heart className="h-5 w-5 fill-primary-foreground" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <Sparkles className="h-8 w-8 opacity-40" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">That's everyone!</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                You've swiped on all candidate students in your college.
              </p>
            </div>
            <button 
              onClick={() => { setCurrentIndex(0); mutate(); }}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Reset Swipes
            </button>
          </div>
        )}
      </div>

      {/* Match Notification Modal */}
      {swipeResult?.matched && swipeResult.matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl text-center space-y-6 flex flex-col items-center animate-in zoom-in-95">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">It's a Match!</span>
              <h3 className="text-xl font-bold text-foreground">You and {swipeResult.matchedUser.displayName} liked each other!</h3>
            </div>

            <div className="flex items-center gap-4 py-4">
              <Avatar className="h-20 w-20 border-2 border-primary shadow-lg">
                <AvatarFallback className="text-xl">Me</AvatarFallback>
              </Avatar>
              <Heart className="h-8 w-8 text-primary fill-primary animate-pulse shrink-0" />
              <Avatar className="h-20 w-20 border-2 border-primary shadow-lg">
                <AvatarImage src={swipeResult.matchedUser.avatarUrl || ""} />
                <AvatarFallback className="text-xl">{swipeResult.matchedUser.displayName[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col w-full gap-3 pt-2">
              <Link 
                href="/app/chat"
                className="flex items-center justify-center gap-2 rounded-lg bg-primary h-10 px-4 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-colors"
              >
                <MessageCircle className="h-4 w-4" /> Start Chatting
              </Link>
              <button
                onClick={handleCloseMatch}
                className="h-10 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
