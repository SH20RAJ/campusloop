"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { Heart, MessageCircle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const POLL_OPTIONS = [
  { id: "nescafe", text: "Nescafe booth", votes: 212 },
  { id: "juice", text: "Sharma ji's juice corner", votes: 168 },
  { id: "mess", text: "Main mess, obviously", votes: 74 },
];

export function HeroPreview() {
  const reduce = useReducedMotion();
  const [votedId, setVotedId] = useState<string | null>(null);
  const [options, setOptions] = useState(POLL_OPTIONS);
  const [likes, setLikes] = useState(214);
  const [liked, setLiked] = useState(false);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [4, -4]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4, 4]), {
    stiffness: 150,
    damping: 20,
  });

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  function vote(id: string) {
    if (votedId) return;
    setVotedId(id);
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o))
    );
  }

  function toggleLike() {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  }

  function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function resetTilt() {
    mx.set(0.5);
    my.set(0.5);
  }

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 32 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div
      className="relative mx-auto w-full max-w-md pb-14"
      style={{ perspective: 1000 }}
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
    >
      <motion.div
        style={reduce ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.div {...rise(0.15)}>
          <Card className="relative z-10 shadow-lg">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Poll</Badge>
                <span className="text-xs text-muted-foreground">
                  {totalVotes.toLocaleString("en-IN")} votes
                </span>
              </div>
              <p className="font-heading text-base font-medium leading-snug">
                Which canteen actually deserves your money?
              </p>
              <div className="space-y-2">
                {options.map((option) => {
                  const pct = Math.round((option.votes / totalVotes) * 100);
                  const isMine = votedId === option.id;
                  return votedId ? (
                    <div
                      key={option.id}
                      className={cn(
                        "relative overflow-hidden rounded-lg ring-1 ring-foreground/10",
                        isMine && "ring-primary/40"
                      )}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-primary/15"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: pct / 100 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: "100%", transformOrigin: "left" }}
                      />
                      <div className="relative flex items-center justify-between px-3 py-2.5 text-sm">
                        <span
                          className={cn("font-medium", isMine && "text-primary")}
                        >
                          {option.text}
                        </span>
                        <span className="font-semibold text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      key={option.id}
                      onClick={() => vote(option.id)}
                      className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium ring-1 ring-foreground/10 transition-colors hover:bg-muted active:translate-y-px"
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          {...rise(0.35)}
          className="absolute -bottom-2 right-0 z-20 w-56 rotate-2 sm:-right-6"
        >
          <Card size="sm" className="shadow-xl">
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="gap-1">
                  <Lock className="size-3" />
                  Confession
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  anon_4f2a
                </span>
              </div>
              <p className="text-sm leading-snug">
                the library AC is set to Antarctica and i am once again
                studying in a hoodie in May
              </p>
              <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                <button
                  onClick={toggleLike}
                  aria-label="Like confession"
                  className={cn(
                    "flex cursor-pointer items-center gap-1 transition-colors hover:text-primary active:scale-90",
                    liked && "text-primary"
                  )}
                >
                  <Heart className={cn("size-3.5", liked && "fill-primary")} />
                  <span className="font-semibold">{likes}</span>
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-3.5" />
                  <span className="font-semibold">38</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
