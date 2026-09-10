"use client";

import { Link2, Plus, X } from "lucide-react";
import {
  MAX_CUSTOM_LINKS,
  SOCIAL_LINK_CATEGORIES,
  SOCIAL_PLATFORMS,
  type SocialLinks,
} from "@/lib/social-links";
import { cn } from "@/lib/utils";

interface SocialLinksEditorProps {
  value: SocialLinks;
  onChange: (next: SocialLinks) => void;
}

export function SocialLinksEditor({ value, onChange }: SocialLinksEditorProps) {
  const filled = Object.keys(value.platforms).length + value.custom.length;

  function setPlatform(key: string, raw: string) {
    const platforms = { ...value.platforms };
    if (raw.trim()) platforms[key] = raw;
    else delete platforms[key];
    onChange({ ...value, platforms });
  }

  function setCustom(index: number, patch: Partial<{ label: string; url: string }>) {
    const custom = value.custom.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange({ ...value, custom });
  }

  function addCustom() {
    if (value.custom.length >= MAX_CUSTOM_LINKS) return;
    onChange({ ...value, custom: [...value.custom, { label: "", url: "" }] });
  }

  function removeCustom(index: number) {
    onChange({ ...value, custom: value.custom.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Link2 className="size-3.5 text-primary" /> Links & Socials
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Coding profiles, socials, channels, portfolio — type a username or paste a full URL.
          </p>
        </div>
        {filled > 0 && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            {filled} added
          </span>
        )}
      </div>

      {SOCIAL_LINK_CATEGORIES.map((category) => (
        <div key={category} className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{category}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SOCIAL_PLATFORMS.filter((p) => p.category === category).map((platform) => (
              <label
                key={platform.key}
                className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-2.5 py-2 focus-within:border-primary transition-colors"
                title={platform.hint}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black"
                  style={{ backgroundColor: `${platform.color}22`, color: platform.color }}
                >
                  {platform.monogram}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold text-muted-foreground leading-none">
                    {platform.label}
                  </span>
                  <input
                    type="text"
                    value={value.platforms[platform.key] ?? ""}
                    onChange={(e) => setPlatform(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    maxLength={300}
                    className="mt-1 w-full bg-transparent text-xs font-semibold text-foreground placeholder:text-muted-foreground/50 outline-none"
                  />
                </span>
                {value.platforms[platform.key] && (
                  <button
                    type="button"
                    onClick={() => setPlatform(platform.key, "")}
                    className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                    aria-label={`Clear ${platform.label}`}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-2 pt-1 border-t border-border/40">
        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Custom links ({value.custom.length}/{MAX_CUSTOM_LINKS})
          </p>
          {value.custom.length < MAX_CUSTOM_LINKS && (
            <button
              type="button"
              onClick={addCustom}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              <Plus className="size-3.5" /> Add link
            </button>
          )}
        </div>
        {value.custom.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={link.label}
              onChange={(e) => setCustom(i, { label: e.target.value })}
              placeholder="Label (e.g. Blog, Club, Startup)"
              maxLength={30}
              className={cn(
                "w-28 shrink-0 rounded-xl border border-border/60 bg-muted/20 px-3 py-2",
                "text-xs font-semibold outline-none focus:border-primary"
              )}
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => setCustom(i, { url: e.target.value })}
              placeholder="https://..."
              maxLength={300}
              className="flex-1 min-w-0 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs font-semibold outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => removeCustom(i)}
              className="size-8 shrink-0 rounded-xl border border-border/60 text-muted-foreground hover:text-destructive flex items-center justify-center cursor-pointer"
              aria-label="Remove custom link"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
