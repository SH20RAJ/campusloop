"use client";

import { MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FollowButton } from "@/components/profile/follow-button";

interface PublicFollowButtonProps {
  username: string;
  displayName: string;
  profileId: string;
  initialIsFollowing?: boolean;
  isSignedIn?: boolean;
}

export function PublicFollowButton({
  username,
  displayName,
  profileId,
  initialIsFollowing = false,
  isSignedIn = false,
}: PublicFollowButtonProps) {
  const router = useRouter();
  const [showSignInModal, setShowSignInModal] = useState(false);

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/app/chat?userId=${profileId}`}
          className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card h-8 sm:h-9 px-3 sm:px-4 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-all cursor-pointer"
        >
          <MessageSquare className="size-3.5" />
          <span className="hidden sm:inline">Message</span>
        </Link>
        <FollowButton username={username} displayName={displayName} initialIsFollowing={initialIsFollowing} />
      </div>
    );
  }

  function handleFollowClick() {
    toast.info(`Join CampusLoop to follow @${username} and see their campus updates!`);
    router.push(`/join?mode=signup&returnUrl=/@${username}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/join?mode=signin&returnUrl=/@${username}`}
        className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-all cursor-pointer"
      >
        <MessageSquare className="size-3.5 text-muted-foreground" />
        <span>Message</span>
      </Link>

      <button
        type="button"
        onClick={handleFollowClick}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary h-8 sm:h-9 px-4 sm:px-5 text-xs font-black text-primary-foreground shadow-md hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
      >
        <UserPlus className="size-3.5" />
        <span>Follow</span>
      </button>
    </div>
  );
}
