"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  href?: string;
}

export function BrandLogoIcon({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeMap = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
    xl: "size-12",
  };

  return (
    <img
      src="/logo.png"
      alt="CampusLoop Logo"
      className={cn(
        sizeMap[size],
        "object-contain shrink-0 transition-transform duration-300 hover:scale-105 select-none",
        className
      )}
      loading="eager"
    />
  );
}

export function BrandLogo({ className, size = "md", showWordmark = true, href = "/app" }: BrandLogoProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      <BrandLogoIcon size={size} />
      {showWordmark && (
        <span
          className={cn(
            "font-display font-bold tracking-[-0.04em] text-foreground transition-colors group-hover:text-primary leading-none",
            size === "sm" && "text-sm",
            size === "md" && "text-[17px]",
            size === "lg" && "text-xl",
            size === "xl" && "text-2xl"
          )}
        >
          CampusLoop
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
