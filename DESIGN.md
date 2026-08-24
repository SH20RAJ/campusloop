# 🎨 CampusLoop Design System & UI/UX Handbook

This document serves as the official specification for the **CampusLoop** visual language, component architecture, color tokens, and mobile-first experience.

---

## 🔮 1. Brand Identity & Color Tokens

### 🌈 Primary Gradient & Accents
- **Continuous Loop Brand Gradient (`BRAND_GRADIENT`)**:
  `bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600`
- **Primary Brand Color**:
  - **Light Mode**: Electric Violet `oklch(0.58 0.23 275)` (`#7C3AED`)
  - **Dark Mode**: Radiant Iris `oklch(0.65 0.22 275)` (`#8B5CF6`)
- **Backgrounds**:
  - **Light**: Ultra-clean lavender tint `oklch(0.985 0.006 280)`
  - **Dark**: Deep Twilight Obsidian `oklch(0.13 0.015 275)` (`#0F0C1B`)
- **Cards & Frosted Glass**:
  - **Light**: Pure crisp white `oklch(0.995 0.003 280)` with `border-border/70`
  - **Dark**: Frosted charcoal violet `oklch(0.17 0.018 275)` with `border-border/60`

| Semantic Role | Token / Tailwind Class | Visual Purpose |
| :--- | :--- | :--- |
| **Primary Action** | `bg-primary text-primary-foreground` | Main CTAs, Upvote active states, Verification badges |
| **Brand Accent Pill** | `bg-primary/10 text-primary border border-primary/20` | Badges, AISHE codes, active categories |
| **Trending / Clout** | `text-rose-500` / `text-amber-500` | Flame indicators, LP Points, National Rank |
| **Verified Student Hub**| `text-emerald-500 bg-emerald-500/10` | Verified email & college badge |
| **Anonymous Confessions**| `text-violet-500 bg-violet-500/10` | Pseudonym identities & anonymous vault items |

---

## ♾️ 2. Logo Mark & SVG Architecture

The official CampusLoop logo is an isometric continuous mobius loop forming an open **"C"** with dynamic indigo-to-purple gradient transitions.

- **Component**: `<BrandLogo />` (with wordmark) and `<BrandLogoIcon />` (vector icon).
- **Scalability**: Renders vector-sharp at `sm` (24px), `md` (32px), `lg` (40px), and `xl` (48px).

```tsx
import { BrandLogo, BrandLogoIcon } from "@/components/ui/brand-logo";

<BrandLogo size="md" href="/app" />
```

---

## 🏛️ 3. Component Architecture & UI Patterns

### 1. **Campus Directory & College Cards (`/app/colleges`)**
- **Hero Spotlight**: Ambient radial glow with debounced instant search (`⌘K`).
- **Panoramic Banner Thumbnail**: Real college banner with gradient overlay for text legibility.
- **Overlapping Crest**: Rounded-2xl avatar box overlaid across the banner bottom.
- **National Campus Clout Leaderboard**: Top 3 Podium (Gold 🥇, Silver 🥈, Bronze 🥉) with live LP scores and thread counters.

### 2. **Rightbar Sidebar (`src/components/ui/right-sidebar.tsx`)**
- **Clout Progress Bar**: Smooth linear tier progression towards *Verified Star* (+150 LP).
- **Suggested Classmates**: Micro-avatar rows with 1-click Direct Message.
- **Trending Campus Hubs**: Live pulse indicator with instant jump links.
- **WhatsApp Class Invite**: 1-click clipboard link generator.

### 3. **Loading Screens (`/loading.tsx` & `src/app/app/(main)/loading.tsx`)**
- Continuous pulsing Brand Mark with radial violet ambient glow.
- Linear indeterminate progress bar with gradient shimmer animation (`animate-[loading-progress_1.4s_ease-in-out_infinite]`).

---

## 📱 4. Mobile-First Optimization Guidelines

1. **Touch Targets**: All interactive buttons, chips, and tap zones must have at least `44px` touch height.
2. **Bottom Safe Area**: All scrollable main views must use `pb-28` to prevent content overlap with the mobile bottom navigation bar.
3. **No Horizontal Scroll on Page Body**: Carousels and state filters must use `.overflow-x-auto .no-scrollbar` with momentum scrolling (`-webkit-overflow-scrolling: touch`).
4. **Fluid Typography**: Large headings use `text-2xl sm:text-3xl lg:text-4xl` to prevent awkward line wraps on 360px–390px mobile screens.

---

## 🚀 5. Product Hunt Launch Highlights (2.0 Major Update)

When submitting or updating on Product Hunt:

- **Tagline**: The verified student network for 1,350+ Indian colleges.
- **What's New in 2.0**:
  1. **1,350+ Campus Hubs & All-India Directory**: Searchable directory with authentic college crests, NIRF rankings, and Wikipedia-verified history.
  2. **National Campus Clout Leaderboard**: Compete with other universities in live student engagement, discussions, and invites.
  3. **Facebook-Style Instant Comments & Feeds**: Optimistic updates, seen-post demotion algorithm, and photo attachments.
  4. **24h Vibe Stories & Fullscreen Viewer**: Ephemeral campus vibe sharing with audio and reaction gestures.
  5. **DPDP Act 2023 & Statutory Compliance**: Strict intermediary guidelines, safe-harbor protections, and cryptographic identity vault.
