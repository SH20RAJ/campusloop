"use client";

import { useState } from "react";
import {
  Home,
  Compass,
  School,
  Heart,
  MessageSquare,
  Sparkles,
  Users,
  Bell,
  Plus,
  UserCircle,
  Shield,
  LogOut,
  Sliders,
  Menu,
  X,
  FileText,
  HelpCircle,
  Layers,
  Download,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { UserProfile } from "@/db/schema";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

interface NavigationProps {
  profile?: UserProfile;
  collegeName?: string;
  isAdmin?: boolean;
}

export function Navigation({ profile, isAdmin }: NavigationProps) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const desktopNavItems = [
    { icon: Home, href: "/app", label: "Home" },
    { icon: Compass, href: "/app/discover", label: "Discover" },
    { icon: School, href: "/app/colleges", label: "Colleges" },
    { icon: Heart, href: "/app/confessions", label: "Confessions" },
    { icon: Users, href: "/app/communities", label: "Communities" },
    { icon: Sparkles, href: "/app/dating", label: "Matches" },
    { icon: MessageSquare, href: "/app/chat", label: "Messages" },
    { icon: Bell, href: "/app/notifications", label: "Notifications" },
    { icon: UserCircle, href: "/app/profile", label: "Profile" },
    { icon: Sliders, href: "/app/settings", label: "Settings" },
  ];

  if (isAdmin) {
    desktopNavItems.push({ icon: Shield, href: "/admin", label: "Admin Console" });
  }

  const mobileBottomItems = [
    { icon: Home, href: "/app", label: "Home" },
    { icon: Compass, href: "/app/discover", label: "Discover" },
    { icon: Plus, href: "/app/post/new", label: "" },
    { icon: MessageSquare, href: "/app/chat", label: "Chat" },
    { icon: Menu, href: "#menu", label: "Menu", isTrigger: true },
  ];

  const fullMobileDrawerLinks = [
    {
      group: "Primary Campus",
      items: [
        { icon: Home, href: "/app", label: "Campus Feed", desc: "Live discussions & confessions" },
        { icon: Compass, href: "/app/discover", label: "Discover Hub", desc: "Explore colleges & trending tags" },
        { icon: Sparkles, href: "/app/dating", label: "Campus Matches", desc: "Swipe verified college students", badge: "Hot" },
        { icon: MessageSquare, href: "/app/chat", label: "Direct Messages", desc: "Private student chat" },
        { icon: Bell, href: "/app/notifications", label: "Notifications", desc: "Upvotes, comments & matches" },
      ],
    },
    {
      group: "Communities & Colleges",
      items: [
        { icon: School, href: "/app/colleges", label: "College Directory", desc: "1,350+ indexed Indian colleges" },
        { icon: Users, href: "/app/communities", label: "Communities", desc: "Clubs, departments & groups" },
        { icon: Heart, href: "/app/confessions", label: "Confessions", desc: "Anonymous campus thoughts" },
      ],
    },
    {
      group: "Account & System",
      items: [
        { icon: UserCircle, href: "/app/profile", label: "My Profile", desc: "View LP clout & badges" },
        { icon: Download, href: "#install", label: "Install Campus App", desc: "Add to home screen for 2x speed", badge: "PWA" },
        { icon: Sliders, href: "/app/settings", label: "Settings", desc: "Preferences & privacy" },
        { icon: Layers, href: "/overview", label: "Strategic Overview", desc: "Architecture & TAM brief" },
        { icon: FileText, href: "/pitch", label: "Pitch Deck", desc: "Investor presentation & metrics" },
        { icon: HelpCircle, href: "/safety", label: "Safety Center", desc: "Anti-harassment guidelines" },
      ],
    },
  ];

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 border-r border-border bg-background py-6 px-4 md:flex md:flex-col justify-between">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/app" className="flex items-center gap-2 px-3 text-lg font-black tracking-tight text-foreground select-none">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-6 w-6 object-cover rounded-lg" />
            <span>CampusLoop</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-4 rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200",
                    isActive
                      ? "bg-muted text-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <AnimateIcon animateOnHover animation="path">
                    <Icon
                      className={cn(
                        "h-4.5 w-4.5 shrink-0 transition-colors",
                        isActive ? "text-foreground stroke-[2.5]" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                  </AnimateIcon>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions Area */}
        <div className="space-y-3 pt-4 border-t border-border/60">
          <Link href="/app/post/new" className="block">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2.5 rounded-lg text-xs cursor-pointer border-none transition-colors">
              Create Post
            </Button>
          </Link>

          {profile && (
            <div className="flex items-center justify-between gap-2 px-2 py-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={profile.avatarUrl || ""} />
                  <AvatarFallback className="text-[9px] font-bold text-xs">
                    {profile.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{profile.displayName}</p>
                  <p className="truncate text-[8.5px] text-muted-foreground">@{profile.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <ThemeToggle className="h-6 w-6 rounded border-none bg-transparent hover:bg-muted/50" />
                <Link
                  href="/handler/sign-out"
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
                  title="Sign out"
                >
                  <AnimateIcon animateOnHover animation="path">
                    <LogOut className="h-4 w-4" />
                  </AnimateIcon>
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Mobile Bottom Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/80 bg-background/95 backdrop-blur-xl px-2 md:hidden shadow-lg touch-manipulation">
        {mobileBottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.label === "") {
            return (
              <Link
                key="create"
                href="/app/post/new"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md border-none active:scale-95 transition-transform"
              >
                <AnimateIcon animateOnHover animation="path">
                  <Plus className="h-5 w-5" />
                </AnimateIcon>
              </Link>
            );
          }

          if (item.isTrigger) {
            return (
              <button
                key="menu-trigger"
                type="button"
                onClick={() => setShowMobileMenu(true)}
                className="group flex flex-col items-center justify-center flex-1 h-full py-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Icon className="h-4.5 w-4.5 transition-colors" />
                <span className="mt-0.5 text-[9px] font-bold">Menu</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center flex-1 h-full py-1 relative",
                isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <AnimateIcon animateOnHover animation="path">
                <Icon className="h-4.5 w-4.5 transition-colors" />
              </AnimateIcon>
              <span className="mt-0.5 text-[9px] font-bold">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 size-1 rounded-full bg-foreground" />
              )}
            </Link>
          );
        })}
      </div>

      {/* ─── Full Mobile Navigation Drawer Sheet ─── */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md md:hidden animate-in fade-in select-none">
          <div className="max-h-[85vh] w-full rounded-t-[32px] border-t border-border bg-card p-5 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header with Profile */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              {profile ? (
                <Link
                  href="/app/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <Avatar className="size-11 border-2 border-primary/30">
                    <AvatarImage src={profile.avatarUrl || ""} />
                    <AvatarFallback className="font-bold">{profile.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground truncate">{profile.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">@{profile.username} · 🔥 {profile.points || 0} LP</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="CampusLoop" className="size-7 rounded-lg" />
                  <span className="text-base font-black text-foreground">CampusLoop Menu</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {fullMobileDrawerLinks.map((group) => (
                <div key={group.group} className="space-y-1.5">
                  <p className="px-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                    {group.group}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {group.items.map((link) => {
                      const Icon = link.icon;
                      const isCurrent = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowMobileMenu(false)}
                          className={cn(
                            "flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all",
                            isCurrent
                              ? "bg-primary/10 border border-primary/30 text-primary font-bold"
                              : "hover:bg-muted/50 text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={cn("size-4.5 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")} />
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-none">{link.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{link.desc}</p>
                            </div>
                          </div>

                          {link.badge && (
                            <span className="rounded-full bg-rose-500/15 border border-rose-500/30 text-[9px] font-black text-rose-500 px-2 py-0.5">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {isAdmin && (
                <div className="pt-1">
                  <Link
                    href="/admin"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold"
                  >
                    <Shield className="size-4.5" />
                    <span>Admin Moderation Console</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThemeToggle className="h-8 w-8 rounded-xl border border-border/60 bg-muted/30" />
                <span className="text-xs font-semibold text-muted-foreground">Theme</span>
              </div>

              <Link
                href="/handler/sign-out"
                className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="size-3.5" /> Sign out
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
