"use client";

import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function MerchantLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    sounds.tap();
    haptics.medium();

    try {
      const res = await fetch("/api/merchant/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string; merchant?: any };

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      sounds.success();
      haptics.success();
      toast.success(`Welcome back, ${data.merchant?.name || "Merchant"}!`);

      // If rental merchant, redirect to /merchant-portal/bikes, else /merchant-portal
      if (data.merchant?.categorySlug === "rentals") {
        router.push("/merchant-portal/bikes");
      } else {
        router.push("/merchant-portal");
      }
      router.refresh();
    } catch (err: any) {
      sounds.pop();
      haptics.error();
      toast.error(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFillDemo(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    sounds.tap();
    toast.info(`Filled credentials for @${u}`);
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/app" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-sm tracking-tighter">
            CL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-foreground">CampusLoop</span>
            <span className="text-[10px] font-bold text-muted-foreground -mt-0.5">Merchant Portal</span>
          </div>
        </Link>

        <Link
          href="/app/marketplace"
          className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Campus Store
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="rounded-3xl bg-card border border-border/80 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-black uppercase tracking-wider mb-2">
              <Store className="size-3.5" />
              <span>Campus Merchant Console</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Sign in to manage your store
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Accept live orders, update menu items & prices, configure delivery, and print QR codes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                <span>Merchant Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. momohouse"
                  className="w-full h-11 rounded-2xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-muted-foreground" />
                  <span>Password</span>
                </label>
                <span className="text-[10px] text-muted-foreground">Provided by Admin</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 rounded-2xl bg-muted/40 border border-border px-3.5 pr-10 text-xs font-bold text-foreground outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full h-11 rounded-2xl bg-foreground text-background text-xs font-black flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Merchant Portal</span>
                  <ArrowRight className="size-4 stroke-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-border/40 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
              Quick Demo Store Accounts:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("momohouse", "momo@CampusLoop2026")}
                className="px-2.5 py-1 rounded-xl bg-muted/50 hover:bg-muted border border-border text-[11px] font-bold text-foreground flex items-center gap-1 transition-colors cursor-pointer"
              >
                <KeyRound className="size-3 text-primary" />
                <span>@momohouse (Food)</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("campusbikes", "bikes@CampusLoop2026")}
                className="px-2.5 py-1 rounded-xl bg-muted/50 hover:bg-muted border border-border text-[11px] font-bold text-foreground flex items-center gap-1 transition-colors cursor-pointer"
              >
                <KeyRound className="size-3 text-emerald-500" />
                <span>@campusbikes (Rentals)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>Verified Campus Merchant Portal · 256-bit Encrypted Session</span>
          </p>
          <p className="text-[10px] text-muted-foreground/80">
            Need credentials for your campus stall? Request access from the{" "}
            <Link href="/contact" className="underline hover:text-foreground">
              CampusLoop Admin
            </Link>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-2 text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} CampusLoop. All rights reserved.
      </footer>
    </div>
  );
}
