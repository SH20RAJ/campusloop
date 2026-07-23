# CampusLoop Design System

Based on the provided reference design, this document outlines the core design tokens, aesthetics, and component guidelines used throughout the CampusLoop application. 

## 1. Core Aesthetic & Vibe
* **Vibe:** Premium, modern, Gen-Z friendly, highly visual.
* **Key Characteristic:** **Glassmorphism**. Extensive use of dark/light frosted glass overlays over images and backgrounds (`backdrop-blur-md`).
* **Geometry:** Extremely soft and rounded (`rounded-2xl`, `rounded-3xl`, `rounded-full`). Almost no sharp corners anywhere in the UI.

## 2. Color Palette
The app relies on a clean base with image content providing color, offset by signature brand colors and distinctive overlays.

* **Brand / Primary:** Warm Gold/Mustard (`#C09763` or Tailwind `amber-600`/`amber-700` equivalents) & Coral Pink/Orange gradients.
* **Background:** Clean White (`#FFFFFF`) / Dark Onyx (`#0A0A0A`).
* **Text Colors:**
    * **Primary Text:** Near Black (`#111111`) / Clean White (`#F9FAFB`).
    * **Secondary Text:** Muted Gray (`#6B7280`).
    * **Overlay Text:** Pure White (`#FFFFFF`) for overlay elements.
* **Overlays (Glass Effect):**
    * **Frosted Glass:** `bg-background/80 backdrop-blur-md border border-border/60`.
* **Accents:**
    * **Notification/Live:** Soft Red (`#EF4444`).
    * **Verified Badge:** Standard Blue (`#3B82F6`).

## 3. Typography
Modern, rounded geometric sans-serif or clean neutral sans-serif.
* **Primary Font:** **Outfit**, **Inter**, or **Geist**.
* **Hierarchy:**
    * **Display / H1:** 40px+, Bold/Black, tight tracking.
    * **H2 / Titles:** 20px-24px, SemiBold.
    * **Body:** 14px-16px, Regular/Medium.
    * **Small / Meta:** 12px, Medium/SemiBold.

## 4. Shapes & Border Radii
* **Containers & Cards:** `border-radius: 16px` to `24px` (`rounded-2xl` or `rounded-3xl`).
* **Buttons & Pills:** `rounded-xl` or `rounded-full`.
* **Avatars:** Circular (`rounded-full`).

## 5. Core Components
* **Navigation:** Sticky top/side glass nav and mobile bottom pill bar.
* **Post Cards:** Clean post cards with embedded poll bars, quoted reposts, like/comment counts, and instant reaction animations.
* **Story Creator:** 9:16 story preview with gradient picker, sticker badges, and instant posting.
