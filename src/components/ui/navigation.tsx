"use client";

import { useState } from "react";
import {
  Home,
  Compass,
  School,
  Heart,
  MessageSquare,
  Flame,
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
  ChevronUp,
  Cake,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { BrandLogo } from "@/components/ui/brand-logo";
import type { UserProfile } from "@/db/schema";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import {
  DESKTOP_NAV_ITEMS,
  MOBILE_BOTTOM_ITEMS,
  FULL_MOBILE_DRAWER_LINKS,
} from "@/constants";

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
  const fullMobileDrawerLinks = FULL_MOBILE_DRAWER_LINKS;

  return (
    <>
      {/* ─── Enhanced Desktop Sidebar with AnimateUI ─── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border/20 bg-background/85 backdrop-blur-2xl py-5 px-3.5 md:flex md:flex-col justify-between overflow-y-auto select-none">
        <div className="space-y-4">
          {/* Logo & Campus Tag */}
          <div className="px-2 pb-1 flex items-center justify-between">
            <BrandLogo href="/app" size="md" />
            {collegeName && (
              <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full truncate max-w-[90px]" title={collegeName}>
                {collegeName.split(" ")[0]}
              </span>
            )}
          </div>

          {/* Navigation Links with AnimateUI & Sliding Active Indicator */}
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
                  {/* Sliding Active Pill */}
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

                  {/* Micro-Badges */}
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
          {isViewer ? (
            <div className="rounded-2xl bg-amber-500/10 px-3.5 py-2 text-[10px] font-semibold leading-relaxed text-amber-600 dark:text-amber-400">
              👀 Viewer Mode — join with your college email to post &amp; chat.
            </div>
          ) : (
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

              {/* Animated Popover Menu */}
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
                      href="/app/profile/edit"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                    >
                      <Sliders className="size-3.5 text-blue-500" />
                      <span>Edit Profile & Photos</span>
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

                    {!isViewer && (
                      <Link
                        href="/app/stories/new"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                      >
                        <Flame className="size-3.5 text-amber-500" />
                        <span>Post 24h Campus Vibe</span>
                      </Link>
                    )}


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
                  <ChevronUp className={cn("size-3.5 text-muted-foreground transition-transform duration-200", showProfileMenu && "rotate-180")} />
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

      {/* ─── Mobile Bottom Bar (Hidden inside chat and story fullscreen screens) ─── */}
      {!pathname.startsWith("/app/chat") &&
        !pathname.startsWith("/app/stories/new") &&
        !pathname.startsWith("/app/story/") && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px))] items-center justify-around border-t border-border/20 bg-background/85 backdrop-blur-2xl px-2 md:hidden touch-manipulation select-none">
            {mobileBottomItems.map((item) => {
              const isActive = pathname === item.href || (item.href === "/app/profile" && pathname.startsWith("/app/profile"));
              const Icon = item.icon;

              if (item.label === "") {
                if (isViewer) return null;
                return (
                  <Link
                    key="create"
                    href="/app/post/new"
                    className="flex size-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-xs active:scale-90 transition-transform cursor-pointer"
                    aria-label="Create post"
                  >
                    <Plus className="size-5 stroke-[2.5]" />
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
                        <Avatar className={cn("size-6 shrink-0 transition-all", isActive && "ring-2 ring-primary ring-offset-1 ring-offset-background")}>
                          <AvatarImage src={profile.avatarUrl} />
                          <AvatarFallback className="text-[9px] font-bold">{(profile.displayName?.[0] || "U").toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Icon className={cn("size-5 transition-colors", isActive ? "stroke-[2.5]" : "stroke-[1.8]")} />
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
                    <Icon className={cn("size-5 transition-colors", isActive ? "stroke-[2.5]" : "stroke-[1.8]")} />
                    {item.href === "/app/chat" && (
                      <span className="absolute -top-1 -right-1.5 flex size-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                        1
                      </span>
                    )}
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


      {/* ─── Full Mobile Aurora Slide-Out Drawer (Exact match to Reference 1 & 3) ─── */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 flex md:hidden select-none">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Slide-out Aurora Menu */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="relative z-10 flex h-full w-[84%] max-w-[320px] flex-col justify-between overflow-y-auto bg-aurora-mesh p-6 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-7">
                {/* Header: 4-Petal Loop Logo + Welcome to CampusLoop */}
                <div className="flex items-start justify-between pt-2">
                  <div className="space-y-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 shadow-md backdrop-blur-md">
                      <Flame className="size-6 text-white" />
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                        Welcome<br />to CampusLoop
                      </h2>
                      <p className="text-xs text-white/80 font-medium truncate max-w-[200px]">
                        {collegeName || "Verified Campus Network"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/80 hover:bg-white/30 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Primary Quick Links List */}
                <nav className="space-y-1.5 pt-2">
                  <Link
                    href="/app/settings"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-bold text-white/90 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                  >
                    <Sliders className="size-4.5 text-white/80" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-bold text-white/90 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                  >
                    <HelpCircle className="size-4.5 text-white/80" />
                    <span>Support</span>
                  </Link>

                  <Link
                    href="/about"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-bold text-white/90 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                  >
                    <Layers className="size-4.5 text-white/80" />
                    <span>About</span>
                  </Link>

                  <Link
                    href="/terms"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-bold text-white/90 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                  >
                    <FileText className="size-4.5 text-white/80" />
                    <span>Legals & Safety</span>
                  </Link>

                  <Link
                    href="/safety"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-bold text-white/90 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                  >
                    <HelpCircle className="size-4.5 text-white/80" />
                    <span>FAQ</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-sm font-bold text-white/90 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                  >
                    <MessageSquare className="size-4.5 text-white/80" />
                    <span>Give feedback</span>
                  </Link>
                </nav>

                {/* Sub-Hubs & Communities Section (Exact match to Reference 1 & 3) */}
                <div className="space-y-2.5 pt-2 border-t border-white/15">
                  <p className="px-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                    Your Communities
                  </p>
                  <div className="space-y-1">
                    <Link
                      href="/app/communities"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/15 transition-all text-xs font-bold text-white cursor-pointer"
                    >
                      <div className="flex size-7 items-center justify-center rounded-xl bg-emerald-500/80 text-white font-bold text-[11px] shadow-xs">
                        🌱
                      </div>
                      <span className="truncate">Campus Ecological</span>
                    </Link>

                    <Link
                      href="/app/communities"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/15 transition-all text-xs font-bold text-white cursor-pointer"
                    >
                      <div className="flex size-7 items-center justify-center rounded-xl bg-blue-500/80 text-white font-bold text-[11px] shadow-xs">
                        ⚡
                      </div>
                      <span className="truncate">Tech & Dev Loop</span>
                    </Link>

                    <Link
                      href="/app/communities"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/15 transition-all text-xs font-bold text-white cursor-pointer"
                    >
                      <div className="flex size-7 items-center justify-center rounded-xl bg-amber-500/80 text-white font-bold text-[11px] shadow-xs">
                        🎨
                      </div>
                      <span className="truncate">Fest & Cultural Hub</span>
                    </Link>

                    <Link
                      href="/app/communities"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus className="size-4" />
                      <span>Explore all communities</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Profile Row in Aurora Drawer */}
              <div className="pt-6 border-t border-white/15 flex items-center justify-between">
                {profile ? (
                  <Link
                    href="/app/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity"
                  >
                    <Avatar className="size-9 border-2 border-white/40 shadow-sm shrink-0">
                      <AvatarImage src={profile.avatarUrl || ""} />
                      <AvatarFallback className="font-bold text-xs bg-white text-primary">
                        {(profile.displayName?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate">{profile.displayName}</p>
                      <p className="text-[10px] text-white/75 truncate">@{profile.username}</p>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <ThemeToggle className="size-8 rounded-xl bg-white/20 text-white border-none" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {profile && <ThemeToggle className="size-8 rounded-xl bg-white/20 text-white border-none hover:bg-white/30" />}
                  <SignOutButton />
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
