# DB Schema Alignment Implementation Plan

**Goal:** Align the Next.js app and bridge code with `supabase/migrations/001_fresh_reset.sql` so auth/admin, quotas, projects, builder history, and subscriptions all use the same database contract.

**Architecture:** Introduce shared server-side helpers for profile/admin/config access, then update each DB-touching surface area to use those helpers and the reset-migration field shapes. Keep the migration as the single source of truth and remove silent fallback behavior that hides broken DB state.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase SSR/Auth, Supabase service-role helpers, Express bridge, PostgreSQL RPC/functions, Vitest

---

## File structure map

### Auth/admin contract
- Modify: `src/middleware.ts` — gate `/admin` by `public.users.role`
- Modify/Create: `src/lib/supabase/admin.ts` — centralize authenticated-user, profile, admin-role, config validation, and service-role helpers
- Modify: `src/app/admin/layout.tsx` — reuse shared admin guard
- Modify: `src/app/api/admin/config/route.ts` — require admin auth on GET and POST and validate `tier_limits` writes
- Modify: `src/app/api/admin/stats/route.ts` — require admin auth before service-role access
- Modify: `src/app/api/admin/users/route.ts` — require admin auth and validate tier writes
- Modify: `src/app/auth/callback/route.ts` — verify or repair profile row assumptions after session exchange

### Tier/quota/config contract
- Modify: `src/lib/quota.ts` — use explicit dual-quota config shape and stricter profile/config handling
- Modify: `src/config/platform.ts` — keep display constants compatible with reset migration terminology
- Modify: `src/app/(platform)/layout.tsx` — stop masking missing profile state as free tier
- Modify: `src/app/(platform)/app/page.tsx` — render limits/stats consistent with backend contract
- Modify: `src/app/(platform)/app/settings/page.tsx` — show separate chat/builder limits and accurate active-project counting
- Modify: `src/app/admin/limits/page.tsx` — read/write `chat_requests_per_day`, `builder_requests_per_day`, `max_active_projects`
- Modify: `src/app/api/chat/stream/route.ts` — use stricter tier/profile lookup
- Modify: `src/app/api/builder/analyze/route.ts` — use stricter tier/profile lookup and updated active-project messaging
- Modify: `src/app/api/builder/start/route.ts` — use stricter tier/profile lookup
- Modify: `src/app/api/builder/chat/route.ts` — use stricter tier/profile lookup
- Modify: `src/app/api/builder/chat/[id]/route.ts` — use stricter tier/profile lookup
- Test: `src/test/unit/quota.test.ts`
- Test: `src/test/unit/active-project-limits.test.ts`
- Test: `src/test/unit/tier-limits-ui.test.ts`

### Projects/builder/build jobs contract
- Modify: `src/app/api/builder/create/route.ts` — stop writing stack into `projects.type`
- Modify: `src/app/api/projects/[id]/route.ts` — align project detail reads with reset-schema fields
- Modify: `src/app/api/projects/[id]/files/route.ts` — verify `serve_path` contract remains consistent
- Modify: `src/app/api/projects/[id]/[...path]/route.ts` — use DB-backed `serve_path`
- Modify: `src/app/(platform)/app/builder/terminal/[id]/page.tsx` — consume structured terminal history safely
- Modify: `bridge/src/routes/build.js` — align build-job writes with schema fields
- Modify: `bridge/src/routes/chat.js` — align conversation/message writes and profile/tier reads with reset-schema assumptions
- Modify: `bridge/src/routes/builder-analyze.js` — align project creation fields and messaging
- Modify: `bridge/src/lib/direct-builder.js` — preserve structured terminal-event semantics
- Modify: `bridge/src/lib/direct-chat.js` — read/write structured builder history correctly
- Modify: `bridge/src/workers/job-queue.js` — persist `answers` and chosen worker ownership fields consistently
- Modify: `bridge/src/workers/build-worker.js` — align claimed worker fields with schema
- Test: `src/test/unit/project-create.test.ts`
- Test: `src/test/unit/project-files.test.ts`
- Test: `src/test/unit/builder-history.test.ts`
- Test: `src/test/unit/bridge-chat-route.test.ts`
- Test: `src/test/unit/build-jobs.test.ts`

