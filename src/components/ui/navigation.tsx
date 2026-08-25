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
  Sliders,
  Menu,
  X,
  FileText,
  HelpCircle,
  Layers,
  Download,
  ShoppingBag,
  Search,
  Home as HomeIcon,
  Car,
  Gift,
  Wrench,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/ui/sign-out-button";
import type { UserProfile } from "@/db/schema";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { BrandLogo } from "@/components/ui/brand-logo";

interface NavigationProps {
  profile?: UserProfile;
  collegeName?: string;
  isAdmin?: boolean;
  isViewer?: boolean;
}

export function Navigation({ profile, isAdmin, isViewer }: NavigationProps) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const desktopNavItems = [
    { icon: Home, href: "/app", label: "Home" },
    { icon: Compass, href: "/app/discover", label: "Discover" },
    { icon: School, href: "/app/colleges", label: "Colleges" },
    { icon: Users, href: "/app/communities", label: "Communities" },
    ...(isViewer
      ? []
      : [
          { icon: Sparkles, href: "/app/dating", label: "Matches" },
          { icon: MessageSquare, href: "/app/chat", label: "Messages" },
          { icon: PartyPopper, href: "/app/birthdays", label: "Birthdays" },
        ]),
    { icon: Bell, href: "/app/notifications", label: "Notifications" },
    { icon: UserCircle, href: "/app/profile", label: "Profile" },
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
        { icon: PartyPopper, href: "/app/birthdays", label: "Birthdays & DOB", desc: "Today's campus celebrations", badge: "New" },
        { icon: MessageSquare, href: "/app/chat", label: "Direct Messages", desc: "Private student chat" },
        { icon: Bell, href: "/app/notifications", label: "Notifications", desc: "Upvotes, comments & matches" },
      ],
    },
    {
      group: "Campus Utility",
      items: [
        { icon: ShoppingBag, href: "/app/hashtag/BuySell", label: "Buy / Sell / Exchange", desc: "Books, tech, cycles & dorm items" },
        { icon: Search, href: "/app/hashtag/LostAndFound", label: "Lost & Found", desc: "Report or claim campus belongings" },
        { icon: HomeIcon, href: "/app/hashtag/Roommates", label: "Roommate / Flat Finder", desc: "Find hostel & flat roommates" },
        { icon: Car, href: "/app/hashtag/RideShare", label: "Ride Sharing", desc: "Carpool to metro or station" },
        { icon: Gift, href: "/app/hashtag/FreeStuff", label: "Free Stuff", desc: "Giveaways & free student gear" },
        { icon: Wrench, href: "/app/hashtag/CampusHelp", label: "Need / Can Help", desc: "Peer tutoring, lab help & notes" },
      ],
    },
    {
      group: "Social & Vibes",
      items: [
        { icon: PartyPopper, href: "/app/hashtag/CampusMemes", label: "Memes & Banter", desc: "Hostel tea & campus humor" },
        { icon: PartyPopper, href: "/app/hashtag/CampusEvents", label: "Events & Fests", desc: "Cultural fests, hackathons & gigs" },
        { icon: Users, href: "/app/communities", label: "Sub-Hubs & Clubs", desc: "Interest communities & branches" },
        { icon: Heart, href: "/app/confessions", label: "Confessions", desc: "Anonymous campus thoughts" },
        { icon: School, href: "/app/colleges", label: "College Directory", desc: "1,350+ indexed Indian colleges" },
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
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 border-r border-border bg-background py-5 px-3 md:flex md:flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          {/* Logo */}
          <div className="px-3 pb-1">
            <BrandLogo href="/app" size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200",
                    isActive
                      ? "bg-muted text-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <AnimateIcon animateOnHover animation="path">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
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
        <div className="space-y-3 pt-3 border-t border-border/60">
          {isViewer ? (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[10px] font-semibold leading-relaxed text-amber-600 dark:text-amber-400">
              👀 Viewer Mode — join with your college email to post &amp; chat.
            </div>
          ) : (
            <Link href="/app/post/new" className="block">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 rounded-xl text-xs cursor-pointer border-none shadow-xs transition-colors">
                Create Post
              </Button>
            </Link>
          )}

          {profile && (
            <div className="relative">
              {showProfileMenu && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
              )}

              {showProfileMenu && (
                <div className="absolute bottom-12 left-0 right-0 z-50 rounded-2xl border border-border bg-card p-2 shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-2.5 py-1.5 border-b border-border/50">
                    <p className="text-xs font-bold text-foreground truncate">{profile.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">@{profile.username}</p>
                  </div>

                  <Link
                    href="/app/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <UserCircle className="size-3.5 text-primary" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    href="/app/profile/edit"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Sliders className="size-3.5 text-blue-500" />
                    <span>Edit Profile & Photos</span>
                  </Link>

                  <Link
                    href="/app/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Sliders className="size-3.5 text-muted-foreground" />
                    <span>Settings</span>
                  </Link>

                  {!isViewer && (
                    <Link
                      href="/app/stories/new"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Sparkles className="size-3.5 text-amber-500" />
                      <span>Post 24h Campus Vibe</span>
                    </Link>
                  )}

                  <div className="border-t border-border/50 pt-1">
                    <SignOutButton variant="menu-item" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 px-1.5 py-1.5 rounded-2xl hover:bg-muted/30 transition-colors">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
                >
                  <Avatar className="size-8 shrink-0 border border-border group-hover:scale-105 transition-transform">
                    <AvatarImage src={profile.avatarUrl || ""} />
                    <AvatarFallback className="text-[9px] font-bold">
                      {profile.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">{profile.displayName}</p>
                    <p className="truncate text-[9px] text-muted-foreground">@{profile.username}</p>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <ThemeToggle className="size-7 rounded-lg border-none bg-transparent hover:bg-muted/50" />
                  <SignOutButton variant="icon" />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Mobile Bottom Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] items-center justify-around border-t border-border/80 bg-background/95 backdrop-blur-xl px-2 md:hidden shadow-lg touch-manipulation select-none">
        {mobileBottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.label === "") {
            if (isViewer) return null;
            return (
              <Link
                key="create"
                href="/app/post/new"
                className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md border-none active:scale-90 transition-transform cursor-pointer"
              >
                <AnimateIcon animateOnHover animation="path">
                  <Plus className="size-5" />
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
                className="group flex flex-col items-center justify-center flex-1 h-full py-1 text-muted-foreground hover:text-foreground active:scale-95 transition-transform cursor-pointer"
              >
                <Icon className="size-4.5 transition-colors" />
                <span className="mt-0.5 text-[9px] font-bold">Menu</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center flex-1 h-full py-1 relative active:scale-95 transition-transform",
                isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <AnimateIcon animateOnHover animation="path">
                <Icon className="size-4.5 transition-colors" />
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
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md md:hidden animate-in fade-in select-none"
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            className="max-h-[88vh] max-h-[88dvh] w-full rounded-t-[32px] border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Sheet Drag/Pull Pill Indicator */}
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-3 shrink-0" />

            {/* Drawer Header with Profile */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              {profile ? (
                <Link
                  href="/app/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <Avatar className="size-11 border-2 border-primary/30 shrink-0">
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
                aria-label="Close menu"
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
                <ThemeToggle className="size-8 rounded-xl border border-border/60 bg-muted/30" />
                <span className="text-xs font-semibold text-muted-foreground">Theme</span>
              </div>

              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
