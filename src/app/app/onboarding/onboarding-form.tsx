"use client";

import { useState } from "react";
import { completeOnboarding } from "./actions";

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    try {
      await completeOnboarding(formData);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
        <input 
          id="displayName"
          name="displayName"
          type="text" 
          placeholder="e.g. John Doe" 
          required 
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium">Username</label>
        <input 
          id="username"
          name="username"
          type="text" 
          placeholder="e.g. johndoe99" 
          required 
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">This will be public on your profile, but hidden on anonymous posts.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading}
        className="mt-4 flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? "Setting up..." : "Complete Setup"}
      </button>
    </form>
  );
}