### Payments/subscriptions contract
- Modify: `src/app/api/subscriptions/create/route.ts` — derive acting user from session instead of request body
- Modify: `src/app/api/webhooks/stripe/route.ts` — write only reset-schema subscription fields
- Modify: `src/app/api/webhooks/konnect/route.ts` — write only reset-schema subscription fields
- Test: `src/test/unit/subscriptions.test.ts`

---

### Task 1: Add shared profile/admin Supabase helpers

**Files:**
- Modify/Create: `src/lib/supabase/admin.ts`
- Modify: `src/lib/supabase/server.ts`
- Test: `src/test/unit/supabase-admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from 'vitest'
import { getAuthenticatedUser, getCurrentProfile, requireAdmin } from '@/lib/supabase/admin'

describe('supabase admin helpers', () => {
  it('throws when auth user is missing', async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any
    await expect(getAuthenticatedUser(supabase)).rejects.toThrow('Unauthorized')
  })

  it('throws when profile row is missing', async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })) })) })),
    } as any
    await expect(getCurrentProfile(supabase)).rejects.toThrow('User profile not found')
  })

  it('throws when user role is not admin', async () => {
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }) },
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { id: 'u1', role: 'user' }, error: null }) })) })) })),
    } as any
    await expect(requireAdmin(supabase)).rejects.toThrow('Forbidden')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/test/unit/supabase-admin.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
export async function getAuthenticatedUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return user
}

export async function getCurrentProfile(supabase: SupabaseClient) {
  const user = await getAuthenticatedUser(supabase)
  const { data, error } = await supabase.from('users').select('id,email,role,tier').eq('id', user.id).single()
  if (error || !data) throw new Error('User profile not found')
  return { user, profile: data }
}

export async function requireAdmin(supabase: SupabaseClient) {
  const { user, profile } = await getCurrentProfile(supabase)
  if (profile.role !== 'admin') throw new Error('Forbidden')
  return { user, profile }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/test/unit/supabase-admin.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/admin.ts src/lib/supabase/server.ts src/test/unit/supabase-admin.test.ts
git commit -m "refactor: centralize profile and admin supabase helpers"
```

### Task 2: Secure admin middleware, layout, and API routes

**Files:**
- Modify: `src/middleware.ts`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/app/api/admin/config/route.ts`
- Modify: `src/app/api/admin/stats/route.ts`
- Modify: `src/app/api/admin/users/route.ts`
- Test: `src/test/unit/admin-routes.test.ts`
- Test: `src/test/unit/middleware-admin.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it, vi } from 'vitest'
import { GET as getConfig, POST as postConfig } from '@/app/api/admin/config/route'
import { GET as getStats } from '@/app/api/admin/stats/route'
import { GET as getUsers, PATCH as patchUser } from '@/app/api/admin/users/route'

vi.mock('@/lib/supabase/admin', () => ({
  requireAdmin: vi.fn().mockRejectedValue(new Error('Forbidden')),
  getSupabaseAdminClient: vi.fn(),
}))

describe('admin routes', () => {
  it('returns 403 for GET /api/admin/config when requester is not admin', async () => {
    const res = await getConfig(new Request('http://localhost/api/admin/config?key=bridge_settings'))
    expect(res.status).toBe(403)
  })

  it('returns 403 for POST /api/admin/config when requester is not admin', async () => {
    const res = await postConfig(new Request('http://localhost/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'tier_limits', value: {} }),
    }))
    expect(res.status).toBe(403)
  })

  it('returns 403 for GET /api/admin/stats when requester is not admin', async () => {
    const res = await getStats(new Request('http://localhost/api/admin/stats'))
    expect(res.status).toBe(403)
  })

  it('returns 403 for GET /api/admin/users when requester is not admin', async () => {
    const res = await getUsers(new Request('http://localhost/api/admin/users'))
    expect(res.status).toBe(403)
  })

  it('returns 403 for PATCH /api/admin/users when requester is not admin', async () => {
    const res = await patchUser(new Request('http://localhost/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', newTier: 'plus' }),
    }))
    expect(res.status).toBe(403)
  })
})
```

Add a middleware test that verifies `/admin` redirects when `public.users.role !== 'admin'`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/admin-routes.test.ts src/test/unit/middleware-admin.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
export async function GET(req: Request) {
  const supabase = createServerClient()
  try {
    await requireAdmin(supabase)
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminClient = getSupabaseAdminClient()
  // proceed with DB read
}
```

