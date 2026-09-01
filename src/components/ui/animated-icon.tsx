"use client";

import type { LucideIcon } from "lucide-react";
import { motion, useAnimationControls, useReducedMotion, type Variants } from "motion/react";
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { cn } from "@/lib/utils";

export {
  Bell as AnimateBell,
  BellRing as AnimateBellRing,
  Bookmark as AnimateBookmark,
  BookOpen as AnimateBookOpen,
  Check as AnimateCheck,
  CheckCheck as AnimateCheckCheck,
  Compass as AnimateCompass,
  Download as AnimateDownload,
  FileText as AnimateFileText,
  Flame as AnimateFlame,
  Folder as AnimateFolder,
  Heart as AnimateHeart,
  House as AnimateHouse,
  Image as AnimateImage,
  Lock as AnimateLock,
  LogOut as AnimateLogOut,
  MapPin as AnimateMapPin,
  Menu as AnimateMenu,
  MessageCircle as AnimateMessageCircle,
  MessageSquare as AnimateMessageSquare,
  Mic as AnimateMic,
  Moon as AnimateMoon,
  Package as AnimatePackage,
  Paperclip as AnimatePaperclip,
  Pause as AnimatePause,
  Phone as AnimatePhone,
  Play as AnimatePlay,
  Plus as AnimatePlus,
  RefreshCw as AnimateRefreshCw,
  Repeat as AnimateRepeat,
  Repeat2 as AnimateRepeat2,
  Save as AnimateSave,
  Search as AnimateSearch,
  Send as AnimateSend,
  Settings as AnimateSettings,
  Share as AnimateShare,
  ShieldCheck as AnimateShieldCheck,
  ShoppingBag as AnimateShoppingBag,
  ShoppingCart as AnimateShoppingCart,
  SlidersHorizontal as AnimateSlidersHorizontal,
  Sparkles as AnimateSparkles,
  Star as AnimateStar,
  Store as AnimateStore,
  Sun as AnimateSun,
  ThumbsUp as AnimateThumbsUp,
  Trash as AnimateTrash,
  Trash2 as AnimateTrash2,
  TrendingUp as AnimateTrendingUp,
  Upload as AnimateUpload,
  User as AnimateUser,
  Users as AnimateUsers,
  Utensils as AnimateUtensils,
  Video as AnimateVideo,
  Volume2 as AnimateVolume2,
  VolumeX as AnimateVolumeX,
  X as AnimateX,
  Zap as AnimateZap,
} from "@animateicons/react/lucide";
// Export direct high-performance animated SVG icons from @animateicons/react/lucide
export {
  GraduationCap as AnimateGraduationCap,
  Smile as AnimateSmile,
} from "lucide-react";

/**
 * Matches `IconHandle` from @animateicons/react, so call sites are portable.
 */
export type IconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

/**
 * Named motions. Each is a physical idea rather than a generic "wiggle" — a
 * bell swings from its crown, a heart beats twice, a page lifts.
 */
export type IconMotionName =
  | "bell"
  | "beat"
  | "pop"
  | "spin"
  | "nudge-right"
  | "nudge-up"
  | "lift"
  | "dip"
  | "twinkle"
  | "shake";

const MOTIONS: Record<IconMotionName, Variants> = {
  bell: {
    normal: { rotate: 0, transformOrigin: "50% 15%" },
    animate: {
      rotate: [0, -14, 11, -7, 4, 0],
      transformOrigin: "50% 15%",
      transition: { duration: 0.7, ease: [0.22, 0.9, 0.32, 1] },
    },
  },
  beat: {
    normal: { scale: 1 },
    animate: { scale: [1, 1.22, 0.97, 1.1, 1], transition: { duration: 0.52, ease: "easeOut" } },
  },
  pop: {
    normal: { scale: 1, y: 0 },
    animate: { scale: [1, 0.88, 1.12, 1], y: [0, 1, -2, 0], transition: { duration: 0.36 } },
  },
  spin: {
    normal: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } },
  },
  "nudge-right": {
    normal: { x: 0 },
    animate: { x: [0, 3.5, 0], transition: { duration: 0.4, ease: "easeOut" } },
  },
  "nudge-up": {
    normal: { y: 0 },
    animate: { y: [0, -3.5, 0], transition: { duration: 0.4, ease: "easeOut" } },
  },
  lift: {
    normal: { y: 0, scale: 1 },
    animate: { y: [0, -3, 0], scale: [1, 1.08, 1], transition: { duration: 0.45, ease: "easeOut" } },
  },
  dip: {
    normal: { y: 0 },
    animate: { y: [0, 3, -1, 0], transition: { duration: 0.42, ease: "easeOut" } },
  },
  twinkle: {
    normal: { scale: 1, rotate: 0, opacity: 1 },
    animate: {
      scale: [1, 0.85, 1.15, 1],
      rotate: [0, -12, 12, 0],
      transition: { duration: 0.55, ease: "easeInOut" },
    },
  },
  shake: {
    normal: { x: 0 },
    animate: { x: [0, -3, 3, -2, 2, 0], transition: { duration: 0.4 } },
  },
};

