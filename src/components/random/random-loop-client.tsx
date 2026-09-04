"use client";

import { ArrowLeft, Loader2, MessageSquare, MoreVertical, Send, Shield, ShieldAlert, ShieldCheck, Zap, UserCheck, Video, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { ActiveCallOverlay } from "@/components/calls/active-call-overlay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { RANDOM_LOOP_STARTERS } from "@/lib/random-loop-safety";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";

interface RandomLoopClientProps {
  currentProfile: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
    institutionId: string;
    year: string | null;
    branch: string | null;
  };
}

const INTEREST_CHIPS = [
  { id: "fun", label: "😂 Just for fun" },
  { id: "tech", label: "💻 Tech & Dev" },
  { id: "study", label: "📚 Study & Exams" },
  { id: "gaming", label: "🎮 Gaming" },
  { id: "music", label: "🎵 Music & Vibe" },
  { id: "sports", label: "🏏 Sports" },
  { id: "movies", label: "🎬 Movies & Anime" },
  { id: "startups", label: "🚀 Startups" },
  { id: "relationships", label: "❤️ Relationships" },
  { id: "latenight", label: "🌙 Late night talks" },
  { id: "life", label: "🧠 Life & Career" },
  { id: "surprise", label: "🎲 Surprise me" },
];

