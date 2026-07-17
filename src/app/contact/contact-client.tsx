"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function ContactClient() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !subject || !message) return;

    setIsSending(true);
    setTimeout(() => {
      toast.success("Feedback submitted! Our safety team will review it shortly. 🚀");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSending(false);
    }, 800);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-12">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/join">
            <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
              Join CampusLoop
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md px-6 pt-28 mx-auto space-y-6">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Contact <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Support</span>
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            Have questions about college domain verification, safety policies, or partnership requests? Send us a message.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4 shadow-md">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Email</label>
            <input
              type="email"
              required
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs focus:ring-1 focus:ring-ring outline-none font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Onboard my college domain"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs focus:ring-1 focus:ring-ring outline-none font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Message</label>
            <textarea
              required
              rows={4}
              placeholder="Describe your issue or feedback in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-ring outline-none resize-none font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full rounded-xl bg-primary h-10 px-4 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            {isSending ? "Sending..." : "Submit Form"}
          </button>
        </form>
      </main>
    </div>
  );
}
