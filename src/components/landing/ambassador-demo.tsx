"use client";

import { useState } from "react";
import { Copy, Check, Gift, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "./reveal";
import Link from "next/link";
import { toast } from "sonner";

export function AmbassadorShowcase() {
  const [username, setUsername] = useState("yourname");
  const [copied, setCopied] = useState(false);

  const cleanHandle = username.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "yourname";
  const shareLink = `https://campusloop.space/join?invite=${cleanHandle}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard! Share it in your college WhatsApp groups 🚀");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section className="border-t border-border/60 bg-gradient-to-b from-background via-muted/20 to-background py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <Reveal className="space-y-6">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 gap-1.5 py-1 px-3">
              <Gift className="size-3.5 text-primary" /> Campus Ambassador & Referral Program
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight md:text-4xl leading-tight">
              Bring your campus onboard. Earn 20 LP per verified invite.
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Want your college to top the national leaderboard? Share your unique invite link with friends, batchmates, and campus WhatsApp groups. Every verified student who signs up boosts your campus rank!
            </p>

            <div className="space-y-3">
              {[
                { title: "+20 Loop Points per invite", desc: "Climb from Campus Newbie to Campus Legend status rapidly." },
                { title: "Unlock Campus Ambassador Badge", desc: "Get featured on your college leaderboard as a top contributor." },
                { title: "Bring your entire batch", desc: "Unlock exclusive campus community hubs and canteen debate polls." },
              ].map((perk, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Check className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{perk.title}</p>
                    <p className="text-[11px] text-muted-foreground">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Interactive Link Generator Widget */}
          <Reveal delay={0.15}>
            <Card className="border border-primary/20 bg-card shadow-2xl p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/10 blur-2xl" />

              <CardContent className="p-0 space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Test Invite Link Generator
                  </span>
                  <Badge variant="secondary" className="text-[10px]">Live Preview</Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Enter your desired username:</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. aditi_bits"
                      className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* Generated Link Box */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Your Unique Referral Link</label>
                  <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5">
                    <span className="text-xs font-mono font-semibold text-foreground truncate flex-1">
                      {shareLink}
                    </span>
                    <Button
                      size="sm"
                      onClick={handleCopy}
                      className="shrink-0 text-xs font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-[11px] text-muted-foreground leading-relaxed">
                  💡 <strong className="text-foreground">Pro-tip:</strong> Copy and share this link in your college WhatsApp group or Instagram bio to invite your batchmates!
                </div>

                <div className="pt-2">
                  <Link href="/join?mode=signup" className="w-full">
                    <Button className="w-full font-bold shadow-md shadow-primary/10 gap-1.5">
                      Get Your Verified Link Now <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
