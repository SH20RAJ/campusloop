"use client";

import { Home, Compass, Plus, Bell, UserCircle, Shield, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationProps {
  isAdmin?: boolean;
}

export function Navigation({ isAdmin }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, href: "/app/campus", label: "Home" },
    { icon: Compass, href: "/app/discover", label: "Discover" },
    { icon: Heart, href: "/app/confessions", label: "Confessions" },
    { icon: MessageSquare, href: "/app/chat", label: "Messages" },
    { icon: Plus, href: "/app/post/new", label: "Create" },
    { icon: UserCircle, href: "/app/profile", label: "Profile" },
  ];

  if (isAdmin) {
    navItems.push({ icon: Shield, href: "/admin", label: "Admin" });
  }

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border bg-card px-4 py-6 md:flex md:flex-col justify-between">
        <div className="space-y-6">
          <div className="px-3 py-2 text-xl font-bold tracking-tight text-foreground">
            CampusLoop
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border pt-4">
          CampusLoop MVP • pure shadcn
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex h-16 border-t border-border bg-card md:hidden items-center justify-around px-2 shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
