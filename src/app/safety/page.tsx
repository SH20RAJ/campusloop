import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Heart, ShieldAlert, Sparkles } from "lucide-react";
import { MarketingHeader, MarketingFooter } from "@/components/marketing/system";

export const metadata: Metadata = {
  title: "Safety Guidelines | CampusLoop",
  description: "Learn how CampusLoop protects students and monitors content quality.",
};

export default function SafetyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-12">
      <MarketingHeader />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl px-6 pt-28 mx-auto space-y-8">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Safety <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Guidelines</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Anonymity is a superpower, but with great power comes great responsibility. Learn about our content guidelines and moderator actions.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Automated Doxx Prevention</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our edge parsers automatically block confessions containing personal phone numbers, targets, and direct student email IDs to prevent targeted harassment. Keep confessions general!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Community Moderation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If a post is flagged by 5 or more students, it is automatically hidden from the feed pending moderator review. Block any user to instantly hide their content from your view forever.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Dating Safety Protocol</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All candidates are verified college peers. If someone sends offensive content, report them inside the chat interface to trigger immediate account suspension and lockouts.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
