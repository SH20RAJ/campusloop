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
  AnimateBookmark,
  AnimateBookOpen,
  AnimateCalendar,
  AnimateCompass,
  AnimateFlame,
  AnimateGraduationCap,
  AnimateHeart,
  AnimateHouse,
  AnimateLock,
  AnimatePlus,
  AnimateSearch,
  AnimateShieldCheck,
  AnimateShoppingBag,
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
    icon: AnimateGraduationCap,
    href: "/app/academics",
    label: "Academics",
  },
  { icon: AnimateUsers, href: "/app/communities", label: "Communities" },
  {
    icon: AnimateFlame,
    href: "/app/confessions",
    label: "Confessions",
    badge: "HOT",
    badgeColor: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
  },
  {
    icon: AnimateCalendar,
    href: "/app/events",
    label: "Events",
  },
  { icon: AnimateHeart, href: "/app/dating", label: "Match" },
  { icon: AnimateUser, href: "/app/profile", label: "Profile" },
  { icon: MoreHorizontal, href: "/app/more", label: "More" },
];

export const MOBILE_BOTTOM_ITEMS: NavItem[] = [
  { icon: AnimateHouse, href: "/app", label: "Home" },
  { icon: AnimateCompass, href: "/app/discover", label: "Explore" },
  { icon: AnimatePlus, href: "/app/post/new", label: "Create" },
  { icon: AnimateFlame, href: "/app/confessions", label: "Confessions" },
  { icon: AnimateGraduationCap, href: "/app/academics", label: "Academics" },
];

export const BETA_HUB_ITEMS: NavItem[] = [
  {
    icon: AnimateShoppingBag,
    href: "/app/marketplace",
    label: "Campus Marketplace",
    desc: "Buy, sell dorm essentials, books, cycles & order from campus canteens",
    badge: "BETA",
    badgeColor: "bg-amber-500/15 text-amber-500 border border-amber-500/30",
  },
  {
    icon: AnimateZap,
    href: "/app/random",
    label: "Random Loop",
    desc: "Meet someone unexpected. Instant real-time serendipitous chat with verified peers",
    badge: "BETA",
    badgeColor: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  {
    icon: Hourglass,
    href: "/app/capsule",
    label: "Time Capsule",
    desc: "Batch memory vault locked until convocation & landmark dates",
    badge: "VAULT",
    badgeColor: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
  },
  {
    icon: Gamepad2,
    href: "/app/gaming",
    label: "Gaming & Esports Arena",
    desc: "Campus BGMI, Valorant, FIFA tournaments & hostel gaming lobbies",
    badge: "ESPORTS",
    badgeColor: "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30",
  },
  {
    icon: AnimateZap,
    href: "/app/ai",
    label: "Campus AI Assistant",
    desc: "Ask about campus fests, study roadmaps, hostel tips & navigate CampusLoop",
    badge: "AI",
    badgeColor: "bg-primary/15 text-primary border border-primary/30",
  },
];

export const MORE_HUB_SECTIONS: NavGroup[] = [
  {
    group: "Core Campus Hubs",
    items: [
      {
        icon: AnimateGraduationCap,
        href: "/app/academics",
        label: "Academic Vault",
        desc: "Notes, PPTs, Books, PYQs, syllabus & branch study resources",
        badge: "+20 LP",
        badgeColor: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
      },
      {
        icon: AnimateFlame,
        href: "/app/confessions",
        label: "Campus Confessions",
        desc: "Unfiltered campus confessions, spicy scoops & secrets",
        badge: "HOT",
        badgeColor: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      },
      {
        icon: AnimateUsers,
        href: "/app/communities",
        label: "Communities & Clubs",
        desc: "Student-created clubs, technical societies & campus interest groups",
        badge: "CLUBS",
        badgeColor: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
      },
      {
        icon: School,
        href: "/app/colleges",
        label: "Colleges Directory",
        desc: "1,350+ indexed Indian college hubs, rankings & hub request forms",
        badge: "1,350+",
        badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
      },
    ],
  },
  {
    group: "Campus Living & Utilities",
    items: [
      {
        icon: Calendar,
        href: "/app/events",
        label: "Events, Fests & Hackathons",
        desc: "College fests, hackathons, workshops, recruitments & registrations",
        badge: "EVENTS",
        badgeColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      },
      {
        icon: AnimateBookOpen,
        href: "/app/articles",
        label: "Articles & Roadmaps",
        desc: "Placement roadmaps, tech tutorials, interviews & campus long reads",
        badge: "READS",
        badgeColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      },
      {
        icon: Building2,
        href: "/app/housing",
        label: "Housing & Flatmates",
        desc: "Verified student flatmates, hostel rooms, PGs & apartments near campus",
        badge: "PG & FLATS",
        badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
      },
      {
        icon: AnimateSearch,
        href: "/app/lost-and-found",
        label: "Lost & Found Hub",
        desc: "Report and recover misplaced student ID cards, keys, earbuds & gadgets",
        badge: "RECOVERY",
        badgeColor: "bg-violet-500/15 text-violet-400 border-violet-500/30",
      },
      {
        icon: Car,
        href: "/app/rideshare",
        label: "Ride Share & Carpools",
        desc: "Split cabs to airport, railway stations, weekend trips & daily commutes",
        badge: "CAB",
        badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      },
      {
        icon: Cake,
        href: "/app/birthdays",
        label: "Campus Birthdays",
        desc: "Celebrate fellow classmates and batchmates born today",
        badge: "TODAY",
        badgeColor: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      },
      {
        icon: Hourglass,
        href: "/app/capsule",
        label: "Time Capsule",
        desc: "Batch memory vault locked until convocation & landmark dates",
        badge: "VAULT",
        badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      },
    ],
  },
  {
    group: "Social, Discovery & Fun",
    items: [
      {
        icon: AnimateFlame,
        href: "/app/confessions",
        label: "Campus Confessions",
        desc: "Unfiltered campus thoughts with sealed identity escrow",
        badge: "ANON",
        badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      },
      {
        icon: AnimateLock,
        href: "/app/crush",
        label: "Secret Crush Vault",
        desc: "5-slot intent-hidden encrypted campus crush match vault",
        badge: "SECRET",
        badgeColor: "bg-pink-500/15 text-pink-400 border-pink-500/30",
      },
      {
        icon: AnimateZap,
        href: "/app/random",
        label: "Random Loop",
        desc: "Meet someone unexpected. Instant real-time serendipitous chat with verified peers",
        badge: "BETA",
        badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      },
      {
        icon: AnimateZap,
        href: "/app/ai",
        label: "Campus AI Assistant",
        desc: "Ask about campus fests, study roadmaps, hostel tips & navigate CampusLoop",
        badge: "AI",
        badgeColor: "bg-primary/15 text-primary border-primary/30",
      },
      {
        icon: Gamepad2,
        href: "/app/gaming",
        label: "Gaming & Esports Arena",
        desc: "Campus BGMI, Valorant, FIFA tournaments & hostel gaming lobbies",
        badge: "ESPORTS",
        badgeColor: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
      },
    ],
  },
  {
    group: "Account & Trust",
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
        label: "Settings & Privacy",
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