For middleware, use a middleware-compatible role lookup with the request-bound Supabase client created inside `src/middleware.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/admin-routes.test.ts src/test/unit/middleware-admin.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts src/app/admin/layout.tsx src/app/api/admin/config/route.ts src/app/api/admin/stats/route.ts src/app/api/admin/users/route.ts src/test/unit/admin-routes.test.ts src/test/unit/middleware-admin.test.ts
git commit -m "fix: enforce role-based admin authorization"
```

### Task 3: Repair auth callback/profile-row handling

**Files:**
- Modify: `src/app/auth/callback/route.ts`
- Modify: `src/lib/supabase/admin.ts`
- Test: `src/test/unit/auth-callback.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('auth callback', () => {
  it('redirects with profile_missing when session exchange succeeds but profile repair fails', async () => {
    expect('replace with route assertion').toBe('redirects to login')
  })

  it('repairs the public.users row when missing and repair is safe', async () => {
    expect('replace with helper assertion').toBe('profile repaired')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/auth-callback.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
if (!error) {
  const repaired = await ensureUserProfile(supabase)
  if (!repaired) {
    return NextResponse.redirect(`${origin}/auth/login?error=profile_missing`)
  }
  return NextResponse.redirect(`${origin}${next}`)
}
```

Add `ensureUserProfile(...)` that repairs only from authenticated session data when safe.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/auth-callback.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/callback/route.ts src/lib/supabase/admin.ts src/test/unit/auth-callback.test.ts
git commit -m "fix: repair missing user profile after auth callback"
```

### Task 4: Update quota helpers to the reset-migration dual-quota contract

**Files:**
- Modify: `src/lib/quota.ts`
- Modify: `src/test/unit/quota.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { getQuotaStats } from '@/lib/quota'

describe('quota helpers', () => {
  it('reads explicit chat and builder limits from admin_config', async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({
            data: { value: { free: { chat_requests_per_day: 50, builder_requests_per_day: 10, max_active_projects: 1 } } },
            error: null,
          }) }),
        }),
      }),
    } as any

    const stats = await getQuotaStats(supabase, 'u1', 'free')
    expect(stats.chat.limit).toBe(50)
    expect(stats.builder.limit).toBe(10)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/test/unit/quota.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
return {
  builderRequestsPerDay: tierConfig.builder_requests_per_day ?? TIERS[tier as Tier]?.builderRequestsPerDay,
  chatRequestsPerDay: tierConfig.chat_requests_per_day ?? TIERS[tier as Tier]?.chatRequestsPerDay,
  maxActiveProjects: tierConfig.max_active_projects ?? TIERS[tier as Tier]?.maxActiveProjects,
}
```

Remove legacy `requests_per_day` and `* 5` compatibility logic.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/test/unit/quota.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/quota.ts src/test/unit/quota.test.ts
git commit -m "fix: align quota helpers with dual-limit config"
```

### Task 5: Stop masking missing profile/tier state as free in API routes

**Files:**
- Modify: `src/app/api/chat/stream/route.ts`
- Modify: `src/app/api/builder/start/route.ts`
- Modify: `src/app/api/builder/chat/route.ts`
- Modify: `src/app/api/builder/chat/[id]/route.ts`
- Modify: `src/app/(platform)/layout.tsx`
- Test: `src/test/unit/profile-tier-routes.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('profile-dependent routes', () => {
  it('returns 500 from chat stream when auth succeeds but public.users row is missing', async () => {
    expect('replace with route status assertion').toBe('500')
  })

  it('returns 500 from builder start when auth succeeds but tier cannot be resolved from profile', async () => {
    expect('replace with route status assertion').toBe('500')
  })

  it('does not render platform layout with a fake free tier when the profile row is missing', async () => {
    expect('replace with redirect or thrown error assertion').toBe('profile required')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/profile-tier-routes.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
const { profile } = await getCurrentProfile(supabase)
const tier = profile.tier
console.error('[profile] missing or invalid profile row for authenticated user')
```

