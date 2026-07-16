"use client";

import { UserProfile } from "@/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

interface StoryRingProps {
  users: UserProfile[];
}

export function StoryRing({ users }: StoryRingProps) {
  return (
    <div className="flex w-full gap-4 overflow-x-auto px-4 pb-4 pt-6 scrollbar-hide">
      {/* Current User Story Placeholder */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-primary to-amber-300">
          <div className="rounded-full bg-background p-[2px]">
            <Avatar className="h-16 w-16 border-2 border-transparent">
              <AvatarImage src="" />
              <AvatarFallback>+</AvatarFallback>
            </Avatar>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border-2 border-background bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
            Live
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground">You</span>
      </div>

      {/* Other Users */}
      {users.map((user, idx) => (
        <div key={user.id} className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "relative rounded-full p-[2px]",
              idx < 3 ? "bg-gradient-to-tr from-primary to-amber-300" : "bg-muted"
            )}
          >
            <div className="rounded-full bg-background p-[2px]">
              <Avatar className="h-16 w-16 border-2 border-transparent">
                <AvatarImage src={user.avatarUrl || ""} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate w-16 text-center">
            {user.displayName.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}
