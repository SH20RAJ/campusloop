"use client";

import { Drawer } from "vaul";
import { Heart, X, School } from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";

export interface Admirer {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  photo: string | null;
  year: number | null;
  institutionName: string | null;
}

interface LikesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admirers: Admirer[];
  isLoading: boolean;
  onLikeBack: (admirer: Admirer) => void;
  onPass: (admirer: Admirer) => void;
}

export function LikesPanel({ open, onOpenChange, admirers, isLoading, onLikeBack, onPass }: LikesPanelProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[80dvh] max-w-lg flex-col rounded-t-3xl border-t border-white/10 bg-neutral-950 p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] outline-none">
          <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-white/20" />

          <Drawer.Title className="flex items-center gap-2 text-base font-black text-white">
            <Heart className="size-4 fill-rose-500 text-rose-500" />
            {admirers.length > 0 ? `${admirers.length} like${admirers.length > 1 ? "s" : ""} waiting` : "Likes you"}
          </Drawer.Title>
          <p className="mt-0.5 text-xs font-medium text-white/50">
            These students already swiped right on you. Like back for an instant match.
          </p>

          <div className="mt-4 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : admirers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Heart className="size-8 text-white/15" />
                <p className="text-sm font-bold text-white/60">No pending likes yet</p>
                <p className="max-w-[240px] text-xs text-white/40">
                  Keep your profile sharp — add photos and interests so your card stands out in decks.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {admirers.map((admirer) => (
                  <div key={admirer.id} className="relative overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={admirer.photo ?? getAvatarUrl(admirer.avatarUrl, admirer.username)}
                      alt={admirer.displayName}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3">
                      <div>
                        <p className="truncate text-sm font-black text-white">
                          {admirer.displayName}
                          {admirer.year ? ` · Yr ${admirer.year}` : ""}
                        </p>
                        {admirer.institutionName && (
                          <p className="flex items-center gap-1 truncate text-[10px] font-semibold text-white/70">
                            <School className="size-2.5 shrink-0" /> {admirer.institutionName}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPass(admirer)}
                          aria-label={`Pass on ${admirer.displayName}`}
                          className="flex h-8 flex-1 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
                        >
                          <X className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onLikeBack(admirer)}
                          aria-label={`Like ${admirer.displayName} back`}
                          className="flex h-8 flex-1 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                        >
                          <Heart className="size-4 fill-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
