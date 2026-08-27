import type { LucideIcon } from "lucide-react";
import {
Bell,
Cake,
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
Sliders,
UserCircle,
Users
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
 * Clean, minimal primary navigation items (Twitter / X style: 5-6 core items + More)
 */
export const DESKTOP_NAV_ITEMS: NavItem[] = [
  { icon: Home, href: "/app", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Explore" },
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
