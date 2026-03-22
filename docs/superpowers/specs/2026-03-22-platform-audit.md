# DIGITN Platform — Full Audit Report
**Date:** 2026-03-22
**Scope:** Every platform page, component, API route, layout, config, auth, admin, i18n

---

## SEVERITY LEGEND
- 🔴 **CRITICAL** — Broken functionality, security risk, or data loss
- 🟠 **HIGH** — Bad UX, wrong behavior, or significant visual bug
- 🟡 **MEDIUM** — Polish, consistency, or minor logic issues
- 🟢 **LOW** — Improvement / nice-to-have

---

## 1. BUGS & BROKEN CODE

### 🔴 BUG-01 — Sidebar nav: dashboard item uses wrong translation key
**File:** `src/components/layout/Sidebar.tsx` line 13
**Problem:** The first nav item (`/app`, the dashboard) uses `key: 'chat'` — so it renders "Chat" as the label instead of "Dashboard" or "Home". There's no `dashboard` or `home` key in the nav items array for the `/app` route.
**Fix:** Add a `dashboard` key to i18n `nav` object and use it for the `/app` route, OR rename to `home` with a `FiHome` icon.

### 🔴 BUG-02 — Auth callback URL is wrong in signup page
**File:** `src/app/auth/signup/page.tsx` line ~17 and ~55
**Problem:** `signUp` uses `emailRedirectTo: .../auth/callback` but `signInWithOAuth` uses `redirectTo: .../api/auth/callback` — two different URLs. The OAuth callback route is at `src/app/auth/callback/route.ts` (path `/auth/callback`), not `/api/auth/callback`. OAuth signups will fail to redirect correctly.
**Fix:** Change Google OAuth `redirectTo` to `${window.location.origin}/auth/callback`.

### 🔴 BUG-03 — `subscriptions/create` route fetches `full_name` field that doesn't exist
**File:** `src/app/api/subscriptions/create/route.ts` line ~38
**Problem:** The Konnect payment route does `.select('email, full_name')` but the `users` table schema stores the name column as `name`, not `full_name`. This query will always return `null` for the name.
**Fix:** Change to `.select('email, name')` and use `user?.name`.

### 🔴 BUG-04 — Builder stream route: `params` not awaited (Next.js 15 warning, breaks in strict mode)
**File:** `src/app/api/builder/stream/[id]/route.ts`
**Problem:** `params.id` is accessed directly. In Next.js 14+ App Router with TypeScript strict mode, dynamic params must be treated as a Promise in some configurations. Also no error handling if `response.body` is null.
**Fix:** Destructure `params` safely, add null check on `response.body`.

### 🟠 BUG-05 — ProjectPreview: expiry badge uses hardcoded Tailwind colors that break dark mode
**File:** `src/components/builder/ProjectPreview.tsx` line ~35
**Problem:** `bg-red-100 text-red-700` and `bg-green-100 text-green-700` are hardcoded Tailwind colors — they look terrible in dark mode (bright colored badges on dark background).
**Fix:** Replace with CSS variable-based styles: use `rgba` backgrounds with `var(--accent)` or themed colors.

### 🟠 BUG-06 — Header: quota bar shows "left" but receives raw numbers inconsistently
**File:** `src/components/layout/Header.tsx`
**Problem:** `pct` is calculated as `(requestsLeft / requestsTotal) * 100` — but `requestsLeft` semantically means remaining requests, so the bar depletes as you use it. However the platform dashboard page (`app/page.tsx`) passes `requestsUsed` and `requestsLimit` — the Header receives them correctly but the naming is inverted (`requestsLeft` should be `requestsUsed`). Confusing and error-prone.
**Fix:** Rename props to `requestsUsed` / `requestsLimit` and recalculate `pct` as `(requestsUsed / requestsLimit) * 100`.

### 🟠 BUG-07 — Chat quota race condition: increment happens before confirming the stream succeeds
**File:** `src/app/api/chat/stream/route.ts`
**Problem:** The quota is incremented BEFORE the bridge request is made. If the bridge fails (network error, bridge down), the user loses a quota count for nothing.
**Fix:** Move quota increment to AFTER a successful bridge response (check `response.ok` first).

