# DIGITN SaaS Platform — Phase 1: Infrastructure & Foundation

**Goal:** Transform digitn.tech from a static Vercel site into a server-rendered Next.js 14 app running on a VPS with Nginx, Supabase DB schema, design system foundation, and i18n scaffolding — while keeping the existing French marketing page fully working.

**Architecture:** Next.js 14 App Router runs on VPS via PM2 on port 3000. Nginx sits in front, proxying `/` to Next.js and serving `/projects/` as static files. Supabase cloud handles DB + Auth. The Express AI Bridge (Phase 3) runs separately at port 3001.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (cloud), next-intl, Framer Motion, react-icons/fi, react-hot-toast, PM2, Nginx

---

## File Map

### Files to Modify
- `next.config.js` — remove `output: 'export'`, add next-intl plugin
- `tailwind.config.js` — add new color tokens, RTL plugin, dark mode
- `src/app/globals.css` — update CSS variables for design system (light + dark)
- `src/app/layout.tsx` — add next-intl provider, theme provider, update fonts
- `package.json` — add new dependencies

### Files to Move/Restructure
- `src/app/page.tsx` → `src/app/(marketing)/page.tsx`
- `src/app/layout.tsx` stays as root layout (wraps both marketing + platform)

### New Files to Create
- `src/app/(marketing)/layout.tsx` — marketing-only layout (no sidebar)
- `src/app/(platform)/layout.tsx` — platform shell with sidebar + header
- `src/app/(platform)/app/page.tsx` — dashboard placeholder
- `src/app/auth/login/page.tsx` — login page placeholder
- `src/app/auth/signup/page.tsx` — signup page placeholder
- `src/middleware.ts` — auth + locale detection (skeleton)
- `src/i18n/config.ts` — next-intl config
- `src/i18n/messages/fr.json` — French strings
- `src/i18n/messages/en.json` — English strings
- `src/i18n/messages/ar.json` — Arabic strings
- `src/lib/supabase/client.ts` — browser Supabase client
- `src/lib/supabase/server.ts` — server Supabase client
- `src/config/platform.ts` — platform-specific config (tiers, limits)
- `src/components/layout/Sidebar.tsx` — platform sidebar
- `src/components/layout/Header.tsx` — platform header
- `src/components/layout/LanguageSwitcher.tsx` — AR/FR/EN switcher
- `src/components/ui/ThemeToggle.tsx` — dark/light mode toggle
- `supabase/migrations/001_initial_schema.sql` — complete DB schema
- `ecosystem.config.js` — PM2 config for VPS
- `nginx/digitn.tech.conf` — Nginx site config

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install all new packages**

```bash
npm install @supabase/supabase-js @supabase/ssr next-intl react-hot-toast react-icons framer-motion
npm install -D @tailwindcss/typography tailwindcss-rtl
```

- [ ] **Step 2: Verify install succeeded**

```bash
npm ls @supabase/supabase-js next-intl react-hot-toast react-icons
```
Expected: all packages listed with version numbers, no errors

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add SaaS platform dependencies"
```

---

## Task 2: Update next.config.js (Remove Static Export)

**Files:**
- Modify: `next.config.js`

- [ ] **Step 1: Read current config**

```bash
cat next.config.js
```

- [ ] **Step 2: Replace config content**

Replace `next.config.js` with:

```javascript
const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
}

module.exports = withNextIntl(nextConfig)
```

- [ ] **Step 3: Verify build still compiles**

```bash
npm run build 2>&1 | tail -20
```
Expected: build completes (may show warnings, no fatal errors)

- [ ] **Step 4: Commit**

```bash
git add next.config.js
git commit -m "feat: switch from static export to SSR, add next-intl"
```

---

## Task 3: Update Design System (globals.css + tailwind.config.js)

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Update globals.css with complete design system**

Replace `:root` and add dark mode variables in `src/app/globals.css`:

```css
/* Add/replace at top of globals.css */
:root {
  /* Backgrounds */
  --bg-primary: #f8f7f5;
  --bg-secondary: #f0eee6;
  --card-bg: #eae5d9;
  --card-strong: #e0d9cc;

  /* Text */
  --text-primary: #1e1d1b;
  --text-secondary: rgba(30, 29, 27, 0.55);
  --text-tertiary: rgba(30, 29, 27, 0.35);

  /* Accents */
  --accent: #d97757;
  --accent-hover: #c4623e;
  --accent-blue: #2e6287;
  --accent-blue-hover: #245071;

  /* Borders & Shadows */
  --border: #e6e4dc;
  --border-strong: rgba(30, 29, 27, 0.15);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.1);

  /* Fonts */
  --font-serif: "Newsreader", "Playfair Display", Georgia, serif;
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

  /* Sidebar */
  --sidebar-width: 250px;
}

