"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface StoryAvatarItemProps {
  displayName: string;
  avatarUrl: string | null;
  hasUnseen?: boolean;
  isFriend?: boolean;
  onClick: () => void;
}

export function StoryAvatarItem({
  displayName,
  avatarUrl,
  hasUnseen = true,
  isFriend = false,
  onClick,
}: StoryAvatarItemProps) {
  const fallback = displayName ? displayName[0].toUpperCase() : "S";

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group focus:outline-none"
    >
      <div
        className={cn(
          "p-0.5 rounded-full transition-all duration-300 group-hover:scale-105",
          hasUnseen
            ? isFriend
              ? "bg-linear-to-tr from-emerald-500 via-teal-500 to-green-400 p-[2.5px] shadow-xs shadow-emerald-500/20"
              : "bg-linear-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2.5px] shadow-xs"
            : "p-[1.5px] border-2 border-muted-foreground/30 opacity-60 group-hover:opacity-100"
        )}
      >
        <Avatar className="h-14 w-14 border-2 border-background shadow-xs">
          <AvatarImage src={avatarUrl || ""} />
          <AvatarFallback className="font-bold text-xs bg-muted text-muted-foreground">
            {fallback}
          </AvatarFallback>
        </Avatar>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground truncate max-w-[64px]">
        {displayName}
      </span>
    </button>
  );
}
