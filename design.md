# CampusLoop Design System

Based on the provided reference design, this document outlines the core design tokens, aesthetics, and component guidelines to be used throughout the CampusLoop application. 

## 1. Core Aesthetic & Vibe
*   **Vibe:** Premium, modern, Gen-Z friendly, highly visual.
*   **Key Characteristic:** **Glassmorphism**. Extensive use of dark, frosted glass overlays over images and backgrounds.
*   **Geometry:** Extremely soft and rounded. Almost no sharp corners anywhere in the UI.

## 2. Color Palette
The app relies on a clean base with image content providing the color, offset by a signature brand color and distinctive dark overlays.

*   **Brand / Primary:** Warm Gold/Mustard (`#C09763` or Tailwind `amber-600`/`amber-700` equivalents) - Used for onboarding backgrounds and key brand moments.
*   **Background (Light Mode Default):** Clean White (`#FFFFFF`) or very light off-white (`#F9FAFB`).
*   **Text Colors:**
    *   **Primary Text:** Near Black (`#111111`) for maximum contrast on light backgrounds.
    *   **Secondary Text:** Muted Gray (`#6B7280`) for handles, timestamps, and subtitles.
    *   **Overlay Text:** Pure White (`#FFFFFF`) for any text sitting on top of an image or glassmorphism pill.
*   **Overlays (The "Glass" Effect):**
    *   **Dark Glass:** `rgba(0, 0, 0, 0.4)` to `rgba(0, 0, 0, 0.6)` with a strong backdrop blur (`backdrop-blur-md` or `backdrop-blur-lg`). Used for bottom navigation, post headers, and image text backgrounds.
*   **Accents:**
    *   **Notification/Live:** Soft Red (`#EF4444`).
    *   **Verified Badge:** Standard Blue (`#3B82F6`).

## 3. Typography
A modern, rounded geometric sans-serif or a very clean neutral sans-serif is required to match the soft UI.
*   **Primary Font:** **Outfit**, **Quicksand**, or **Inter**. (Outfit is highly recommended for the rounded, friendly feel).
*   **Hierarchy:**
    *   **Display / H1:** 40px+, Medium/SemiBold, tight tracking (Used in onboarding).
    *   **H2 / Titles:** 20px-24px, SemiBold (Usernames, Page Titles).
    *   **Body:** 14px-16px, Regular (Post captions, bios).
    *   **Small / Meta:** 12px, Medium (Follower counts, tags, time).

## 4. Shapes & Border Radii
Sharp edges are strictly avoided.
*   **Containers & Cards:** `border-radius: 24px` to `32px` (Tailwind `rounded-3xl` or `rounded-[32px]`).
*   **Buttons & Pills:** `border-radius: 9999px` (Tailwind `rounded-full`).
*   **Avatars:** Perfectly circular (`rounded-full`).

## 5. Core Components

### Bottom Navigation
*   **Style:** Floating pill shape, disconnected from the bottom edge.
*   **Background:** Dark frosted glass (`bg-black/50 backdrop-blur-md`).
*   **Active State:** The active icon is placed inside a solid white circle (`bg-white text-black`), while inactive icons are white outlines (`text-white/70`).

### Post Cards (Feed)
*   **Structure:** Image-first. The image takes up the full width of the card and has large rounded corners (`rounded-3xl`).
*   **Header (Overlaid):** A small frosted glass pill (`bg-black/30 backdrop-blur`) floating at the top-left of the image containing the author's avatar, name, and verified badge.
*   **Content (Overlaid):** Likes, comments, shares, and the post caption sit directly on the bottom of the image, usually with a subtle dark gradient from the bottom to ensure text readability.

### Story Bar
*   **Layout:** Horizontal scrolling row at the top of the feed.
*   **Avatars:** Large circular avatars.
*   **Active/Live:** Indicated by a dark border or gradient border with a small overlapping pill (e.g., a black pill saying "Live").

### Profile View
*   **Header Image:** Edge-to-edge cover photo with rounded bottom corners.
*   **Avatar:** Large, overlapping the cover photo and the white background, featuring a thick white border (`ring-4 ring-white`).
*   **Stats:** Clean row of numbers over labels (Followers, Followings, Posts) separated by very subtle vertical dividers.
*   **Action Buttons:** Row of pill-shaped buttons ("Follow", "Message", "Insight"). Outline style (`border border-gray-200 rounded-full`).
*   **Grid:** Photo grid uses padded images with `rounded-2xl` corners rather than edge-to-edge squares.

## 6. Layout & Spacing
*   **App Padding:** Generous horizontal padding on main screens (e.g., `px-4` or `px-6`).
*   **Gaps:** Use `gap-4` or `gap-6` between major vertical sections (Stories -> Feed -> Post).