export interface AnimatedIconProps
  extends Omit<
    ComponentPropsWithoutRef<"span">,
    "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"
  > {
  /** Any lucide-react icon component or @animateicons/react component. */
  icon: LucideIcon | ComponentType<any>;
  /** Which motion to play. */
  animation?: IconMotionName;
  size?: number;
  /** Scales the motion's duration. 1 is the tuned default. */
  duration?: number;
  /** Set false to render a completely static icon. */
  isAnimated?: boolean;
  /** Play on hover / focus. Turn off to drive it only through the ref. */
  animateOnHover?: boolean;
  /**
   * Replay whenever this value changes — for state a click produces, like a
   * heart filling or notifications ringing.
   */
  playKey?: string | number | boolean;
  strokeWidth?: number;
  iconClassName?: string;
}

export const AnimatedIcon = forwardRef<IconHandle, AnimatedIconProps>(function AnimatedIcon(
  {
    icon: Icon,
    animation = "pop",
    size = 18,
    duration = 1,
    isAnimated = true,
    animateOnHover = true,
    playKey,
    strokeWidth,
    className,
    iconClassName,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const enabled = isAnimated && !prefersReducedMotion;
  const firstRender = useRef(true);

  const variants = useMemo(() => {
    const base = MOTIONS[animation] || MOTIONS.pop;
    if (duration === 1) return base;
    const animate = base.animate as Record<string, unknown> & {
      transition?: { duration?: number };
    };
    return {
      ...base,
      animate: {
        ...animate,
        transition: {
          ...animate.transition,
          duration: (animate.transition?.duration ?? 0.4) * duration,
        },
      },
    } as Variants;
  }, [animation, duration]);

  const start = useCallback(() => {
    if (!enabled) return;
    controls.start("animate");
  }, [controls, enabled]);

  const stop = useCallback(() => {
    controls.start("normal");
  }, [controls]);

  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (playKey === undefined) return;
    start();
  }, [playKey, start]);

  return (
    <motion.span
      variants={variants}
      initial="normal"
      animate={controls}
      onMouseEnter={(event) => {
        if (animateOnHover) start();
        onMouseEnter?.(event as never);
      }}
      onMouseLeave={(event) => {
        if (animateOnHover) stop();
        onMouseLeave?.(event as never);
      }}
      onFocus={(event) => {
        if (animateOnHover) start();
        onFocus?.(event as never);
      }}
      onBlur={(event) => {
        if (animateOnHover) stop();
        onBlur?.(event as never);
      }}
      className={cn("inline-flex items-center justify-center", className)}
      {...(rest as Record<string, unknown>)}
    >
      <Icon size={size} strokeWidth={strokeWidth} className={iconClassName} />
    </motion.span>
  );
});

/**
 * Hover-driven motion handle for a whole button or card.
 */
export function useIconHandle() {
  const ref = useRef<IconHandle>(null);
  const handlers = useMemo(
    () => ({
      onMouseEnter: () => ref.current?.startAnimation(),
      onMouseLeave: () => ref.current?.stopAnimation(),
      onFocus: () => ref.current?.startAnimation(),
      onBlur: () => ref.current?.stopAnimation(),
    }),
    []
  );
  return { ref, handlers };
}
