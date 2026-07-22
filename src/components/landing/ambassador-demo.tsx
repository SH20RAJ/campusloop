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
    toast.success("Link copied! Share it in your batch WhatsApp group 🚀");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section className="border-t border-border/60 bg-background py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <Reveal className="space-y-5">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 gap-1.5 py-1 px-3 text-xs">
              <Gift className="size-3.5 text-primary" /> Campus Ambassador & Referral
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight md:text-4xl leading-tight">
              Infiltrate your campus. Get paid in clout and LP.
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Share your invite link in the college WhatsApp group your CR hasn&apos;t muted yet. Every verified classmate who joins boosts your college leaderboard rank!
            </p>

            <div className="space-y-3">
              {[
                { title: "+20 Loop Points per verified signup", desc: "Climb from Backlog Survivor to Campus Legend status." },
                { title: "Flex your Ambassador Badge", desc: "Get featured at the top of your college leaderboard." },
                { title: "Bring your whole batch", desc: "So someone can finally answer 'is attendance mandatory today?'" },
              ].map((perk, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Check className="size-3" />
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
          <Reveal delay={0.1}>
            <Card className="border border-border bg-card shadow-sm p-5 space-y-4">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Test Referral Link Generator
                  </span>
                  <Badge variant="secondary" className="text-[10px]">Live Demo</Badge>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Type your desired handle:</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. aditi_bits"
                      className="w-full rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* Generated Link Box */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Your Unique Link</label>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
                    <span className="text-xs font-mono font-semibold text-foreground truncate flex-1">
                      {shareLink}
                    </span>
                    <Button
                      size="sm"
                      onClick={handleCopy}
                      className="shrink-0 text-xs font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                    >
                      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-[11px] text-muted-foreground leading-relaxed border border-border/40">
                  💡 <strong className="text-foreground">Pro-tip:</strong> Put this in your Instagram bio or spam it in your college WhatsApp group to farm LP.
                </div>

                <div className="pt-1">
                  <Link href="/join?mode=signup" className="w-full">
                    <Button className="w-full font-semibold text-xs gap-1.5">
                      Get Your Verified Link Now <ArrowRight className="size-3.5" />
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
