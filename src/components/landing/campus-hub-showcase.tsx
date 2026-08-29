"use client";

import { Card,CardContent } from "@/components/ui/card";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
ArrowRight,
BookOpen,
Car,
Copy,
Gamepad2,
Home,
MessageCircle,
PackageSearch,
ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "./reveal";

interface HubItemData {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  demo: any;
}

const HUB_ITEMS: Record<string, HubItemData> = {
  lost_found: {
    title: "Lost & Found Registry",
    subtitle: "Reunite with lost calculators, ID cards, keys & cycle locks",
    badge: "Lost & Found",
    badgeColor: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    demo: {
      type: "LOST",
      itemTitle: "Casio fx-991EX Scientific Calculator",
      location: "Main Building Room 214",
      date: "Yesterday during Math Tutorial",
      reward: "Treat at Canteen 🍔",
      author: "Shaswat Raj",
      college: "BIT Mesra",
    },
  },
  marketplace: {
    title: "Buy & Sell Student Marketplace",
    subtitle: "Trade cycles, drafters, coolers, and books within your hostel perimeter",
    badge: "Marketplace",
    badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    demo: {
      itemTitle: "Hero Sprint 21-Speed Gear Bicycle",
      price: "₹2,800",
      originalPrice: "₹7,200",
      condition: "Like New",
      location: "Hostel 11 Cycle Stand",
      seller: "Ayush Tiwari",
      college: "BIT Mesra",
    },
  },
  gaming: {
    title: "Gaming & Esports Arena",
    subtitle: "Form 5v5 scrims, Chess.com blitz duels, and BGMI squad custom lobbies",
    badge: "Gaming Arena",
    badgeColor: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    demo: {
      game: "Valorant",
      mode: "5v5 Inter-Hostel Scrim",
      title: "Plat/Diamond Scrims • Need 2 Duelists",
      slots: "3/5 Filled",
      time: "Tonight 10:30 PM",
      hostTag: "Viper#IN1",
      college: "BIT Mesra",
    },
  },
  rideshare: {
    title: "Ride Share & Cab Pooling",
    subtitle: "Split auto fares and airport cabs with verified batchmates",
    badge: "Ride Share",
    badgeColor: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    demo: {
      route: "Campus Gate ➔ Ranchi Railway Station",
      departure: "Friday 5:30 AM",
      seats: "2 Seats Left",
      fare: "₹75 / seat",
      vehicle: "Auto Pool",
      creator: "Arjun Sen",
      college: "BIT Mesra",
    },
  },
  housing: {
    title: "Housing & Flatmates Finder",
    subtitle: "Find verified student flatmates and PGs around the campus perimeter",
    badge: "Housing",
    badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    demo: {
      title: "1 Room in 3BHK Flat near Back Gate",
      rent: "₹4,200 / mo",
      distance: "5 min walk from Back Gate",
      occupancy: "Single Room (Boys)",
      amenities: ["High-speed WiFi", "Cook Available", "Power Backup"],
      college: "BIT Mesra",
    },
  },
  academics: {
    title: "Notes, Solved PYQs & Academics",
    subtitle: "Exam-night handwritten notes, 5-year solved papers, and professor cheat sheets",
    badge: "Notes & PYQs",
    badgeColor: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
    demo: {
      subject: "CS201 • Data Structures & Algorithms",
      title: "Complete Handwritten End-Sem Notes + Solved PYQs",
      branch: "Computer Science • Sem 3",
      upvotes: "42 Upvotes",
      isVerified: true,
      college: "BIT Mesra",
    },
  },
};