### 🟠 BUG-08 — `admin/layout.tsx` has duplicate auth guard (middleware + layout)
**File:** `src/app/admin/layout.tsx`
**Problem:** The middleware already protects `/admin` routes. The layout also does `redirect('/app')` if email doesn't match. This is fine as defense-in-depth, but the layout imports `FiUsers` and `FiSettings` from `react-icons/fi` that are never used.
**Fix:** Remove unused imports (`FiUsers`, `FiSettings`).

### 🟡 BUG-09 — Sidebar: `navItems` has two entries with `key: 'chat'`
**File:** `src/components/layout/Sidebar.tsx`
**Problem:** Both `/app` (dashboard) and `/app/chat` use `key: 'chat'` as their translation key, causing both to render the same "Chat" label. Dashboard shows "Chat" instead of something like "Accueil" or "Dashboard".
**Fix:** Add `key: 'dashboard'` for `/app` route, add to i18n.

### 🟡 BUG-10 — `LanguageSwitcher` uses `window.location.reload()` — kills app state
**File:** `src/components/layout/LanguageSwitcher.tsx` line ~33
**Problem:** Language switch triggers a full page reload. While this refreshes i18n, it destroys any in-progress chat or builder state. It also causes a flash.
**Fix:** Use Next.js router `router.refresh()` instead, which does a soft refresh preserving client state where possible.

---

## 2. STYLE & UI ISSUES

### 🟠 STYLE-01 — BuildProgress terminal: hardcoded dark background ignores theme
**File:** `src/components/builder/BuildProgress.tsx` line ~52
**Problem:** `bg-[#1e1d1b]` and `text-green-400` are hardcoded — in light mode the terminal still looks dark (which is actually intentional for a terminal), but `black/40` overlay and `white/10` borders don't use CSS variables. Minor inconsistency.
**Fix:** Keep dark terminal aesthetic but use `--card-bg` or explicit dark tokens instead of magic hex values. Keep green text as terminal convention.

### 🟠 STYLE-02 — ProjectPreview: mobile frame `h-[812px]` overflows on small screens
**File:** `src/components/builder/ProjectPreview.tsx`
**Problem:** Mobile preview sets `h-[812px]` which exceeds viewport height on most laptops. The container doesn't scroll, so the iframe is clipped.
**Fix:** Use `max-h-[80vh]` with `overflow-auto` on the frame container instead.

### 🟠 STYLE-03 — Settings page: upgrade button uses `var(--text-primary)` as background
**File:** `src/app/(platform)/app/settings/page.tsx` (seen in agent output)
**Problem:** Non-popular plan upgrade button uses `var(--text-primary)` as `backgroundColor`. In light mode this is `#1e1d1b` (dark, fine). In dark mode `--text-primary` is `#e5e4d9` (cream) — giving a cream-colored button with white text that is nearly unreadable.
**Fix:** Replace with a neutral dark color like `#1e1d1b` directly, or use `var(--accent)` for all upgrade buttons.

### 🟠 STYLE-04 — Header: bell button has no hover state feedback and does nothing
**File:** `src/components/layout/Header.tsx`
**Problem:** The bell `<button>` has no `onClick`, no notification system behind it, and no disabled state. It's a dead UI element that misleads users.
**Fix:** Either remove it or add `opacity-50 cursor-not-allowed` + a tooltip saying "Coming soon".

### 🟡 STYLE-05 — Sidebar brand uses raw `|` character instead of DigItnLogo component
**File:** `src/components/layout/Sidebar.tsx`
**Problem:** The brand mark is `<span>|</span><span>DIGITN</span>` — a raw pipe character. The new `DigItnLogo` component was created but not used in the sidebar.
**Fix:** Replace with `<DigItnLogo size={20} />` + `DIGITN` text, matching auth pages and chat.

### 🟡 STYLE-06 — Auth pages brand uses same raw `|` character
**File:** `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`
**Problem:** Same as above — raw pipe + serif text instead of `DigItnLogo`.
**Fix:** Use `<DigItnLogo />` component for consistent branding.

### 🟡 STYLE-07 — Admin layout brand uses plain text "DIGITN ADMIN" with no logo
**File:** `src/app/admin/layout.tsx`
**Problem:** Just a bold serif text with no icon. Inconsistent with platform sidebar.
**Fix:** Use `<DigItnLogo />` + "ADMIN" text.

