"use client";

import {
  ArrowRight,
  Award,
  Check,
  Compass,
  Copy,
  Heart,
  Hourglass,
  KeyRound,
  Mail,
  MessageSquare,
  Repeat2,
  School,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DemoClient() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const email = "demo@campusloop.space";
  const pass = "CampusLoop@2026!";
  const referralUrl = "https://campusloop.space/join?ref=demo_tester";

  const copyToClipboard = async (text: string, type: "email" | "pass" | "ref") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
        toast.success("Demo email copied! 📋");
      } else if (type === "pass") {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2000);
        toast.success("Demo password copied! 🔑");
      } else if (type === "ref") {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
        toast.success("Referral link copied! 🚀");
      }
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const FEATURES = [
    {
      icon: Repeat2,
      title: "Campus Feed & Confessions",
      desc: "Post anonymous confessions with PII scrubbing, launch live polls, quote-repost, and double-tap hearts.",
      badge: "Full Access",
    },
    {
      icon: Heart,
      title: "Campus Match & Crush Vault",
      desc: "Swipe student deck with filters, send instant matches, and lock up to 5 campus crushes in the escrow vault.",
      badge: "Active Deck",
    },
    {
      icon: MessageSquare,
      title: "Realtime Chat & PeerJS Calls",
      desc: "Direct messaging, group channels, and 1-to-1 WebRTC audio/video calling over peer-to-peer media plane.",
      badge: "WebRTC P2P",
    },
    {
      icon: ShoppingBag,
      title: "Marketplace & 10+ Utility Hubs",
      desc: "Trade cycles, book station cab pools, find flatmates, 5v5 gaming lobbies, lost & found, and canteen food.",
      badge: "14 Merchants",
    },
    {
      icon: Hourglass,
      title: "Batch Time Capsule Vault",
      desc: "Bury sealed batch predictions and letters locked until convocation with real-time countdown tickers.",
      badge: "Exclusive",
    },
    {
      icon: Award,
      title: "Loop Points Clout & Blue Tick",
      desc: "Preloaded with 450 LP — Gold Star tier status, verified star badge, and unlocked reputation multipliers.",
      badge: "Gold Star (450 LP)",
    },
  ];

  const STATS = [
    { label: "Indexed Indian Colleges", value: "1,350+" },
    { label: "Active Student Profiles", value: "1,630+" },
    { label: "Campus Posts & Polls", value: "1,410+" },
    { label: "Discussions & Comments", value: "2,420+" },
    { label: "Curated Academics", value: "240+" },
    { label: "Test Suites Passing", value: "100% (178)" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/10 blur-[130px]" />
        <div className="absolute top-[50%] right-[10%] h-[400px] w-[500px] rounded-full bg-rose-500/10 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between pb-8 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base shadow-md shadow-primary/20">
              CL
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-black tracking-tight leading-none">
                Campus<span className="text-primary">Loop</span>
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Testing Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link href="/app">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex rounded-full text-xs">
                <Compass className="mr-1.5 size-3.5" />
                Browse Feed
              </Button>
            </Link>
            <Link href="/handler/sign-in">
              <Button size="sm" className="rounded-full text-xs font-bold shadow-md shadow-primary/25">
                Sign In
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="pt-12 pb-10 text-center space-y-4 max-w-2xl mx-auto">
          <Badge
            variant="secondary"
            className="rounded-full px-3.5 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20"
          >
            <Sparkles className="mr-1.5 size-3.5" />
            Public Investor &amp; Evaluator Access
          </Badge>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl font-heading">
            Experience CampusLoop with{" "}
            <span className="bg-gradient-to-r from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">
              All Features Unlocked
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            No college email needed. Use our official public demo account to explore verified student feeds,
            post confessions, test the dating deck, make PeerJS WebRTC calls, and share referral links.
          </p>
        </div>

        {/* Credentials Card (Highlight) */}
        <div className="grid gap-6 md:grid-cols-5 my-8">
          <Card className="md:col-span-3 border-primary/30 bg-gradient-to-br from-card to-primary/[0.04] shadow-xl shadow-primary/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Public Demo Credentials</CardTitle>
                    <CardDescription className="text-xs">
                      Shared test account with full Verified Student privileges
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold">
                  ● Ready to Use
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Email Row */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Test Account Email
                </label>
                <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="size-4 text-primary shrink-0" />
                    <span className="font-mono text-sm font-bold text-foreground truncate">{email}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2.5 text-xs text-primary hover:bg-primary/10 rounded-lg shrink-0"
                    onClick={() => copyToClipboard(email, "email")}
                  >
                    {copiedEmail ? (
                      <Check className="size-3.5 text-emerald-500 mr-1" />
                    ) : (
                      <Copy className="size-3.5 mr-1" />
                    )}
                    {copiedEmail ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Password Row */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <KeyRound className="size-4 text-amber-500 shrink-0" />
                    <span className="font-mono text-sm font-bold text-foreground tracking-wider truncate">
                      {pass}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2.5 text-xs text-primary hover:bg-primary/10 rounded-lg shrink-0"
                    onClick={() => copyToClipboard(pass, "pass")}
                  >
                    {copiedPass ? (
                      <Check className="size-3.5 text-emerald-500 mr-1" />
                    ) : (
                      <Copy className="size-3.5 mr-1" />
                    )}
                    {copiedPass ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Link href="/handler/sign-in" className="flex-1">
                  <Button className="w-full font-bold shadow-md shadow-primary/20">
                    Log In with Demo Account
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </Link>
                <Link href="/app" className="flex-1">
                  <Button variant="outline" className="w-full font-semibold">
                    Open Public App
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Referral & Invite Card */}
          <Card className="md:col-span-2 border-border/60 bg-card/60 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                  <Share2 className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Refer College Students</CardTitle>
                  <CardDescription className="text-xs">
                    Earn +20 Loop Points for every verified student invited
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Share this referral link with college friends or campus communities. When they sign up with
                their official college email, your test account earns clout rewards!
              </p>

              <div className="rounded-xl border border-border/80 bg-background/90 p-2.5 space-y-2">
                <span className="font-mono text-[11px] font-semibold text-muted-foreground block truncate">
                  {referralUrl}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs font-bold rounded-lg"
                  onClick={() => copyToClipboard(referralUrl, "ref")}
                >
                  {copiedRef ? (
                    <Check className="size-3.5 text-emerald-500 mr-1.5" />
                  ) : (
                    <Copy className="size-3.5 mr-1.5" />
                  )}
                  {copiedRef ? "Referral Link Copied!" : "Copy Referral Link"}
                </Button>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  Verified Star Badge
                </span>
                <span className="font-bold text-primary">450 LP</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Codebase & Platform Stats */}
        <div className="my-12">
          <div className="text-center pb-6 space-y-1">
            <h2 className="text-xl font-bold font-heading">Current Platform &amp; Codebase Statistics</h2>
            <p className="text-xs text-muted-foreground">
              Production scale metrics across Indian colleges and social layers
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-center space-y-1 hover:border-primary/40 transition-colors"
              >
                <div className="text-2xl sm:text-3xl font-black font-heading text-primary">{stat.value}</div>
                <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unlocked Capabilities Grid */}
        <div className="my-12">
          <div className="text-center pb-6 space-y-1">
            <h2 className="text-xl font-bold font-heading">What You Can Test With This Account</h2>
            <p className="text-xs text-muted-foreground">
              Zero-restriction student access across all 6 core pillars
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="border-border/50 bg-card/40 hover:border-primary/40 transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <f.icon className="size-4" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {f.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold pt-2">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Hub Explorer Strip */}
        <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-rose-500/10 to-amber-500/10 p-6 sm:p-8 my-8 text-center space-y-4">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-background border border-border/60 shadow-sm text-primary mx-auto">
            <School className="size-6" />
          </div>
          <div className="space-y-1 max-w-xl mx-auto">
            <h3 className="text-lg font-bold font-heading">Switch Across 1,350+ College Hubs</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Experience the campus feed for IIT Delhi, BITS Pilani, NIT Trichy, VIT Vellore, BIT Mesra, SRM,
              DTU, and more with instant scope toggling.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link href="/app/colleges">
              <Button variant="secondary" size="sm" className="rounded-full text-xs font-semibold">
                Explore All College Hubs
              </Button>
            </Link>
            <Link href="/handler/sign-in">
              <Button size="sm" className="rounded-full text-xs font-bold">
                Log In &amp; Start Testing
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
