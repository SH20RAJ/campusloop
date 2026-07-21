"use client";

import {
  Home,
  Compass,
  Heart,
  MessageSquare,
  Sparkles,
  Users,
  Bell,
  Plus,
  UserCircle,
  Shield,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { UserProfile } from "@/db/schema";

interface NavigationProps {
  profile?: UserProfile;
  collegeName?: string;
  isAdmin?: boolean;
}

export function Navigation({ profile, isAdmin }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, href: "/app", label: "Home" },
    { icon: Compass, href: "/app/discover", label: "Discover" },
    { icon: Heart, href: "/app/confessions", label: "Confessions" },
    { icon: Users, href: "/app/communities", label: "Communities" },
    { icon: Sparkles, href: "/app/dating", label: "Matches" },
    { icon: MessageSquare, href: "/app/chat", label: "Messages" },
    { icon: Bell, href: "/app/notifications", label: "Notifications" },
    { icon: UserCircle, href: "/app/profile", label: "Profile" },
  ];

  if (isAdmin) {
    navItems.push({ icon: Shield, href: "/admin", label: "Admin Console" });
  }

  const mobileItems = [
    { icon: Home, href: "/app", label: "Home" },
    { icon: Compass, href: "/app/discover", label: "Discover" },
    { icon: Plus, href: "/app/post/new", label: "" },
    { icon: MessageSquare, href: "/app/chat", label: "Chat" },
    { icon: Bell, href: "/app/notifications", label: "Alerts" },
  ];

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 border-r border-border bg-background py-6 px-4 md:flex md:flex-col justify-between">
        <div className="space-y-6">
          {/* Logo / Text brand */}
          <Link href="/app" className="flex items-center gap-2 px-3 text-lg font-black tracking-tight text-foreground select-none">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-6 w-6 object-cover rounded-lg" />
            <span>CampusLoop</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-4 py-3 text-xs font-bold transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions Area */}
        <div className="space-y-3 pt-4 border-t border-border/60">
          <Link href="/app/post/new" className="block">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-sm hover:shadow-md border-none transition-all duration-200">
              ✨ Create Post
            </Button>
          </Link>

          {profile && (
            <Link href="/app/profile" className="block group">
              <div className="flex items-center justify-between gap-2.5 px-3 py-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors duration-200 border border-border/50 hover:border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0 border border-border/50 group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={profile.avatarUrl || ""} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary/20 text-primary">
                      {profile.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">{profile.displayName}</p>
                    <p className="truncate text-[9px] text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  <ThemeToggle className="h-7 w-7 rounded-lg border-none bg-transparent hover:bg-background transition-colors" />
                  <Link
                    href="/handler/sign-out"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
                    title="Sign out"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LogOut className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Link>
          )}
        </div>
      </aside>

      {/* ─── Mobile Bottom Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background px-2 md:hidden shadow-md">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.label === "") {
            return (
              <Link
                key="create"
                href="/app/post/new"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95 border-none"
              >
                <Plus className="h-5 w-5" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 relative",
                isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="mt-0.5 text-[8.5px] font-bold">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 size-1 rounded-full bg-foreground" />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
