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

---

## 9. In-App Feed & Post Card Architecture (Twitter / X Design)

- **Flat Timeline Stream**: Posts are NOT bulky floating cards with separate shadows and background containers. They stream continuously within a centered `max-w-2xl` column with `border-x border-border/20` and 1px dividers (`border-b border-border/30 px-4 py-3.5`).
- **2-Column Layout**:
  - **Left column**: Circular 40px avatar (`size-10 rounded-full shrink-0`).
  - **Right column**:
    - Header line: Author display name (bold 15px, hover:underline), verified check (`#1d9bf0`), `@handle`, `·`, relative time (`2h`), and subtle three-dots menu.
    - Minimal HR: `<hr className="border-t border-border/20 my-1.5" />` provides clean, defined separation before post content.
    - Post body: Crisp 15px font, RichText hashtags and mentions (`text-[#1d9bf0]`).
    - Media / Poll: `rounded-2xl border border-border/40 overflow-hidden mt-2.5`.
    - Twitter Action Bar: Reply, Repost, Like (animated fill), Share with circular hover background states (`group-hover:bg-[#1d9bf0]/10`, `group-hover:bg-rose-500/10`, etc.) and tabular count figures.
- **In-Between Feed Modules**: Modules like "Communities for you" or "Campus Match" render flat in the stream (`py-3 px-4 border-b border-border/30`) with circular icons and high-contrast pill buttons (`Join` / `Joined`).

---

## 10. Skeleton State Suite

All loading placeholders in `src/components/ui/skeleton-card.tsx` match the exact page structures they represent:
- `FeedSkeleton`: 4 Twitter 2-column post card skeletons with avatar, header, HR line, and action row.
- `FeedLoadingMoreSkeleton`: 2 stream skeletons for infinite scrolling when fetching next page.
- `PostDetailSkeleton`: Full post view with author, big body text lines, timestamp bar, reply composer, and thread comments with vertical connector lines.
- `ProfileSkeleton`: Cover banner, avatar bar with -mt-12 offset, bio info, stats, tabs, and post stream.
- `NotificationsSkeleton`: Twitter notifications stream with category icon on left, avatar, and preview cards.
- `CommunitySkeleton`: Flat stream of community rows with circular avatars, stats, and join pill skeletons.
- `CollegesSkeleton`: Directory search input and college hub cards with shields.
- `DatingSkeleton`: Aspect-ratio swipe card deck with bio tags and action circles.
- `SearchSkeleton`: Search input, tabs bar, LinkedIn-style student rows, and post skeletons.

