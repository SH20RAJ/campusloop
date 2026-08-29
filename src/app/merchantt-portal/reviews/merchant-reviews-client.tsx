"use client";

import { Avatar,AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const SAMPLE_REVIEWS = [
  {
    id: "rev_1",
    author: "Shaswat Raj",
    username: "sh20raj",
    rating: 5,
    date: "Yesterday",
    comment: "Steamed chicken momos were steaming hot and delivered to Hostel 11 in under 15 minutes! The spicy garlic chutney is unbeatable.",
    reply: "Thank you Shaswat! Glad you loved the extra chutney.",
  },
  {
    id: "rev_2",
    author: "Ananya Kashyap",
    username: "ananya_kashyap",
    rating: 5,
    date: "2 days ago",
    comment: "Kurkure momos were super crunchy. Perfect evening snack during exams.",
    reply: null,
  },
  {
    id: "rev_3",
    author: "Nikhil Mehta",
    username: "nikhil_mehta092",
    rating: 4,
    date: "3 days ago",
    comment: "Good taste, would love if cold coffee had slightly less sugar next time.",
    reply: "Noted Nikhil, we'll keep the sweetness customizable!",
  },
];

export function MerchantReviewsClient() {
  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6 select-none pb-24">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Student Ratings &amp; Reviews</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          See what verified campus students are saying about your store
        </p>
      </div>

      {/* ─── Rating Overview ─── */}
      <div className="p-5 rounded-3xl bg-card border border-border/40 flex items-center gap-5 shadow-xs">
        <div className="text-center">
          <p className="text-3xl font-black text-foreground">4.8</p>
          <div className="flex items-center gap-0.5 justify-center text-amber-400 mt-1">
            <Star className="size-3.5 fill-amber-400" />
            <Star className="size-3.5 fill-amber-400" />
            <Star className="size-3.5 fill-amber-400" />
            <Star className="size-3.5 fill-amber-400" />
            <Star className="size-3.5 fill-amber-400" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">184 verified reviews</p>
        </div>

        <div className="h-12 w-px bg-border/40" />

        <div className="flex-1 space-y-1 text-xs font-semibold text-muted-foreground">
          <p className="text-foreground">96% of students recommend this store</p>
          <p className="text-[11px]">Ranked #1 Food Partner on BIT Mesra campus</p>
        </div>
      </div>

      {/* ─── Reviews List ─── */}
      <div className="space-y-3.5">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Recent Reviews
        </h2>

        {SAMPLE_REVIEWS.map((r) => (
          <div key={r.id} className="p-4 rounded-2xl bg-card border border-border/40 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="size-7 rounded-full">
                  <AvatarFallback className="text-[10px] font-bold">{r.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-foreground">{r.author}</p>
                  <p className="text-[10px] text-muted-foreground">@{r.username} · {r.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-3 fill-amber-400" />
                ))}
              </div>
            </div>

            <p className="text-xs text-foreground leading-relaxed">{r.comment}</p>

            {r.reply && (
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/30 text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground block">Store Reply:</span>
                <span>{r.reply}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
