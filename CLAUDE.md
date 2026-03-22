# DIGITN SaaS Platform — Complete Project Reference

> **READ THIS FIRST.** This file contains everything about the project. Do NOT read individual code files unless making changes to them. This file IS the context.

---

## What Is This Project?

DIGITN (digitn.tech) is an **AI-powered SaaS platform** like Bolt.new / Lovable / Replit Agent. Users visit the site, chat with an AI agent called "DIGITN AI", describe what they want built, and the AI autonomously creates the project on a Ubuntu VPS, deploys it to a preview URL, and lets users download the code.

The site was originally a simple French agency landing page. It has been transformed into a full SaaS platform while preserving the original marketing homepage.

**Domain:** digitn.tech
**Owner:** Aymen (contact@digitn.tech)
**Location:** Tunis, Tunisia
**Languages:** Arabic (RTL), French (default), English

---

## Architecture

```
Browser → Nginx (digitn.tech, VPS)
            ↓
       Next.js 14 App Router (PM2, port 3000)
            ↓
       Supabase Cloud (PostgreSQL + Auth + RLS)
            ↓
       AI Bridge (Express.js, port 3001, internal only)
            ↓
       9Router (http://localhost:20128/v1, OpenAI-compatible proxy)
            ↓
       40+ AI providers auto-routed by tier
            ↓
       Generated project files → Nginx serves /projects/[id]
```

### Components:
- **Next.js 14** — App Router, SSR (NOT static export), deployed on VPS via PM2
- **Supabase** — Cloud PostgreSQL + Auth + Row Level Security (project: deccdkiiegniqbvqredq)
- **AI Bridge** — Express.js at localhost:3001, receives chat/build requests, calls 9Router
- **9Router** — OpenAI-compatible proxy at localhost:20128, routes to best available AI provider automatically
- **Nginx** — Reverse proxy for digitn.tech, serves /projects/[id] as static files, /zips/[id].zip for downloads
- **Stripe** — International card payments
- **Konnect** — Tunisian card payments (d-card, e-DINAR)

### Why NOT Vercel?
Vercel has 60-second function timeout. AI builds take 5-10 minutes. Running on VPS eliminates this limit entirely. Also makes serving generated project files trivial via Nginx.

---

## CRITICAL RULES (Never Break These)

1. **NEVER mention AI model names** anywhere — not in code, not in UI, not in AI responses. No "Claude", "Sonnet", "GPT", "Gemini", "Anthropic", "Google", "OpenAI". The AI is called **"DIGITN AI"**. If asked what powers it: *"Our advanced built-in AI engine."*

2. **Admin email is `contact@digitn.tech`** — only this email can access /admin. Hardcoded in middleware.ts.

3. **All platform CSS must use CSS variables** — `var(--bg-primary)`, `var(--accent)`, etc. Never raw hex colors in platform components. The marketing page is the only exception (uses inline styles intentionally).

4. **Project previews expire after 15 minutes** for ALL tiers. Timer resets when user requests changes/rebuild.

5. **9Router API key is configurable from the admin panel** — no code changes needed to switch providers.

---

## Subscription Tiers

| Tier Key | Display Name | Requests/Day | Active Projects | AI Models | Price |
|----------|-------------|-------------|-----------------|-----------|-------|
| `free` | DIGITN FAST | 10 | 1 | ag/gemini-3-flash, gh/gpt-5-mini, qw/qwen3-coder-flash | Free forever |
| `pro` | DIGITN PRO | 50 | 3 | ag/claude-sonnet-4-6, gh/claude-sonnet-4.6, kr/claude-sonnet-4.5 | 29 DT / $9 /month |
| `plus` | DIGITN PLUS | Unlimited | Unlimited | Same premium models as PRO | 79 DT / $25 /month |

- PRO and PLUS use the **same premium models** — difference is request limits
- 9Router automatically selects the best available model from the list
- Preview expiry: **15 minutes** for ALL tiers (resets on rebuild)
- Config stored in `admin_config` table and `src/config/platform.ts`

---

## Complete File Structure

