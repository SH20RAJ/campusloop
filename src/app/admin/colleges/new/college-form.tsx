"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCollege } from "../actions";

export function CollegeForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    // Auto-generate slug from name if slug hasn't been manually edited
    if (!slug || slug === sluggify(name)) {
      setSlug(sluggify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      await createCollege(formData);
    } catch (err: any) {
      setError(err.message || "Failed to create college");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            College Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Indian Institute of Technology Bombay"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Slug *
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="iit-bombay"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            URL-friendly identifier. Auto-generated from name.
          </p>
        </div>

        <div>
          <label
            htmlFor="websiteDomain"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Website Domain
          </label>
          <input
            id="websiteDomain"
            name="websiteDomain"
            type="text"
            placeholder="iitb.ac.in"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Main website domain, e.g. iitb.ac.in
          </p>
        </div>

        <div>
          <label
            htmlFor="state"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            State
          </label>
          <input
            id="state"
            name="state"
            type="text"
            placeholder="Maharashtra"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div>
          <label
            htmlFor="district"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            District
          </label>
          <input
            id="district"
            name="district"
            type="text"
            placeholder="Mumbai"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div>
          <label
            htmlFor="website"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Website URL
          </label>
          <input
            id="website"
            name="website"
            type="url"
            placeholder="https://www.iitb.ac.in"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="domains"
          className="mb-1.5 block text-xs font-semibold text-foreground"
        >
          Allowed Email Domains
        </label>
        <input
          id="domains"
          name="domains"
          type="text"
          placeholder="iitb.ac.in, cse.iitb.ac.in, mech.iitb.ac.in"
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Comma or space-separated list of domains that students from this
          college can use to sign up.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create College"}
        </button>
        <Link
          href="/admin/colleges"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function sluggify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}
