"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type CalendarEvent,
  downloadAppleCalendarIcs,
  openGoogleCalendar,
} from "@/lib/calendar";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AddToCalendarDropdownProps {
  event: CalendarEvent;
  variant?: "button" | "pill" | "minimal";
  className?: string;
}

export function AddToCalendarDropdown({
  event,
  variant = "button",
  className,
}: AddToCalendarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    sounds.tap();
    haptics.light();
    setIsOpen((prev) => !prev);
  }

  function handleGoogle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    openGoogleCalendar(event);
  }

  function handleApple(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    downloadAppleCalendarIcs(event);
  }

  return (
    <div ref={dropdownRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-label="Add event to calendar"
        className={cn(
          "inline-flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95",
          variant === "button" &&
            "h-8 px-3 rounded-full text-xs font-bold border border-border/40 bg-muted/40 hover:bg-muted/70 text-foreground shadow-2xs",
          variant === "pill" &&
            "h-9 px-4 rounded-xl text-xs font-black border border-border/40 bg-card hover:bg-muted/40 text-foreground shadow-xs",
          variant === "minimal" &&
            "size-8 rounded-full border border-border/40 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground items-center justify-center p-0"
        )}
      >
        <Calendar className="size-3.5 text-primary shrink-0" />
        {variant !== "minimal" && (
          <>
            <span>Add to Calendar</span>
            <ChevronDown
              className={cn("size-3 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-0 z-50 mt-1.5 w-52 origin-top-right rounded-2xl border border-border/40 bg-popover/95 p-1.5 shadow-lg backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Add to Calendar
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted/70"
          >
            {/* Google Calendar Icon SVG */}
            <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight">Google Calendar</span>
              <span className="text-[10px] font-medium text-muted-foreground">Web & Android</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleApple}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted/70"
          >
            {/* Apple Calendar Icon SVG */}
            <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-zinc-500/10 text-foreground">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77.99.08 2.03-.52 2.68-1.27z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight">Apple Calendar</span>
              <span className="text-[10px] font-medium text-muted-foreground">iOS, Mac & .ics</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
