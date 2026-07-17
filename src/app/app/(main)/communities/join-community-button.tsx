"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinCommunity } from "./actions";

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
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`h-8 px-4 text-xs font-semibold rounded-lg transition-all border cursor-pointer disabled:opacity-50 ${
        isMember 
          ? "bg-card text-muted-foreground border-border hover:bg-muted" 
          : "bg-primary text-primary-foreground border-primary hover:bg-primary/95"
      }`}
    >
      {isMember ? "Joined" : "Join"}
    </button>
  );
}
