"use client";

import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DESKTOP_NAV_ITEMS,MOBILE_BOTTOM_ITEMS } from "@/constants";
import type { UserProfile } from "@/db/schema";
import { cn } from "@/lib/utils";
import { AnimatePresence,motion } from "framer-motion";
import {
Bell,
Cake,
ChevronUp,
Compass,
Flame,
Heart,
Home,
Menu,
MessageSquare,
Plus,
School,
Shield,
Sliders,
UserCircle,
Users,
X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavigationProps {
  profile?: UserProfile;
  collegeName?: string;
  isAdmin?: boolean;
  isViewer?: boolean;
}

export function Navigation({ profile, collegeName, isAdmin, isViewer }: NavigationProps) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const desktopNavItems = [
    ...DESKTOP_NAV_ITEMS.filter((item) => {
      if (isViewer && ["/app/dating", "/app/chat", "/app/birthdays"].includes(item.href)) {
        return false;
      }
      return true;
    }),
  ];

  if (isAdmin) {
    desktopNavItems.push({ icon: Shield, href: "/admin", label: "Admin Console" });
  }

  const mobileBottomItems = MOBILE_BOTTOM_ITEMS;

  const mobileDrawerItems = [
    { icon: Home, href: "/app", label: "Home Feed" },
    { icon: Compass, href: "/app/discover", label: "Discover" },
    { icon: Heart, href: "/app/dating", label: "Matches / Dating" },
    { icon: Users, href: "/app/communities", label: "Communities" },
    { icon: School, href: "/app/colleges", label: "Colleges" },
    { icon: Cake, href: "/app/birthdays", label: "Campus Birthdays" },
    { icon: Flame, href: "/app/confessions", label: "Confessions" },
    { icon: MessageSquare, href: "/app/chat", label: "Messages" },
    { icon: Bell, href: "/app/notifications", label: "Notifications" },
    { icon: UserCircle, href: "/app/profile", label: "Profile" },
    { icon: Sliders, href: "/app/settings", label: "Settings" },
  ];

  return (
    <>
      {/* ─── Top Mobile Header with Drawer Trigger ─── */}
      {!pathname.startsWith("/app/chat") &&
        !pathname.startsWith("/app/stories/new") &&
        !pathname.startsWith("/app/story/") && (
          <header className="sticky top-0 z-40 flex h-13 w-full items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl md:hidden select-none">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowMobileMenu(true)}
                className="flex size-9 items-center justify-center rounded-xl bg-muted/50 text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="size-4.5" />
              </button>

              <Link href="/app" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="CampusLoop"
                  className="size-7 object-contain drop-shadow-2xs"
                />
                <span className="text-sm font-black tracking-tight text-foreground">
                  Campus<span className="text-primary font-black">Loop</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/app/chat"
                className="flex size-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
                aria-label="Direct messages"
              >
                <MessageSquare className="size-4" />
              </Link>

              <Link
                href="/app/notifications"
                className="flex size-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
              </Link>

              <ThemeToggle className="size-8 rounded-full border-none bg-transparent hover:bg-muted" />
            </div>
          </header>
        )}

      {/* ─── Desktop Sidebar ─── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border/20 bg-background/85 backdrop-blur-2xl py-5 px-3.5 md:flex md:flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          {/* Logo & Campus Tag */}
          <div className="px-2 pb-1 flex items-center justify-between">
            <BrandLogo href="/app" size="md" />
            {collegeName && (
              <span
                className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full truncate max-w-[90px]"
                title={collegeName}
              >
                {collegeName.split(" ")[0]}
              </span>
            )}
          </div>

          {/* Navigation Links with Sliding Active Indicator */}
          <nav className="space-y-1 relative">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer",
                    isActive
                      ? "text-foreground font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute inset-0 rounded-2xl bg-muted/70 shadow-2xs z-0"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-3 min-w-0">
                    <AnimateIcon animateOnHover animation="path">
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive
                            ? "text-primary stroke-[2.5]"
                            : "text-muted-foreground group-hover:text-foreground stroke-[1.8]"
                        )}
                      />
                    </AnimateIcon>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.href === "/app/chat" && (
                    <span className="relative z-10 size-2 rounded-full bg-rose-500 shadow-xs" />
                  )}
                  {item.href === "/app/dating" && (
                    <span className="relative z-10 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-500">
                      Hot
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & User Profile Capsule */}
        <div className="space-y-3 pt-3 border-t border-border/20">
          {!isViewer && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/app/post/new" className="block">
                <Button className="w-full bg-foreground text-background hover:opacity-90 font-black py-2.5 rounded-2xl text-xs cursor-pointer border-none shadow-xs transition-all flex items-center justify-center gap-1.5">
                  <Plus className="size-4 stroke-[3]" />
                  <span>Create Post</span>
                </Button>
              </Link>
            </motion.div>
          )}

          {profile && (
            <div className="relative">
              {showProfileMenu && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
              )}

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute bottom-14 left-0 right-0 z-50 rounded-3xl bg-card/95 backdrop-blur-2xl p-2 shadow-2xl space-y-1 border border-border/30"
                  >
                    <div className="px-3 py-2 border-b border-border/20">
                      <p className="text-xs font-black text-foreground truncate">{profile.displayName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">@{profile.username}</p>
                    </div>

                    <Link
                      href="/app/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <UserCircle className="size-3.5 text-primary" />
                      <span>View Profile</span>
                    </Link>

                    <Link
                      href="/app/dating"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <Heart className="size-3.5 text-rose-500" />
                      <span>Campus Matches</span>
                    </Link>

                    <Link
                      href="/app/birthdays"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <Cake className="size-3.5 text-pink-500" />
                      <span>Campus Birthdays</span>
                    </Link>

                    <Link
                      href="/app/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <Sliders className="size-3.5 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-border/20 pt-1">
                      <SignOutButton variant="menu-item" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User Profile Pill Container */}
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-card hover:bg-muted/50 transition-colors shadow-2xs">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
                >
                  <Avatar className="size-8 shrink-0 group-hover:scale-105 transition-transform">
                    <AvatarImage src={profile.avatarUrl || ""} />
                    <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                      {profile.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-foreground">{profile.displayName}</p>
                    <p className="truncate text-[9px] text-muted-foreground">@{profile.username}</p>
                  </div>
                  <ChevronUp
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform duration-200",
                      showProfileMenu && "rotate-180"
                    )}
                  />
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <ThemeToggle className="size-7 rounded-lg border-none bg-transparent hover:bg-muted/60" />
                  <SignOutButton variant="icon" />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Mobile Bottom Bar ─── */}
      {!pathname.startsWith("/app/chat") &&
        !pathname.startsWith("/app/stories/new") &&
        !pathname.startsWith("/app/story/") && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px))] items-center justify-around border-t border-border/20 bg-background/90 backdrop-blur-2xl px-2 md:hidden touch-manipulation select-none">
            {mobileBottomItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/app/profile" && pathname.startsWith("/app/profile"));
              const Icon = item.icon;

              if (item.label === "") {
                if (isViewer) return null;
                return (
                  <Link
                    key="create"
                    href="/app/post/new"
                    className="flex size-9 items-center justify-center rounded-2xl bg-foreground text-background shadow-xs active:scale-90 transition-transform cursor-pointer"
                    aria-label="Create post"
                  >
                    <Plus className="size-4.5 stroke-[2.5]" />
                  </Link>
                );
              }

              if (item.href === "/app/profile") {
                return (
                  <Link
                    key="profile"
                    href="/app/profile"
                    className={cn(
                      "group flex flex-col items-center justify-center flex-1 h-full py-1 relative active:scale-95 transition-transform",
                      isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="relative">
                      {profile?.avatarUrl ? (
                        <Avatar
                          className={cn(
                            "size-5.5 shrink-0 transition-all",
                            isActive && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                          )}
                        >
                          <AvatarImage src={profile.avatarUrl} />
                          <AvatarFallback className="text-[8px] font-bold">
                            {(profile.displayName?.[0] || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Icon
                          className={cn(
                            "size-5 transition-colors",
                            isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                          )}
                        />
                      )}
                    </div>
                    <span className="mt-0.5 text-[9px] font-bold">Profile</span>
                    {isActive && (
                      <div className="absolute bottom-1 size-1 rounded-full bg-foreground" />
                    )}
                  </Link>
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
                  <div className="relative">
                    <Icon
                      className={cn(
                        "size-5 transition-colors",
                        isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                      )}
                    />
                  </div>
                  <span className="mt-0.5 text-[9px] font-bold">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-1 size-1 rounded-full bg-foreground" />
                  )}
                </Link>
              );
            })}
          </div>
        )}

      {/* ─── Mobile Slide-Out Drawer ─── */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 flex md:hidden select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setShowMobileMenu(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 36 }}
              className="relative z-10 flex h-full w-[82%] max-w-[300px] flex-col justify-between overflow-y-auto bg-card p-5 text-foreground shadow-2xl border-r border-border/40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="CampusLoop" className="size-8 object-contain" />
                    <div>
                      <h2 className="text-sm font-black tracking-tight text-foreground">
                        Campus<span className="text-primary font-black">Loop</span>
                      </h2>
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[170px]">
                        {collegeName || "Verified Campus"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex size-7 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                  {mobileDrawerItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowMobileMenu(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Profile / Auth Row */}
              <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                {profile ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={profile.avatarUrl || ""} />
                      <AvatarFallback className="text-[9px] font-bold">
                        {profile.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-foreground">{profile.displayName}</p>
                      <p className="truncate text-[9px] text-muted-foreground">@{profile.username}</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/join"
                    onClick={() => setShowMobileMenu(false)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Join Campus
                  </Link>
                )}

                <ThemeToggle className="size-7 rounded-lg border-none bg-transparent hover:bg-muted" />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
