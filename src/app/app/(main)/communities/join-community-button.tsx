"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinCommunity } from "./actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface JoinButtonProps {
  communityId: string;
  initialIsMember: boolean;
}

export function JoinCommunityButton({ communityId, initialIsMember }: JoinButtonProps) {
  const router = useRouter();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    try {
      const res = await joinCommunity(communityId);
      setIsMember(res.joined);
      toast.success(res.joined ? "Joined community! 🎉" : "Left community.");
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
      className={`h-8 px-4 text-xs font-semibold rounded-lg transition-all border cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
        isMember
          ? "bg-card text-muted-foreground border-border hover:bg-muted"
          : "bg-primary text-primary-foreground border-primary hover:bg-primary/95 shadow-xs"
      }`}
    >
      {isLoading && <Loader2 className="size-3 animate-spin" />}
      <span>{isMember ? "Joined" : "Join"}</span>
    </button>
  );
}
