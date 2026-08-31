"use client";

import {
  ArrowUp,
  BookOpen,
  ExternalLink,
  Flame,
  Mic,
  MicOff,
  Radio,
  ShoppingBag,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  WandSparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { AiMode, AiSource } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AiSource[];
  suggestedActions?: Array<{ label: string; action: string; payload?: Record<string, unknown> }>;
  feedback?: "helpful" | "unhelpful";
}

const QUICK_ACTIONS: Array<{ label: string; prompt: string; mode: AiMode; icon: typeof Sparkles }> = [
  {
    label: "What's happening on my campus?",
    prompt: "What's happening on my campus today?",
    mode: "campus",
    icon: Flame,
  },
  {
    label: "What did I miss?",
    prompt: "Give me a useful recap of what I missed recently on campus.",
    mode: "personal",
    icon: Sparkles,
  },
  {
    label: "Help me study",
    prompt: "Help me study and find notes or question papers for my campus.",
    mode: "study",
    icon: BookOpen,
  },
  {
    label: "Find something to buy",
    prompt: "Show me secondhand essentials and items for sale on campus.",
    mode: "search",
    icon: ShoppingBag,
  },
  {
    label: "Make my post better",
    prompt: "Help me improve this post without changing its facts:",
    mode: "create",
    icon: WandSparkles,
  },
];

