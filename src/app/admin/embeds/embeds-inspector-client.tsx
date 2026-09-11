"use client";

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Layers,
  Link2,
  Music,
  Play,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Tv,
} from "lucide-react";
import { useState } from "react";
import { PostEmbedRenderer } from "@/components/embeds/post-embed-renderer";
import { extractEmbedsFromText, type ParsedEmbed } from "@/lib/embeds";
import { sounds } from "@/lib/sounds";
import { haptics } from "@/lib/haptics";

const SAMPLE_URLS = [
  { label: "9GAG Meme", url: "https://9gag.com/gag/aYV9Xq1" },
  { label: "9GAG Portal", url: "https://9gag.com/home" },
  { label: "Spotify Track", url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" },
  { label: "SoundCloud", url: "https://soundcloud.com/octobersveryown/drake-back-to-back-freestyle" },
  { label: "Apple Music", url: "https://music.apple.com/us/album/starboy/1440871441?i=1440871446" },
  { label: "YouTube Video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { label: "CodePen Demo", url: "https://codepen.io/pen/" },
  { label: "Loom Walkthrough", url: "https://www.loom.com/share/sample123" },
];

const ALLOWED_DOMAINS = [
  { domain: "9gag.com", category: "Humor & Memes", provider: "9GAG Video/Image Player", safe: true },
  { domain: "open.spotify.com", category: "Music & Audio", provider: "Spotify iFrame Player", safe: true },
  { domain: "soundcloud.com", category: "Music & Audio", provider: "SoundCloud HTML5 Player", safe: true },
  { domain: "music.apple.com", category: "Music & Audio", provider: "Apple Music Web Player", safe: true },
  { domain: "youtube.com / youtu.be", category: "Video", provider: "YouTube Embedded Player", safe: true },
  { domain: "vimeo.com", category: "Video", provider: "Vimeo Player", safe: true },
  { domain: "loom.com", category: "Video Walkthrough", provider: "Loom Recorder", safe: true },
  { domain: "codepen.io", category: "Developer Tools", provider: "CodePen Interactive Canvas", safe: true },
  { domain: "instagram.com", category: "Social Media", provider: "Instagram Embed", safe: true },
];

export function EmbedsInspectorClient() {
  const [testUrl, setTestUrl] = useState("https://9gag.com/gag/aYV9Xq1");

  const detectedEmbeds: ParsedEmbed[] = extractEmbedsFromText(testUrl);
  const embed = detectedEmbeds[0];

  function handleSelectSample(url: string) {
    sounds.tap();
    haptics.light();
    setTestUrl(url);
  }

  return (
    <div className="space-y-8">
      {/* ─── Interactive URL Embed Sandbox ─── */}
      <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" />
            Live URL Embed Inspector &amp; Sandbox
          </h3>
          <p className="text-xs text-muted-foreground">
            Test external media URLs across all supported audio, video, and interactive providers in real-time
          </p>
        </div>

        {/* Input Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Paste any 9GAG, Spotify, SoundCloud, YouTube, or Apple Music link..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/40 border border-border/50 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
              />
            </div>
            {testUrl && (
              <button
                type="button"
                onClick={() => setTestUrl("")}
                className="px-3 py-2.5 rounded-xl bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Preset Sample Links */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
              Test samples:
            </span>
            {SAMPLE_URLS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleSelectSample(sample.url)}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/50 hover:bg-muted text-foreground transition-colors shrink-0 cursor-pointer border border-border/30"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Embed Inspection Output */}
        <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Metadata Inspector Card */}
          <div className="lg:col-span-5 p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-3 shadow-2xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Parser Inspection Telemetry
            </h4>

            {embed ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-bold text-foreground uppercase">{embed.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Safety Status</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> ALLOWLISTED
                  </span>
                </div>
                {embed.title && (
                  <div className="py-1 border-b border-border/20">
                    <span className="text-muted-foreground block mb-0.5">Extracted Title</span>
                    <span className="font-bold text-foreground leading-snug">{embed.title}</span>
                  </div>
                )}
                {embed.embedUrl && (
                  <div className="py-1 border-b border-border/20">
                    <span className="text-muted-foreground block mb-0.5">Embed Iframe URL</span>
                    <span className="font-mono text-[11px] text-muted-foreground break-all">
                      {embed.embedUrl}
                    </span>
                  </div>
                )}
                <div className="py-1">
                  <span className="text-muted-foreground block mb-0.5">Raw Source URL</span>
                  <span className="font-mono text-[11px] text-muted-foreground break-all">
                    {embed.rawUrl}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-xs text-muted-foreground font-semibold">
                  No supported embed recognized for this URL.
                </p>
              </div>
            )}
          </div>

          {/* Live Player Sandbox */}
          <div className="lg:col-span-7 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tv className="h-3.5 w-3.5 text-primary" />
              Live Responsive Timeline Player
            </h4>

            {testUrl.trim() ? (
              <div className="rounded-2xl border border-border/30 bg-background/50 p-3 shadow-2xs">
                <PostEmbedRenderer content={testUrl} />
              </div>
            ) : (
              <div className="py-12 rounded-2xl border border-dashed border-border/40 text-center text-xs text-muted-foreground">
                Paste a URL above to see the live player preview.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Allowed Media Domains Policy ─── */}
      <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" />
              CampusLoop Verified Embed Providers &amp; Whitelist
            </h3>
            <p className="text-xs text-muted-foreground">
              External services allowed to embed media players inside student posts and chat
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            {ALLOWED_DOMAINS.length} Providers Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALLOWED_DOMAINS.map((domain) => (
            <div
              key={domain.domain}
              className="p-3.5 rounded-2xl bg-muted/20 border border-border/30 space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground">{domain.domain}</span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> ALLOWED
                </span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground">{domain.category}</p>
              <p className="text-[10px] text-muted-foreground/80">{domain.provider}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
