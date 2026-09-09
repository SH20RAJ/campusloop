import {
  BookOpen,
  EyeOff,
  HeartHandshake,
  Hourglass,
  Layers,
  Lock,
  MessagesSquare,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Vote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Layers> = {
  "campus-feed": Layers,
  "anonymous-confessions": EyeOff,
  "polls-and-questions": Vote,
  "campus-match": HeartHandshake,
  "secret-crush": Lock,
  stories: Sparkles,
  marketplace: ShoppingBag,
  "academics-notes": BookOpen,
  "time-capsule": Hourglass,
  "loop-points": Star,
  communities: Users,
  "verification-safety": MessagesSquare,
};

export function DocsFeatureIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? Layers;
  return <Icon className={cn("size-5", className)} aria-hidden />;
}