export function CampusAiClient() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<AiMode>("campus");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);

  // Live Talking AI Voice State
  const [isLiveTalkingOpen, setIsLiveTalkingOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceVolumeEnabled, setVoiceVolumeEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, toolStatus]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setIsListening(false);
            void ask(transcript, mode, true);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [mode]);

  function speakText(text: string) {
    if (!voiceVolumeEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Strip markdown formatting for clean vocalization
    const plain = text.replace(/[*_#`[\]()]/g, "").slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  function toggleLiveTalking() {
    if (isLiveTalkingOpen) {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsListening(false);
      setIsSpeaking(false);
      setIsLiveTalkingOpen(false);
    } else {
      setIsLiveTalkingOpen(true);
      startVoiceListening();
    }
  }

  function startVoiceListening() {
    if (!recognitionRef.current) {
      toast.info("Speech recognition is not supported in this browser. You can type instead!");
      return;
    }
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsListening(true);
      recognitionRef.current.start();
    } catch {
      setIsListening(false);
    }
  }

  async function handleFeedback(messageId: string, rating: "helpful" | "unhelpful") {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, feedback: rating } : m)));
    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating }),
      });
      toast.success(rating === "helpful" ? "Thanks for the feedback!" : "Feedback recorded.");
    } catch {
      // Ignored
    }
  }

  async function ask(prompt = message, selectedMode = mode, fromVoice = false) {
    if (!prompt.trim() || loading) return;
    const cleanPrompt = prompt.trim();
    setMessage("");

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: cleanPrompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setToolStatus("Searching campus knowledge...");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanPrompt,
          mode: selectedMode,
          conversationId: conversationId || undefined,
        }),
      });

      const data = (await response.json()) as {
        answer?: string;
        sources?: AiSource[];
        suggestedActions?: Array<{ label: string; action: string; payload?: Record<string, unknown> }>;
        conversationId?: string;
        messageId?: string;
        error?: string;
      };

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const reply = data.answer ?? data.error ?? "I couldn't answer that right now.";
      const assistantMsg: ChatMessage = {
        id: data.messageId || `asst_${Date.now()}`,
        role: "assistant",
        content: reply,
        sources: data.sources || [],
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (fromVoice || isLiveTalkingOpen) {
        speakText(reply);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "Campus AI is temporarily unavailable. Try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      setToolStatus(null);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col px-3 py-6 sm:px-6">
      {/* Header Bar */}
      <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>Campus AI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Ask your campus.</h1>
        </div>

        {/* Live Talking AI trigger button */}
        <button
          type="button"
          onClick={toggleLiveTalking}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-black transition-all cursor-pointer shadow-xs",
            isLiveTalkingOpen
              ? "border-primary bg-primary text-primary-foreground animate-pulse"
              : "border-border/70 bg-card hover:bg-muted text-foreground"
          )}
          title="Talk to Campus AI"
        >
          <Radio className="size-3.5 text-rose-500 animate-pulse" />
          <span>Live Voice</span>
        </button>
      </div>

      {/* Floating Live Talking AI HUD Modal */}
      {isLiveTalkingOpen && (
        <div className="mb-6 rounded-3xl border border-primary/30 bg-card/95 p-6 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-foreground">
                Live Talking AI
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setVoiceVolumeEnabled(!voiceVolumeEnabled);
                  if (voiceVolumeEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="size-8 rounded-full border border-border/50 bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                title={voiceVolumeEnabled ? "Mute Speech" : "Unmute Speech"}
              >
                {voiceVolumeEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>

              <button
                type="button"
                onClick={toggleLiveTalking}
                className="size-8 rounded-full border border-border/50 bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="my-6 flex flex-col items-center justify-center text-center">
            {/* Visual Speech Pulse Ring */}
            <div
              className={cn(
                "relative flex size-24 items-center justify-center rounded-full transition-all duration-500",
                isListening
                  ? "bg-rose-500/20 scale-110 shadow-lg shadow-rose-500/30"
                  : isSpeaking
                    ? "bg-primary/20 scale-105 shadow-lg shadow-primary/30"
                    : "bg-muted/60"
              )}
            >
              <div
                className={cn(
                  "size-14 rounded-full flex items-center justify-center text-white transition-all",
                  isListening
                    ? "bg-rose-500 animate-bounce"
                    : isSpeaking
                      ? "bg-primary animate-pulse"
                      : "bg-muted-foreground/30 text-foreground"
                )}
              >
                {isListening ? <Mic className="size-6" /> : <Sparkles className="size-6" />}
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <p className="text-sm font-extrabold text-foreground">
                {isListening
                  ? "Listening to your campus question..."
                  : isSpeaking
                    ? "Campus AI is speaking..."
                    : "Tap mic to speak"}
              </p>
              <p className="text-xs text-muted-foreground">
                Ask about mess timings, end-sem papers, campus confessions, or marketplace
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant={isListening ? "destructive" : "default"}
                size="sm"
                onClick={() => {
                  if (isListening) {
                    recognitionRef.current?.stop();
                    setIsListening(false);
                  } else {
                    startVoiceListening();
                  }
                }}
                className="rounded-full px-5 font-bold cursor-pointer"
              >
                {isListening ? (
                  <>
                    <MicOff className="size-3.5 mr-1.5" /> Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="size-3.5 mr-1.5" /> Speak Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Stream Viewport */}
      <div className="flex-1 space-y-4 pb-28">
        {messages.length === 0 ? (
          <div className="py-4 space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2.5 text-primary mb-2 font-black text-sm">
                <Sparkles className="size-4" />
                <span>Grounded Campus Knowledge</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                CampusLoop AI understands your college clubs, course cheat sheets, secondhand listings, and
                live campus velocity. Answers cite real student discussions with zero fabricated facts.
              </p>
            </div>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUICK_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMode(item.mode);
                      setMessage(item.prompt);
                      void ask(item.prompt, item.mode);
                    }}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left text-xs sm:text-sm font-semibold transition-all hover:bg-muted/50 cursor-pointer shadow-2xs"
                  >
                    <div className="size-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-foreground" />
                    </div>
                    <span className="truncate text-foreground font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex flex-col space-y-2", m.role === "user" ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-3xl px-4 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-card border border-border/60 text-foreground rounded-tl-xs"
                )}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Source Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Sources & Discussions
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((s) => {
                        const href =
                          s.type === "post"
                            ? `/app/post/${s.id}`
                            : s.type === "event"
                              ? `/app/events/${s.id}`
                              : s.type === "marketplace"
                                ? `/app/marketplace`
                                : s.type === "academic"
                                  ? `/app/academics`
                                  : `/app`;

                        return (
                          <Link
                            key={s.id}
                            href={href}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-muted/60 hover:bg-muted text-foreground border border-border/40 transition-colors"
                          >
                            <span className="truncate max-w-40">{s.title || "Campus Thread"}</span>
                            <ExternalLink className="size-2.5 shrink-0 opacity-70" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested Action Pills */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2 flex flex-wrap gap-1.5">
                    {m.suggestedActions.map((a, i) => (
                      <Link
                        key={i}
                        href={(a.payload?.url as string) || "/app"}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {a.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback Controls for AI Responses */}
              {m.role === "assistant" && (
                <div className="flex items-center gap-1.5 pl-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback(m.id, "helpful")}
                    className={cn(
                      "size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                      m.feedback === "helpful" && "text-emerald-500 bg-emerald-500/10"
                    )}
                    title="Helpful response"
                  >
                    <ThumbsUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(m.id, "unhelpful")}
                    className={cn(
                      "size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors",
                      m.feedback === "unhelpful" && "text-rose-500 bg-rose-500/10"
                    )}
                    title="Unhelpful"
                  >
                    <ThumbsDown className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading / Searching Status Indicator */}
        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-card/60 px-4 py-2.5 text-xs text-muted-foreground animate-pulse w-fit">
            <Sparkles className="size-3.5 text-primary animate-spin" />
            <span>{toolStatus || "Analyzing campus discussions..."}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-linear-to-t from-background via-background/95 to-transparent pb-4 pt-6">
        <div className="mx-auto max-w-3xl px-3 sm:px-6">
          <div className="flex items-end gap-2 rounded-3xl border border-border/70 bg-card p-2 shadow-xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                if (!isListening) {
                  startVoiceListening();
                } else {
                  recognitionRef.current?.stop();
                  setIsListening(false);
                }
              }}
              className={cn(
                "size-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0",
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
              title="Voice Input"
            >
              <Mic className="size-4.5" />
            </button>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void ask();
                }
              }}
              placeholder="Ask CampusLoop anything…"
              rows={1}
              className="min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-xs sm:text-sm outline-none placeholder:text-muted-foreground/70"
            />

            <Button
              type="button"
              onClick={() => void ask()}
              disabled={!message.trim() || loading}
              className="size-10 rounded-full p-0 shrink-0 cursor-pointer"
              aria-label="Send"
            >
              <ArrowUp className="size-4.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
