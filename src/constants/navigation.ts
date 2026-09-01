import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Cake,
  Calendar,
  Car,
  Gamepad2,
  HelpCircle,
  Hourglass,
  MoreHorizontal,
  School,
  Sliders,
} from "lucide-react";
import {
  AnimateBellRing,
  AnimateBookmark,
  AnimateBookOpen,
  AnimateCompass,
  AnimateFlame,
  AnimateGraduationCap,
  AnimateHeart,
  AnimateHouse,
  AnimateLock,
  AnimateMessageSquare,
  AnimatePlus,
  AnimateSearch,
  AnimateShieldCheck,
  AnimateShoppingBag,
  AnimateSparkles,
  AnimateUser,
  AnimateUsers,
  AnimateZap,
} from "@/components/ui/animated-icon";

export interface NavItem {
  icon: LucideIcon | React.ComponentType<any>;
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

export const DESKTOP_NAV_ITEMS: NavItem[] = [
  { icon: AnimateHouse, href: "/app", label: "Home" },
  { icon: AnimateCompass, href: "/app/discover", label: "Explore" },
  {
    icon: Calendar,
    href: "/app/events",
    label: "Events",
    badge: "NEW",
    badgeColor: "bg-primary/15 text-primary border border-primary/30",
  },
  {
    icon: AnimateShoppingBag,
    href: "/app/marketplace",
    label: "Marketplace",
    badge: "NEW",
    badgeColor: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
  },
  { icon: AnimateHeart, href: "/app/matching", label: "Match" },
  { icon: AnimateBellRing, href: "/app/notifications", label: "Notifications" },
  { icon: AnimateMessageSquare, href: "/app/chat", label: "Messages" },
  { icon: AnimateUsers, href: "/app/communities", label: "Communities" },
  { icon: AnimateUser, href: "/app/profile", label: "Profile" },
  { icon: MoreHorizontal, href: "/app/more", label: "More" },
];

export const MOBILE_BOTTOM_ITEMS: NavItem[] = [
  { icon: AnimateHouse, href: "/app", label: "Home" },
  { icon: AnimateCompass, href: "/app/discover", label: "Explore" },
  { icon: AnimatePlus, href: "/app/post/new", label: "Post" },
  { icon: AnimateHeart, href: "/app/matching", label: "Match" },
  { icon: MoreHorizontal, href: "/app/more", label: "More" },
];

export const MORE_HUB_SECTIONS: NavGroup[] = [
  {
    group: "Campus Spotlight & Vaults (Exclusive)",
    items: [
      {
        icon: AnimateZap,
        href: "/app/random",
        label: "Random Loop",
        desc: "Meet someone unexpected. Instant real-time serendipitous chat with verified peers",
        badge: "HOT",
        badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      },
      {
        icon: AnimateLock,
        href: "/app/crush",
        label: "Secret Crush Vault",
        desc: "5-slot intent-hidden encrypted campus crush match vault",
        badge: "5 SLOTS",
        badgeColor: "bg-pink-500/15 text-pink-500 border-pink-500/30",
      },
      {
        icon: AnimateSparkles,
        href: "/app/ai",
        label: "Campus AI Assistant",
        desc: "Ask about campus fests, study roadmaps, hostel tips & navigate CampusLoop",
        badge: "AI",
        badgeColor: "bg-primary/15 text-primary border-primary/30",
      },
      {
        icon: AnimateFlame,
        href: "/app/confessions",
        label: "Campus Confessions",
        desc: "Unfiltered campus thoughts with sealed identity escrow",
        badge: "ANON",
        badgeColor: "bg-rose-500/15 text-rose-500 border-rose-500/30",
      },
      {
        icon: Hourglass,
        href: "/app/capsule",
        label: "Time Capsule",
        desc: "Batch memory vault locked until convocation & landmark dates",
        badge: "LOCKED",
        badgeColor: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
      },
      {
        icon: Cake,
        href: "/app/birthdays",
        label: "Campus Birthdays",
        desc: "Celebrate fellow classmates and batchmates born today",
        badge: "TODAY",
        badgeColor: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
      },
    ],
  },
  {
    group: "Student Living & Campus Utilities",
    items: [
      {
        icon: AnimateGraduationCap,
        href: "/app/academics",
        label: "Academics & Study Hub",
        desc: "PYQs, lecture notes, branch syllabi & exam preparation resources",
        badge: "STUDY",
        badgeColor: "bg-blue-500/15 text-blue-500 border-blue-500/30",
      },
      {
        icon: AnimateBookOpen,
        href: "/app/articles",
        label: "Articles & Roadmaps",
        desc: "Placement roadmaps, tech tutorials, interviews & campus long reads",
        badge: "READS",
        badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      },
      {
        icon: Building2,
        href: "/app/housing",
        label: "Housing & Flatmates",
        desc: "Verified student flatmates, hostel rooms, PGs & apartments near campus",
        badge: "PG & FLATS",
        badgeColor: "bg-orange-500/15 text-orange-500 border-orange-500/30",
      },
      {
        icon: Car,
        href: "/app/rideshare",
        label: "Ride Share & Carpools",
        desc: "Split cabs to airport, railway stations, weekend trips & daily commutes",
        badge: "POOL",
        badgeColor: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
      },
      {
        icon: AnimateSearch,
        href: "/app/lost-and-found",
        label: "Lost & Found Hub",
        desc: "Report and recover misplaced student ID cards, keys, earbuds & gadgets",
        badge: "RECOVERY",
        badgeColor: "bg-violet-500/15 text-violet-500 border-violet-500/30",
      },
      {
        icon: Gamepad2,
        href: "/app/gaming",
        label: "Gaming & Esports Arena",
        desc: "Campus BGMI, Valorant, FIFA tournaments & hostel gaming lobbies",
        badge: "LOBBIES",
        badgeColor: "bg-fuchsia-500/15 text-fuchsia-500 border-fuchsia-500/30",
      },
    ],
  },
  {
    group: "Core Campus Hubs & Activities",
    items: [
      {
        icon: AnimateUsers,
        href: "/app/communities",
        label: "Communities & Clubs",
        desc: "Student-created clubs, technical societies & campus interest groups",
        badge: "HUBS",
        badgeColor: "bg-primary/15 text-primary border-primary/30",
      },
      {
        icon: AnimateShoppingBag,
        href: "/app/marketplace",
        label: "Student Marketplace & Canteens",
        desc: "Buy, sell, trade dorm essentials, books, cycles & order from campus food joints",
        badge: "MARKET",
        badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      },
      {
        icon: Calendar,
        href: "/app/events",
        label: "Events, Fests & Hackathons",
        desc: "College fests, hackathons, workshops, recruitments & registrations",
        badge: "EVENTS",
        badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      },
      {
        icon: AnimateMessageSquare,
        href: "/app/chat",
        label: "Direct Messages",
        desc: "P2P verified student chats, real-time messaging & study rooms",
        badge: "CHAT",
        badgeColor: "bg-blue-500/15 text-blue-500 border-blue-500/30",
      },
      {
        icon: AnimateHeart,
        href: "/app/matching",
        label: "Campus Match Deck",
        desc: "Safe vibe matching & swipe deck for verified classmates",
        badge: "SAFE",
        badgeColor: "bg-rose-500/15 text-rose-500 border-rose-500/30",
      },
      {
        icon: School,
        href: "/app/colleges",
        label: "Colleges Directory",
        desc: "1,350+ indexed Indian college hubs, rankings & hub request forms",
        badge: "1,350+",
        badgeColor: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
      },
      {
        icon: AnimateCompass,
        href: "/app/discover",
        label: "Campus Radius & Discovery",
        desc: "Explore trending campus pulses, top voices & global campus feeds across India",
        badge: "EXPLORE",
        badgeColor: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
      },
    ],
  },
  {
    group: "Account & Safety",
    items: [
      {
        icon: AnimateBookmark,
        href: "/app/saved",
        label: "Saved Posts",
        desc: "Your private vault of bookmarked posts, threads & resources",
      },
      {
        icon: Sliders,
        href: "/app/settings",
        label: "Settings",
        desc: "Account privacy, notification preferences & verification",
      },
      {
        icon: AnimateShieldCheck,
        href: "/safety",
        label: "Safety & Community Guidelines",
        desc: "Verified student network rules, identity escrow & moderation standards",
      },
      {
        icon: HelpCircle,
        href: "/contact",
        label: "Help & Feedback",
        desc: "Reach out to CampusLoop core team or apply to become a campus ambassador",
      },
    ],
  },
];
