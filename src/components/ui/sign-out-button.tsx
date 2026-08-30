"use client";

import { cn } from "@/lib/utils";
import { useUser } from "@hexclave/next";
import { Loader2,LogOut } from "lucide-react";
import { useState } from "react";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "icon" | "button" | "menu-item";
  showText?: boolean;
}

export function SignOutButton({
  className,
  children,
  variant = "button",
  showText = true,
}: SignOutButtonProps) {
  useUser({ or: "return-null" });
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isSigningOut) return;

    setIsSigningOut(true);
    window.location.href = "/logout";
  }


  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={cn(
          "flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-50",
          className
        )}
        title="Sign Out"
        aria-label="Sign out"
      >
        {isSigningOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
      </button>
    );
  }

  if (variant === "menu-item") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={cn(
          "flex w-full items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left disabled:opacity-50",
          className
        )}
      >
        {isSigningOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
        {children || <span>Sign Out</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border/60 bg-transparent px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer active:scale-95 disabled:opacity-50",
        className
      )}
    >
      {isSigningOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
      {children || (showText ? <span>Sign out</span> : null)}
    </button>
  );
}
