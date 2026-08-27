"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Hash,ShieldCheck,Users } from "lucide-react";
import { useEffect,useState } from "react";
import useSWR from "swr";

export interface MentionUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  points?: number;
  isVerified?: boolean;
  institutionName?: string | null;
  branch?: string | null;
}

export interface MentionHashtag {
  tag: string;
  count: number;
  formattedCount: string;
}

interface MentionsResponse {
  users: MentionUser[];
  hashtags: MentionHashtag[];
}

export interface TriggerContext {
  type: "mention" | "hashtag";
  query: string;
  startIndex: number;
  endIndex: number;
}

export function detectMentionTrigger(
  text: string,
  cursorPosition: number
): TriggerContext | null {
  if (cursorPosition < 0 || cursorPosition > text.length) return null;

  const textBeforeCursor = text.slice(0, cursorPosition);
  // Match word ending at cursor that starts with @ or #
  const match = textBeforeCursor.match(/(?:^|\s)([@#])([a-zA-Z0-9_\u0900-\u097F]*)$/);

  if (!match) return null;

  const symbol = match[1];
  const query = match[2];
  const startIndex = cursorPosition - query.length - 1; // index of @ or #
  const endIndex = cursorPosition;

  return {
    type: symbol === "@" ? "mention" : "hashtag",
    query,
    startIndex,
    endIndex,
  };
}

interface MentionSuggestionsProps {
  trigger: TriggerContext | null;
  onSelect: (replacement: string, trigger: TriggerContext) => void;
  onClose?: () => void;
  className?: string;
}

export function MentionSuggestions({
  trigger,
  onSelect,
  onClose,
  className,
}: MentionSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const query = trigger?.query || "";
  const type = trigger?.type === "mention" ? "users" : "hashtags";

  const { data } = useSWR<MentionsResponse>(
    trigger ? `/api/mentions?q=${encodeURIComponent(query)}&type=${type}` : null,
    fetcher,
    { dedupingInterval: 1000 }
  );

  const users = data?.users || [];
  const hashtags = data?.hashtags || [];

  const itemsCount = trigger?.type === "mention" ? users.length : hashtags.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [trigger?.query, trigger?.type]);

  // Handle keyboard events
  useEffect(() => {
    if (!trigger || itemsCount === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % itemsCount);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (!trigger) return;
        if (trigger.type === "mention" && users[selectedIndex]) {
          onSelect(`@${users[selectedIndex].username} `, trigger);
        } else if (trigger.type === "hashtag" && hashtags[selectedIndex]) {
          onSelect(`${hashtags[selectedIndex].tag} `, trigger);
        }
      }
 else if (e.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [trigger, itemsCount, selectedIndex, users, hashtags, onSelect, onClose]);

  if (!trigger || itemsCount === 0) return null;

  return (
    <div
      className={cn(
        "absolute z-50 w-72 sm:w-80 rounded-2xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-2xl p-1.5 overflow-hidden animate-in fade-in-50 zoom-in-95",
        className
      )}
    >
      <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/30">
        {trigger.type === "mention" ? (
          <>
            <Users className="size-3" />
            <span>Mention Student</span>
          </>
        ) : (
          <>
            <Hash className="size-3" />
            <span>Campus Hashtags</span>
          </>
        )}
      </div>

      <div className="max-h-56 overflow-y-auto no-scrollbar py-1 space-y-0.5">
        {trigger.type === "mention" &&
          users.map((user, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur
                  onSelect(`@${user.username} `, trigger);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer",
                  isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                )}
              >
                <Avatar className="size-8 border border-border/40 shrink-0">
                  <AvatarImage src={user.avatarUrl || ""} />
                  <AvatarFallback className="text-[11px] font-black bg-muted text-foreground">
                    {user.displayName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-black text-foreground truncate flex items-center gap-1">
                    <span>{user.displayName}</span>
                    {user.isVerified && (
                      <ShieldCheck className="size-3 text-[#1d9bf0] shrink-0" />
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    @{user.username}
                    {user.institutionName && ` · ${user.institutionName}`}
                  </p>
                </div>
              </button>
            );
          })}

        {trigger.type === "hashtag" &&
          hashtags.map((h, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={h.tag}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur
                  onSelect(`${h.tag} `, trigger);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer",
                  isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-foreground truncate">
                    {h.tag}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
                  {h.formattedCount}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
