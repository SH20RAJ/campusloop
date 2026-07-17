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
  Flame,
  Ghost,
  BookOpen,
  Coffee,
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

const navGroups = [
  {
    label: "Social",
    items: [
      { icon: Home, href: "/app", label: "Campus Feed", color: "text-rose-500 hover:bg-rose-500/10" },
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
  { icon: Home, href: "/app", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Discover" },
  { icon: Plus, href: "/app/post/new", label: "" },
  { icon: Sparkles, href: "/app/dating", label: "Dating" },
  { icon: Bell, href: "/app/notifications", label: "Alerts" },
];

const VIBES = [
  { icon: Flame, label: "Hustling", class: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { icon: Ghost, label: "Lurking", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { icon: MessageSquare, label: "Yapping", class: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { icon: BookOpen, label: "Studying", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { icon: Coffee, label: "Caffeinated", class: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
];

export function Navigation({ profile, collegeName = "Your College", isAdmin }: NavigationProps) {
  const pathname = usePathname();
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
          "fixed left-0 top-0 z-30 hidden h-screen border-r border-border bg-[#09070F]/80 dark:bg-[#09070F]/90 backdrop-blur-xl transition-all duration-300 md:flex md:flex-col shadow-[4px_0_30px_rgba(0,0,0,0.15)]",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex items-center px-4 border-b border-border/30",
            collapsed ? "justify-center h-16" : "justify-between h-16"
          )}
        >
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-logo-gradient p-0.5 shadow-md shadow-primary/10 transition-transform hover:scale-105">
              <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-105 rounded-lg bg-black/40" />
              <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[#09070F] animate-ping" />
            </div>
            {!collapsed && (
              <span className="bg-hero-gradient bg-clip-text text-base font-black tracking-tight text-transparent">
                CampusLoop
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/15 hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed Toggle Trigger */}
        {collapsed && (
          <div className="flex justify-center py-2 border-b border-border/25">
            <button
              onClick={() => setCollapsed(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/15 hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Virtual Student ID Card */}
        {profile && !collapsed ? (
          <div className="mx-4 mt-5 relative overflow-hidden rounded-2xl border border-border/30 bg-muted/10 p-3 shadow-2xs group hover:border-primary/25 transition-all duration-300">
            {/* Holographic glowing line at the top */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary via-accent to-secondary opacity-80" />
            
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 border border-primary/20 shadow-inner group-hover:scale-102 transition-transform duration-300">
                <AvatarImage src={profile?.avatarUrl || ""} />
                <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                  {profile?.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold text-foreground">
                    {profile?.displayName || "Student"}
                  </p>
                  {isAdmin && (
                    <span className="rounded bg-destructive/15 px-1 py-0.5 text-[8px] font-bold text-destructive shrink-0">
                      Staff
                    </span>
                  )}
                </div>
                <p className="truncate text-[9px] text-muted-foreground font-semibold flex items-center gap-0.5 mt-0.5">
                  <Zap className="h-2.5 w-2.5 text-primary shrink-0 animate-pulse" />
                  {collegeName.split(",")[0]}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-border/20 pt-2.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/50">
                My Vibe
              </span>
              <button
                onClick={changeVibe}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs",
                  currentVibe.class
                )}
              >
                <currentVibe.icon className="h-2.5 w-2.5" />
                <span>{currentVibe.label}</span>
              </button>
            </div>
          </div>
        ) : collapsed && profile ? (
          <div className="mx-auto mt-5 flex flex-col items-center gap-2">
            <button onClick={changeVibe} className="relative cursor-pointer group">
              <Avatar className="h-9 w-9 border border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src={profile?.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">{profile?.displayName?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className={cn(
                "absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#120E22] border border-border shadow-2xs",
                currentVibe.class
              )}>
                <currentVibe.icon className="h-2.5 w-2.5" />
              </span>
            </button>
          </div>
        ) : null}

        {/* Navigation Lists */}
        <nav className="mt-6 flex-1 overflow-y-auto px-3 space-y-6 scrollbar-none">
          {groups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              {!collapsed && (
                <p className="px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 border-l border-primary/45 ml-1">
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
                        "group flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 border-l-2 border-transparent",
                        collapsed && "justify-center px-0 rounded-2xl h-11 w-11 mx-auto border-l-0",
                        isActive
                          ? "bg-primary/10 border-l-2 border-primary text-primary shadow-2xs font-extrabold"
                          : "text-muted-foreground hover:bg-muted/10 hover:text-foreground hover:translate-x-0.5"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-all group-hover:scale-105",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
        <div className={cn("border-t border-border/30 p-4 bg-muted/5", collapsed && "flex flex-col items-center gap-3")}>
          {!collapsed ? (
            <div className="space-y-4">
              <Link href="/app/post/new">
                <Button className="w-full gap-2 text-xs font-bold bg-logo-gradient text-white hover:opacity-95 shadow-md shadow-primary/15 hover:shadow-lg transition-all h-9.5 rounded-xl border-none cursor-pointer">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </Link>
              
              <div className="flex items-center justify-between px-1 text-[10px]">
                <Link
                  href="/app/profile"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-bold transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                
                <ThemeToggle className="h-7 w-7 rounded-lg border-none bg-transparent hover:bg-muted/15" />

                <Link
                  href="/handler/sign-out"
                  className="flex items-center gap-1 text-muted-foreground hover:text-destructive font-bold transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ThemeToggle className="h-9 w-9 rounded-xl border border-border/25" />
              <Link href="/app/post/new">
                <Button size="icon" className="h-10 w-10 rounded-xl bg-logo-gradient shadow-md border-none cursor-pointer">
                  <Plus className="h-5 w-5 text-white" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Mobile Bottom Bar ─── */}
      <div className="fixed bottom-3 left-4 right-4 z-40 flex h-14 items-center justify-around rounded-2xl border border-border/30 bg-[#09070F]/80 backdrop-blur-xl px-2 shadow-xl md:hidden">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.label === "") {
            return (
              <Link
                key="create"
                href="/app/post/new"
                className="relative -mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-logo-gradient text-white shadow-lg transition-transform hover:scale-105 active:scale-95 border border-primary/20"
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
                "flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative",
                isActive ? "text-primary font-black" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="mt-0.5 text-[8px] tracking-wide">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1.5 size-1 rounded-full bg-primary animate-[pulse_2s_infinite]" />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
