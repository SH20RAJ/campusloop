"use client";

import {
  ArrowLeft,
  Bike,
  Droplet,
  Grid,
  History,
  Home,
  Scissors,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, getAvatarUrl } from "@/lib/utils";

interface MarketplaceShellClientProps {
  children: React.ReactNode;
  profile: any;
  viewerMode: boolean;
}

const VERTICAL_NAV = [
  {
    name: "Food & Canteen",
    slug: "food",
    icon: UtensilsCrossed,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  { name: "Bike Rentals", slug: "rentals", icon: Bike, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "Barber & Salon", slug: "barber", icon: Scissors, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Laundry & Wash", slug: "laundry", icon: Shirt, color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "Water Can Refill", slug: "water", icon: Droplet, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  {
    name: "Supermarket & Mart",
    slug: "essentials",
    icon: ShoppingBag,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

export function MarketplaceShellClient({ children, profile, viewerMode }: MarketplaceShellClientProps) {
  const pathname = usePathname();
  const { totalItemsCount, overallSubtotal } = useMarketplaceCart();
  const totalItems = totalItemsCount;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 pb-20 md:pb-6">
      {/* ─── Dedicated Marketplace Top Header ─── */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-xl select-none">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Feed Back Link + Logo & Campus Market Hub */}
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex size-8.5 items-center justify-center rounded-full border border-border/40 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
              title="Back to Campus Feed"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <Link
              href="/app/marketplace"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex items-center gap-2 group"
            >
              <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm tracking-tighter">
                <Store className="size-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-1.5">
                  <span>Campus</span>
                  <span className="text-primary font-black">Market</span>
                </span>
              </div>
            </Link>

            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 ml-1">
              <Sparkles className="size-3" />
              <span>{profile?.institution?.name?.split(",")[0] || "Campus Hub"}</span>
            </span>
          </div>

          {/* Right: Cart Trigger, Orders, Theme, Profile */}
          <div className="flex items-center gap-2">
            <Link
              href="/app/marketplace/orders"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer",
                pathname.startsWith("/app/marketplace/orders") ||
                  pathname.startsWith("/app/marketplace/order")
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <History className="size-3.5" />
              <span>Orders &amp; Bookings</span>
            </Link>

            {/* Live Cart Link */}
            <Link
              href="/app/marketplace/cart"
              onClick={() => {
                sounds.tap();
                haptics.medium();
              }}
              className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ShoppingCart className="size-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="size-4.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center -mr-1 animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>

            <ThemeToggle className="size-8.5 rounded-full border border-border/40 bg-muted/40 hover:bg-muted" />

            <Link
              href="/app/profile"
              className="flex items-center gap-2 pl-1 group cursor-pointer"
              title={`Logged in as @${profile.username}`}
            >
              <Avatar className="size-8 border border-border/60 transition-transform group-hover:scale-105">
                <AvatarImage
                  src={getAvatarUrl(profile.avatarUrl)}
                  alt={profile.displayName || profile.username}
                />
                <AvatarFallback className="text-[11px] font-black uppercase">
                  {profile.displayName?.slice(0, 2) || profile.username?.slice(0, 2) || "CL"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container with Desktop Sidebar ─── */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-4 flex-1 flex gap-6">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 space-y-6 sticky top-20 h-fit select-none">
          {/* Vertical Categories */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2">
              Campus Services
            </span>
            <div className="space-y-1">
              {VERTICAL_NAV.map((v) => {
                const Icon = v.icon;
                const pathSlug = v.slug === "essentials" ? "supermarket" : v.slug;
                const isActive = pathname.startsWith(`/app/marketplace/${pathSlug}`);
                return (
                  <Link
                    key={v.slug}
                    href={`/app/marketplace/${pathSlug}`}
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                    }}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "size-6 rounded-lg flex items-center justify-center shrink-0",
                        v.bg,
                        v.color
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <span>{v.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Actions & Merchant Link */}
          <div className="rounded-2xl border border-border/60 bg-card p-3 space-y-2">
            <p className="text-[11px] font-black text-foreground">Own a campus stall?</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Accept live orders, print QR menus, and manage delivery directly.
            </p>
            <Link
              href="/merchant-portal/login"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-black text-primary hover:underline"
            >
              <span>Sign In to Merchant Portal</span>
              <span>→</span>
            </Link>
          </div>
        </aside>

        {/* Page Main */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* ─── Dedicated Marketplace Mobile Bottom Bar (5 Core Tabs) ─── */}
      <nav
        aria-label="Marketplace navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-2 py-1.5 select-none"
      >
        <div className="grid grid-cols-5 items-center">
          <Link
            href="/app/marketplace"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-black transition-colors",
              pathname === "/app/marketplace" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="size-4.5" />
            <span>Market</span>
          </Link>

          <Link
            href="/app/marketplace#categories"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Grid className="size-4.5" />
            <span>Services</span>
          </Link>

          <Link
            href="/app/marketplace?focus=search"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="size-4.5" />
            <span>Search</span>
          </Link>

          <Link
            href="/app/marketplace/cart"
            onClick={() => {
              sounds.tap();
              haptics.medium();
            }}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-black transition-colors",
              pathname.startsWith("/app/marketplace/cart")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <ShoppingCart className="size-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 size-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>

          <Link
            href="/app/marketplace/orders"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-bold transition-colors",
              pathname.startsWith("/app/marketplace/orders") || pathname.startsWith("/app/marketplace/order")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="size-4.5" />
            <span>Orders</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