```
digitn-pro/
├── CLAUDE.md                          ← YOU ARE HERE
├── .env.local                         # Real secrets (never commit)
├── next.config.js                     # SSR mode + next-intl plugin
├── tailwind.config.js                 # Dark mode, typography plugin, custom colors
├── postcss.config.js                  # Tailwind + autoprefixer
├── tsconfig.json                      # TypeScript config
├── package.json                       # Next.js 14 + all dependencies
├── ecosystem.config.js                # PM2 production config (port 3000)
│
├── nginx/
│   └── digitn.tech.conf               # Full Nginx config (SSL, /projects/, /zips/, SSE proxy)
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # 7 tables + RLS + triggers + indexes + seed data
│
├── bridge/                            # === EXPRESS.JS AI BRIDGE SERVER ===
│   ├── server.js                      # Express app, auth middleware, mounts /chat + /build, cleanup cron
│   ├── cleanup.js                     # Cron: deletes expired projects every 2 min
│   ├── package.json                   # express, cors, openai, @supabase/supabase-js, archiver, node-cron
│   └── src/
│       ├── lib/
│       │   ├── supabase.js            # Service role client (bypasses RLS)
│       │   ├── router9.js             # 9Router OpenAI client + AI_IDENTITY prompt
│       │   └── builder.js             # Spawns Claude Code CLI, streams output, zips result
│       └── routes/
│           ├── chat.js                # POST /chat/stream → SSE streaming from 9Router
│           └── build.js               # POST /build/start + GET /build/stream/:id
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout: Inter + Playfair fonts, NextIntlClientProvider, Toaster, RTL, theme script
│   │   ├── not-found.tsx              # Custom 404 page
│   │   ├── globals.css                # CSS variables (:root light + [data-theme="dark"]), @tailwind directives
│   │   │
│   │   ├── (marketing)/              # === PUBLIC MARKETING PAGE ===
│   │   │   ├── layout.tsx             # Passthrough layout (no sidebar)
│   │   │   ├── page.tsx               # Full landing page (hero, services, portfolio, pricing, testimonials, contact)
│   │   │   ├── metadata.ts            # FAQ + Service JSON-LD schemas for SEO
│   │   │   └── GlobeMap.tsx           # D3.js interactive Tunisia globe
│   │   │
│   │   ├── (platform)/               # === AUTHENTICATED SaaS PLATFORM ===
│   │   │   ├── layout.tsx             # Platform shell: auth check, fetches user tier, renders Sidebar
│   │   │   └── app/
│   │   │       ├── page.tsx           # Dashboard: welcome, quota display, links to Chat & Builder
│   │   │       ├── chat/
│   │   │       │   ├── page.tsx       # New chat page
│   │   │       │   └── [id]/page.tsx  # Chat history page (loads messages from DB)
│   │   │       ├── builder/
│   │   │       │   └── page.tsx       # 3-phase builder: planning → building → preview
│   │   │       ├── projects/
│   │   │       │   └── page.tsx       # Project list with status badges
│   │   │       └── settings/
│   │   │           └── page.tsx       # Billing: current plan + Stripe/Konnect upgrade buttons
│   │   │
│   │   ├── admin/                     # === OWNER-ONLY ADMIN DASHBOARD ===
│   │   │   ├── layout.tsx             # Admin shell with sidebar, email guard
│   │   │   └── page.tsx              # Stats (users/pro/plus counts) + 9Router config form
│   │   │
│   │   ├── auth/                      # === AUTHENTICATION ===
│   │   │   ├── login/page.tsx         # Email + Google OAuth login
│   │   │   ├── signup/page.tsx        # Email + Google OAuth signup
│   │   │   └── callback/route.ts      # OAuth code exchange redirect
│   │   │
│   │   └── api/                       # === API ROUTES ===
│   │       ├── chat/stream/route.ts             # SSE proxy: quota check → forward to bridge /chat/stream
│   │       ├── builder/
│   │       │   ├── create/route.ts              # Trigger build: quota check → create project → call bridge /build/start
│   │       │   └── stream/[id]/route.ts         # SSE proxy: ownership check → forward bridge /build/stream/:id
│   │       ├── subscriptions/
│   │       │   └── create/route.ts              # Create Stripe Checkout or Konnect payment session
│   │       ├── webhooks/
│   │       │   ├── stripe/route.ts              # Stripe webhook: upgrade user tier on payment
│   │       │   └── konnect/route.ts             # Konnect webhook: verify payment, upgrade tier
│   │       ├── admin/
│   │       │   └── config/route.ts              # POST: update admin_config table
│   │       └── contact/route.ts                 # Legacy contact form handler
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx      # Main chat: SSE streaming, message state, URL rewriting
│   │   │   ├── ChatInput.tsx          # Auto-resize textarea + send button
│   │   │   └── MessageBubble.tsx      # Markdown rendering (react-markdown + remark-gfm)
│   │   ├── builder/
│   │   │   ├── BuildProgress.tsx      # Terminal-like build output (SSE EventSource)
│   │   │   └── ProjectPreview.tsx     # iframe preview + device toggle + download + expiry countdown
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # Platform sidebar: nav, tier badge, theme toggle, language switcher, logout
│   │   │   ├── Header.tsx             # Top bar: title, quota progress bar, bell, user avatar
│   │   │   └── LanguageSwitcher.tsx   # FR/EN/AR dropdown, cookie-based
│   │   └── ui/
│   │       └── ThemeToggle.tsx        # Light/dark mode toggle (localStorage + data-theme attribute)
│   │
│   ├── config/
│   │   ├── site.ts                    # Business info: name, URL, phone, email, social links, analytics IDs
│   │   └── platform.ts               # TIERS object, FREE_MODELS, PAID_MODELS, AI_IDENTITY_PROMPT, BRIDGE_URL
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client (createBrowserClient from @supabase/ssr)
│   │   │   └── server.ts             # Server Supabase client (createServerClient with cookies)
│   │   ├── payments/
│   │   │   ├── stripe.ts             # Stripe SDK initialization + STRIPE_PRICES
│   │   │   └── konnect.ts            # Konnect API: createKonnectPayment() with init-payment endpoint
│   │   └── analytics.ts              # GA4 + Meta Pixel event tracking
│   │
│   ├── i18n/
│   │   ├── config.ts                  # next-intl getRequestConfig, cookie-based locale detection
│   │   └── messages/
│   │       ├── fr.json                # French (default) — all UI strings
│   │       ├── en.json                # English — all UI strings
│   │       └── ar.json               # Arabic — all UI strings (RTL)
│   │
│   └── middleware.ts                  # Auth guard: /app/* requires login, /admin/* requires contact@digitn.tech
│
├── docs/superpowers/
│   ├── plans/                         # Implementation plans for each phase
│   └── specs/                         # Design specs
│
└── public/
    ├── data/                          # Tunisia map topology JSON for D3 globe
    ├── icon.svg                       # Favicon
    └── robots.txt                     # SEO robots
```

