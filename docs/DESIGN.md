# 🎨 CampusLoop Design System (Twitter / X Specification)

This specification defines the exact design system, tokens, typography, component rules, and interaction patterns for CampusLoop, built directly on the modern **Twitter / X visual language**.

---

## 🏛️ Core Design Philosophy

1. **Content First, Zero UI Clutter**: Content (posts, confessions, articles, polls) is the hero. Eliminate redundant cards, bulky headers, duplicate buttons, and decorative frames.
2. **Flat Timeline Architecture**: Feed items are borderless vertical rows separated solely by subtle hairline dividers (`border-b border-border/40`). Avoid nesting cards within cards.
3. **Pure High-Contrast Palette**: True OLED black (`#000000`) for dark mode, crisp clean white (`#FFFFFF`) for light mode.
4. **Instant Scanability**: Clear visual hierarchy:
   $$\text{Post Content} > \text{Author \& Verified Badge} > \text{Context (Campus/Tag)} > \text{Engagement Metrics} > \text{Secondary Actions}$$
5. **Standardized Interaction Row**: Action icons (`Reply`, `Repost`, `Like`, `Views`, `Bookmark`, `Share`) placed with subtle muted gray color (`#71767b`), illuminating in signature colors on hover/active.

---

## 🎨 Semantic Color Tokens (CSS Variables)

Never hardcode raw hex values in components. Always use semantic Tailwind classes backed by CSS variables in [`globals.css`](file:///Users/shaswatraj/Desktop/startups/campusloop/src/app/globals.css).

| Token | Light Mode | Dark Mode (OLED X) | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#FFFFFF` | `#000000` | Main canvas and feed background |
| `--foreground` | `#0F1419` | `#E7E9EA` | Primary text and headings |
| `--muted` | `#F7F9F9` | `#16181C` | Input fields, pills, secondary cards |
| `--muted-foreground` | `#536471` | `#71767B` | Handles, timestamps, icons, counters |
| `--border` | `#EFF3F4` | `#2F3336` | Hairline dividers, subtle borders |
| `--primary` | `#1D9BF0` | `#1D9BF0` | Accent blue, links, verified check, primary CTA |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary buttons |
| `--card` | `#FFFFFF` | `#000000` | Main container background |
| `--card-muted` | `#F7F9F9` | `#16181C` | Right sidebar modules ("What's happening") |
| `--destructive` | `#F4212E` | `#F4212E` | Errors, delete actions, report |
| `--success` | `#00BA7C` | `#00BA7C` | Repost active state, success |
| `--like` | `#F91880` | `#F91880` | Heart / like active state |

---

## 🔤 Typography & Font Hierarchy

CampusLoop uses system typography matching the **Chirp / Inter** geometry (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).

| Element | Font Size | Line Height | Weight | Color Class |
| :--- | :--- | :--- | :--- | :--- |
| **Top Bar Header** | `17px` (`text-[17px]`) | `22px` | `800` (Extra Bold) | `text-foreground font-black` |
| **Top Tabs** | `15px` (`text-[15px]`) | `20px` | `700` (Bold) | `text-foreground` (Active: border underline) |
| **Author Name** | `15px` (`text-[15px]`) | `20px` | `700` (Bold) | `text-foreground font-bold` |
| **Handle / Time** | `15px` (`text-[15px]`) | `20px` | `400` (Regular) | `text-muted-foreground` |
| **Post Body** | `15px` (`text-[15px]`) | `20px` (or `22px`) | `400` (Regular) | `text-foreground leading-normal` |
| **Long-Read Title** | `20px` / `24px` | `28px` / `32px` | `900` (Black) | `text-foreground font-black tracking-tight` |
| **Action Counter** | `13px` (`text-[13px]`) | `16px` | `500` (Medium) | `text-muted-foreground font-medium` |
| **Micro Badges** | `11px` (`text-[11px]`) | `14px` | `700` (Bold) | `text-muted-foreground uppercase` |

---

## 📐 Layout Architecture

### 1. Three-Column Desktop Grid
- **Left Navigation (`w-[275px]`)**:
  - Sticky left sidebar with Twitter/X circular icons + bold navigation labels.
  - Large pill "Post" / "Confess" button (`h-12 w-full rounded-full bg-primary font-black`).
  - User profile bottom pill with avatar, name, handle, and overflow menu.
- **Center Timeline (`max-w-[600px] w-full border-x border-border/40`)**:
  - Sticky Top Bar (`h-[53px] bg-background/80 backdrop-blur-md`):
    - Flat tabs: `For you` | `Following` / `Campus` | `India`.
    - Active tab has a 4px primary blue pill underline centered below text.
  - Inline Top Composer (Desktop) / Floating Action Button `+` (Mobile).
  - Flat infinite stream of posts separated by `border-b border-border/40`.
- **Right Sidebar (`w-[350px] pl-6 hidden lg:block`)**:
  - Pill search bar (`h-11 rounded-full bg-muted/60 px-4 border border-transparent focus:border-primary focus:bg-background`).
  - Card modules (`rounded-2xl bg-muted/50 border border-border/30 p-4 space-y-3`):
    - *"What's happening on campus"* (Trending hashtags & live topics).
    - *"Who to follow"* (Campus batchmates & verified writers).

### 2. Mobile Responsive Shell
- **Sticky Top Bar**: `CampusLoop 🔔` + `BIT Mesra ▾` + Tab Row (`For you` | `Latest` | `Viral`).
- **Mobile Bottom Navigation (`h-14 border-t border-border/40 bg-background/90 backdrop-blur-xl`)**:
  - 5 primary icons: `Home 🏠` | `Explore 🔎` | `+ (FAB)` | `Notifications 🔔` | `Profile 👤`.

---

## 💬 Post Component Anatomical Rules

A standard CampusLoop post follows this exact layout:

```
┌──────────────────────────────────────────────────────────────┐
│ [Avatar]   Author Name ✓  @handle · 4d          [··· Menu]   │
│            🏫 BIT Mesra                                      │
│                                                              │
│            Confession or post text goes here with crisp      │
│            line height and natural readability...            │
│                                                              │
│            [Optional Poll / Image / CodeBlock / Video]       │
│                                                              │
│            💬 12     ↻ 4     ❤️ 84     📊 1.2K     🔖    ↗  │
└──────────────────────────────────────────────────────────────┘
```

### Hover & Active Accent States for Actions
- **Reply (`💬`)**: Hover `text-primary bg-primary/10`
- **Repost (`↻`)**: Hover `text-emerald-500 bg-emerald-500/10`
- **Like (`❤️`)**: Hover `text-rose-500 bg-rose-500/10`
- **Views (`📊`)**: Hover `text-primary bg-primary/10`
- **Bookmark (`🔖`)**: Hover `text-primary bg-primary/10`
- **Share (`↗`)**: Hover `text-primary bg-primary/10`