### 🟡 STYLE-08 — `prose` class conflict in MessageBubble — double prose styling
**File:** `src/components/chat/MessageBubble.tsx`
**Problem:** The markdown container has both `prose prose-sm max-w-none` (Tailwind Typography) AND custom `<style>` block with `.digitn-prose` rules. The Tailwind `prose` class will conflict with custom styles, causing unpredictable rendering especially for `p`, `code`, `pre` elements.
**Fix:** Remove `prose prose-sm max-w-none` class — keep only the `digitn-prose` custom styles which are already comprehensive and theme-aware.

### 🟡 STYLE-09 — ChatInput disclaimer text is hardcoded French
**File:** `src/components/chat/ChatInput.tsx` line ~58
**Problem:** `"DIGITN AI peut faire des erreurs. Vérifiez les informations importantes."` is hardcoded in French — no i18n, ignores user's selected language.
**Fix:** Move to i18n messages under `chat.disclaimer` key, use `useTranslations`.

### 🟡 STYLE-10 — Sidebar "Plan actif" label is hardcoded French
**File:** `src/components/layout/Sidebar.tsx`
**Problem:** `"Plan actif"` is hardcoded. The rest of the sidebar uses `useTranslations('nav')`. English and Arabic users will see French.
**Fix:** Add `activePlan` key to i18n `nav` messages, use translation.

### 🟢 STYLE-11 — BuildProgress: no empty state before first log arrives
**File:** `src/components/builder/BuildProgress.tsx`
**Problem:** The terminal is blank for the first few seconds while the build starts. No loading indicator until the first log line arrives.
**Fix:** Show a "Connecting to build server..." placeholder text in the terminal when `logs` is empty.

---

## 3. CODE QUALITY & ARCHITECTURE

### 🟠 CODE-01 — Quota logic duplicated across 2 API routes
**Files:** `src/app/api/chat/stream/route.ts`, `src/app/api/builder/create/route.ts`
**Problem:** Both routes contain identical quota check + increment logic (~30 lines each). If you change the limit formula, you must update both places.
**Fix:** Extract to `src/lib/quota.ts` as a reusable `checkAndIncrementQuota(userId)` function.

### 🟠 CODE-02 — `platform.ts` tier limits are hardcoded in API routes, ignoring the config
**Files:** API routes reference `10 / 50 / 9999` inline; `platform.ts` defines `TIERS` with the same values
**Problem:** The `TIERS` object in `platform.ts` is defined but the API routes don't import it — they hardcode the numbers. The admin panel can update `admin_config` in the DB but the API routes don't read from it either.
**Fix:** Import `TIERS` from `platform.ts` in all API routes: `const limit = TIERS[tier as Tier].requestsPerDay`.

### 🟠 CODE-03 — `subscriptions/create` creates a raw Supabase admin client inline
**File:** `src/app/api/subscriptions/create/route.ts`
**Problem:** Creates `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` inline in the route. This bypasses the shared `src/lib/supabase/server.ts` pattern and makes it easy to miss environment variable validation.
**Fix:** Create `src/lib/supabase/admin.ts` that exports a singleton admin client, import it in routes.

### 🟡 CODE-04 — `MessageBubble` uses `<style>` injection inside component render
**File:** `src/components/chat/MessageBubble.tsx`
**Problem:** A `<style>` tag is rendered inside the component body on every message render. This creates multiple duplicate `<style>` elements in the DOM for every AI message shown.
**Fix:** Move styles to `globals.css` as `.digitn-prose { ... }` rules.

### 🟡 CODE-05 — `ChatInterface` injects bounce animation `<style>` in render
**File:** `src/components/chat/ChatInterface.tsx`
**Problem:** Same issue — `@keyframes bounce` is injected inline. This style gets added on every render.
**Fix:** Move `@keyframes bounce` to `globals.css`.

### 🟡 CODE-06 — Builder page has no error boundary for build failures
**File:** `src/app/(platform)/app/builder/page.tsx`
**Problem:** If the bridge is down and `POST /api/builder/create` fails, the user gets a toast but the phase state stays at "planning" with no way to retry cleanly.
**Fix:** Add an explicit error state with a "Try again" button that resets to the planning phase.

### 🟡 CODE-07 — `ThemeToggle` reads `localStorage` on mount without SSR guard
**File:** `src/components/ui/ThemeToggle.tsx`
**Problem:** The component initializes `useState('dark')` and reads localStorage in `useEffect`. This is correct, but there's no `suppressHydrationWarning` on the toggle button itself — if the server and client disagree on the initial theme, the icon flashes.
**Fix:** Add `suppressHydrationWarning` to the button, or derive initial state from `document.documentElement.getAttribute('data-theme')` synchronously.