---

## Database Schema (Supabase)

**Project URL:** https://deccdkiiegniqbvqredq.supabase.co
**Migration file:** `supabase/migrations/001_initial_schema.sql`

### Tables:

**`users`** — extends Supabase Auth
- id (uuid, PK, FK → auth.users), email, name, avatar_url
- tier (free/pro/plus), language (ar/fr/en)
- stripe_customer_id, konnect_customer_id
- Auto-created via `handle_new_user` trigger on auth signup

**`usage_quotas`** — daily request tracking
- user_id, date, requests_used, requests_limit
- UNIQUE(user_id, date) — one row per user per day

**`subscriptions`** — payment records
- user_id, tier (pro/plus), status (active/cancelled/past_due)
- provider (stripe/konnect), provider_subscription_id, current_period_end

**`conversations`** — chat sessions
- user_id, mode (chat/builder), title

**`messages`** — individual messages
- conversation_id, user_id, role (user/assistant/system), content

**`projects`** — generated projects
- user_id, conversation_id, name, description, plan_json
- status (planning/building/ready/failed/expired)
- type (website/webapp/ecommerce/api)
- serve_path (/var/www/projects/[id]), public_url, zip_path
- expires_at, last_accessed_at

**`admin_config`** — dynamic settings (editable from /admin)
- key/value pairs: bridge_settings, tier_limits, free_models, paid_models

**RLS:** Enabled on all tables. Users can only access their own data. admin_config has RLS enabled (service role only).

---

## Design System

### Colors (CSS Variables in globals.css)

