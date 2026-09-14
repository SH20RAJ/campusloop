"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ElegantShapeProps {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  y?: number;
  gradient?: string;
}

export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  y = 15,
  gradient = "from-primary/20",
}: ElegantShapeProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -120,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.2,
        delay,
        ease: "easeOut" as const,
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute pointer-events-none", className)}
    >
      <motion.div
        animate={{
          y: [0, y, 0],
        }}
        transition={{
          duration: 10 + delay * 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-md border border-white/10 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(29,155,240,0.12)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

interface ShapeLandingHeroProps {
  badge?: ReactNode;
  titlePrimary: string;
  titleAccent: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ShapeLandingHero({
  badge,
  titlePrimary,
  titleAccent,
  description,
  actions,
  children,
  className,
}: ShapeLandingHeroProps) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2 + i * 0.15,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-gradient-to-b from-background via-background/95 to-background pt-24 pb-16 sm:pt-32 sm:pb-24",
        className
      )}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-[550px] w-full max-w-6xl -translate-x-1/2 bg-gradient-to-br from-[#1D9BF0]/15 via-purple-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 -z-10 h-[400px] w-[400px] bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-20 -z-10 h-[400px] w-[400px] bg-emerald-500/10 blur-3xl" />

      {/* Floating 21st Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.2}
          width={450}
          height={110}
          rotate={12}
          y={18}
          gradient="from-[#1D9BF0]/25 dark:from-[#1D9BF0]/30"
          className="left-[-8%] md:left-[-3%] top-[12%] md:top-[16%]"
        />
        <ElegantShape
          delay={0.4}
          width={380}
          height={90}
          rotate={-15}
          y={15}
          gradient="from-purple-500/20 dark:from-purple-500/25"
          className="right-[-4%] md:right-[2%] top-[65%] md:top-[68%]"
        />
        <ElegantShape
          delay={0.3}
          width={260}
          height={70}
          rotate={-8}
          y={12}
          gradient="from-emerald-500/20 dark:from-emerald-500/25"
          className="left-[4%] md:left-[8%] bottom-[8%] md:bottom-[12%]"
        />
        <ElegantShape
          delay={0.5}
          width={200}
          height={55}
          rotate={22}
          y={10}
          gradient="from-amber-500/20 dark:from-amber-500/25"
          className="right-[10%] md:right-[16%] top-[8%] md:top-[12%]"
        />
      </div>

      {/* Main Grid Content */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Headline & Actions */}
          <div className="flex flex-col items-start text-left space-y-6 lg:col-span-7">
            {badge && (
              <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible">
                {badge}
              </motion.div>
            )}

            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
                {titlePrimary}
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1D9BF0] via-sky-400 to-indigo-500">
                  {titleAccent}
                </span>
              </h1>
            </motion.div>

            {description && (
              <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
                <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
                  {description}
                </p>
              </motion.div>
            )}

            {actions && (
              <motion.div
                custom={3}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="w-full pt-1"
              >
                {actions}
              </motion.div>
            )}
          </div>

          {/* Right Column: Interactive Demonstration Artifact */}
          {children && (
            <motion.div
              custom={4}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="w-full lg:col-span-5"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
