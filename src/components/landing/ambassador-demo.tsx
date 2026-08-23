"use client";

import { useState } from "react";
import { Copy, Check, Gift, Sparkles, ArrowRight, ShieldCheck, Flame, Users } from "lucide-react";
import { Reveal } from "./reveal";
import Link from "next/link";
import { toast } from "sonner";

export function AmbassadorShowcase() {
  const [username, setUsername] = useState("shaswat");
  const [copied, setCopied] = useState(false);

  const cleanHandle = username.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "student";
  const shareLink = `https://campusloop.space/join?invite=${cleanHandle}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied! Share with your college classmates 🚀");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section className="border-t border-border/60 bg-background py-16 sm:py-20 select-none overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Left Column: Ambassador Value Proposition */}
          <Reveal className="space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Gift className="size-3.5 text-primary" /> Campus Ambassador & Referral
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
              Infiltrate your campus. Get paid in Clout & LP.
            </h2>

            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Share your invite link in your batch WhatsApp groups & hostel chats. Every verified classmate who joins boosts your college ranking!
            </p>

            <div className="space-y-2.5 pt-1">
              {[
                { icon: Flame, title: "+20 Loop Points per verified peer", desc: "Climb from Rookie to Campus Star & Legend tier." },
                { icon: ShieldCheck, title: "Verified Ambassador Badge", desc: "Get featured at the top of your college directory." },
                { icon: Users, title: "Bring your whole batch", desc: "Unlock exclusive batch discussion threads & confessions." },
              ].map((perk, idx) => {
                const Icon = perk.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/60 p-3 shadow-2xs">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{perk.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug">{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Right Column: Mobile-Safe Interactive Link Generator */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm space-y-4 max-w-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5 truncate">
                  <Sparkles className="size-3.5 shrink-0" /> Live Referral Link Generator
                </span>
                <span className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                  +20 LP
                </span>
              </div>

              {/* Handle Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground">Type your campus username:</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-muted-foreground">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_handle"
                    maxLength={30}
                    className="w-full rounded-xl border border-border/70 bg-muted/20 pl-7 pr-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:bg-background outline-none transition-all"
                  />
                </div>
              </div>

              {/* Generated Link Box with Safe Wrapping */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Your Unique Invitation URL
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-2.5">
                  <span className="text-[11px] font-mono font-bold text-foreground break-all sm:truncate flex-1 px-1">
                    {shareLink}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    <span>{copied ? "Copied Link!" : "Copy Link"}</span>
                  </button>
                </div>
              </div>

              {/* Pro-Tip Box */}
              <div className="rounded-2xl bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed border border-border/40 space-y-1">
                <p className="font-medium">
                  💡 <strong className="text-foreground">Pro-tip:</strong> Share this link in your college WhatsApp or Telegram group to farm +20 Loop Points per peer!
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-1">
                <Link
                  href="/join?mode=signup"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                >
                  <span>Get Your Official Verified Link</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
