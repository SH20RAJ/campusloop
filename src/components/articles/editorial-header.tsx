"use client";

import { ArrowLeft, LayoutDashboard, PenTool, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface EditorialHeaderProps {
  profile: {
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export function EditorialHeader({ profile }: EditorialHeaderProps) {
  const pathname = usePathname();

  // Hide the global editorial top bar on editor pages to avoid redundant double-headers on mobile
  if (pathname.includes("/articles/new") || pathname.includes("/edit")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl select-none">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Feed Back Link + Logo & Publication Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/app"
            className="flex size-8.5 items-center justify-center rounded-full border border-border/40 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
            title="Back to Campus Feed"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <Link href="/app/articles" className="flex items-center gap-2 group min-w-0">
            <img
              src="/logo.png"
              alt="CampusLoop"
              className="size-7 object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col truncate">
              <span className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-1">
                <span>Campus</span>
                <span className="text-primary font-black">Editorial</span>
              </span>
            </div>
          </Link>

          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black border border-primary/20 ml-1">
            <Zap className="size-3" />
            <span>Student Edition</span>
          </span>
        </div>

        {/* Right: Actions (Write, Dashboard, Theme, User) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/app/articles/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Drafts</span>
          </Link>

          <Link
            href="/app/articles/new"
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 shadow-xs shadow-primary/20 transition-all cursor-pointer active:scale-95"
          >
            <PenTool className="size-3.5" />
            <span className="hidden sm:inline">Write (+15 LP)</span>
            <span className="sm:hidden">Write</span>
          </Link>

          <ThemeToggle className="size-8.5 rounded-full border border-border/40 bg-muted/40 hover:bg-muted" />

          <Link
            href="/app/profile"
            className="flex items-center gap-2 pl-0.5 group cursor-pointer"
            title={`Logged in as @${profile.username}`}
          >
            <Avatar className="size-8 border border-border/60 transition-transform group-hover:scale-105">
              <AvatarImage src={profile.avatarUrl || ""} />
              <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                {profile.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
