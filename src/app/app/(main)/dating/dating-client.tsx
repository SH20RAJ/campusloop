"use client";

import { useState } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, MessageCircle, Sparkles, Filter, MapPin, School } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

type Candidate = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  institution?: { name: string } | null;
};

type MatchResult = {
  matched: boolean;
  conversationId?: string;
  matchedUser?: {
    displayName: string;
    avatarUrl: string | null;
  };
};

export function DatingClient() {
  const [gender, setGender] = useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [collegeScope, setCollegeScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [targetCollegeId, setTargetCollegeId] = useState<string>("ALL");

  const { data: colleges } = useSWR<{ id: string; name: string }[]>("/api/colleges", fetcher);

  const { data: candidates, error, isLoading, mutate } = useSWR<Candidate[]>(
    `/api/dating/profiles?gender=${gender}&college=${collegeScope}&targetInstitutionId=${targetCollegeId}`,
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-6 max-w-md mx-auto">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Campus Matches
        </h2>
        <p className="text-xs text-muted-foreground">Swipe right to match and start a private chat.</p>
      </div>

      {/* Filter Options */}
      <div className="w-full bg-card rounded-xl border border-border p-4 space-y-3 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Filter className="h-3 w-3" /> Matching Preferences
        </span>
        
        <div className="flex flex-col gap-2">
          {/* Gender Filter */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Show me</span>
            <div className="flex gap-1 bg-muted p-0.5 rounded-lg border border-border">
              {(["ALL", "MALE", "FEMALE"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => { setGender(g); setCurrentIndex(0); }}
                  className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    gender === g 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g === "ALL" ? "Everyone" : g === "MALE" ? "Men" : "Women"}
                </button>
              ))}
            </div>
          </div>

          {/* College Scope Filter */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Search Scope</span>
            <div className="flex gap-1 bg-muted p-0.5 rounded-lg border border-border">
              <button
                onClick={() => { setCollegeScope("CAMPUS"); setTargetCollegeId("ALL"); setCurrentIndex(0); }}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  collegeScope === "CAMPUS" 
                    ? "bg-background text-foreground shadow-sm font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My College
              </button>
              <button
                onClick={() => { setCollegeScope("GLOBAL"); setCurrentIndex(0); }}
                className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  collegeScope === "GLOBAL" 
                    ? "bg-background text-foreground shadow-sm font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Global
              </button>
            </div>
          </div>

          {/* Specific College Selection Dropdown (Only for global) */}
          {collegeScope === "GLOBAL" && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">College</span>
              <select
                value={targetCollegeId}
                onChange={(e) => { setTargetCollegeId(e.target.value); setCurrentIndex(0); }}
                className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none max-w-[200px]"
              >
                <option value="ALL">All Colleges</option>
                {colleges?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Card Arena */}
      <div className="relative w-full aspect-[3/4] rounded-2xl border border-border bg-card shadow-lg flex flex-col justify-between overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <Skeleton className="h-44 w-full rounded-xl animate-pulse" />
              <Skeleton className="h-6 w-3/4 rounded animate-pulse" />
              <Skeleton className="h-4 w-1/2 rounded animate-pulse" />
            </div>
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
              <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-center p-6 text-destructive text-xs">
            Failed to load candidates.
          </div>
        ) : currentCandidate ? (
          <>
            {/* Candidate Header / Pic */}
            <div className="relative flex-1 bg-muted/20 flex flex-col items-center justify-center p-6">
              {/* Simulated Distance Badge */}
              <div className="absolute top-4 right-4 bg-muted px-2.5 py-1 rounded-full text-[10px] font-semibold text-foreground flex items-center gap-1 border border-border">
                <MapPin className="h-3 w-3 text-primary animate-bounce" />
                {collegeScope === "CAMPUS" ? "On Campus" : "India"}
              </div>

              <Avatar className="h-28 w-28 border-4 border-background shadow-xl mb-4">
                <AvatarImage src={currentCandidate.avatarUrl || ""} />
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {currentCandidate.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold text-foreground">{currentCandidate.displayName}</h3>
              
              {/* Render candidate's institution name */}
              <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                <School className="h-3.5 w-3.5" />
                {currentCandidate.institution?.name || "Verified Student"}
              </p>
              
              <p className="text-[10px] text-muted-foreground mt-0.5">@{currentCandidate.username}</p>
            </div>

            {/* Candidate Bio / Info */}
            <div className="px-6 py-4 border-t border-border space-y-3 bg-card shrink-0">
              <p className="text-xs text-foreground/90 leading-relaxed text-center italic font-medium">
                "{currentCandidate.bio || "Hey! I'm using CampusLoop."}"
              </p>
            </div>

            {/* Swipe Action Buttons */}
            <div className="flex items-center justify-center gap-6 py-5 border-t border-border bg-card shrink-0">
              <button
                onClick={() => handleSwipe("PASS")}
                disabled={actionLoading}
                className="flex items-center justify-center h-11 w-11 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer animate-in slide-in-from-left-2"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleSwipe("LIKE")}
                disabled={actionLoading}
                className="flex items-center justify-center h-11 w-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 shadow-md transition-all active:scale-95 cursor-pointer animate-in slide-in-from-right-2"
              >
                <Heart className="h-4 w-4 fill-primary-foreground" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center text-muted-foreground border border-border">
              <Sparkles className="h-6 w-6 opacity-40 text-primary animate-spin" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">That's everyone!</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                No more candidates matching these settings. Try changing filters or reset.
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
              <span className="text-xs font-bold tracking-widest text-primary uppercase animate-pulse">It's a Match!</span>
              <h3 className="text-xl font-bold text-foreground">You and {swipeResult.matchedUser.displayName} liked each other!</h3>
            </div>

            <div className="flex items-center gap-4 py-4 animate-bounce">
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
