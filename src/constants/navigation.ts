import {
  Home,
  Compass,
  School,
  Users,
  Sparkles,
  MessageSquare,
  PartyPopper,
  Bell,
  UserCircle,
  Shield,
  ShoppingBag,
  Search,
  Home as HomeIcon,
  Car,
  Gift,
  Wrench,
  Heart,
  Sliders,
  Layers,
  FileText,
  HelpCircle,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  href: string;
  label: string;
  desc?: string;
  badge?: string;
  isTrigger?: boolean;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const DESKTOP_NAV_ITEMS: NavItem[] = [
  { icon: Home, href: "/app", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Discover" },
  { icon: School, href: "/app/colleges", label: "Colleges" },
  { icon: Users, href: "/app/communities", label: "Communities" },
  { icon: Sparkles, href: "/app/dating", label: "Matches" },
  { icon: MessageSquare, href: "/app/chat", label: "Messages" },
  { icon: Bell, href: "/app/notifications", label: "Notifications" },
  { icon: UserCircle, href: "/app/profile", label: "Profile" },
];

export const MOBILE_BOTTOM_ITEMS: NavItem[] = [
  { icon: Home, href: "/app", label: "Home" },
  { icon: Compass, href: "/app/discover", label: "Discover" },
  { icon: Sparkles, href: "/app/post/new", label: "" },
  { icon: MessageSquare, href: "/app/chat", label: "Chat" },
  { icon: UserCircle, href: "/app/profile", label: "Profile" },
];


export const FULL_MOBILE_DRAWER_LINKS: NavGroup[] = [
  {
    group: "Primary Campus",
    items: [
      { icon: Home, href: "/app", label: "Campus Feed", desc: "Live discussions & confessions" },
      { icon: Compass, href: "/app/discover", label: "Discover Hub", desc: "Explore colleges & trending tags" },
      { icon: Sparkles, href: "/app/dating", label: "Campus Matches", desc: "Swipe verified college students", badge: "Hot" },
      { icon: PartyPopper, href: "/app/birthdays", label: "Birthdays & DOB", desc: "Today's campus celebrations", badge: "New" },
      { icon: MessageSquare, href: "/app/chat", label: "Direct Messages", desc: "Private student chat" },
      { icon: Bell, href: "/app/notifications", label: "Notifications", desc: "Upvotes, comments & matches" },
    ],
  },
  {
    group: "Campus Utility",
    items: [
      { icon: ShoppingBag, href: "/app/hashtag/BuySell", label: "Buy / Sell / Exchange", desc: "Books, tech, cycles & dorm items" },
      { icon: Search, href: "/app/hashtag/LostAndFound", label: "Lost & Found", desc: "Report or claim campus belongings" },
      { icon: HomeIcon, href: "/app/hashtag/Roommates", label: "Roommate / Flat Finder", desc: "Find hostel & flat roommates" },
      { icon: Car, href: "/app/hashtag/RideShare", label: "Ride Sharing", desc: "Carpool to metro or station" },
      { icon: Gift, href: "/app/hashtag/FreeStuff", label: "Free Stuff", desc: "Giveaways & free student gear" },
      { icon: Wrench, href: "/app/hashtag/CampusHelp", label: "Need / Can Help", desc: "Peer tutoring, lab help & notes" },
    ],
  },
  {
    group: "Social & Vibes",
    items: [
      { icon: PartyPopper, href: "/app/hashtag/CampusMemes", label: "Memes & Banter", desc: "Hostel tea & campus humor" },
      { icon: PartyPopper, href: "/app/hashtag/CampusEvents", label: "Events & Fests", desc: "Cultural fests, hackathons & gigs" },
      { icon: Users, href: "/app/communities", label: "Sub-Hubs & Clubs", desc: "Interest communities & branches" },
      { icon: Heart, href: "/app/confessions", label: "Confessions", desc: "Anonymous campus thoughts" },
      { icon: School, href: "/app/colleges", label: "College Directory", desc: "1,350+ indexed Indian colleges" },
    ],
  },
  {
    group: "Account & System",
    items: [
      { icon: UserCircle, href: "/app/profile", label: "My Profile", desc: "View LP clout & badges" },
      { icon: Download, href: "#install", label: "Install Campus App", desc: "Add to home screen for 2x speed", badge: "PWA" },
      { icon: Sliders, href: "/app/settings", label: "Settings", desc: "Preferences & privacy" },
      { icon: Layers, href: "/overview", label: "Strategic Overview", desc: "Architecture & TAM brief" },
      { icon: FileText, href: "/pitch", label: "Pitch Deck", desc: "Investor presentation & metrics" },
      { icon: HelpCircle, href: "/safety", label: "Safety Center", desc: "Anti-harassment guidelines" },
    ],
  },
];
