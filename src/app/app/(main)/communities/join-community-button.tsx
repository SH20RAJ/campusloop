"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { joinCommunity } from "./actions";

interface JoinButtonProps {
  communityId: string;
  initialIsMember: boolean;
  className?: string;
}

export function JoinCommunityButton({
  communityId,
  initialIsMember,
  className,
}: JoinButtonProps) {
  const router = useRouter();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    try {
      const res = await joinCommunity(communityId);
      setIsMember(res.joined);
      toast.success(res.joined ? "Joined community!" : "Left community.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update membership");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "h-8 px-4 text-xs font-bold rounded-full transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95",
        isMember
          ? "border border-border/60 bg-transparent text-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
          : "bg-foreground text-background hover:opacity-90 shadow-2xs",
        className
      )}
    >
      {isLoading && <Loader2 className="size-3 animate-spin" />}
      <span>{isMember ? "Joined" : "Join"}</span>
    </button>
  );
}
