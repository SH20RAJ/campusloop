# 🚀 CampusLoop

CampusLoop is the **ultimate social layer built exclusively for college students**. Speak freely via anonymous confessions, vote on local drama, join custom hobby communities, swipe to match on verified profiles, and build your social presence — all gatekept securely by your official student email.

🌐 **Production Link:** [https://campusloop.space](https://campusloop.space)

---

## ✨ Key Features

### 1. ⚡ Loop Points (LP) & Vibe Ranks
- **Gamified Engagement**: Users earn Loop Points (LP) automatically for participating in the campus ecosystem:
  - **+20 LP** per successfully onboarding referral invite.
  - **+5 LP** per post created.
  - **+2 LP** per discussion comment or reply posted.
  - **+1 LP** per poll vote/post heart.
- **Dynamic Vibe Badges**: Users receive special rank badges displayed directly on their profile cards:
  - `🔥 Campus Legend` (>= 500 LP)
  - `👑 Campus Talker` (>= 200 LP)
  - `⚡ Loop Starter` (>= 0 LP)

### 2. 📱 PWA Integration & Mobile optimization
- **Home Screen Install**: Fully compliant PWA manifest (`manifest.json`) and service worker (`sw.js`) for a premium mobile-first application experience.
- **Micro-Animations & Toasts**: Sleek, non-intrusive toast popups powered by `sonner` replace legacy browser alerts, offering smooth feedback when copying invite handles or posting stories.

### 3. 🎨 Fullscreen Vibe Creator (Stories)
- **Creative Canvas**: Separate interactive creator view at `/app/stories/new` with live canvas preview.
- **Customization**: Support for multiple gradients, typography alignments (Left/Center/Right), and Gen-Z stickers (maximum 3 to keep it clean).

### 4. 🔗 Dynamic Vanity URLs (`/@username`)
- **Vanity URL routing**: Students get beautiful vanity URLs directly at the root level: `campusloop.space/@username`.
- **High-Virality Conversion**: Non-logged-in visitors landing on a user's vanity link see a premium locked teaser card encouraging them to register with their college email to unlock private chats and posts.

### 5. 💬 Instant Messaging & Swiping
- **Matching Preferences**: Filter candidates by gender and college scope (Campus vs. Global).
- **Direct Chat Redirection**: Click "Message" on any profile to instantly start/resume private chats.

---

## 📚 Documentation & Architecture

For detailed architecture guides, design system tokens, and roadmap specs, check out the [`docs/`](campusloop/docs) directory:

- 🏗️ [**Architecture & AI Agent Guide**](campusloop/docs/ARCHITECTURE.md)
- 🎨 [**Design System**](campusloop/docs/DESIGN_SYSTEM.md)
- 🗺️ [**Roadmap & Phases**](campusloop/docs/ROADMAP_PHASES.md)
- 📜 [**Changelog**](campusloop/docs/CHANGELOG.md)

---

## 🛠️ Stack & Technologies

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS + Tailwind
- **Backend/Auth**: Hexclave Auth (sign-in, sessions, server credentials)
- **Database**: PostgreSQL (Neon Serverless) + Drizzle ORM
- **Deployment**: OpenNext + Cloudflare Workers (Wrangler Edge)
- **Notifications**: Sonner Toasts

---

## ⚙️ Setup & Installation

1. **Clone the Repository & Install Dependencies**:
   ```bash
   bun install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   DB_URL="postgresql://neondb_owner:..."
   NEXT_PUBLIC_HEXCLAVE_API_URL="https://api.stack-auth.com"
   NEXT_PUBLIC_HEXCLAVE_PROJECT_ID="e40e0f..."
   HEXCLAVE_SECRET_SERVER_KEY="ssk_..."
   ```

3. **Push Schema and Seed DB**:
   ```bash
   bun run db:push
   bun run db:seed
   ```

4. **Start Development Server**:
   ```bash
   bun run dev
   ```

---

## 🚀 Production Deployment

Wrangler variables and credentials must be set before deploying.

1. **Set Secrets on Cloudflare**:
   ```bash
   echo "YOUR_POSTGRES_URL" | bunx wrangler secret put DB_URL
   echo "https://api.stack-auth.com" | bunx wrangler secret put NEXT_PUBLIC_HEXCLAVE_API_URL
   echo "YOUR_PROJECT_ID" | bunx wrangler secret put NEXT_PUBLIC_HEXCLAVE_PROJECT_ID
   echo "YOUR_SERVER_KEY" | bunx wrangler secret put HEXCLAVE_SECRET_SERVER_KEY
   ```

2. **Deploy to Workers**:
   ```bash
   bun run deploy
   ```