export function RandomLoopClient({ currentProfile }: RandomLoopClientProps) {
  const router = useRouter();

  // State Machine: "CONFIGURING" | "QUEUED" | "ACTIVE" | "ENDED"
  const [viewState, setViewState] = useState<"CONFIGURING" | "QUEUED" | "ACTIVE" | "ENDED">("CONFIGURING");
  const [selectedMode, setSelectedMode] = useState<"MY_CAMPUS" | "ANY_CAMPUS">("MY_CAMPUS");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["fun"]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // In-session chat state
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [starterIndex, setStarterIndex] = useState(0);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("HARASSMENT");
  const [ratedReaction, setRatedReaction] = useState<string | null>(null);

  // Video calling state in Random Loop
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [showVideoConsentModal, setShowVideoConsentModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Poll active session details and message feed
  const { data: sessionData, mutate: mutateSession } = useSWR<{
    session: any;
    partner: any;
    messages: any[];
  }>(activeSessionId ? `/api/random/session/${activeSessionId}` : null, fetcher, {
    refreshInterval: 1800, // Real-time poll every 1.8s
  });

  const session = sessionData?.session;
  const partner = sessionData?.partner;
  const messages = sessionData?.messages || [];

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Handle session status updates
  useEffect(() => {
    if (session?.status && session.status !== "ACTIVE" && viewState === "ACTIVE") {
      setViewState("ENDED");
      setIsVideoActive(false);
    }
  }, [session?.status, viewState]);

  // Video session trigger effect: when both users accept, launch video
  useEffect(() => {
    if (session?.isBothVideoAccepted && !isVideoActive) {
      sounds.ting();
      toast.success("Mutual video accepted! Connecting camera... 📹");
      setIsVideoActive(true);
      setShowVideoConsentModal(false);
    } else if (
      session?.partnerVideoRequested &&
      !session?.myVideoRequested &&
      !showVideoConsentModal &&
      !isVideoActive
    ) {
      sounds.pop();
      setShowVideoConsentModal(true);
    }
  }, [
    session?.isBothVideoAccepted,
    session?.partnerVideoRequested,
    session?.myVideoRequested,
    showVideoConsentModal,
    isVideoActive,
  ]);

  function handleToggleInterest(id: string) {
    sounds.tap();
    haptics.light();
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      if (selectedInterests.length >= 3) {
        toast.info("You can choose up to 3 interests to keep matching fast.");
        return;
      }
      setSelectedInterests([...selectedInterests, id]);
    }
  }

  // Join Matchmaking Queue
  async function handleFindSomeone() {
    sounds.pop();
    haptics.medium();
    setViewState("QUEUED");

    try {
      const res = await fetch("/api/random/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          interests: selectedInterests,
          year: currentProfile.year,
          department: currentProfile.branch,
        }),
      });

      const data = (await res.json()) as any;
      if (data.status === "MATCHED" && data.sessionId) {
        sounds.ting();
        haptics.success();
        setActiveSessionId(data.sessionId);
        setViewState("ACTIVE");
      }
    } catch {
      toast.error("Could not enter matching queue. Try again.");
      setViewState("CONFIGURING");
    }
  }

  // Poll queue if still waiting
  useEffect(() => {
    let interval: any;
    if (viewState === "QUEUED") {
      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/random/queue");
          const data = (await res.json()) as any;
          if (data.status === "MATCHED" && data.sessionId) {
            sounds.ting();
            haptics.success();
            setActiveSessionId(data.sessionId);
            setViewState("ACTIVE");
          }
        } catch {
          // Poll retry
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [viewState]);

  // Cancel Queue
  async function handleCancelQueue() {
    sounds.tap();
    try {
      await fetch("/api/random/queue", { method: "DELETE" });
    } catch {}
    setViewState("CONFIGURING");
  }

  // Send Chat Message
  async function handleSendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!inputText.trim() || !activeSessionId || isSending) return;

    sounds.send();
    haptics.light();
    setIsSending(true);

    try {
      const res = await fetch(`/api/random/session/${activeSessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      const data = (await res.json()) as any;

      if (!res.ok) {
        if (data.piiDetected) {
          sounds.pop();
          haptics.heavy();
          toast.warning(data.error);
        } else {
          toast.error(data.error || "Failed to send message");
        }
        return;
      }

      setInputText("");
      mutateSession();
    } catch {
      toast.error("Message could not be sent");
    } finally {
      setIsSending(false);
    }
  }

  // Action: Next Person
  async function handleNextPerson() {
    sounds.pop();
    haptics.medium();
    if (!activeSessionId) return;

    try {
      await fetch(`/api/random/session/${activeSessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "NEXT" }),
      });
    } catch {}

    setActiveSessionId(null);
    setShowOptionsModal(false);
    setRatedReaction(null);
    handleFindSomeone();
  }

  // Action: Leave Chat
  async function handleLeaveChat() {
    sounds.tap();
    if (activeSessionId) {
      try {
        await fetch(`/api/random/session/${activeSessionId}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "LEAVE" }),
        });
      } catch {}
    }
    setActiveSessionId(null);
    setShowOptionsModal(false);
    setViewState("CONFIGURING");
  }

  // Action: Mutual Video Request
  async function handleRequestVideo(peerId?: string) {
    sounds.tap();
    haptics.medium();
    if (!activeSessionId) return;

    try {
      const res = await fetch(`/api/random/session/${activeSessionId}/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peerId }),
      });
      const data = (await res.json()) as any;
      mutateSession();

      if (data.isBothVideoAccepted) {
        sounds.ting();
        haptics.success();
        setIsVideoActive(true);
        setShowVideoConsentModal(false);
      } else {
        toast.info("Video request sent! Waiting for consent 📹");
      }
    } catch {
      toast.error("Could not request video");
    }
  }

  // Action: Mutual Reveal
  async function handleRequestReveal() {
    sounds.tap();
    haptics.medium();
    if (!activeSessionId) return;

    try {
      const res = await fetch(`/api/random/session/${activeSessionId}/reveal`, {
        method: "POST",
      });
      const data = (await res.json()) as any;
      mutateSession();
      if (data.isBothRevealed) {
        sounds.ting();
        haptics.success();
        toast.success("🎉 You both revealed your identities!");
      } else {
        toast.info("Reveal request sent! Waiting for your partner to agree.");
      }
    } catch {
      toast.error("Could not request identity reveal");
    }
  }

  // Action: Continue Conversation in Messages
  async function handleContinueInMessages() {
    sounds.tap();
    haptics.medium();
    if (!activeSessionId) return;

    try {
      const res = await fetch(`/api/random/session/${activeSessionId}/continue`, {
        method: "POST",
      });
      const data = (await res.json()) as any;
      mutateSession();

      if (data.bothContinued && data.conversationId) {
        sounds.ting();
        haptics.success();
        toast.success("❤️ Conversation saved to Messages!");
        router.push(`/app/chat`);
      } else {
        toast.info("Connection saved! Waiting for partner to also click Keep Talking.");
      }
    } catch {
      toast.error("Could not save conversation");
    }
  }

  // Action: Submit Safety Report
  async function handleSubmitReport() {
    if (!activeSessionId) return;
    try {
      await fetch(`/api/random/session/${activeSessionId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REPORT", reason: reportReason }),
      });
      toast.success("Report submitted. You have been disconnected safely.");
    } catch {}
    setShowReportModal(false);
    setViewState("CONFIGURING");
  }

  // Rate Conversation
  async function handleRateConversation(rating: string) {
    setRatedReaction(rating);
    sounds.tap();
    haptics.light();
    if (activeSessionId) {
      try {
        await fetch(`/api/random/session/${activeSessionId}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "RATE", rating }),
        });
      } catch {}
    }
  }

  // ─── 1. CONFIGURING VIEW ───
  if (viewState === "CONFIGURING") {
    return (
      <main className="max-w-xl mx-auto min-h-[calc(100dvh-5rem)] p-4 flex flex-col justify-between select-none">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/app/more"
                className="size-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-5" />
              </Link>
              <div>
                <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-1.5">
                  <Zap className="size-5 text-amber-500 fill-amber-500" />
                  <span>Random Loop</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  You don't know who you'll meet. You know they're in the Loop.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="size-3.5" />
              <span>Verified Only</span>
            </span>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              1. Who should we find?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setSelectedMode("MY_CAMPUS");
                }}
                className={cn(
                  "p-4 rounded-3xl border-2 text-left transition-all cursor-pointer space-y-1",
                  selectedMode === "MY_CAMPUS"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/50 bg-card hover:bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🏫</span>
                  {selectedMode === "MY_CAMPUS" && <span className="size-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm font-black text-foreground">My Campus</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Meet someone from your own college
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setSelectedMode("ANY_CAMPUS");
                }}
                className={cn(
                  "p-4 rounded-3xl border-2 text-left transition-all cursor-pointer space-y-1",
                  selectedMode === "ANY_CAMPUS"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/50 bg-card hover:bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🌎</span>
                  {selectedMode === "ANY_CAMPUS" && <span className="size-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm font-black text-foreground">Campus Hopper</p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Discover students across India
                </p>
              </button>
            </div>
          </div>

          {/* Interests Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                2. What do you want to talk about?
              </label>
              <span className="text-[11px] text-muted-foreground">{selectedInterests.length}/3 selected</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {INTEREST_CHIPS.map((chip) => {
                const isSelected = selectedInterests.includes(chip.id);
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleToggleInterest(chip.id)}
                    className={cn(
                      "px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border",
                      isSelected
                        ? "bg-foreground text-background border-foreground font-black shadow-xs scale-105"
                        : "bg-muted/50 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accountable Anonymity Notice */}
          <div className="p-4 rounded-3xl bg-muted/30 border border-border/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-foreground">
              <Shield className="size-4 text-primary" />
              <span>Safe &amp; Accountable Anonymity</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your name and profile remain completely private. Backend identities are securely verified by
              campus email to keep conversations respectful and safe.
            </p>
          </div>
        </div>

        {/* Start CTA */}
        <div className="pt-6">
          <button
            type="button"
            onClick={handleFindSomeone}
            className="w-full h-13 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-[0.99]"
          >
            <Zap className="size-5" />
            <span>Find Someone in the Loop</span>
          </button>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            You will be connected anonymously. You can switch to the next student anytime.
          </p>
        </div>
      </main>
    );
  }

  // ─── 2. QUEUED / MATCHING VIEW ───
  if (viewState === "QUEUED") {
    return (
      <main className="max-w-md mx-auto min-h-[calc(100dvh-5rem)] p-4 flex flex-col items-center justify-center text-center space-y-6 select-none">
        <div className="relative size-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-50" />
          <div className="absolute inset-2 rounded-full border border-primary/50 animate-pulse" />
          <div className="size-20 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center shadow-lg">
            <Zap className="size-8 text-primary fill-primary animate-bounce" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-foreground">Finding someone in the Loop...</h2>
          <p className="text-xs text-muted-foreground max-w-xs">
            Matching interests, checking campus eligibility, and finding a verified peer for you.
          </p>
          <p className="text-[11px] font-bold text-primary pt-2">Someone is probably waiting right now 👀</p>
        </div>

        <button
          type="button"
          onClick={handleCancelQueue}
          className="px-5 py-2 rounded-full bg-muted/60 hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground border border-border/50 transition-colors cursor-pointer"
        >
          Cancel Search
        </button>
      </main>
    );
  }

  // ─── 3. ACTIVE CHAT VIEW ───
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col h-[100dvh] max-w-2xl mx-auto border-x border-border/30 select-none">
      {/* Top Chat Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-background/95 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLeaveChat}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Leave Conversation"
          >
            <ArrowLeft className="size-4.5" />
          </button>

          <div className="flex items-center gap-2.5">
            <Avatar className="size-9 border border-border/50 bg-muted">
              {partner?.avatarUrl ? (
                <AvatarImage src={partner.avatarUrl} alt={partner.displayName} />
              ) : (
                <AvatarFallback className="font-bold text-xs bg-linear-to-br from-primary/20 to-purple-500/20 text-primary">
                  {partner?.displayName?.slice(0, 2).toUpperCase() || "AN"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-foreground leading-tight">
                  {partner?.displayName || "Anonymous Student"}
                </span>
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>{partner?.collegeName?.split(",")[0] || "Campus Student"}</span>
                {partner?.year && <span>· {partner.year}</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSafetyModal(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full bg-muted/40 hover:bg-muted transition-colors cursor-pointer"
            title="Privacy status"
          >
            <ShieldCheck className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Protected</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOptionsModal(true)}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
      </header>

      {/* Conversation Starters Carousel */}
      <div className="bg-muted/20 border-b border-border/20 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs">🎲</span>
          <p className="text-xs font-semibold text-foreground/90 truncate">
            {RANDOM_LOOP_STARTERS[starterIndex % RANDOM_LOOP_STARTERS.length]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sounds.pop();
            setStarterIndex((i) => i + 1);
          }}
          className="text-[11px] font-bold text-primary shrink-0 hover:underline cursor-pointer"
        >
          Shuffle
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MessageSquare className="size-6" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-sm font-black text-foreground">You are now connected!</p>
              <p className="text-xs text-muted-foreground">
                Say hello or answer the prompt above. Keep the vibe friendly and respectful.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex flex-col max-w-[82%]", m.isMine ? "ml-auto items-end" : "items-start")}
            >
              <div
                className={cn(
                  "p-3 rounded-2xl text-xs font-medium leading-relaxed break-words",
                  m.isMine
                    ? "bg-primary text-primary-foreground rounded-br-xs shadow-xs"
                    : "bg-muted text-foreground rounded-bl-xs border border-border/40"
                )}
              >
                {m.body}
              </div>
              <span className="text-[9px] text-muted-foreground/60 px-1 pt-0.5">
                {formatTimeAgo(m.createdAt)}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Bar: Action Toolbar & Input Composer */}
      <div className="border-t border-border/30 bg-background/95 p-3 space-y-2.5 shrink-0">
        {/* Quick Action Pills: Next, Reveal, Keep Talking */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleNextPerson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer border border-border/40"
          >
            <span>Next Person ➡️</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Request Video Pill */}
            {!session?.isBothVideoAccepted && (
              <button
                type="button"
                onClick={() => handleRequestVideo()}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border",
                  session?.myVideoRequested
                    ? "bg-purple-500/15 text-purple-500 border-purple-500/30"
                    : "bg-muted/40 hover:bg-muted border-border/40 text-muted-foreground hover:text-foreground"
                )}
                title="Switch conversation to video with mutual consent"
              >
                <Video className="size-3.5" />
                <span>{session?.myVideoRequested ? "Video Sent" : "Video 📹"}</span>
              </button>
            )}

            {!session?.isBothRevealed && (
              <button
                type="button"
                onClick={handleRequestReveal}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border",
                  session?.myReveal
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-muted/40 hover:bg-muted border-border/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <UserCheck className="size-3.5" />
                <span>{session?.myReveal ? "Reveal Sent" : "Reveal Me"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleContinueInMessages}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border",
                session?.myContinue
                  ? "bg-rose-500/15 text-rose-500 border-rose-500/30 font-black"
                  : "bg-muted/40 hover:bg-muted border-border/40 text-muted-foreground hover:text-foreground"
              )}
            >
              <span>❤️ {session?.myContinue ? "Keep Talking (Waiting)" : "Keep Talking"}</span>
            </button>
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a safe anonymous message..."
            className="flex-1 h-11 rounded-2xl bg-muted/40 border border-border/60 px-4 text-xs font-medium text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="size-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
          >
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </div>

      {/* Safety & Privacy Drawer Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 max-w-sm w-full p-5 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-black text-foreground">
                <ShieldCheck className="size-5 text-primary" />
                <span>Your Privacy &amp; Protection</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSafetyModal(false)}
                className="size-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span>🛡️</span>
                <span>Your identity and profile picture remain hidden unless both agree to reveal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔒</span>
                <span>Sharing phone numbers, emails, and social handles is restricted.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🚨</span>
                <span>You can disconnect, block, or report at any moment.</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setShowSafetyModal(false)}
              className="w-full h-10 rounded-xl bg-foreground text-background font-bold text-xs cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Options Dropdown Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 max-w-xs w-full p-4 rounded-3xl space-y-2 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setShowOptionsModal(false);
                setShowReportModal(true);
              }}
              className="w-full text-left p-3 rounded-2xl hover:bg-muted text-xs font-bold text-rose-500 flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="size-4" />
              <span>Report Student</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (confirm("Block this student? You will never be matched with them again.")) {
                  await fetch(`/api/random/session/${activeSessionId}/action`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "BLOCK" }),
                  });
                  toast.success("Student blocked.");
                  handleNextPerson();
                }
              }}
              className="w-full text-left p-3 rounded-2xl hover:bg-muted text-xs font-bold text-rose-500 flex items-center gap-2 cursor-pointer"
            >
              <X className="size-4" />
              <span>Block Student</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOptionsModal(false)}
              className="w-full h-10 rounded-xl bg-muted text-foreground font-bold text-xs cursor-pointer mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 max-w-sm w-full p-5 rounded-3xl space-y-3.5 shadow-xl">
            <h3 className="text-sm font-black text-foreground">Report Student</h3>
            <p className="text-xs text-muted-foreground">
              Why are you reporting this conversation? Our campus safety team reviews flagged interactions.
            </p>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full h-10 rounded-xl bg-muted border border-border/50 px-3 text-xs font-bold text-foreground outline-none"
            >
              <option value="HARASSMENT">Harassment or Insults</option>
              <option value="SEXUAL">Inappropriate or Sexual Content</option>
              <option value="THREAT">Threatening Behavior</option>
              <option value="PII_ASK">Asking for Personal Contact Info</option>
              <option value="SPAM">Spam or Scams</option>
              <option value="OTHER">Other Violation</option>
            </select>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 h-10 rounded-xl bg-muted text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                className="flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black cursor-pointer shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Request Consent Modal */}
      {showVideoConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-white/15 max-w-sm w-full p-6 rounded-3xl space-y-4 text-center shadow-2xl">
            <div className="size-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
              <Video className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Video Request 📹</h3>
              <p className="text-xs text-zinc-400">
                {partner?.displayName || "Anonymous Student"} wants to switch this conversation to video.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowVideoConsentModal(false)}
                className="flex-1 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Not Now
              </button>
              <button
                type="button"
                onClick={() => handleRequestVideo()}
                className="flex-1 h-11 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-colors shadow-lg cursor-pointer"
              >
                Accept Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Random Loop Video Stream Overlay */}
      {isVideoActive && partner && activeSessionId && (
        <ActiveCallOverlay
          callId={activeSessionId}
          isCaller={session?.myVideoRequested || false}
          type="video"
          partner={{
            id: partner.id,
            displayName: partner.displayName,
            avatarUrl: partner.avatarUrl,
            username: partner.username,
          }}
          remotePeerId={session?.partnerPeerId}
          onCallEnded={() => setIsVideoActive(false)}
        />
      )}
    </div>
  );
}