export function CampusHubShowcase() {
  const [activeKey, setActiveKey] = useState<string>("gaming");
  const activeHub = HUB_ITEMS[activeKey] || HUB_ITEMS.gaming;
  const demo = activeHub.demo;

  function handleSelect(key: string) {
    sounds.tap();
    haptics.light();
    setActiveKey(key);
  }

  return (
    <section className="border-t border-border/60 bg-muted/5 py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="max-w-2xl space-y-3 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Campus Hubs &amp; Services
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything your campus needs, under one roof.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            No more messy WhatsApp groups or unverified Telegram channels. Each college gets its own isolated, verified student-to-student service hubs.
          </p>
        </Reveal>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {[
            { key: "lost_found", label: "Lost & Found", icon: PackageSearch },
            { key: "marketplace", label: "Buy & Sell", icon: ShoppingBag },
            { key: "gaming", label: "Gaming Arena", icon: Gamepad2 },
            { key: "rideshare", label: "Ride Share", icon: Car },
            { key: "housing", label: "Housing & Flats", icon: Home },
            { key: "academics", label: "Notes & PYQs", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeKey === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleSelect(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0",
                  isSelected
                    ? "bg-foreground text-background font-black shadow-sm"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Card Showcase */}
        <div className="grid gap-6 lg:grid-cols-12 items-center pt-4">
          <div className="lg:col-span-5 space-y-4">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border",
                activeHub.badgeColor
              )}
            >
              {activeHub.badge}
            </span>
            <h3 className="text-2xl font-bold text-foreground">
              {activeHub.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {activeHub.subtitle}
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <span>Try clicking buttons on the demo card</span>
                <ArrowRight className="size-3" />
              </span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="shadow-lg border border-border/80 bg-card overflow-hidden">
              <CardContent className="p-6 space-y-4">
                {activeKey === "lost_found" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                        {demo.type} ITEM
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {demo.college}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {demo.itemTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Last seen at {demo.location} · {demo.date}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs font-bold text-amber-500">
                        Reward: {demo.reward}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.ting();
                          haptics.repost();
                          toast.success("Contacted founder on CampusLoop!");
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 cursor-pointer shadow-xs active:scale-95"
                      >
                        I Found This!
                      </button>
                    </div>
                  </div>
                )}

                {activeKey === "marketplace" && (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-foreground">
                        {demo.price}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {demo.originalPrice}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                        {demo.condition}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {demo.itemTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Pickup location: {demo.location} · Seller: @{demo.seller}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">
                        Hostel Room Delivery Available
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.pop();
                          haptics.light();
                          toast.info("Opening student messenger with seller!");
                        }}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer shadow-xs active:scale-95"
                      >
                        <MessageCircle className="size-3" />
                        <span>Chat with Seller</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeKey === "gaming" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                        {demo.game} · {demo.mode}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {demo.time}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {demo.title}
                    </h4>
                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/40">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Lobby Squad</span>
                        <span className="text-purple-500 font-black">{demo.slots}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full w-[60%]" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          haptics.light();
                          navigator.clipboard.writeText(demo.hostTag);
                          toast.success(`Copied Riot Tag: ${demo.hostTag} 📋`);
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <span>Tag: {demo.hostTag}</span>
                        <Copy className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.match();
                          haptics.match();
                          toast.success("Joined 5v5 Scrim Lobby! 🎮");
                        }}
                        className="px-4 py-1.5 rounded-full bg-purple-500 text-white text-xs font-bold hover:bg-purple-600 cursor-pointer shadow-xs active:scale-95"
                      >
                        Join Lobby
                      </button>
                    </div>
                  </div>
                )}

                {activeKey === "rideshare" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-500 border border-sky-500/30">
                        {demo.vehicle}
                      </span>
                      <span className="text-sm font-black text-sky-500">
                        {demo.fare}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {demo.route}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Departure: {demo.departure} · Coordinated by {demo.creator}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs font-bold text-emerald-500">
                        {demo.seats}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.match();
                          haptics.match();
                          toast.success("Seat Reserved! Split fare with batchmate 🚗");
                        }}
                        className="px-4 py-1.5 rounded-full bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 cursor-pointer shadow-xs active:scale-95"
                      >
                        Book Seat
                      </button>
                    </div>
                  </div>
                )}

                {activeKey === "housing" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-amber-500">
                        {demo.rent}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {demo.occupancy}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {demo.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {demo.distance}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(demo.amenities || []).map((am: string) => (
                        <span key={am} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {am}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2 border-t border-border/30">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          haptics.light();
                          toast.info("Opening flatmate contact!");
                        }}
                        className="px-4 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 cursor-pointer shadow-xs active:scale-95"
                      >
                        Contact Flatmate
                      </button>
                    </div>
                  </div>
                )}

                {activeKey === "academics" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-500">
                        {demo.subject}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        Verified Notes
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {demo.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {demo.branch}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="text-xs font-black text-foreground">
                        {demo.upvotes}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          haptics.light();
                          toast.success("Opening Google Drive notes folder! 📚");
                        }}
                        className="px-4 py-1.5 rounded-full bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 cursor-pointer shadow-xs active:scale-95"
                      >
                        Open Notes Drive
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
