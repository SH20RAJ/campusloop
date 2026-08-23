# 🎨 CampusLoop Design System

Single source of truth for how CampusLoop looks and feels — on the marketing site
(`/`, `/about`, `/overview`, `/pitch`, `/safety`, `/privacy`, `/contact`) and inside
the app (`/app/*`). Shared marketing primitives live in
`src/components/marketing/system.tsx`; tokens live in `src/app/globals.css`.

---

## 1. Brand

| Element | Value |
| --- | --- |
| Voice | Confident, playful, student-first. "Your campus, unfiltered." |
| Primary color | `--primary` — warm ember orange (`oklch(0.6171 0.1375 39.04)` light / `oklch(0.6724 0.1308 38.76)` dark) |
| Brand gradient | `from-primary via-orange-500 to-amber-500` (exported as `BRAND_GRADIENT`) |
| Logo treatment | Black rounded-lg tile + `GradientText` wordmark (`BrandMark`) |

**Gradient discipline**: the gradient is an *accent*. Use it on at most one phrase
per heading (via `<GradientText>`), never on body copy or whole headings.

## 2. Color tokens

All colors come from the shadcn token set in `globals.css` (`--background`,
`--foreground`, `--card`, `--muted`, `--primary`, `--destructive`, `--border`, …)
and adapt to light/dark automatically. **Never hard-code hex values** in
components; semantic accent colors are allowed from Tailwind's palette with a
consistent mapping:

| Meaning | Class |
| --- | --- |
| Success / polls | `emerald-500` |
| Info / links | `blue-500` |
| Questions / energy | `orange-500` |
| Confessions / love | `pink-500` |
| Anonymity | `violet-500` |
| Viewer mode / caution | `amber-500` |
| Danger / reports | `destructive` (token) |

## 3. Typography

System font stack (see `--font-sans`). Scale used across marketing pages:

| Role | Classes |
| --- | --- |
| Hero H1 | `text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight` |
| Section H2 | `text-3xl md:text-4xl font-bold tracking-tight` |
| Card H3 | `text-lg/xl font-semibold` |
| Eyebrow | `text-xs font-semibold uppercase tracking-[0.18em] text-primary` |
| Body | `text-base leading-relaxed text-muted-foreground` |
| Fine print | `text-xs text-muted-foreground` |

In-app UI trends one step smaller (`text-sm` body, `text-xs` metadata) with
`font-bold`/`font-black` reserved for names, counters, and CTAs.

## 4. Shape & elevation

- Radius rhythm: pills/badges `rounded-full` · buttons & inputs `rounded-xl`/`rounded-2xl` · cards `rounded-2xl`/`rounded-3xl`.
- Borders: `border-border/60`–`/80`. Shadows stay subtle: `shadow-xs` on cards, `shadow-md` on primary CTAs only.
- Overlays (story editor, drawers): `bg-black/40 backdrop-blur-md`.

## 5. Spacing & layout

- Marketing container: `max-w-6xl px-6` (the `Section` component).
- Section vertical rhythm: `py-20 md:py-24`; CTA bands `py-24 md:py-28`.
- Text-heavy pages (safety, privacy): `max-w-2xl`.
- Every section starts with `SectionHeading` (eyebrow → title → lede).

## 6. Components (marketing)

From `src/components/marketing/system.tsx`:

| Component | Use |
| --- | --- |
| `MarketingHeader` | Fixed top nav. One per page — never hand-roll a header. |
| `MarketingFooter` | Link columns + tagline. One per page. |
| `Section` | Width/padding wrapper. `tone: default \| muted \| bordered`. |
| `SectionHeading` | Eyebrow + H2 + lede, `align: left \| center`. |
| `GradientText` | Brand gradient accent span. |
| `BrandMark` | Logo + wordmark lockup. |
| `StatCard` | Big number + label + optional sub. |
| `CTABand` | Full-width closing call-to-action. |

## 7. Motion

- Scroll reveals via `<Reveal>` (`src/components/landing/reveal.tsx`), stagger `delay={i * 0.08}`.
- Micro-interactions: `active:scale-95` on tappables, `transition-colors`/`transition-all` at default duration.
- Never animate layout on text-heavy legal pages.

## 8. Accessibility

- Interactive icons need `aria-label`; decorative ones don't.
- Keep `text-muted-foreground` on `bg-background`/`bg-card` only (contrast).
- Focus states come from the shadcn defaults — don't remove outlines without replacing them.
