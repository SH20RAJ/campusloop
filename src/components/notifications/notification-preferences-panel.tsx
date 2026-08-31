"use client";

import {
  AtSign,
  Bell,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Sparkles,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  type NotificationPreferenceSet,
  useNotificationPreferences,
} from "@/hooks/use-notification-preferences";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface PreferenceRow {
  key: keyof NotificationPreferenceSet;
  label: string;
  description: string;
  icon: ReactNode;
  /** Indented under the row above, and disabled while that row is off. */
  dependsOn?: keyof NotificationPreferenceSet;
}

const ROWS: PreferenceRow[] = [
  {
    key: "messages",
    label: "Direct messages",
    description: "Buzz your phone the moment a classmate DMs you",
    icon: <Send className="size-3.5 text-sky-500" />,
  },
  {
    key: "followedPosts",
    label: "Posts from people you follow",
    description: "Know when your friends and follows drop something new",
    icon: <Sparkles className="size-3.5 text-violet-500" />,
  },
  {
    key: "followedPostsFriendsOnly",
    label: "Only from mutual friends",
    description: "Narrow post alerts to people who follow you back",
    icon: <Users className="size-3.5 text-emerald-500" />,
    dependsOn: "followedPosts",
  },
  {
    key: "likes",
    label: "Likes on your posts",
    description: "Upvotes and hearts on what you shared",
    icon: <Heart className="size-3.5 text-rose-500" />,
  },
  {
    key: "comments",
    label: "Comments & replies",
    description: "Someone replied to your post or to your comment",
    icon: <MessageCircle className="size-3.5 text-blue-500" />,
  },
  {
    key: "mentions",
    label: "Mentions",
    description: "You were tagged with an @handle anywhere on campus",
    icon: <AtSign className="size-3.5 text-primary" />,
  },
  {
    key: "reposts",
    label: "Reposts & quotes",
    description: "Your post was carried to another campus feed",
    icon: <Repeat2 className="size-3.5 text-emerald-500" />,
  },
  {
    key: "follows",
    label: "New followers & friends",
    description: "Someone followed you, or followed you back",
    icon: <UserPlus className="size-3.5 text-primary" />,
  },
  {
    key: "matches",
    label: "Matches, crushes & vibes",
    description: "Campus Match, Secret Crush and story interactions",
    icon: <Zap className="size-3.5 text-amber-500" />,
  },
];

function ToggleRow({
  row,
  value,
  disabled,
  onChange,
}: {
  row: PreferenceRow;
  value: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={row.label}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all shadow-2xs",
        disabled
          ? "border-border/40 bg-muted/10 opacity-50 cursor-not-allowed"
          : "border-border/60 bg-background/50 hover:border-border cursor-pointer active:scale-[0.99]",
        row.dependsOn && "ml-4 w-[calc(100%-1rem)]"
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/50">
        {row.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-foreground">{row.label}</span>
        <span className="block text-[11px] text-muted-foreground truncate">{row.description}</span>
      </span>

      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          value ? "bg-primary" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-background shadow-sm transition-all",
            value ? "left-[1.125rem]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

/**
 * Account-wide notification switches for the settings page.
 *
 * These are the blunt instrument — "never ping me about likes". Silencing one
 * specific person without silencing the whole category is done from that
 * person's profile instead, via `MuteUserButton`.
 */
export function NotificationPreferencesPanel() {
  const { preferences, isLoading, setPreference } = useNotificationPreferences();

  async function handleChange(key: keyof NotificationPreferenceSet, next: boolean) {
    sounds.tap();
    haptics.light();
    const ok = await setPreference(key, next);
    if (!ok) {
      haptics.error();
      toast.error("Could not save that setting. Please try again.");
    }
  }

  return (
    <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-3">
      <div>
        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Bell className="size-3.5 text-primary" /> What you get notified about
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Turn off a whole category here. To silence one person without silencing everyone, open their profile
          and mute them there.
        </p>
      </div>

      <div className={cn("space-y-2 pt-1", isLoading && "opacity-60")}>
        {ROWS.map((row) => (
          <ToggleRow
            key={row.key}
            row={row}
            value={preferences[row.key]}
            disabled={isLoading || (row.dependsOn ? !preferences[row.dependsOn] : false)}
            onChange={(next) => handleChange(row.key, next)}
          />
        ))}
      </div>
    </div>
  );
}
