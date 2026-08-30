"use client";

import { useUser } from "@hexclave/next";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";

export function LogoutClient() {
  const user = useUser({ or: "return-null" });
  const [status, setStatus] = useState("Signing out of CampusLoop...");

  useEffect(() => {
    let isMounted = true;

    async function performStrictLogout() {
      try {
        // 1. Revoke session via Hexclave SDK if user object exists
        if (user) {
          try {
            await user.signOut();
          } catch (err) {
            console.warn("Hexclave user.signOut error (continuing cleanup):", err);
          }
        }

        // 2. Call server-side cookie wipe API
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // ignore network failure on cookie wipe API
        }

        // 3. Purge all client-side cookies
        if (typeof document !== "undefined") {
          const cookies = document.cookie.split(";");
          for (const c of cookies) {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
            if (name) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
            }
          }
        }

        // 4. Purge local storage & session storage
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // ignore storage errors
        }

        if (isMounted) {
          setStatus("Redirecting to sign in...");
        }

        // 5. Hard replace window location to Hexclave default sign-in handler
        window.location.replace("/handler/sign-in");
      } catch (error) {
        console.error("Strict logout error:", error);
        window.location.replace("/handler/sign-in");
      }
    }

    performStrictLogout();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 select-none">
      <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
        <BrandLogo href="/" size="lg" />

        <div className="flex items-center gap-2 pt-4 text-sm font-semibold text-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>{status}</span>
        </div>

        <p className="text-xs text-muted-foreground">Clearing campus session tokens and caches securely.</p>
      </div>
    </div>
  );
}