Add consistent logging at profile/config failure points.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/profile-tier-routes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/chat/stream/route.ts src/app/api/builder/start/route.ts src/app/api/builder/chat/route.ts src/app/api/builder/chat/[id]/route.ts src/app/(platform)/layout.tsx src/test/unit/profile-tier-routes.test.ts
git commit -m "fix: require profile-backed tier lookups in app routes"
```

### Task 6: Align active-project enforcement with reset-schema limits

**Files:**
- Modify: `src/app/api/builder/analyze/route.ts`
- Modify: `src/app/(platform)/app/settings/page.tsx`
- Modify: `src/app/(platform)/app/page.tsx`
- Test: `src/test/unit/active-project-limits.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('active project limits', () => {
  it('counts analyzing, planning, building, and ready as active in builder analyze enforcement', () => {
    expect('replace with count assertion').toBe('4 active statuses counted')
  })

  it('uses the same active-project definition in settings/dashboard summaries', () => {
    expect('replace with UI data assertion').toBe('same active count')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/active-project-limits.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
const ACTIVE_PROJECT_STATUSES = ['analyzing', 'planning', 'building', 'ready'] as const
```

Use the same active-status definition in backend enforcement and UI summaries.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/active-project-limits.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/builder/analyze/route.ts src/app/(platform)/app/settings/page.tsx src/app/(platform)/app/page.tsx src/test/unit/active-project-limits.test.ts
git commit -m "fix: align active project counting with reset schema"
```

### Task 7: Align admin limits UI and platform displays with dual quotas

**Files:**
- Modify: `src/app/admin/limits/page.tsx`
- Modify: `src/app/api/admin/config/route.ts`
- Modify: `src/app/(platform)/app/page.tsx`
- Modify: `src/app/(platform)/app/settings/page.tsx`
- Modify: `src/config/platform.ts`
- Test: `src/test/unit/tier-limits-ui.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'
import { validateTierLimits } from '@/app/api/admin/config/route'

describe('tier limit views and config writes', () => {
  it('accepts only chat_requests_per_day, builder_requests_per_day, and max_active_projects for each tier', () => {
    expect(validateTierLimits({
      free: { chat_requests_per_day: 50, builder_requests_per_day: 10, max_active_projects: 1 },
      pro: { chat_requests_per_day: 300, builder_requests_per_day: 50, max_active_projects: 3 },
      plus: { chat_requests_per_day: 9999, builder_requests_per_day: 9999, max_active_projects: 999 },
    })).toBe(true)
  })

  it('rejects legacy requests_per_day payloads', () => {
    expect(validateTierLimits({ free: { requests_per_day: 10, max_active_projects: 1 } })).toBe(false)
  })
})
```

Add rendering assertions so dashboard/settings show separate Chat and Builder quotas.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/tier-limits-ui.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
const emptyLimits = {
  free: { chat_requests_per_day: 50, builder_requests_per_day: 10, max_active_projects: 1 },
  pro: { chat_requests_per_day: 300, builder_requests_per_day: 50, max_active_projects: 3 },
  plus: { chat_requests_per_day: 9999, builder_requests_per_day: 9999, max_active_projects: 999 },
}
```

Add server-side validation in `src/app/api/admin/config/route.ts` for the explicit reset-schema shape.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/tier-limits-ui.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/limits/page.tsx src/app/api/admin/config/route.ts src/app/(platform)/app/page.tsx src/app/(platform)/app/settings/page.tsx src/config/platform.ts src/test/unit/tier-limits-ui.test.ts
git commit -m "fix: align tier limit UI and config writes with reset schema"
```

### Task 8: Fix project creation to separate `type` and `stack`

**Files:**
- Modify: `src/app/api/builder/analyze/route.ts`
- Modify: `src/app/api/builder/create/route.ts`
- Modify: `bridge/src/routes/builder-analyze.js`
- Test: `src/test/unit/project-create.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('project creation', () => {
  it('stores a valid category in projects.type for next builder analyze requests', () => {
    expect('replace with payload assertion').toBe('website')
  })

  it('stores the detailed stack in projects.stack for legacy builder create requests', () => {
    expect('replace with payload assertion').toBe('react-tailwind')
  })

  it('maps bridge builder-analyze project writes to website|webapp|ecommerce|api only', () => {
    expect('replace with bridge payload assertion').toBe('webapp')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/project-create.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
const projectType = mapStackToProjectType(stack)
const projectStack = stack ?? null

await supabase.from('projects').insert({
  user_id: user.id,
  name,
  description,
  type: projectType,
  stack: projectStack,
})
```

Apply the same type/stack contract to the bridge-side analyze route.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/project-create.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/builder/analyze/route.ts src/app/api/builder/create/route.ts bridge/src/routes/builder-analyze.js src/test/unit/project-create.test.ts
git commit -m "fix: store project type and stack separately"
```

### Task 9: Use DB-backed `serve_path` and align project file serving

**Files:**
- Modify: `src/app/api/projects/[id]/route.ts`
- Modify: `src/app/api/projects/[id]/[...path]/route.ts`
- Modify: `src/app/api/projects/[id]/files/route.ts`
- Test: `src/test/unit/project-files.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('project file routes', () => {
  it('serves files from the project serve_path stored in DB', () => {
    expect('replace with serve_path assertion').toBe('/var/www/projects/p1')
  })

  it('returns project detail data without assuming stale status/path fields', () => {
    expect('replace with project route assertion').toBe('ready')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/project-files.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
const { data: project } = await supabase
  .from('projects')
  .select('id,user_id,status,serve_path,zip_path')
  .eq('id', id)
  .single()

const rootDir = project.serve_path
```

Use DB-backed paths after ownership validation in both file-serving routes and align the project detail route to the reset-schema field contract.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/project-files.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/projects/[id]/route.ts src/app/api/projects/[id]/[...path]/route.ts src/app/api/projects/[id]/files/route.ts src/test/unit/project-files.test.ts
git commit -m "fix: serve project files from db-backed paths"
```

### Task 10: Align builder terminal history reads/writes to structured events

**Files:**
- Modify: `bridge/src/lib/direct-chat.js`
- Modify: `bridge/src/lib/direct-builder.js`
- Modify: `src/app/(platform)/app/builder/terminal/[id]/page.tsx`
- Test: `src/test/unit/builder-history.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('builder history', () => {
  it('loads ordered terminal history from get_terminal_history()', () => {
    expect('replace with rpc ordering assertion').toBe('sequence ok')
  })

  it('filters plain prompt context to message events only for modification chat history', () => {
    expect('replace with event filtering assertion').toBe('message-only')
  })

  it('persists structured file/status events before the UI depends on them during refresh', () => {
    expect('replace with save_terminal_event assertion').toBe('structured event persisted')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/builder-history.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```js
const { data: history } = await supabase.rpc('get_terminal_history', {
  p_project_id: projectId,
})

const messageHistory = (history ?? []).filter((row) => row.event_type === 'message')
```

First update all event producers that the UI depends on during refresh, then switch readers to the ordered structured-event path.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/builder-history.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add bridge/src/lib/direct-chat.js bridge/src/lib/direct-builder.js src/app/(platform)/app/builder/terminal/[id]/page.tsx src/test/unit/builder-history.test.ts
git commit -m "fix: align builder history with structured terminal events"
```

### Task 11: Align bridge chat route with reset-schema profile and persistence rules

**Files:**
- Modify: `bridge/src/routes/chat.js`
- Test: `src/test/unit/bridge-chat-route.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('bridge chat route', () => {
  it('fails clearly when user tier/profile cannot be resolved instead of defaulting to free silently', () => {
    expect('replace with route error assertion').toBe('profile required')
  })

  it('writes conversations and messages using only fields supported by the reset schema', () => {
    expect('replace with insert payload assertion').toBe('schema aligned')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/bridge-chat-route.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```js
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('tier')
  .eq('id', userId)
  .single()

if (userError || !userData) {
  throw new Error('User profile required')
}
```

Also verify conversation/message inserts continue to use only reset-schema fields.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/bridge-chat-route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add bridge/src/routes/chat.js src/test/unit/bridge-chat-route.test.ts
git commit -m "fix: align bridge chat route with reset schema"
```

### Task 12: Align build-job queue fields with the reset schema

**Files:**
- Modify: `bridge/src/routes/build.js`
- Modify: `bridge/src/workers/job-queue.js`
- Modify: `bridge/src/workers/build-worker.js`
- Test: `src/test/unit/build-jobs.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('build jobs', () => {
  it('persists answers and worker ownership fields consistently', () => {
    expect('replace with job payload assertion').toBe('schema aligned')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/build-jobs.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```js
await supabase.from('build_jobs').insert({
  project_id: projectId,
  user_id: userId,
  status: 'queued',
  plan_text: planText,
  answers: answers ?? null,
  tier,
})
```

Pick one canonical worker-ownership contract (`claimed_by` and/or `worker_id`) and update queue claim/write logic consistently.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/build-jobs.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add bridge/src/routes/build.js bridge/src/workers/job-queue.js bridge/src/workers/build-worker.js src/test/unit/build-jobs.test.ts
git commit -m "fix: align build job queue fields with reset schema"
```

### Task 13: Align subscription create and webhook writes with reset schema

**Files:**
- Modify: `src/app/api/subscriptions/create/route.ts`
- Modify: `src/app/api/webhooks/stripe/route.ts`
- Modify: `src/app/api/webhooks/konnect/route.ts`
- Test: `src/test/unit/subscriptions.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'

describe('subscription persistence', () => {
  it('writes provider-agnostic subscription fields supported by the reset schema', () => {
    expect('replace with webhook payload assertion').toBe('schema aligned')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/unit/subscriptions.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```ts
const { user } = await requireAuthenticatedSession()

await adminClient.from('subscriptions').upsert({
  user_id: user.id,
  tier,
  status: 'active',
  provider: 'stripe',
  provider_subscription_id: subscription.id,
  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
})
```

Mirror the same provider-agnostic mapping for Konnect.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/test/unit/subscriptions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/subscriptions/create/route.ts src/app/api/webhooks/stripe/route.ts src/app/api/webhooks/konnect/route.ts src/test/unit/subscriptions.test.ts
git commit -m "fix: align subscription writes with reset schema"
```

### Task 14: Run verification and clean up drift

**Files:**
- Modify as needed: files changed in Tasks 1-13
- Test: relevant unit tests and repo verification commands

- [ ] **Step 1: Run focused unit tests**

Run:
```bash
npm run test -- src/test/unit/supabase-admin.test.ts src/test/unit/admin-routes.test.ts src/test/unit/middleware-admin.test.ts src/test/unit/auth-callback.test.ts src/test/unit/quota.test.ts src/test/unit/profile-tier-routes.test.ts src/test/unit/active-project-limits.test.ts src/test/unit/tier-limits-ui.test.ts src/test/unit/project-create.test.ts src/test/unit/project-files.test.ts src/test/unit/builder-history.test.ts src/test/unit/bridge-chat-route.test.ts src/test/unit/build-jobs.test.ts src/test/unit/subscriptions.test.ts
```
Expected: PASS

- [ ] **Step 2: Run type/lint verification**

Run:
```bash
npm run build
```
Expected: PASS with no type or lint regressions.

- [ ] **Step 3: Verify migration-contract references**

Run:
```bash
git diff -- src bridge supabase/migrations/001_fresh_reset.sql
```
Expected: changed code references only supported schema fields and routes no longer assume old shapes.

- [ ] **Step 4: Commit final verification fixes**

```bash
git add src bridge
git commit -m "test: verify db schema alignment against reset migration"
```
