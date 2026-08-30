import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  Bookmark,
  Cake,
  Calendar,
  Compass,
  Flame,
  Heart,
  HelpCircle,
  Home,
  Hourglass,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Plus,
  School,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  UserCircle,
  Users,
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  href: string;
  label: string;
  desc?: string;
  badge?: string;
  badgeColor?: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

/**
 * Clean, minimal primary navigation items (Twitter / X style: core items + More)
 */
export const DESKTOP_NAV_ITEMS: NavItem[] = [
  { icon: Home, href: "/app", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Explore" },
  {
    icon: Calendar,
    href: "/app/events",
    label: "Events",
    badge: "NEW",
    badgeColor: "bg-primary/15 text-primary border border-primary/30",
  },
  { icon: Bookmark, href: "/app/saved", label: "Saved" },
  {
    icon: ShoppingBag,
    href: "/app/marketplace",
    label: "Marketplace",
    badge: "NEW",
    badgeColor: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
  },
  { icon: Heart, href: "/app/dating", label: "Dating" },
  { icon: Bell, href: "/app/notifications", label: "Notifications" },
  { icon: MessageSquare, href: "/app/chat", label: "Messages" },
  { icon: Users, href: "/app/communities", label: "Communities" },
  { icon: UserCircle, href: "/app/profile", label: "Profile" },
  { icon: MoreHorizontal, href: "/app/more", label: "More" },
];

/**
 * Mobile Bottom Floating Navigation
 */
export const MOBILE_BOTTOM_ITEMS: NavItem[] = [
  { icon: Home, href: "/app", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Explore" },
  { icon: Plus, href: "/app/post/new", label: "" },
  { icon: MessageSquare, href: "/app/chat", label: "Chat" },
  { icon: MoreHorizontal, href: "/app/more", label: "More" },
];

/**
 * All secondary features grouped under the "More" parent hub
 */
export const MORE_HUB_SECTIONS: NavGroup[] = [
  {
    group: "Connections & Dating",
    items: [
      {
        icon: Lock,
        href: "/app/crush",
        label: "Secret Crush",
        desc: "5-slot intent-hidden campus crush vault",
        badge: "5 Slots",
        badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      },
      {
        icon: Heart,
        href: "/app/dating",
        label: "Campus Match",
        desc: "Swipe deck for 18+ verified students",
        badge: "18+",
        badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      },
    ],
  },
  {
    group: "Campus Directories & Life",
    items: [
      {
        icon: BookOpen,
        href: "/app/articles",
        label: "Campus Articles & Blogs",
        desc: "Placement roadmaps, tech tutorials & campus long reads",
        badge: "NEW",
        badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      },
      {
        icon: Calendar,
        href: "/app/events",
        label: "Events & Fests",
        desc: "Hackathons, fests, workshops & competitions",
        badge: "NEW",
        badgeColor: "bg-primary/10 text-primary border-primary/20",
      },
      {
        icon: School,
        href: "/app/colleges",
        label: "Colleges Directory",
        desc: "1,350+ indexed Indian college hubs & rankings",
      },
      {
        icon: Hourglass,
        href: "/app/capsule",
        label: "Time Capsule",
        desc: "Batch memory vault locked until convocation & landmark dates",
        badge: "Unique",
        badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      },
      {
        icon: Flame,
        href: "/app/confessions",
        label: "Campus Confessions",
        desc: "Anonymous discussions with sealed identity escrow",
      },
      {
        icon: Cake,
        href: "/app/birthdays",
        label: "Campus Birthdays",
        desc: "Celebrate fellow classmates born today",
      },
    ],
  },
  {
    group: "Account & Platform",
    items: [
      {
        icon: Sliders,
        href: "/app/settings",
        label: "Settings",
        desc: "Account privacy, verification & notifications",
      },
      {
        icon: ShieldCheck,
        href: "/safety",
        label: "Safety & Privacy",
        desc: "Verified student network guidelines & moderation",
      },
      {
        icon: HelpCircle,
        href: "/contact",
        label: "Help & Feedback",
        desc: "Reach out to CampusLoop core team",
      },
    ],
  },
];