### 🟢 CODE-08 — No `loading.tsx` files for platform routes
**Problem:** None of the platform pages have a `loading.tsx` sibling. Next.js App Router uses these for automatic Suspense boundaries. Without them, page transitions show nothing while server components load.
**Fix:** Add `loading.tsx` with skeleton UI for `/app`, `/app/chat`, `/app/builder`, `/app/projects`, `/app/settings`.

### 🟢 CODE-09 — No `error.tsx` files for platform routes
**Problem:** No error boundaries. If any server component throws (DB down, auth error), the user sees a Next.js default error page.
**Fix:** Add `error.tsx` with a friendly "Something went wrong" + retry button for the platform routes.

---

## 4. SECURITY

### 🔴 SEC-01 — `BRIDGE_SECRET` falls back to empty string
**File:** `src/config/platform.ts` line ~27
**Problem:** `export const BRIDGE_SECRET = process.env.BRIDGE_SECRET || ''` — if the env var is missing, the secret is an empty string. The bridge server accepts any `Authorization: Bearer ` header including empty ones.
**Fix:** Add a startup check: `if (!process.env.BRIDGE_SECRET) throw new Error('BRIDGE_SECRET is required')`. Same for `BRIDGE_URL`.

### 🟠 SEC-02 — OAuth callback URL in signup uses `/api/auth/callback` (wrong, could be exploited)
**See BUG-02 above** — wrong redirect URL is a security concern, not just a bug.

### 🟡 SEC-03 — Admin config API route lacks additional server-side email check
**File:** `src/app/api/admin/config/route.ts`
**Problem:** The middleware protects `/admin/*` pages, but the API route `/api/admin/config` is a POST endpoint. Middleware doesn't protect `/api/` routes for admin — only the middleware `matcher` covers it implicitly. The route should verify the user's email server-side.
**Fix:** Add explicit `user.email !== 'contact@digitn.tech'` check in the API route handler.

---

## 5. I18N GAPS

### 🟡 I18N-01 — Missing `nav.dashboard` key
Both `fr.json` and `en.json` have no `dashboard` key under `nav`. Needed for BUG-01 fix.

### 🟡 I18N-02 — Missing `chat.disclaimer` key
Needed for STYLE-09 fix. Add: `"disclaimer": "DIGITN AI can make mistakes. Verify important information."` in en, French equivalent in fr.

### 🟡 I18N-03 — Missing `nav.activePlan` key
Needed for STYLE-10 fix. Add: `"activePlan": "Active plan"` in en, `"Plan actif"` in fr.

### 🟡 I18N-04 — Arabic (`ar.json`) not audited — likely incomplete
The Arabic translation file exists but wasn't included in this audit. Given the platform was built primarily in French/English, Arabic strings are likely placeholder or missing entirely for newer features.

---

## 6. MISSING FEATURES (referenced in code but not implemented)

### 🟠 FEAT-01 — Bell/notifications button is a dead UI element
**See STYLE-04** — remove or stub properly.

### 🟡 FEAT-02 — "Forgot password" link exists in login page but no route/handler
**File:** `src/app/auth/login/page.tsx`
The i18n has `forgotPassword` key but there's no `/auth/forgot-password` page or Supabase password reset flow.
**Fix:** Either implement Supabase `resetPasswordForEmail` flow, or remove the link until it's ready.

### 🟡 FEAT-03 — Admin sidebar has `FiUsers`, `FiActivity`, `FiSettings` imports but no Users or Activity pages
**File:** `src/app/admin/layout.tsx`
Only "Overview" is linked. Users/Activity pages are imported but don't exist.
**Fix:** Remove unused nav links and imports from admin layout.

---

## SUMMARY TABLE

