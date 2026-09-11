"use client";

import { X } from "lucide-react";
import { useMemo } from "react";
import { AudioPlayer } from "@/components/media/audio-player";
import { VideoPlayer } from "@/components/media/video-player";
import { extractEmbedsFromText, type ParsedEmbed } from "@/lib/embeds";
import { AppleMusicEmbed } from "./apple-music-embed";
import { ArticleEmbed } from "./article-embed";
import { CodePenEmbed } from "./codepen-embed";
import { CommunityEmbed } from "./community-embed";
import { EventEmbed } from "./event-embed";
import { InstagramEmbed } from "./instagram-embed";
import { LinkPreviewEmbed } from "./link-preview-embed";
import { LoomEmbed } from "./loom-embed";
import { NineGagEmbed } from "./ninegag-embed";
import { SoundCloudEmbed } from "./soundcloud-embed";
import { SpotifyEmbed } from "./spotify-embed";
import { UserProfileEmbed } from "./user-profile-embed";
import { VimeoEmbed } from "./vimeo-embed";
import { YouTubeEmbed } from "./youtube-embed";

interface PostEmbedRendererProps {
  content?: string;
  embeds?: ParsedEmbed[];
  limit?: number;
  dismissable?: boolean;
  onDismiss?: (rawUrl: string) => void;
}

export function PostEmbedRenderer({
  content,
  embeds: directEmbeds,
  limit = 2,
  dismissable = false,
  onDismiss,
}: PostEmbedRendererProps) {
  const embeds = useMemo(() => {
    if (directEmbeds) return directEmbeds;
    if (!content) return [];
    return extractEmbedsFromText(content);
  }, [directEmbeds, content]);

  if (!embeds || embeds.length === 0) return null;

  const visibleEmbeds = limit ? embeds.slice(0, limit) : embeds;

  return (
    <div className="mt-1 space-y-2.5">
      {visibleEmbeds.map((embed, idx) => {
        const key = `${embed.type}-${embed.rawUrl}-${idx}`;

        const renderContent = () => {
          switch (embed.type) {
            case "ninegag":
              return <NineGagEmbed key={key} gagId={embed.id} rawUrl={embed.rawUrl} isHome={embed.isHome} />;

            case "spotify":
              return embed.embedUrl ? (
                <SpotifyEmbed key={key} embedUrl={embed.embedUrl} rawUrl={embed.rawUrl} />
              ) : null;

            case "soundcloud":
              return embed.embedUrl ? (
                <SoundCloudEmbed key={key} embedUrl={embed.embedUrl} rawUrl={embed.rawUrl} />
              ) : null;

            case "apple_music":
              return embed.embedUrl ? (
                <AppleMusicEmbed key={key} embedUrl={embed.embedUrl} rawUrl={embed.rawUrl} />
              ) : null;

            case "youtube":
              return embed.id ? <YouTubeEmbed key={key} videoId={embed.id} rawUrl={embed.rawUrl} /> : null;

            case "instagram":
              return embed.embedUrl ? (
                <InstagramEmbed key={key} embedUrl={embed.embedUrl} rawUrl={embed.rawUrl} id={embed.id} />
              ) : null;

            case "codepen":
              return embed.embedUrl ? (
                <CodePenEmbed
                  key={key}
                  embedUrl={embed.embedUrl}
                  penId={embed.id}
                  author={embed.author}
                  rawUrl={embed.rawUrl}
                />
              ) : null;

            case "loom":
              return embed.embedUrl ? (
                <LoomEmbed key={key} embedUrl={embed.embedUrl} rawUrl={embed.rawUrl} />
              ) : null;

            case "vimeo":
              return embed.embedUrl ? (
                <VimeoEmbed key={key} embedUrl={embed.embedUrl} rawUrl={embed.rawUrl} id={embed.id} />
              ) : null;

            case "audio":
              return <AudioPlayer key={key} src={embed.rawUrl} title="Audio Track" />;

            case "video":
              return <VideoPlayer key={key} src={embed.rawUrl} />;

            case "internal_profile":
              return embed.username ? <UserProfileEmbed key={key} username={embed.username} /> : null;

            case "internal_community":
              return embed.slug ? <CommunityEmbed key={key} slugOrId={embed.slug} /> : null;

            case "internal_event":
              return embed.id ? <EventEmbed key={key} eventId={embed.id} /> : null;

            case "internal_article":
              return embed.slug ? <ArticleEmbed key={key} slug={embed.slug} /> : null;

            case "opengraph":
              return <LinkPreviewEmbed key={key} url={embed.rawUrl} />;

            default:
              return null;
          }
        };

        const rendered = renderContent();
        if (!rendered) return null;

        if (dismissable && onDismiss) {
          return (
            <div key={key} className="group relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(embed.rawUrl);
                }}
                className="absolute right-2 top-4 z-20 flex size-6.5 items-center justify-center rounded-full bg-black/75 text-white backdrop-blur-md transition-all hover:bg-destructive active:scale-95 shadow-md cursor-pointer"
                title="Remove preview"
                aria-label="Remove preview"
              >
                <X className="size-3.5" />
              </button>
              {rendered}
            </div>
          );
        }

        return rendered;
      })}
    </div>
  );
}
