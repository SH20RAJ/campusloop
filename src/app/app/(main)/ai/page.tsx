"use client";

import { ArrowUp, BookOpen, Flame, Search, ShoppingBag, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AiMode } from "@/lib/ai/types";

const actions: Array<{ label: string; prompt: string; mode: AiMode; icon: typeof Sparkles }> = [
  {
    label: "What's happening on my campus?",
    prompt: "What's happening on my campus today?",
    mode: "campus",
    icon: Flame,
  },
  {
    label: "What did I miss?",
    prompt: "Give me a useful recap of what I missed recently.",
    mode: "personal",
    icon: Sparkles,
  },
  {
    label: "Help me study",
    prompt: "Help me study based on what's useful for my campus.",
    mode: "study",
    icon: BookOpen,
  },
  { label: "Find something", prompt: "Help me find something on CampusLoop.", mode: "search", icon: Search },
  {
    label: "Find something to buy",
    prompt: "Help me find something to buy on CampusLoop.",
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

export default function CampusAiPage() {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<AiMode>("campus");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(prompt = message, selectedMode = mode) {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, mode: selectedMode }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      setAnswer(data.answer ?? data.error ?? "I couldn't answer that right now.");
    } catch {
      setAnswer("Campus AI is temporarily unavailable. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-4" /> Campus AI
        </div>
        <h1 className="text-3xl font-black tracking-tight">Ask your campus.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find, understand, create and navigate CampusLoop with AI.
        </p>
      </div>

      {answer && (
        <div className="mb-5 rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="mb-3 text-xs font-bold text-muted-foreground">Campus AI</div>
          <div className="whitespace-pre-wrap text-sm leading-6">{answer}</div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actions.map((item) => {
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
              className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 text-left text-sm font-semibold transition-colors hover:bg-muted/40"
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-4 rounded-3xl border border-border/60 bg-background/95 p-2 shadow-xl backdrop-blur-xl">
        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void ask();
              }
            }}
            placeholder="Ask CampusLoop anything…"
            rows={2}
            className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="button"
            onClick={() => void ask()}
            disabled={!message.trim() || loading}
            className="mb-1 size-10 rounded-full p-0"
            aria-label="Ask Campus AI"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
