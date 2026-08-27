"use client";

import { createCommunity } from "@/app/app/(main)/communities/actions";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
CheckCircle2,
EyeOff,
Globe,
Loader2,
Lock,
Plus,
Trash2,
Users2,
Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  "Tech & Coding",
  "Music & Arts",
  "Gaming & Anime",
  "Sports & Fitness",
  "Academics & Placements",
  "Memes & Culture",
  "General",
];

export function CreateCommunityClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE" | "UNLISTED">("PUBLIC");
  const [allowAnonymousPosts, setAllowAnonymousPosts] = useState(true);

  // Rules list
  const [rules, setRules] = useState<Array<{ title: string; description: string }>>([
    { title: "Be respectful to peers", description: "No hate speech, harassment, or personal attacks." },
    { title: "Stay relevant", description: "Keep discussions and media focused on this community's theme." },
  ]);

  function handleAddRule() {
    if (rules.length >= 6) {
      toast.error("Maximum 6 rules allowed");
      return;
    }
    setRules([...rules, { title: "", description: "" }]);
  }

  function handleRemoveRule(index: number) {
    setRules(rules.filter((_, i) => i !== index));
  }

  function handleRuleChange(index: number, field: "title" | "description", value: string) {
    const updated = [...rules];
    updated[index][field] = value;
    setRules(updated);
  }

  const generatedSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a community name");
      return;
    }

    setLoading(true);
    try {
      const validRules = rules.filter((r) => r.title.trim().length > 0);
      const newComm = await createCommunity({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        privacy,
        allowAnonymousPosts,
        rules: validRules.length > 0 ? JSON.stringify(validRules) : undefined,
      });

      toast.success(`c/${newComm.name} created! +100 LP awarded 🎉`);
      router.push(`/app/communities/${newComm.slug || newComm.id}`);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to create community");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-24 px-3 sm:px-4 pt-3 gap-5 select-none animate-in fade-in">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/communities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/40 hover:bg-muted px-3.5 py-1.5 rounded-full"
        >
          <ArrowLeft className="size-3.5" /> Back to Communities
        </Link>
      </div>

      {/* Hero Card */}
      <div className="rounded-3xl bg-card p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Users2 className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">Create a Campus Community</h1>
            <p className="text-xs text-muted-foreground">
              Build an interest club, branch group, or discussion hub for your campus.
            </p>
          </div>
        </div>

        {/* Founder LP Clout Perk */}
        <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <Zap className="size-4 text-amber-500 shrink-0" /> Founder Perk: +100 LP Clout
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold shrink-0">
            Instant Admin Role
          </span>
        </div>
      </div>

      {/* Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Identity & Name */}
        <div className="rounded-3xl bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
            1. Community Identity
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Community Name *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                c/
              </span>
              <input
                type="text"
                required
                maxLength={40}
                placeholder="e.g. bit-coders, campus-rock, formula-racing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 pl-8 pr-4 rounded-full border border-border/60 bg-muted/20 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all"
              />
            </div>
            {name.trim() && (
              <p className="text-[11px] text-muted-foreground pl-3">
                URL Preview: <strong className="text-foreground">campusloop.space/app/communities/{generatedSlug}</strong>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between border",
                    category === cat
                      ? "bg-foreground text-background border-foreground font-black shadow-2xs"
                      : "bg-muted/20 text-muted-foreground border-border/50 hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{cat}</span>
                  {category === cat && <CheckCircle2 className="size-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">About & Purpose</label>
            <textarea
              rows={3}
              maxLength={300}
              placeholder="What is this community about? What topics or events will you discuss?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-2xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all resize-none"
            />
          </div>
        </div>

        {/* 2. Privacy & Access Settings */}
        <div className="rounded-3xl bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
            2. Privacy &amp; Access Controls
          </h2>

          <div className="grid gap-2.5">
            {/* Public */}
            <div
              onClick={() => setPrivacy("PUBLIC")}
              className={cn(
                "p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3",
                privacy === "PUBLIC"
                  ? "bg-primary/5 border-primary shadow-2xs"
                  : "bg-muted/10 border-border/60 hover:bg-muted/20"
              )}
            >
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Globe className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-foreground">Public Hub</h3>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Anyone on CampusLoop can view posts and join this sub-hub freely.
                </p>
              </div>
            </div>

            {/* Private */}
            <div
              onClick={() => setPrivacy("PRIVATE")}
              className={cn(
                "p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3",
                privacy === "PRIVATE"
                  ? "bg-primary/5 border-primary shadow-2xs"
                  : "bg-muted/10 border-border/60 hover:bg-muted/20"
              )}
            >
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <Lock className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs font-bold text-foreground">Private Hub</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Only approved members can view posts and participate. Non-members must submit a join request.
                </p>
              </div>
            </div>

            {/* Unlisted */}
            <div
              onClick={() => setPrivacy("UNLISTED")}
              className={cn(
                "p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3",
                privacy === "UNLISTED"
                  ? "bg-primary/5 border-primary shadow-2xs"
                  : "bg-muted/10 border-border/60 hover:bg-muted/20"
              )}
            >
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                <EyeOff className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs font-bold text-foreground">Secret / Unlisted Hub</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Hidden from search and the public directory. Only accessible via your private invite link.
                </p>
              </div>
            </div>
          </div>

          {/* Anonymous Posting Option */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-border/40">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">Allow Anonymous Posts</h4>
              <p className="text-[11px] text-muted-foreground">
                Permit members to post confessions &amp; questions with masked identities.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAllowAnonymousPosts(!allowAnonymousPosts)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                allowAnonymousPosts ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  allowAnonymousPosts ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {/* 3. Community Rules */}
        <div className="rounded-3xl bg-card p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
              3. Community Guidelines &amp; Rules
            </h2>
            <button
              type="button"
              onClick={handleAddRule}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3.5" /> Add Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-muted/20 border border-border/60 space-y-2 relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-muted-foreground">Rule #{idx + 1}</span>
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                      title="Remove Rule"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Rule Title (e.g. No Spamming)"
                  value={rule.title}
                  onChange={(e) => handleRuleChange(idx, "title", e.target.value)}
                  className="w-full h-8 px-3 rounded-xl border border-border/50 bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none"
                />

                <input
                  type="text"
                  placeholder="Short Description (Optional explanation)"
                  value={rule.description}
                  onChange={(e) => handleRuleChange(idx, "description", e.target.value)}
                  className="w-full h-8 px-3 rounded-xl border border-border/50 bg-card text-[11px] font-normal text-foreground placeholder:text-muted-foreground/60 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full h-11 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Founding Community...</span>
            </>
          ) : (
            <>
              <Zap className="size-4" />
              <span>Create Community &amp; Claim +100 LP</span>
            </>
          )}
        </button>
      </form>
    </main>
  );
}
