# DIGITN SaaS Platform — Phase 5: Admin Dashboard Implementation Plan

**Goal:** Build a secure Admin Dashboard allowing the owner to monitor platform usage, view active subscriptions, and configure 9Router AI models and API keys dynamically without redeploying the app.

**Architecture:** A protected Next.js route `/admin` (only accessible by users with `email === 'admin@digitn.tech'` or a specific DB flag). It queries the `admin_config`, `users`, and `usage_quotas` tables in Supabase.

**Tech Stack:** Next.js Server Components, Supabase, Tailwind CSS, React Hook Form

---

## File Structure

### API & Components
- Create: `src/app/admin/layout.tsx` — specific admin shell
- Create: `src/app/admin/page.tsx` — main dashboard (Stats & Config)
- Create: `src/app/api/admin/config/route.ts` — API to update 9Router settings
- Modify: `src/middleware.ts` — add admin email check for `/admin`

---

## Task 1: Admin Route Protection

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Update middleware to protect `/admin`**

Edit `src/middleware.ts` to add a check for the admin email:

```typescript
  // Protect platform routes
  if (path.startsWith('/app')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Protect admin routes - Change this email to your actual admin email
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
    if (user.email !== 'contact@digitn.tech') { // Replace with actual admin email later
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: secure admin routes via middleware"
```

---

## Task 2: Create Admin Layout & Dashboard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create Admin Layout**

Create `src/app/admin/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FiHome, FiSettings, FiUsers, FiActivity } from 'react-icons/fi'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'contact@digitn.tech') redirect('/app')

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-full border-r border-[var(--border)] bg-[var(--bg-secondary)] z-40">
        <div className="p-6 border-b border-[var(--border)]">
          <Link href="/admin" className="font-serif font-bold text-xl text-[var(--text-primary)]">DIGITN ADMIN</Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-[var(--card-bg)] rounded-md text-sm text-[var(--text-primary)] font-medium"><FiHome /> Overview</Link>
          <Link href="/app" className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--card-bg)] rounded-md text-sm text-[var(--text-secondary)] mt-auto border-t border-[var(--border)] pt-4"><FiActivity /> Exit to App</Link>
        </nav>
      </aside>

      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create Admin API to update Config**

Create `src/app/api/admin/config/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== 'contact@digitn.tech') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { key, value } = body;

  const { error } = await supabase.from('admin_config').update({ value }).eq('key', key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Create Admin Dashboard UI**

Create `src/app/admin/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [config, setConfig] = useState<any>({ base_url: '', auth_token: '' });
  const [stats, setStats] = useState({ users: 0, pro: 0, plus: 0 });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Load config
      const { data: cfg } = await supabase.from('admin_config').select('value').eq('key', 'bridge_settings').single();
      if (cfg) setConfig(cfg.value);

      // Load stats
      const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: pro } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'pro');
      const { count: plus } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'plus');

      setStats({ users: users || 0, pro: pro || 0, plus: plus || 0 });
    }
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'bridge_settings', value: config })
    });
    if (res.ok) toast.success('Configuration 9Router sauvegardée');
    else toast.error('Erreur de sauvegarde');
    setSaving(false);
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-serif text-[var(--text-primary)] mb-8">System Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">Total Users</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.users}</p>
        </div>
        <div className="p-6 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">PRO Subscriptions</p>
          <p className="text-3xl font-bold text-[var(--accent)]">{stats.pro}</p>
        </div>
        <div className="p-6 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">PLUS Subscriptions</p>
          <p className="text-3xl font-bold text-green-600">{stats.plus}</p>
        </div>
      </div>

      {/* 9Router Config */}
      <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-6">9Router Configuration</h2>
      <form onSubmit={handleSaveConfig} className="max-w-2xl bg-[var(--card-bg)] p-8 rounded-xl border border-[var(--border)] space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">9Router Base URL</label>
          <input
            type="url"
            value={config.base_url}
            onChange={e => setConfig({...config, base_url: e.target.value})}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Auth Token (API Key)</label>
          <input
            type="password"
            value={config.auth_token}
            onChange={e => setConfig({...config, auth_token: e.target.value})}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] outline-none"
            placeholder="sk-..."
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/app/admin/ src/app/api/admin/
git commit -m "feat: add admin dashboard for 9Router configuration"
```

---

## Verification

- [ ] Run `npm run build` to verify no errors.
- [ ] Make sure `contact@digitn.tech` matches the intended admin email.