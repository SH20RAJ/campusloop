"use client";

import { Home, Compass, Plus, Bell, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, href: "/app/campus", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Discover" },
  { icon: Plus, href: "/app/post/new", label: "Create" },
  { icon: Bell, href: "/app/notifications", label: "Notifications" },
  { icon: UserCircle, href: "/app/profile", label: "Profile" },
];

export function GlassBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center justify-center gap-6 rounded-full border border-white/10 bg-black/70 px-6 py-4 shadow-2xl backdrop-blur-xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
              isActive ? "bg-white text-black shadow-md" : "text-white/70 hover:text-white"
            )}
            aria-label={item.label}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2 : 1.5} />
          </Link>
        );
      })}
    </div>
  );
}
