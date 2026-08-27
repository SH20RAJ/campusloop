"use client";

import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DESKTOP_NAV_ITEMS,MOBILE_BOTTOM_ITEMS } from "@/constants/navigation";
import type { UserProfile } from "@/db/schema";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { AnimatePresence,motion } from "framer-motion";
import {
Bell,
HelpCircle,
Menu,
MessageSquare,
MoreHorizontal,
Plus,
ShieldCheck,
Sliders,
UserCircle,
X
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
  const unreadNotificationsCount = useUnreadNotificationsCount();


  const desktopNavItems = [
    ...DESKTOP_NAV_ITEMS.filter((item) => {
      if (isViewer && ["/app/chat"].includes(item.href)) {
        return false;
      }
      return true;
    }),
  ];

  return (
    <>
      {/* ─── Minimal Top Mobile Header ─── */}
      {!pathname.startsWith("/app/chat") &&
        !pathname.startsWith("/app/stories/new") &&
        !pathname.startsWith("/app/story/") && (
          <header className="sticky top-0 z-40 flex h-13 w-full items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl md:hidden select-none">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowMobileMenu(true)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                {profile?.avatarUrl ? (
                  <Avatar className="size-7.5 border border-border/40">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="text-[10px] font-bold">
                      {profile.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Menu className="size-5 text-foreground" />
                )}
              </button>

              <Link href="/app" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="CampusLoop"
                  className="size-7 object-contain"
                />
                <span className="text-sm font-black tracking-tight text-foreground">
                  Campus<span className="text-primary font-black">Loop</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/app/chat"
                className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Direct messages"
              >
                <MessageSquare className="size-4.5" />
              </Link>

              <Link
                href="/app/notifications"
                className="relative flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-4.5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-[#1d9bf0]" />
                )}
              </Link>
            </div>
          </header>
        )}

      {/* ─── Desktop Twitter/X Style Sidebar ─── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border/30 bg-background py-4 px-3 md:flex md:flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          {/* Logo */}
          <div className="px-3 py-1 flex items-center justify-between">
            <BrandLogo href="/app" size="md" />
            {collegeName && (
              <span
                className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full truncate max-w-[95px]"
                title={collegeName}
              >
                {collegeName.split(" ")[0]}
              </span>
            )}
          </div>

          {/* Primary Navigation Links */}
          <nav className="space-y-1">
            {desktopNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));
              const Icon = item.icon;
              const isNotifications = item.href === "/app/notifications";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-4 rounded-full px-4 py-3 text-sm font-semibold transition-colors cursor-pointer",
                    isActive
                      ? "text-foreground font-black bg-muted/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <div className="relative">
                    <AnimateIcon animateOnHover animation="path">
                      <Icon
                        className={cn(
                          "size-5.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive
                            ? "text-foreground stroke-[2.5]"
                            : "text-muted-foreground group-hover:text-foreground stroke-[1.8]"
                        )}
                      />
                    </AnimateIcon>
                    {isNotifications && unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#1d9bf0] text-white text-[10px] font-black flex items-center justify-center border-2 border-background shadow-xs">
                        {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                      </span>
                    )}
                  </div>

                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>


          {/* Post Action Button */}
          {!isViewer && (
            <div className="pt-2 px-1">
              <Link href="/app/post/new" className="block">
                <Button className="w-full h-11 bg-foreground text-background hover:opacity-90 font-black rounded-full text-sm cursor-pointer border-none shadow-sm transition-all flex items-center justify-center gap-2">
                  <Plus className="size-4.5 stroke-[3]" />
                  <span>Post</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom User Capsule */}
        {profile ? (
          <div className="relative pt-2">
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
                  className="absolute bottom-16 left-0 right-0 z-50 rounded-2xl bg-card border border-border/50 p-1.5 shadow-xl space-y-1"
                >
                  <Link
                    href="/app/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <UserCircle className="size-4 text-muted-foreground" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    href="/app/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Sliders className="size-4 text-muted-foreground" />
                    <span>Settings</span>
                  </Link>

                  <div className="pt-1 border-t border-border/30 px-2 py-1 flex items-center justify-between">
                    <ThemeToggle className="size-7 rounded-lg border-none bg-transparent hover:bg-muted" />
                    <SignOutButton />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="w-full flex items-center justify-between p-2.5 rounded-full hover:bg-muted/50 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="size-9.5 shrink-0 border border-border/40">
                  <AvatarImage src={profile.avatarUrl || ""} />
                  <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                    {profile.displayName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-foreground">{profile.displayName}</p>
                  <p className="truncate text-[10px] text-muted-foreground">@{profile.username}</p>
                </div>
              </div>

              <MoreHorizontal className="size-4 text-muted-foreground group-hover:text-foreground shrink-0" />
            </button>
          </div>
        ) : (
          <div className="p-2">
            <Link
              href="/join"
              className="block w-full py-2.5 text-center text-xs font-bold rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </aside>

      {/* ─── Mobile Bottom Floating Navigation ─── */}
      {!pathname.startsWith("/app/chat") &&
        !pathname.startsWith("/app/stories/new") &&
        !pathname.startsWith("/app/story/") && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px))] items-center justify-around border-t border-border/30 bg-background/90 backdrop-blur-2xl px-2 md:hidden touch-manipulation select-none">
            {MOBILE_BOTTOM_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));
              const Icon = item.icon;

              if (item.label === "") {
                if (isViewer) return null;
                return (
                  <Link
                    key="create"
                    href="/app/post/new"
                    className="flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-xs active:scale-95 transition-transform cursor-pointer"
                    aria-label="Create post"
                  >
                    <Plus className="size-5 stroke-[2.5]" />
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
                  <Icon
                    className={cn(
                      "size-5.5 transition-colors",
                      isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                    )}
                  />
                  <span className="mt-0.5 text-[9px] font-semibold">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-1 size-1 rounded-full bg-foreground" />
                  )}
                </Link>
              );
            })}
          </div>
        )}

      {/* ─── Clean Minimal Twitter-Style Mobile Drawer ─── */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 flex md:hidden select-none">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Clean Sidebar Sheet */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className="relative z-10 flex h-full w-[80%] max-w-[290px] flex-col justify-between overflow-y-auto bg-card border-r border-border/40 text-foreground p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* User Header Info */}
                <div className="space-y-3 pb-4 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <Link
                      href={profile ? "/app/profile" : "/join"}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Avatar className="size-11 border border-border/50 shadow-xs">
                        <AvatarImage src={profile?.avatarUrl || ""} />
                        <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                          {profile?.displayName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShowMobileMenu(false)}
                      className="size-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="size-4.5" />
                    </button>
                  </div>

                  {profile ? (
                    <div>
                      <h3 className="text-sm font-black text-foreground truncate">{profile.displayName}</h3>
                      <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                      {collegeName && (
                        <p className="mt-1 text-[11px] text-muted-foreground font-medium truncate">
                          {collegeName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-black text-foreground">Welcome to CampusLoop</h3>
                      <p className="text-xs text-muted-foreground">Verified student network</p>
                    </div>
                  )}
                </div>

                {/* Primary Navigation Menu */}
                <nav className="space-y-1">
                  {desktopNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/app" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowMobileMenu(false)}
                        className={cn(
                          "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer",
                          isActive
                            ? "text-foreground bg-muted font-black"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-5 shrink-0",
                            isActive ? "text-foreground stroke-[2.5]" : "text-muted-foreground"
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Secondary Quick Links */}
                <div className="pt-4 border-t border-border/30 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-3">
                    Support &amp; Safety
                  </span>
                  <Link
                    href="/app/settings"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Sliders className="size-4" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/safety"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <ShieldCheck className="size-4" />
                    <span>Safety &amp; Rules</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <HelpCircle className="size-4" />
                    <span>Help &amp; Feedback</span>
                  </Link>
                </div>
              </div>

              {/* Bottom Drawer Footer */}
              <div className="pt-4 border-t border-border/30 flex items-center justify-between">
                <ThemeToggle className="size-8 rounded-xl border-none bg-muted/50 hover:bg-muted" />
                {profile ? (
                  <SignOutButton />
                ) : (
                  <Link
                    href="/join"
                    onClick={() => setShowMobileMenu(false)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
