"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
Bike,
CalendarCheck2,
Clock,
DollarSign,
Gauge,
LayoutDashboard,
Menu,
Package,
QrCode,
Settings,
Star,
Store,
Tag,
UtensilsCrossed
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MerchantLayoutClientProps {
  children: React.ReactNode;
  profile: any;
}

const MERCHANT_NAV_ITEMS = [
  { href: "/merchantt-portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchantt-portal/orders", label: "Orders", icon: Package },
  { href: "/merchantt-portal/products", label: "Products / Menu", icon: UtensilsCrossed },
  { href: "/merchantt-portal/store", label: "Store Profile", icon: Store },
  { href: "/merchantt-portal/offers", label: "Offers & Deals", icon: Tag },
  { href: "/merchantt-portal/earnings", label: "Earnings", icon: DollarSign },
  { href: "/merchantt-portal/reviews", label: "Reviews", icon: Star },
  { href: "/merchantt-portal/store/qr", label: "Printable QR", icon: QrCode },
];

const BIKE_RENTAL_NAV_ITEMS = [
  { href: "/merchantt-portal/bikes", label: "Bike Dashboard", icon: Bike },
  { href: "/merchantt-portal/bikes/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/merchantt-portal/bikes/fleet", label: "Fleet Vehicles", icon: Gauge },
  { href: "/merchantt-portal/bikes/availability", label: "Availability", icon: Clock },
  { href: "/merchantt-portal/bikes/settings", label: "Rental Rules", icon: Settings },
];

const MOBILE_MERCHANT_TABS = [
  { href: "/merchantt-portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchantt-portal/orders", label: "Orders", icon: Package },
  { href: "/merchantt-portal/bikes", label: "Bikes", icon: Bike },
  { href: "/merchantt-portal/products", label: "Menu", icon: UtensilsCrossed },
  { href: "/merchantt-portal/store", label: "Store", icon: Store },
];

export function MerchantLayoutClient({ children, profile }: MerchantLayoutClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row select-none">
      {/* ─── Top Mobile Merchant Header ─── */}
      <header className="sticky top-0 z-40 flex h-13 w-full items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-black tracking-tight">
            Campus<span className="text-emerald-500">Merchant</span>
          </span>
        </div>

        <Link
          href="/app/marketplace"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" />
          <span>Student App</span>
        </Link>
      </header>

      {/* ─── Desktop Dedicated Sidebar ─── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border/30 bg-card py-5 px-3 md:flex md:flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Merchant Brand */}
          <div className="px-3">
            <Link href="/merchantt-portal" className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Store className="size-4.5" />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-foreground leading-none block">
                  Campus<span className="text-emerald-500">Merchant</span>
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  Partner Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              General Store
            </p>
            {MERCHANT_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/merchantt-portal" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer",
                    isActive
                      ? "bg-foreground text-background font-black shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Dedicated Bike Rentals Section */}
          <nav className="space-y-1 pt-2 border-t border-border/30">
            <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
              <Bike className="size-3.5" />
              <span>Bike Fleet Rentals</span>
            </p>
            {BIKE_RENTAL_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/merchantt-portal/bikes" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer",
                    isActive
                      ? "bg-emerald-500 text-black font-black shadow-xs"
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

        {/* Bottom User Info & Switch to Student App */}
        <div className="pt-3 border-t border-border/30 space-y-2 px-1">
          <Link
            href="/app/marketplace"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Switch to Student App</span>
          </Link>

          <div className="flex items-center gap-2.5 px-3 py-1 text-xs text-muted-foreground">
            <Avatar className="size-7 rounded-full border border-border/40">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-[10px] font-bold">
                {profile.displayName?.[0] || "M"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground truncate leading-none">
                {profile.displayName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                @{profile.username}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Canvas ─── */}
      <div className="flex-1 md:pl-64 min-h-screen pb-20 md:pb-6">{children}</div>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-border/30 bg-background/90 px-2 backdrop-blur-xl md:hidden">
        {MOBILE_MERCHANT_TABS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/merchantt-portal" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-3 rounded-xl transition-colors cursor-pointer",
                isActive ? "text-emerald-500 font-black" : "text-muted-foreground"
              )}
            >
              <Icon className="size-4.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