| # | Severity | Category | File(s) | Fix Effort |
|---|----------|----------|---------|------------|
| BUG-01 | 🔴 | Bug | Sidebar.tsx | 5 min |
| BUG-02 | 🔴 | Bug/Security | signup/page.tsx | 2 min |
| BUG-03 | 🔴 | Bug | subscriptions/create/route.ts | 2 min |
| BUG-04 | 🟠 | Bug | builder/stream/[id]/route.ts | 10 min |
| BUG-05 | 🟠 | Style | ProjectPreview.tsx | 5 min |
| BUG-06 | 🟠 | Bug | Header.tsx | 5 min |
| BUG-07 | 🟠 | Bug | chat/stream/route.ts | 10 min |
| BUG-08 | 🟡 | Quality | admin/layout.tsx | 2 min |
| BUG-09 | 🟡 | Bug | Sidebar.tsx | 5 min |
| BUG-10 | 🟡 | UX | LanguageSwitcher.tsx | 5 min |
| STYLE-01 | 🟠 | Style | BuildProgress.tsx | 5 min |
| STYLE-02 | 🟠 | Style | ProjectPreview.tsx | 3 min |
| STYLE-03 | 🟠 | Style | settings/page.tsx | 3 min |
| STYLE-04 | 🟠 | UX | Header.tsx | 2 min |
| STYLE-05 | 🟡 | Style | Sidebar.tsx | 5 min |
| STYLE-06 | 🟡 | Style | auth pages | 10 min |
| STYLE-07 | 🟡 | Style | admin/layout.tsx | 5 min |
| STYLE-08 | 🟡 | Code | MessageBubble.tsx | 5 min |
| STYLE-09 | 🟡 | i18n | ChatInput.tsx | 5 min |
| STYLE-10 | 🟡 | i18n | Sidebar.tsx | 5 min |
| STYLE-11 | 🟢 | UX | BuildProgress.tsx | 5 min |
| CODE-01 | 🟠 | Quality | 2 route files | 20 min |
| CODE-02 | 🟠 | Quality | 2 route files | 15 min |
| CODE-03 | 🟠 | Quality | subscriptions route | 10 min |
| CODE-04 | 🟡 | Quality | MessageBubble.tsx | 5 min |
| CODE-05 | 🟡 | Quality | ChatInterface.tsx | 3 min |
| CODE-06 | 🟡 | UX | builder/page.tsx | 15 min |
| CODE-07 | 🟡 | Quality | ThemeToggle.tsx | 3 min |
| CODE-08 | 🟢 | UX | platform routes | 30 min |
| CODE-09 | 🟢 | UX | platform routes | 20 min |
| SEC-01 | 🔴 | Security | platform.ts | 5 min |
| SEC-02 | 🟠 | Security | signup/page.tsx | 2 min |
| SEC-03 | 🟡 | Security | api/admin/config | 5 min |
| I18N-01 | 🟡 | i18n | fr.json, en.json | 5 min |
| I18N-02 | 🟡 | i18n | fr.json, en.json | 5 min |
| I18N-03 | 🟡 | i18n | fr.json, en.json | 5 min |
| I18N-04 | 🟡 | i18n | ar.json | 60 min |
| FEAT-01 | 🟠 | UX | Header.tsx | 5 min |
| FEAT-02 | 🟡 | UX | auth/login | 30 min |
| FEAT-03 | 🟡 | Quality | admin/layout.tsx | 5 min |

---

## RECOMMENDED IMPLEMENTATION ORDER

### Phase 1 — Critical fixes (all 🔴) — do first, ~20 min total
1. SEC-01: BRIDGE_SECRET guard
2. BUG-01 + BUG-09: Sidebar dashboard nav key
3. BUG-02 + SEC-02: OAuth redirect URL
4. BUG-03: Konnect `full_name` → `name`

### Phase 2 — High-impact 🟠 fixes — ~90 min total
5. BUG-07: Move quota increment after successful bridge call
6. CODE-01: Extract quota logic to shared lib
7. CODE-02: Use TIERS from platform.ts in API routes
8. STYLE-03: Settings upgrade button dark mode fix
9. BUG-05: ProjectPreview badge dark mode fix
10. STYLE-04/FEAT-01: Bell button — remove or stub
11. STYLE-02: Mobile preview height

### Phase 3 — Polish & consistency 🟡 — ~60 min total
12. STYLE-05/06/07: Use DigItnLogo in sidebar, auth, admin
13. CODE-04/05: Move inline `<style>` to globals.css
14. STYLE-08: Remove conflicting `prose` class from MessageBubble
15. STYLE-09/10 + I18N-01/02/03: i18n gaps
16. BUG-10: Language switcher soft reload

### Phase 4 — Enhancements 🟢
17. CODE-08/09: loading.tsx + error.tsx for all platform routes
18. STYLE-11: BuildProgress empty state
19. FEAT-02: Forgot password flow
