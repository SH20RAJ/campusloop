"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap,
  HelpCircle,
  Menu,
  MoreHorizontal,
  School,
  Sliders,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { CampusUnlockedModal } from "@/components/preview/campus-unlocked-modal";
import { DreamCampusesModal } from "@/components/preview/dream-campuses-modal";
import {
  AnimateBellRing,
  AnimatedIcon,
  AnimateMessageSquare,
  AnimatePlus,
  AnimateShieldCheck,
  AnimateSlidersHorizontal,
} from "@/components/ui/animated-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { InstagramIcon, LinkedinIcon, XIcon } from "@/components/ui/social-icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DESKTOP_NAV_ITEMS, MOBILE_BOTTOM_ITEMS, type NavItem } from "@/constants/navigation";
import { SOCIAL_LINKS } from "@/constants/socials";
import type { UserProfile } from "@/db/schema";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface NavigationProps {
  profile?: UserProfile;
  collegeName?: string;
  isAdmin?: boolean;
  isViewer?: boolean;
}

export function Navigation({ profile, collegeName, isViewer }: NavigationProps) {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showDreamModal, setShowDreamModal] = useState(false);
  const [marketplaceSeen, setMarketplaceSeen] = useState(true);
  const unreadNotificationsCount = useUnreadNotificationsCount();

  useEffect(() => {
    try {
      const seen = localStorage.getItem("marketplace_seen");
      if (!seen) setMarketplaceSeen(false);
    } catch {}
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/app/marketplace")) {
      try {
        localStorage.setItem("marketplace_seen", "true");
        setMarketplaceSeen(true);
      } catch {}
    }
  }, [pathname]);

  const institutionIdentifier =
    (profile as any)?.institution?.name ||
    (profile as any)?.institution?.slug ||
    profile?.institutionId ||
    collegeName ||
    "";

  const mobileBottomItems: NavItem[] = MOBILE_BOTTOM_ITEMS.filter((item) => {
    if (isViewer && ["/app/matching", "/app/chat"].includes(item.href)) {
      return false;
    }
    return true;
  });

  const desktopNavItems = [
    ...DESKTOP_NAV_ITEMS.filter((item) => {
      if (isViewer && ["/app/chat", "/app/dating", "/app/matching"].includes(item.href)) {
        return false;
      }
      return true;
    }),
  ];

  return (
    <>
      {/* ─── Minimal Top Mobile Header ─── */}
      {!pathname.startsWith("/app/chat") &&
        !pathname.startsWith("/chats") &&
        !pathname.startsWith("/app/chats") &&
        !pathname.startsWith("/app/stories/new") &&
        !pathname.startsWith("/app/story/") &&
        !pathname.startsWith("/app/post/") &&
        !pathname.startsWith("/app/college/") &&
        !(pathname.startsWith("/app/communities/") && pathname !== "/app/communities") &&
        !pathname.startsWith("/app/community/") &&
        !pathname.startsWith("/app/search") &&
        !pathname.startsWith("/app/dating") &&
        !pathname.startsWith("/app/matching") &&
        !pathname.startsWith("/app/settings") &&
        !pathname.startsWith("/@") && (
          <header className="sticky top-0 z-40 flex h-13 w-full items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl md:hidden select-none">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sounds.tap();
                  haptics.light();
                  setShowMobileMenu(true);
                }}
                className="relative flex items-center justify-center p-0.5 rounded-full hover:bg-muted/60 active:scale-95 transition-all cursor-pointer group shrink-0"
                aria-label="Open menu"
                title="Open menu"
              >
                <div className="relative">
                  <Avatar className="size-8 border border-border/50 shadow-2xs">
                    <AvatarImage src={profile?.avatarUrl || ""} />
                    <AvatarFallback className="text-[11px] font-black bg-muted text-foreground">
                      {profile?.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Clean, minimal menu indicator badge on avatar corner */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-card border border-border/80 shadow-xs text-muted-foreground group-hover:text-foreground">
                    <Menu className="size-2" strokeWidth={2.5} />
                  </span>
                </div>
              </button>

              <Link href="/app" className="flex items-center gap-2">
                <img src="/logo.png" alt="CampusLoop" className="size-7 object-contain" />
                {/* <span className="text-sm font-black tracking-tight text-foreground">
                  Campus<span className="text-primary font-black">Loop</span>
                </span> */}
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/app/chat"
                prefetch={true}
                className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Direct messages"
              >
                <AnimatedIcon icon={AnimateMessageSquare} animation="pop" size={18} />
              </Link>

              <Link
                href="/app/notifications"
                prefetch={true}
                className="relative flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Notifications"
              >
                <AnimatedIcon
                  icon={AnimateBellRing}
                  animation="bell"
                  size={18}
                  // Rings again whenever a new notification lands, not just on
                  // hover — the badge alone is easy to miss mid-scroll.
                  playKey={unreadNotificationsCount}
                />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-brand" />
                )}
              </Link>
            </div>
          </header>
        )}

      {/* ─── Desktop Clean Sidebar ─── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border/30 bg-background/95 backdrop-blur-md py-4 px-3 md:flex md:flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-3">
          {/* Top Bar: Brand Logo & Quick Action Icons (Chat & Notifications) */}
          <div className="px-2.5 py-1 flex items-center justify-between">
            <BrandLogo href="/app" size="md" />

            {/* Quick Action Utility Icons: Direct Messages & Notifications */}
            <div className="flex items-center gap-1">
              <Link
                href="/app/chat"
                prefetch={true}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-full transition-all cursor-pointer",
                  pathname.startsWith("/app/chat")
                    ? "bg-foreground text-background shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
                title="Direct Messages"
                aria-label="Direct Messages"
              >
                <AnimatedIcon icon={AnimateMessageSquare} animation="pop" size={18} />
              </Link>

              <Link
                href="/app/notifications"
                prefetch={true}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-full transition-all cursor-pointer",
                  pathname.startsWith("/app/notifications")
                    ? "bg-foreground text-background shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
                title="Notifications"
                aria-label="Notifications"
              >
                <AnimatedIcon
                  icon={AnimateBellRing}
                  animation="bell"
                  size={18}
                  playKey={unreadNotificationsCount}
                />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-brand text-white text-[10px] font-black flex items-center justify-center border-2 border-background shadow-xs animate-in zoom-in-50 duration-200">
                    {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* College Campus Hub Pill */}
          {/* {collegeName && (
            <div className="px-2.5">
              <Link
                href="/app/colleges"
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.tap();
                  haptics.light();
                }}
                className="group flex items-center gap-1.5 w-full text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border border-border/20 hover:border-border/50"
                title={`Campus Hub: ${collegeName} — Click to switch or explore colleges`}
              >
                <School className="size-3.5 shrink-0 text-primary group-hover:scale-110 transition-transform" />
                <span className="truncate">{collegeName}</span>
              </Link>
            </div>
          )} */}

          {/* Primary Navigation Links */}
          <nav className="space-y-1 pt-1">
            {desktopNavItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "group relative flex items-center gap-3.5 rounded-full px-3.5 py-2.5 text-[14px] font-semibold transition-all cursor-pointer",
                    isActive
                      ? "text-foreground font-black bg-muted/70 shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <div className="relative">
                    <AnimateIcon animateOnHover animation="path">
                      <Icon
                        className={cn(
                          "size-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive
                            ? "text-foreground stroke-2"
                            : "text-muted-foreground group-hover:text-foreground stroke-2"
                        )}
                      />
                    </AnimateIcon>
                  </div>

                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                        item.badgeColor || "bg-primary/15 text-primary border border-primary/30"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Post Action Button or Campus Preview Unlock */}
          {isViewer ? (
            <div className="pt-2 px-1 space-y-2">
              <div className="p-3 rounded-2xl bg-linear-to-b from-amber-500/10 to-transparent border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-500">
                    <School className="size-3" /> Campus Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDreamModal(true)}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Dream Hubs
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Exploring from outside. Saved posts persist permanently.
                </p>
                <Button
                  onClick={() => setShowUnlockModal(true)}
                  className="w-full h-8 text-xs font-black rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity gap-1.5 cursor-pointer shadow-xs"
                >
                  <GraduationCap className="size-3.5" />
                  <span>Unlock Campus</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-2 px-1">
              <Link href="/app/post/new" className="block">
                <Button className="w-full h-11 bg-foreground text-background hover:opacity-90 font-black rounded-full text-sm cursor-pointer border-none shadow-sm transition-all flex items-center justify-center gap-2">
                  <AnimatedIcon icon={AnimatePlus} animation="pop" size={18} strokeWidth={2.5} />
                  <span>Post</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom User Capsule */}
        {profile ? (
          <div className="relative pt-2">
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileMenu(false);
                    }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="absolute bottom-16 left-0 right-0 z-50 rounded-2xl bg-card border border-border/50 p-1.5 shadow-xl space-y-1"
                    onClick={(e) => e.stopPropagation()}
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
                </>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowProfileMenu((prev) => !prev);
              }}
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
              href="/handler/sign-in"
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
        !pathname.startsWith("/app/story/") &&
        !pathname.startsWith("/app/post/new") && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col border-t border-white/10 bg-[#09090f]/95 backdrop-blur-2xl md:hidden touch-manipulation select-none pb-[env(safe-area-inset-bottom,0px)] shadow-2xl">
            <div className="flex h-14 items-center justify-around px-2">
              {mobileBottomItems.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
                const Icon = item.icon;

                if (item.href === "/app/post/new") {
                  if (isViewer) return null;
                  return (
                    <Link
                      key="create"
                      href="/app/post/new"
                      prefetch={true}
                      onClick={() => {
                        sounds.tap();
                        haptics.medium();
                      }}
                      className="flex flex-col items-center justify-center -mt-4 shrink-0 mx-1 group cursor-pointer select-none"
                      aria-label="Create post or confession"
                    >
                      <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 via-primary to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] ring-4 ring-[#09090f] group-active:scale-90 transition-transform">
                        <AnimatedIcon icon={AnimatePlus} animation="spin" size={24} strokeWidth={2.6} />
                      </div>
                      <span className="mt-0.5 text-[10px] font-bold text-purple-300 group-hover:text-white transition-colors">
                        Create
                      </span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                    }}
                    className={cn(
                      "group flex flex-col items-center justify-center flex-1 h-full py-1 relative active:scale-95 transition-transform",
                      isActive ? "text-purple-400 font-black" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="relative">
                      <AnimatedIcon
                        icon={Icon}
                        animation="pop"
                        size={22}
                        strokeWidth={isActive ? 2.5 : 2}
                        animateOnHover={false}
                        playKey={isActive}
                        iconClassName={cn(
                          "transition-colors",
                          isActive ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" : ""
                        )}
                      />
                      {item.href === "/app/notifications" && unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-2 rounded-full bg-rose-500 ring-2 ring-[#09090f] animate-pulse" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-0.5 text-[10px] tracking-tight transition-colors",
                        isActive ? "text-purple-400 font-bold" : "text-muted-foreground font-medium"
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
            {/* iOS/Android Home Indicator Bar */}
            <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mb-1.5 shrink-0" />
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
                    <Link href={profile ? "/app/profile" : "/join"} onClick={() => setShowMobileMenu(false)}>
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
                      pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
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
                            isActive ? "text-foreground stroke-2" : "text-muted-foreground"
                          )}
                        />
                        <span>{item.label}</span>
                        {item.badge === "NEW" && !marketplaceSeen && (
                          <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 uppercase tracking-wider">
                            NEW
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Secondary Quick Links */}
                <div className="pt-3 border-t border-border/30 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-3">
                    Support &amp; Safety
                  </span>
                  <Link
                    href="/app/settings"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <AnimatedIcon icon={AnimateSlidersHorizontal} animation="pop" size={16} />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/safety"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <AnimatedIcon icon={AnimateShieldCheck} animation="pop" size={16} />
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

              {/* Social Channels (Instagram -> LinkedIn -> X) */}
              <div className="pt-3 pb-2 flex items-center justify-between border-t border-border/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Follow Us
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={SOCIAL_LINKS.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-7 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground hover:text-pink-500 transition-colors shadow-2xs"
                    aria-label="Instagram"
                    title="Instagram @campusloop.space"
                  >
                    <InstagramIcon className="size-3.5" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-7 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground hover:text-blue-500 transition-colors shadow-2xs"
                    aria-label="LinkedIn"
                    title="LinkedIn @mycampusloop"
                  >
                    <LinkedinIcon className="size-3.5" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.x.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-7 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                    aria-label="X (Twitter)"
                    title="X @mycampusloop"
                  >
                    <XIcon className="size-3" />
                    <span className="sr-only">X (Twitter)</span>
                  </a>
                </div>
              </div>

              {/* Bottom Drawer Footer */}
              <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                <ThemeToggle className="size-8 rounded-xl border-none bg-muted/50 hover:bg-muted" />
                {profile ? (
                  <SignOutButton />
                ) : (
                  <Link
                    href="/handler/sign-in"
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

      {/* Campus Preview Modals */}
      <CampusUnlockedModal isOpen={showUnlockModal} onClose={() => setShowUnlockModal(false)} />
      <DreamCampusesModal isOpen={showDreamModal} onClose={() => setShowDreamModal(false)} />
    </>
  );
}