[data-theme="dark"] {
  --bg-primary: #121211;
  --bg-secondary: #1a1a19;
  --card-bg: #222220;
  --card-strong: #2a2a28;
  --text-primary: #e5e4d9;
  --text-secondary: rgba(229, 228, 217, 0.55);
  --text-tertiary: rgba(229, 228, 217, 0.35);
  --border: rgba(229, 228, 217, 0.1);
  --border-strong: rgba(229, 228, 217, 0.2);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.5);
}

* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
}
```

- [ ] **Step 2: Update tailwind.config.js**

Replace content of `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'card': 'var(--card-bg)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent': 'var(--accent)',
        'accent-blue': 'var(--accent-blue)',
        'border-color': 'var(--border)',
        // Keep existing marketing colors
        cream: '#f8f7f5',
        'terra-cotta': '#d97757',
      },
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
      },
      width: {
        sidebar: '250px',
      },
      maxWidth: {
        platform: '1100px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000 | grep -c "DIGITN"
```
Expected: number > 0 (page renders)

```bash
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css tailwind.config.js
git commit -m "feat: update design system with dark mode CSS variables"
```

---

## Task 4: Set Up i18n (next-intl)

**Files:**
- Create: `src/i18n/config.ts`
- Create: `src/i18n/messages/fr.json`
- Create: `src/i18n/messages/en.json`
- Create: `src/i18n/messages/ar.json`

- [ ] **Step 1: Create i18n config**

Create `src/i18n/config.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr'
  const validLocales = ['fr', 'en', 'ar']
  const safeLocale = validLocales.includes(locale) ? locale : 'fr'

  return {
    locale: safeLocale,
    messages: (await import(`./messages/${safeLocale}.json`)).default,
  }
})
```

- [ ] **Step 2: Create French translations (primary)**

Create `src/i18n/messages/fr.json`:

```json
{
  "nav": {
    "chat": "Chat",
    "builder": "Créateur",
    "projects": "Projets",
    "settings": "Paramètres",
    "admin": "Admin",
    "upgrade": "Mettre à niveau",
    "logout": "Déconnexion"
  },
  "auth": {
    "login": "Connexion",
    "signup": "Inscription",
    "email": "Email",
    "password": "Mot de passe",
    "name": "Nom",
    "loginTitle": "Bon retour",
    "signupTitle": "Créer un compte",
    "noAccount": "Pas encore de compte ?",
    "hasAccount": "Déjà un compte ?",
    "orContinueWith": "Ou continuer avec",
    "google": "Google",
    "error": "Erreur d'authentification",
    "forgotPassword": "Mot de passe oublié ?"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "welcome": "Bienvenue, {name}",
    "requestsLeft": "{count} requêtes restantes aujourd'hui",
    "recentProjects": "Projets récents",
    "noProjects": "Aucun projet encore. Commencez à créer !",
    "startBuilding": "Commencer à créer"
  },
  "chat": {
    "title": "Chat IA",
    "placeholder": "Posez-moi n'importe quelle question...",
    "send": "Envoyer",
    "thinking": "En train de réfléchir...",
    "newChat": "Nouveau chat",
    "quotaExceeded": "Quota journalier atteint. Passez à DIGITN PRO pour plus."
  },
  "builder": {
    "title": "Créateur de projets",
    "placeholder": "Décrivez le projet que vous souhaitez créer...",
    "planning": "Planification en cours...",
    "building": "Construction en cours...",
    "ready": "Votre projet est prêt !",
    "preview": "Aperçu en direct",
    "download": "Télécharger le code",
    "expiresIn": "Expire dans {time}",
    "rebuild": "Reconstruire",
    "approveplan": "Approuver ce plan",
    "editplan": "Modifier le plan"
  },
  "projects": {
    "title": "Mes projets",
    "status": {
      "building": "En construction",
      "ready": "Prêt",
      "failed": "Échec",
      "expired": "Expiré"
    },
    "empty": "Aucun projet. Créez-en un dans le Créateur !"
  },
  "pricing": {
    "title": "Choisissez votre plan",
    "free": "DIGITN FAST",
    "pro": "DIGITN PRO",
    "plus": "DIGITN PLUS",
    "freePrice": "Gratuit",
    "proPrice": "29 DT/mois",
    "plusPrice": "79 DT/mois",
    "requestsDay": "{count} requêtes/jour",
    "unlimited": "Illimité",
    "previewTime": "Aperçu {time} min",
    "choosePlan": "Choisir ce plan",
    "currentPlan": "Plan actuel"
  },
  "settings": {
    "title": "Paramètres",
    "language": "Langue",
    "theme": "Thème",
    "light": "Clair",
    "dark": "Sombre",
    "plan": "Mon plan",
    "profile": "Profil",
    "save": "Enregistrer"
  },
  "errors": {
    "generic": "Une erreur s'est produite. Réessayez.",
    "network": "Erreur réseau. Vérifiez votre connexion.",
    "unauthorized": "Non autorisé. Veuillez vous connecter."
  }
}
```

- [ ] **Step 3: Create English translations**

Create `src/i18n/messages/en.json`:

```json
{
  "nav": {
    "chat": "Chat",
    "builder": "Builder",
    "projects": "Projects",
    "settings": "Settings",
    "admin": "Admin",
    "upgrade": "Upgrade",
    "logout": "Log out"
  },
  "auth": {
    "login": "Sign in",
    "signup": "Create account",
    "email": "Email",
    "password": "Password",
    "name": "Name",
    "loginTitle": "Welcome back",
    "signupTitle": "Create your account",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "orContinueWith": "Or continue with",
    "google": "Google",
    "error": "Authentication error",
    "forgotPassword": "Forgot password?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome, {name}",
    "requestsLeft": "{count} requests left today",
    "recentProjects": "Recent projects",
    "noProjects": "No projects yet. Start building!",
    "startBuilding": "Start building"
  },
  "chat": {
    "title": "AI Chat",
    "placeholder": "Ask me anything...",
    "send": "Send",
    "thinking": "Thinking...",
    "newChat": "New chat",
    "quotaExceeded": "Daily quota reached. Upgrade to DIGITN PRO for more."
  },
  "builder": {
    "title": "Project Builder",
    "placeholder": "Describe the project you want to build...",
    "planning": "Planning your project...",
    "building": "Building your project...",
    "ready": "Your project is ready!",
    "preview": "Live preview",
    "download": "Download code",
    "expiresIn": "Expires in {time}",
    "rebuild": "Rebuild",
    "approveplan": "Approve this plan",
    "editplan": "Edit plan"
  },
  "projects": {
    "title": "My Projects",
    "status": {
      "building": "Building",
      "ready": "Ready",
      "failed": "Failed",
      "expired": "Expired"
    },
    "empty": "No projects yet. Create one in the Builder!"
  },
  "pricing": {
    "title": "Choose your plan",
    "free": "DIGITN FAST",
    "pro": "DIGITN PRO",
    "plus": "DIGITN PLUS",
    "freePrice": "Free",
    "proPrice": "$9/month",
    "plusPrice": "$25/month",
    "requestsDay": "{count} requests/day",
    "unlimited": "Unlimited",
    "previewTime": "{time} min preview",
    "choosePlan": "Choose plan",
    "currentPlan": "Current plan"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "light": "Light",
    "dark": "Dark",
    "plan": "My plan",
    "profile": "Profile",
    "save": "Save"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "network": "Network error. Check your connection.",
    "unauthorized": "Unauthorized. Please log in."
  }
}
```

- [ ] **Step 4: Create Arabic translations**

Create `src/i18n/messages/ar.json`:

```json
{
  "nav": {
    "chat": "محادثة",
    "builder": "المنشئ",
    "projects": "المشاريع",
    "settings": "الإعدادات",
    "admin": "الإدارة",
    "upgrade": "ترقية",
    "logout": "تسجيل الخروج"
  },
  "auth": {
    "login": "تسجيل الدخول",
    "signup": "إنشاء حساب",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "name": "الاسم",
    "loginTitle": "مرحباً بعودتك",
    "signupTitle": "إنشاء حسابك",
    "noAccount": "ليس لديك حساب؟",
    "hasAccount": "لديك حساب بالفعل؟",
    "orContinueWith": "أو تابع بـ",
    "google": "Google",
    "error": "خطأ في المصادقة",
    "forgotPassword": "نسيت كلمة المرور؟"
  },
  "dashboard": {
    "title": "لوحة التحكم",
    "welcome": "مرحباً، {name}",
    "requestsLeft": "{count} طلبات متبقية اليوم",
    "recentProjects": "المشاريع الأخيرة",
    "noProjects": "لا توجد مشاريع بعد. ابدأ الإنشاء!",
    "startBuilding": "ابدأ الإنشاء"
  },
  "chat": {
    "title": "محادثة الذكاء الاصطناعي",
    "placeholder": "اسألني أي شيء...",
    "send": "إرسال",
    "thinking": "جاري التفكير...",
    "newChat": "محادثة جديدة",
    "quotaExceeded": "تم استنفاد الحصة اليومية. قم بالترقية إلى DIGITN PRO للمزيد."
  },
  "builder": {
    "title": "منشئ المشاريع",
    "placeholder": "صف المشروع الذي تريد إنشاءه...",
    "planning": "جاري التخطيط للمشروع...",
    "building": "جاري بناء المشروع...",
    "ready": "مشروعك جاهز!",
    "preview": "معاينة مباشرة",
    "download": "تحميل الكود",
    "expiresIn": "ينتهي خلال {time}",
    "rebuild": "إعادة البناء",
    "approveplan": "الموافقة على هذه الخطة",
    "editplan": "تعديل الخطة"
  },
  "projects": {
    "title": "مشاريعي",
    "status": {
      "building": "قيد البناء",
      "ready": "جاهز",
      "failed": "فشل",
      "expired": "منتهي"
    },
    "empty": "لا توجد مشاريع بعد. أنشئ واحداً في المنشئ!"
  },
  "pricing": {
    "title": "اختر خطتك",
    "free": "DIGITN FAST",
    "pro": "DIGITN PRO",
    "plus": "DIGITN PLUS",
    "freePrice": "مجاني",
    "proPrice": "29 دينار/شهر",
    "plusPrice": "79 دينار/شهر",
    "requestsDay": "{count} طلبات/يوم",
    "unlimited": "غير محدود",
    "previewTime": "معاينة {time} دقيقة",
    "choosePlan": "اختر الخطة",
    "currentPlan": "الخطة الحالية"
  },
  "settings": {
    "title": "الإعدادات",
    "language": "اللغة",
    "theme": "المظهر",
    "light": "فاتح",
    "dark": "داكن",
    "plan": "خطتي",
    "profile": "الملف الشخصي",
    "save": "حفظ"
  },
  "errors": {
    "generic": "حدث خطأ. حاول مرة أخرى.",
    "network": "خطأ في الشبكة. تحقق من اتصالك.",
    "unauthorized": "غير مصرح. يرجى تسجيل الدخول."
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/i18n/
git commit -m "feat: add next-intl i18n with Arabic, French, English"
```

---

## Task 5: Set Up Supabase Clients

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `.env.local` (not committed)
- Modify: `.gitignore`

- [ ] **Step 1: Create browser Supabase client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server Supabase client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component — cookies set by middleware
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create .env.local template**

Create `.env.local` (fill in values from Supabase dashboard):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BRIDGE_SECRET=your-random-bridge-secret
BRIDGE_URL=http://localhost:3001
```

- [ ] **Step 4: Ensure .env.local is gitignored**

```bash
grep -q ".env.local" .gitignore || echo ".env.local" >> .gitignore
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/ .gitignore
git commit -m "feat: add Supabase client setup (browser + server)"
```

---

## Task 6: Create Supabase DB Schema Migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'plus')),
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('ar', 'fr', 'en')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  stripe_customer_id text,
  konnect_customer_id text
);

-- Auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- USAGE QUOTAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage_quotas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  requests_used int NOT NULL DEFAULT 0,
  requests_limit int NOT NULL DEFAULT 10,
  UNIQUE (user_id, date)
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('pro', 'plus')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  provider text NOT NULL CHECK (provider IN ('stripe', 'konnect')),
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'chat' CHECK (mode IN ('chat', 'builder')),
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  plan_json jsonb,
  status text NOT NULL DEFAULT 'building' CHECK (status IN ('planning', 'building', 'ready', 'failed', 'expired')),
  type text CHECK (type IN ('website', 'webapp', 'ecommerce', 'api')),
  serve_path text,
  public_url text,
  zip_path text,
  expires_at timestamptz,
  last_accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ADMIN CONFIG (for 9Router settings, tier limits, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert defaults
INSERT INTO public.admin_config (key, value) VALUES
  ('bridge_settings', '{"base_url": "http://localhost:20128/v1", "auth_token": "", "timeout_ms": 600000}'),
  ('tier_limits', '{"free": {"requests_per_day": 10, "preview_minutes": 15, "max_active_projects": 1}, "pro": {"requests_per_day": 50, "preview_minutes": 15, "max_active_projects": 3}, "plus": {"requests_per_day": 9999, "preview_minutes": 15, "max_active_projects": 999}}'),
  ('free_models', '["ag/gemini-3-flash", "gh/gpt-5-mini", "qw/qwen3-coder-flash"]'),
  ('paid_models', '["ag/claude-sonnet-4-6", "gh/claude-sonnet-4.6", "kr/claude-sonnet-4.5"]')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users: own row only
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Usage quotas: own rows only
CREATE POLICY "Users can read own quotas" ON public.usage_quotas
  FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: own rows only
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Conversations: own rows only
CREATE POLICY "Users can manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Messages: own rows only
CREATE POLICY "Users can manage own messages" ON public.messages
  FOR ALL USING (auth.uid() = user_id);

-- Projects: own rows only
CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_expires ON public.projects(expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_quotas_user_date ON public.usage_quotas(user_id, date);
```

- [ ] **Step 2: Run migration in Supabase dashboard**

Go to your Supabase project → SQL Editor → paste the migration → Run

Verify with:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
Expected: users, usage_quotas, subscriptions, conversations, messages, projects, admin_config

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/
git commit -m "feat: add complete DB schema with RLS policies"
```

---

## Task 7: Create Platform Config

**Files:**
- Create: `src/config/platform.ts`

- [ ] **Step 1: Create platform config**

Create `src/config/platform.ts`:

```typescript
export const TIERS = {
  free: {
    name: 'DIGITN FAST',
    requestsPerDay: 10,
    previewMinutes: 15,
    maxActiveProjects: 1,
    priority: false,
  },
  pro: {
    name: 'DIGITN PRO',
    requestsPerDay: 50,
    previewMinutes: 15,
    maxActiveProjects: 3,
    priority: true,
  },
  plus: {
    name: 'DIGITN PLUS',
    requestsPerDay: 9999,
    previewMinutes: 15,
    maxActiveProjects: 999,
    priority: true,
  },
} as const

export type Tier = keyof typeof TIERS

export const FREE_MODELS = [
  'ag/gemini-3-flash',
  'gh/gpt-5-mini',
  'qw/qwen3-coder-flash',
]

export const PAID_MODELS = [
  'ag/claude-sonnet-4-6',
  'gh/claude-sonnet-4.6',
  'kr/claude-sonnet-4.5',
]

export const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:3001'
export const BRIDGE_SECRET = process.env.BRIDGE_SECRET || ''

export const AI_IDENTITY_PROMPT = `You are DIGITN AI, an advanced AI assistant built into the DIGITN platform.
CRITICAL RULES:
1. NEVER mention your underlying model name, provider, or technology (e.g. never say Claude, Sonnet, GPT, Gemini, Anthropic, Google, OpenAI)
2. If asked what AI you are, say: "I'm DIGITN AI, the platform's built-in AI engine."
3. If asked about your capabilities, describe what you can do — not what you're built on.
4. Always respond in the same language the user writes in.`
```

- [ ] **Step 2: Commit**

```bash
git add src/config/platform.ts
git commit -m "feat: add platform config with tier definitions and AI identity rules"
```

---

## Task 8: Restructure App Routes

**Files:**
- Move: `src/app/page.tsx` → `src/app/(marketing)/page.tsx`
- Create: `src/app/(marketing)/layout.tsx`
- Modify: `src/app/layout.tsx` (root)

- [ ] **Step 1: Create marketing route group**

```bash
mkdir -p src/app/\(marketing\)
```

- [ ] **Step 2: Move marketing page**

```bash
cp src/app/page.tsx "src/app/(marketing)/page.tsx"
```

- [ ] **Step 3: Create marketing layout (minimal — no sidebar)**

Create `src/app/(marketing)/layout.tsx`:

```typescript
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

- [ ] **Step 4: Update root layout.tsx**

Replace `src/app/layout.tsx` to add NextIntlClientProvider and theme support:

```typescript
import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { siteConfig } from '@/config/site'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '800'],
  display: 'swap',
  variable: '--font-inter',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'DIGITN (Digi TN) | Agence Web Tunisie - Création Sites & E-commerce',
    template: '%s | DIGITN',
  },
  description: 'DIGITN (Digi TN) - Agence web tunisienne spécialisée dans la création de sites performants, e-commerce et solutions digitales.',
  // ... keep existing metadata
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const isRTL = locale === 'ar'

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('digitn-theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Remove the old page.tsx from root (AFTER confirming marketing copy exists)**

```bash
ls "src/app/(marketing)/page.tsx" && rm src/app/page.tsx
```

- [ ] **Step 6: Verify dev server shows marketing page**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000 | grep -c "DIGITN"
kill %1
```
Expected: number > 0

- [ ] **Step 7: Commit**

```bash
git add src/app/
git commit -m "feat: restructure into (marketing) route group, add i18n provider"
```

---

## Task 9: Create Middleware (Auth Skeleton)

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware**

Create `src/middleware.ts`:

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protect platform routes
  if (path.startsWith('/app') || path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if ((path.startsWith('/auth/login') || path.startsWith('/auth/signup')) && user) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|projects|zips|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add auth middleware protecting /app and /admin routes"
```

---

## Task 10: Create Platform Shell (Sidebar + Header)

**Files:**
- Create: `src/app/(platform)/layout.tsx`
- Create: `src/app/(platform)/app/page.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/ui/ThemeToggle.tsx`

- [ ] **Step 1: Create ThemeToggle component**

Create `src/components/ui/ThemeToggle.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('digitn-theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('digitn-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--card-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <FiMoon size={15} /> : <FiSun size={15} />}
    </button>
  )
}
```

- [ ] **Step 2: Create Sidebar**

Create `src/components/layout/Sidebar.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiMessageSquare, FiCode, FiFolder, FiSettings, FiZap, FiLogOut } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/app', icon: FiZap, key: 'chat' as const, exact: true },
  { href: '/app/chat', icon: FiMessageSquare, key: 'chat' as const },
  { href: '/app/builder', icon: FiCode, key: 'builder' as const },
  { href: '/app/projects', icon: FiFolder, key: 'projects' as const },
  { href: '/app/settings', icon: FiSettings, key: 'settings' as const },
]

export function Sidebar({ userTier }: { userTier: string }) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const tierName = userTier === 'free' ? 'DIGITN FAST'
    : userTier === 'pro' ? 'DIGITN PRO'
    : 'DIGITN PLUS'

  return (
    <aside
      style={{ width: 'var(--sidebar-width)' }}
      className="fixed left-0 top-0 h-full flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] z-40"
    >
      {/* Brand */}
      <div className="px-5 py-6 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[var(--accent)] font-light text-xl">|</span>
          <span className="font-bold text-lg tracking-[0.06em] font-serif text-[var(--text-primary)]">
            DIGITN
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 mb-3 text-[11px] uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-medium">
          Platform
        </p>
        {navItems.map(({ href, icon: Icon, key }) => {
          const isActive = href === '/app'
            ? pathname === '/app'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                isActive
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <Icon size={15} />
              {t(key)}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: tier badge + theme + logout */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-2">
        {/* Tier badge */}
        <div className="px-3 py-2 rounded-md bg-[var(--card-bg)] border border-[var(--border)]">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Plan actif</p>
          <p className="text-sm font-semibold text-[var(--accent)] mt-0.5">{tierName}</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--card-bg)]"
          >
            <FiLogOut size={14} />
            <span className="text-xs">{t('logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Create Header**

Create `src/components/layout/Header.tsx`:

```typescript
'use client'

import { FiBell } from 'react-icons/fi'

interface HeaderProps {
  title: string
  userName?: string
  requestsLeft?: number
  requestsTotal?: number
}

export function Header({ title, userName, requestsLeft, requestsTotal }: HeaderProps) {
  const pct = requestsTotal ? Math.max(0, Math.min(100, ((requestsLeft || 0) / requestsTotal) * 100)) : 100

  return (
    <header className="h-14 flex items-center justify-between px-8 border-b border-[var(--border)] bg-[var(--bg-primary)]">
      <h1 className="text-[22px] font-semibold font-serif text-[var(--text-primary)]">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Daily quota indicator */}
        {requestsLeft !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              {requestsLeft} left
            </span>
          </div>
        )}

        <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--card-bg)] text-[var(--text-secondary)]">
          <FiBell size={15} />
        </button>

        {userName && (
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center text-white text-xs font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Create platform layout**

Create `src/app/(platform)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tier, name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar userTier={userData?.tier || 'free'} />
      <main style={{ marginLeft: 'var(--sidebar-width)' }} className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Create dashboard placeholder**

```bash
mkdir -p "src/app/(platform)/app"
```

Create `src/app/(platform)/app/page.tsx`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('name, tier')
    .eq('id', user!.id)
    .single()

  const { data: quota } = await supabase
    .from('usage_quotas')
    .select('requests_used, requests_limit')
    .eq('user_id', user!.id)
    .eq('date', new Date().toISOString().split('T')[0])
    .single()

  const requestsLeft = (quota?.requests_limit || 10) - (quota?.requests_used || 0)

  return (
    <div>
      <Header
        title="Dashboard"
        userName={userData?.name || user?.email || ''}
        requestsLeft={requestsLeft}
        requestsTotal={quota?.requests_limit || 10}
      />
      <div className="px-16 py-12 max-w-platform">
        <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-2">
          Bienvenue, {userData?.name || 'utilisateur'} 👋
        </h2>
        <p className="text-[var(--text-secondary)]">
          {requestsLeft} requêtes restantes aujourd'hui
        </p>

        <div className="mt-10 grid grid-cols-2 gap-5">
          <a
            href="/app/chat"
            className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer"
          >
            <p className="text-sm uppercase tracking-[0.12em] text-[var(--text-tertiary)] mb-2">Mode</p>
            <h3 className="text-xl font-serif font-semibold text-[var(--text-primary)]">Chat IA</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Posez des questions, obtenez des réponses instantanées</p>
          </a>
          <a
            href="/app/builder"
            className="p-6 rounded-lg border border-[var(--accent)] bg-[var(--card-bg)] hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer"
          >
            <p className="text-sm uppercase tracking-[0.12em] text-[var(--accent)] mb-2">Mode</p>
            <h3 className="text-xl font-serif font-semibold text-[var(--text-primary)]">Créateur de projets</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Décrivez votre projet, l'IA le construit pour vous</p>
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/ src/components/
git commit -m "feat: add platform shell with sidebar, header, dashboard"
```

---

## Task 11: Create Auth Pages

**Files:**
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/signup/page.tsx`
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create login page**

Create `src/app/auth/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiMail, FiLock } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      router.push('/app')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-[var(--accent)] font-light text-2xl">|</span>
            <span className="font-bold text-xl tracking-[0.06em] font-serif">DIGITN</span>
          </Link>
          <h1 className="mt-4 text-2xl font-serif font-semibold text-[var(--text-primary)]">
            Bon retour
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Connectez-vous à votre compte DIGITN
          </p>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border)] p-7">
          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors mb-5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs text-[var(--text-tertiary)] bg-[var(--card-bg)] px-2">
              ou avec votre email
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Mot de passe</label>
              <div className="relative">
                <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
            Pas encore de compte ?{' '}
            <Link href="/auth/signup" className="text-[var(--accent)] hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create signup page**

