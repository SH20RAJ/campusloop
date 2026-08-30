"use client";

import {
  ArrowLeft,
  Bike,
  CalendarCheck2,
  Clock,
  DollarSign,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  QrCode,
  Settings,
  Star,
  Store,
  Tag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface MerchantLayoutClientProps {
  children: React.ReactNode;
  profile: any;
  merchant?: any;
}

const MERCHANT_NAV_ITEMS = [
  { href: "/merchant-portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchant-portal/orders", label: "Orders", icon: Package },
  { href: "/merchant-portal/products", label: "Products / Menu", icon: UtensilsCrossed },
  { href: "/merchant-portal/store", label: "Store Profile", icon: Store },
  { href: "/merchant-portal/offers", label: "Offers & Deals", icon: Tag },
  { href: "/merchant-portal/earnings", label: "Earnings", icon: DollarSign },
  { href: "/merchant-portal/reviews", label: "Reviews", icon: Star },
  { href: "/merchant-portal/store/qr", label: "Printable QR", icon: QrCode },
];

const BIKE_RENTAL_NAV_ITEMS = [
  { href: "/merchant-portal/bikes", label: "Bike Dashboard", icon: Bike },
  { href: "/merchant-portal/bikes/bookings", label: "Bookings", icon: CalendarCheck2 },
  { href: "/merchant-portal/bikes/fleet", label: "Fleet Vehicles", icon: Gauge },
  { href: "/merchant-portal/bikes/availability", label: "Availability", icon: Clock },
  { href: "/merchant-portal/bikes/settings", label: "Rental Rules", icon: Settings },
];

export function MerchantLayoutClient({ children, profile, merchant }: MerchantLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRentalStore = merchant?.categorySlug === "rentals" || pathname.startsWith("/merchant-portal/bikes");

  async function handleLogout() {
    sounds.tap();
    haptics.medium();
    try {
      await fetch("/api/merchant/auth/logout", { method: "POST" });
      toast.success("Logged out from merchant portal");
      router.push("/merchant-portal/login");
      router.refresh();
    } catch {
      router.push("/merchant-portal/login");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row select-none">
      {/* ─── Top Mobile Merchant Header ─── */}
      <header className="sticky top-0 z-40 flex h-13 w-full items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-foreground cursor-pointer"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-black tracking-tight">
            Campus<span className="text-emerald-500">Merchant</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/marketplace"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="size-3.5" />
            <span>Store</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors"
            title="Log Out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      {/* ─── Desktop Dedicated Sidebar ─── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border/30 bg-card py-5 px-3 md:flex md:flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Merchant Brand */}
          <div className="px-3">
            <Link href="/merchant-portal" className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Store className="size-4.5" />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-foreground leading-none block">
                  Campus<span className="text-emerald-500">Merchant</span>
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">Partner Console</span>
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
                (item.href !== "/merchant-portal" && pathname.startsWith(item.href));
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
                (item.href !== "/merchant-portal/bikes" && pathname.startsWith(item.href));
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
            <span>Student App</span>
          </Link>

          <div className="flex items-center justify-between px-3 py-1 text-xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Avatar className="size-7 rounded-full border border-border/40 shrink-0">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-[10px] font-bold">
                  {profile.displayName?.[0] || "M"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground truncate leading-none">{profile.displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">@{profile.username}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="size-7 rounded-lg hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
              title="Sign Out of Merchant Console"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Slide-out Drawer Menu ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex md:hidden">
          <div className="w-4/5 max-w-xs h-full bg-card border-r border-border p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-sm font-black">
                  Campus<span className="text-emerald-500">Merchant</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <nav className="space-y-1">
                <p className="px-2 text-[10px] font-black uppercase text-muted-foreground">General Store</p>
                {MERCHANT_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold",
                      pathname === item.href
                        ? "bg-foreground text-background font-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <nav className="space-y-1 pt-2 border-t border-border">
                <p className="px-2 text-[10px] font-black uppercase text-emerald-500">Bike Rentals</p>
                {BIKE_RENTAL_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold",
                      pathname === item.href
                        ? "bg-emerald-500 text-black font-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition-colors"
              >
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content Body ─── */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 pb-20 md:pb-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
