"use client";

import { useState } from "react";
import { loginWithPasskey } from "./actions";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await loginWithPasskey(formData);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="passkey" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Passkey</label>
        <input 
          id="passkey"
          name="passkey"
          type="password"
          required
          autoFocus
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-xs font-medium text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-md bg-primary h-10 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Verifying..." : "Access Dashboard"}
      </button>
    </form>
  );
}
