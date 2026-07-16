"use client";

import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/db/schema";

interface NavigationProps {
  profile?: UserProfile;
  collegeName?: string;
  isAdmin?: boolean;
}

const navGroups = [
  {
    label: "Social",
    items: [
      { icon: Home, href: "/app/campus", label: "Campus Feed", color: "text-rose-500 hover:bg-rose-500/10" },
      { icon: Compass, href: "/app/discover", label: "Discover", color: "text-blue-500 hover:bg-blue-500/10" },
      { icon: Heart, href: "/app/confessions", label: "Confessions", color: "text-pink-500 hover:bg-pink-500/10" },
    ],
  },
  {
    label: "Connect",
    items: [
      { icon: Users, href: "/app/communities", label: "Communities", color: "text-emerald-500 hover:bg-emerald-500/10" },
      { icon: Sparkles, href: "/app/dating", label: "Campus Matches", color: "text-violet-500 hover:bg-violet-500/10" },
      { icon: MessageSquare, href: "/app/chat", label: "Messages", color: "text-sky-500 hover:bg-sky-500/10" },
    ],
  },
  {
    label: "Personal",
    items: [
      { icon: Bell, href: "/app/notifications", label: "Notifications", color: "text-amber-500 hover:bg-amber-500/10" },
      { icon: UserCircle, href: "/app/profile", label: "Profile", color: "text-teal-500 hover:bg-teal-500/10" },
    ],
  },
];

const adminGroup = {
  label: "Control Panel",
  items: [
    { icon: Shield, href: "/admin", label: "Admin Console", color: "text-destructive hover:bg-destructive/10" },
  ],
};

const mobileItems = [
  { icon: Home, href: "/app/campus", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Discover" },
  { icon: Plus, href: "/app/post/new", label: "" },
  { icon: Sparkles, href: "/app/dating", label: "Dating" },
  { icon: Bell, href: "/app/notifications", label: "Alerts" },
];

const VIBES = [
  { emoji: "🔥", label: "Hustling", class: "bg-orange-500/10 text-orange-500 border-orange-500/25" },
  { emoji: "😴", label: "Lurking", class: "bg-blue-500/10 text-blue-500 border-blue-500/25" },
  { emoji: "💬", label: "Yapping", class: "bg-pink-500/10 text-pink-500 border-pink-500/25" },
  { emoji: "📚", label: "Studying", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" },
  { emoji: "☕", label: "Caffeinated", class: "bg-amber-500/10 text-amber-500 border-amber-500/25" },
];

export function Navigation({ profile, collegeName = "Your College", isAdmin }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [vibeIdx, setVibeIdx] = useState(0);

  // Load vibe from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cl_user_vibe");
    if (saved) {
      const idx = VIBES.findIndex((v) => v.label === saved);
      if (idx !== -1) setVibeIdx(idx);
    }
  }, []);

  const changeVibe = () => {
    const next = (vibeIdx + 1) % VIBES.length;
    setVibeIdx(next);
    localStorage.setItem("cl_user_vibe", VIBES[next].label);
  };

  const currentVibe = VIBES[vibeIdx];
  const groups = isAdmin ? [...navGroups, adminGroup] : navGroups;

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen border-r border-border bg-card/65 backdrop-blur-xl transition-all duration-300 md:flex md:flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex items-center border-b border-border/80 px-4",
            collapsed ? "justify-center h-16" : "justify-between h-16"
          )}
        >
          <Link href="/app/campus" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-orange-500 text-xs font-bold text-white shadow-md shadow-primary/20">
              CL
              <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500 border border-background animate-ping" />
            </div>
            {!collapsed && (
              <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent">
                CampusLoop
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Trigger */}
        {collapsed && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => setCollapsed(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* User Digital Student ID Badge */}
        {profile && !collapsed ? (
          <div className="mx-4 mt-4 relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted/20 p-4 shadow-sm group">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11 shrink-0 border-2 border-background shadow-md">
                <AvatarImage src={profile?.avatarUrl || ""} />
                <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                  {profile?.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-xs font-bold text-foreground">
                    {profile?.displayName || "Student"}
                  </p>
                  {isAdmin && (
                    <span className="rounded bg-destructive/10 px-1 py-0.5 text-[8px] font-bold text-destructive">
                      Staff
                    </span>
                  )}
                </div>
                <p className="truncate text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                  <Zap className="h-2.5 w-2.5 text-primary shrink-0" />
                  {collegeName}
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                My Vibe
              </span>
              <button
                onClick={changeVibe}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all active:scale-95 cursor-pointer shadow-sm",
                  currentVibe.class
                )}
              >
                <span>{currentVibe.emoji}</span>
                <span>{currentVibe.label}</span>
              </button>
            </div>
          </div>
        ) : collapsed && profile ? (
          <div className="mx-auto mt-4 flex flex-col items-center gap-2">
            <button onClick={changeVibe} className="relative cursor-pointer group">
              <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={profile?.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{profile?.displayName?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-card border border-border text-[9px] shadow-sm">
                {currentVibe.emoji}
              </span>
            </button>
          </div>
        ) : null}

        {/* Navigation Lists */}
        <nav className="mt-6 flex-1 overflow-y-auto px-3 space-y-5 scrollbar-hide">
          {groups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 border-l border-border/60 ml-1">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                        collapsed && "justify-center px-0 rounded-2xl h-11 w-11 mx-auto",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                          : cn("text-muted-foreground hover:text-foreground", item.color)
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                          isActive && "text-primary-foreground"
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions Area */}
        <div className={cn("border-t border-border/80 p-3 bg-muted/5", collapsed && "flex flex-col items-center gap-2")}>
          {!collapsed ? (
            <div className="space-y-3">
              <Link href="/app/post/new">
                <Button className="w-full gap-2 text-xs font-bold bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-95 shadow-md shadow-primary/10 hover:shadow-lg transition-all h-9 rounded-xl cursor-pointer">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </Link>
              
              <div className="flex items-center justify-between px-1 text-xs">
                <Link
                  href="/app/profile"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                
                <Link
                  href="/handler/sign-out"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive font-semibold transition-colors animate-in"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Link>
              </div>
            </div>
          ) : (
            <Link href="/app/post/new">
              <Button size="icon" className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-orange-500 shadow-md cursor-pointer">
                <Plus className="h-5 w-5 text-white" />
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* ─── Mobile Bottom Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/80 bg-card/90 backdrop-blur-md px-2 shadow-lg md:hidden">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.label === "") {
            return (
              <Link
                key="create"
                href="/app/post/new"
                className="relative -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-orange-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-6 w-6" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-0.5 text-[9px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
