"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableOption {
  value: string;
  label: string;
  /** Optional leading glyph, e.g. a branch emoji. */
  icon?: string;
  /** Small right-aligned grouping label. */
  hint?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * Type-to-filter dropdown for long option lists.
 *
 * The branch catalog runs to ~70 entries, which is unusable as a native
 * `<select>` on mobile. Matching is substring-based across every word, so
 * "industrial", "prod" and "eng" all surface Production & Industrial
 * Engineering.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No matches",
  className,
  id,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;

    // Every whitespace-separated term must appear somewhere in the label, so
    // "prod ind" narrows rather than widening.
    const terms = q.split(/\s+/);
    return options.filter((o) => {
      const haystack = `${o.label} ${o.value}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [options, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Close on any outside click.
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) searchRef.current?.focus();
  }, [isOpen]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  function commit(option: SearchableOption) {
    onChange(option.value);
    setIsOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[activeIndex];
      if (option) commit(option);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-border/60 bg-transparent px-3 py-2.5 text-left text-sm font-medium text-foreground outline-none transition-colors",
          isOpen ? "border-primary" : "hover:border-border",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon && <span aria-hidden>{selected.icon}</span>}
          <span className={cn("truncate", !selected && "text-muted-foreground/60")}>
            {selected?.label || placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
          <div className="relative border-b border-border/40">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent py-2.5 pl-9 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div ref={listRef} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((option, i) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-active={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => commit(option)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors",
                      i === activeIndex ? "bg-muted/60" : "hover:bg-muted/40"
                    )}
                  >
                    {option.icon && <span aria-hidden>{option.icon}</span>}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        isSelected ? "font-black text-foreground" : "font-medium text-foreground/90"
                      )}
                    >
                      {option.label}
                    </span>
                    {option.hint && (
                      <span className="shrink-0 text-[10px] font-bold uppercase text-muted-foreground">
                        {option.hint}
                      </span>
                    )}
                    {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-[13px] text-muted-foreground">{emptyText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