**Light Mode (default):**
```
--bg-primary: #f8f7f5       (warm off-white)
--bg-secondary: #f0eee6     (slightly warmer)
--card-bg: #eae5d9           (card backgrounds)
--text-primary: #1e1d1b      (dark ink)
--text-secondary: rgba(30,29,27,0.55)
--text-tertiary: rgba(30,29,27,0.35)
--accent: #d97757            (terra-cotta orange)
--accent-blue: #2e6287
--border: #e6e4dc
```

**Dark Mode ([data-theme="dark"]):**
```
--bg-primary: #121211
--bg-secondary: #1a1a19
--card-bg: #222220
--text-primary: #e5e4d9
--accent: #d97757 (same)
```

### Typography
- **Serif (headings):** Playfair Display → Georgia fallback
- **Sans (body):** Inter → system-ui fallback
- CSS vars: `--font-serif`, `--font-sans`

### Layout
- Sidebar: 250px fixed (`--sidebar-width`)
- Content: `padding: 48px 64px`, `max-width: 1100px`
- Page headers: 22px serif
- Border radius: 4-6px (buttons/inputs), 10px (cards)
- Shadows: very soft (`0 2px 8px rgba(0,0,0,0.08)`)
- Hover: `translateY(-2px)` + shadow increase
- Icons: Feather icons (`react-icons/fi`)
- Notifications: `react-hot-toast`
- Animations: Framer Motion fade-up with `[0.16, 1, 0.3, 1]` easing

### Dark Mode Implementation
- Toggle stored in `localStorage` key `digitn-theme`
- Applied via `document.documentElement.setAttribute('data-theme', theme)`
- Inline `<script>` in layout.tsx prevents flash on load
- Tailwind: `darkMode: ['class', '[data-theme="dark"]']`

---

## Data Flow: How Chat Works

```
1. User types message in ChatInterface.tsx
2. POST /api/chat/stream (Next.js API route)
3. API checks auth (Supabase session) and quota (usage_quotas table)
4. If quota OK: increment requests_used, forward to Bridge
5. POST bridge:3001/chat/stream with { userId, messages, conversationId, isNew }
6. Bridge gets user tier from DB, selects model list
7. Bridge calls 9Router: POST localhost:20128/v1/chat/completions (OpenAI format, stream: true)
8. 9Router picks best available provider, streams response
9. Bridge streams SSE chunks back: { type: 'content', text: '...' }
10. Bridge saves conversation + messages to Supabase
11. Next.js proxies SSE back to browser
12. ChatInterface renders tokens in real-time via MessageBubble (Markdown)
```

## Data Flow: How Builder Works

```
1. User describes project in Builder page (planning phase)
2. AI asks clarifying questions via chat
3. User approves plan
4. POST /api/builder/create → creates project in DB with expires_at = now + 15min
5. Calls bridge:3001/build/start with { projectId, planText, userId }
6. Bridge spawns Claude Code CLI: npx @anthropic-ai/claude-code --print -p "instruction"
7. Claude Code generates all files in /var/www/projects/[id]/
8. Bridge streams stdout/stderr as SSE events to frontend BuildProgress.tsx
9. On completion: Bridge zips project, updates DB status to 'ready'
10. Frontend shows ProjectPreview.tsx with iframe pointing to digitn.tech/projects/[id]
11. User can download ZIP or request changes (resets 15-min timer)
12. Cleanup cron runs every 2 min: deletes expired projects from disk + DB
```

## Data Flow: How Payments Work

```
Stripe:
1. User clicks "Upgrade" on settings page
2. POST /api/subscriptions/create { tier: 'pro', provider: 'stripe' }
3. Creates Stripe Checkout Session with metadata { userId, tier }
4. Redirects user to Stripe hosted checkout
5. On success: Stripe sends webhook to POST /api/webhooks/stripe
6. Webhook verifies signature, inserts subscription, updates user.tier in DB

Konnect (Tunisian):
1. Same flow but calls Konnect init-payment API
2. Redirects to Konnect checkout
3. Konnect sends webhook to POST /api/webhooks/konnect
4. Webhook verifies via Konnect API, parses orderId (userId_tier_timestamp), updates DB
```

---

## Environment Variables (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://deccdkiiegniqbvqredq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # anon/public key
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # service role (bypasses RLS)

# Bridge
BRIDGE_SECRET=sec_digitn_89x_bridge_f3q9v2p4k7m1l5
BRIDGE_URL=http://localhost:3001

# Stripe
STRIPE_SECRET_KEY=sk_test_...          # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...        # Get from Stripe webhook setup