Create `src/app/auth/signup/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiMail, FiLock, FiUser } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Compte créé ! Vérifiez votre email.')
      router.push('/app')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-[var(--accent)] font-light text-2xl">|</span>
            <span className="font-bold text-xl tracking-[0.06em] font-serif">DIGITN</span>
          </Link>
          <h1 className="mt-4 text-2xl font-serif font-semibold text-[var(--text-primary)]">
            Créer votre compte
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Rejoignez DIGITN gratuitement
          </p>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border)] p-7">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors mb-5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs text-[var(--text-tertiary)] bg-[var(--card-bg)] px-2">
              ou avec votre email
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Nom</label>
              <div className="relative">
                <FiUser size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Mot de passe</label>
              <div className="relative">
                <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
                  placeholder="Minimum 6 caractères"
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-[var(--accent)] hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create OAuth callback route**

Create `src/app/auth/callback/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_error`)
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/
git commit -m "feat: add login, signup, and OAuth callback pages"
```

---

## Task 12: Create PM2 Config + Nginx Config

**Files:**
- Create: `ecosystem.config.js`
- Create: `nginx/digitn.tech.conf`

- [ ] **Step 1: Create PM2 ecosystem config**

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'digitn-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/digitn',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/digitn/web-error.log',
      out_file: '/var/log/digitn/web-out.log',
    },
  ],
}
```

- [ ] **Step 2: Create Nginx site config**

Create `nginx/digitn.tech.conf`:

```nginx
# /etc/nginx/sites-available/digitn.tech