# Konnect
KONNECT_API_KEY=...                    # Get from konnect.network
KONNECT_WALLET_ID=...                  # Get from Konnect dashboard

# App
NEXT_PUBLIC_APP_URL=https://digitn.tech  # or http://localhost:4000 for dev
```

---

## Commands

```bash
# Development
npm run dev                    # Start Next.js dev server
cd bridge && node server.js    # Start AI Bridge (needs 9Router running on VPS)

# Production
npm run build                  # Build for production
npm start                      # Start production server

# VPS Deployment
pm2 start ecosystem.config.js           # Start Next.js via PM2
pm2 start bridge/server.js --name bridge # Start Bridge via PM2

# Database
# Run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor

# Clean restart
rm -rf .next && npm run dev    # Clear cache and restart
```

---

## Implementation Status

### ✅ Phase 1: Infrastructure & Foundation — COMPLETE
- Next.js 14 SSR (removed static export)
- Supabase integration (clients, DB schema, RLS)
- Design system (light + dark mode CSS variables)
- i18n (Arabic RTL, French, English via next-intl)
- Auth (login, signup, Google OAuth, middleware protection)
- Platform shell (Sidebar, Header, ThemeToggle, LanguageSwitcher)
- PM2 + Nginx configs ready

### ✅ Phase 2: Chat Mode — COMPLETE
- Express Bridge server with 9Router integration
- SSE streaming chat with real-time token rendering
- Conversation persistence in Supabase
- Quota enforcement (10/50/unlimited per tier)
- Chat history pages (/app/chat/[id])
- Markdown rendering with react-markdown

### ✅ Phase 3: Builder Mode — COMPLETE
- Claude Code CLI spawner in Bridge
- Build progress terminal (SSE EventSource)
- Project preview iframe with device toggle
- ZIP download generation
- Projects list page with status badges
- 15-minute project expiry system

### ✅ Phase 4: Payments & Subscriptions — COMPLETE
- Stripe Checkout integration
- Konnect API integration
- Webhook handlers that auto-upgrade user tier
- Settings page with billing management

### ✅ Phase 5: Admin Dashboard — COMPLETE
- Stats cards (total users, PRO count, PLUS count)
- 9Router API key configuration form
- Protected by admin email check

### ✅ Phase 6: Auto-Cleanup — COMPLETE
- Cron job runs every 2 minutes
- Deletes expired project dirs + ZIPs
- Updates DB status to 'expired'

---

## What Still Needs Manual Setup

### Required Before Going Live:
1. **Run DB migration** — Execute `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
2. **Disable email confirmation** — Supabase → Auth → Providers → Email → Toggle OFF "Confirm email"
3. **Enable Google OAuth** — Supabase → Auth → Providers → Google (needs Google Cloud Console credentials)
4. **Create Stripe products** — DIGITN PRO ($9/mo) and DIGITN PLUS ($25/mo), add price IDs to env
5. **Set up Stripe webhook** — Point to `https://digitn.tech/api/webhooks/stripe`
6. **Get Konnect credentials** — API key + wallet ID from konnect.network
7. **VPS setup** — Clone repo, npm install, npm run build, pm2 start, nginx config, certbot SSL
8. **DNS** — Point digitn.tech A record to VPS IP
9. **9Router** — Ensure running at localhost:20128 on VPS
10. **Claude Code** — Install on VPS: `npm install -g @anthropic-ai/claude-code`
11. **Create directories** — `mkdir -p /var/www/projects /var/www/zips`

### Optional:
- Google Analytics ID in `src/config/site.ts`
- Meta Pixel ID in `src/config/site.ts`
- OG image at `public/og-image.jpg`

---

## Tech Stack Summary

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + CSS Variables |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google OAuth |
| AI Proxy | 9Router (OpenAI-compatible) |
| AI Bridge | Express.js |
| AI Builder | Claude Code SDK |
| Payments | Stripe + Konnect |
| i18n | next-intl v4 |
| Animations | Framer Motion |
| Icons | react-icons/fi (Feather) |
| Markdown | react-markdown + remark-gfm |
| Notifications | react-hot-toast |
| Process Manager | PM2 |
| Reverse Proxy | Nginx |
| Maps | D3.js + TopoJSON |