server {
    listen 80;
    server_name digitn.tech www.digitn.tech;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name digitn.tech www.digitn.tech;

    # SSL (Let's Encrypt - certbot will fill these in)
    ssl_certificate /etc/letsencrypt/live/digitn.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digitn.tech/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Serve generated projects as static files
    location /projects/ {
        alias /var/www/projects/;
        try_files $uri $uri/ $uri/index.html =404;
        expires 15m;
        add_header Cache-Control "public, max-age=900";
    }

    # Serve ZIP downloads
    location /zips/ {
        alias /var/www/zips/;
        add_header Content-Disposition 'attachment';
        add_header Content-Type 'application/zip';
    }

    # Next.js app (everything else)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # SSE support (for streaming AI responses)
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        chunked_transfer_encoding on;
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add ecosystem.config.js nginx/
git commit -m "feat: add PM2 ecosystem config and Nginx site config"
```

---

## Task 13: Final Build Verification

- [ ] **Step 1: Run full build**

```bash
npm run build 2>&1
```
Expected: ✓ Compiled successfully, all pages generated

- [ ] **Step 2: Check for TypeScript errors**

```bash
npx tsc --noEmit 2>&1
```
Expected: no errors

- [ ] **Step 3: Verify route structure**

```bash
find src/app -name "*.tsx" | sort
```
Expected: all new routes visible including `(marketing)`, `(platform)`, `auth`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: Phase 1 complete - infrastructure, design system, auth, i18n, DB schema"
```

---

## Verification Checklist

After Phase 1 is complete:

- [ ] `npm run build` succeeds with no errors
- [ ] `npm run dev` → `http://localhost:3000` shows existing French marketing page
- [ ] `http://localhost:3000/auth/login` shows login form with Google button
- [ ] `http://localhost:3000/auth/signup` shows signup form
- [ ] `http://localhost:3000/app` redirects to `/auth/login` (no auth)
- [ ] Supabase dashboard shows all 7 tables created with RLS enabled
- [ ] Dark mode toggle works (inspect `data-theme` on `<html>`)
- [ ] `ecosystem.config.js` and `nginx/digitn.tech.conf` ready for VPS deployment

**Next Phase:** Phase 2 — Chat Mode (SSE streaming, conversation history, quota enforcement)
