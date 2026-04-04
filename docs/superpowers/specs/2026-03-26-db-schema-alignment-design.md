# 2026-03-26 DB Schema Alignment with `001_fresh_reset.sql`

## Goal
Make `supabase/migrations/001_fresh_reset.sql` the single source of truth for the DIGITN app and bridge database contract. Remove code paths that still assume older schema behavior, silent fallback behavior that hides broken DB state, and API logic that diverges from the migration.

## Why this work is needed
Current code has drift in several critical areas:

- admin authorization logic is inconsistent and partly unsecured
- quota and tier handling mixes static config, dynamic config, and silent `free` fallbacks
- project and builder persistence still assumes older field semantics in some routes
- subscription/webhook writes do not cleanly match the schema contract
- some APIs bypass RLS safely only in some places and unsafely in others

These mismatches explain symptoms like admin access not working, accounts behaving like free/FAST unexpectedly, and data reads/writes becoming unreliable after a reset migration.

## Source of truth
The target contract is `supabase/migrations/001_fresh_reset.sql`, especially:

- `public.users`
  - `tier`: `free | pro | plus`
  - `role`: `user | admin`
- `public.admin_config`
  - `bridge_settings`
  - `tier_limits` with explicit `chat_requests_per_day`, `builder_requests_per_day`, `max_active_projects`
  - `free_models`
  - `paid_models`
- `public.usage_quotas`
  - keyed by `user_id + date`
  - application currently uses `YYYY-MM-DD-chat` and `YYYY-MM-DD-builder` string keys in `date`
- `public.projects`
  - `type`: `website | webapp | ecommerce | api`
  - `stack` stored separately
  - builder state fields such as `current_phase`, `current_task`, `error`, `serve_path`, `zip_path`
- `public.builder_chat_messages`
  - structured terminal-event log using `event_type`, `task_name`, `phase`, `sequence_number`, `metadata`
- `public.build_jobs`
  - queue metadata including `answers`, `claimed_by`, `worker_id`
- `public.subscriptions`
  - generic provider contract centered on `provider`, `provider_subscription_id`, `current_period_end`

## Scope

### In scope
1. Auth and admin alignment
2. Tier, quota, and dynamic config alignment
3. Project, builder, build job, and terminal-history alignment
4. Subscription and payment webhook alignment
5. Safer failure behavior when profile/config rows are missing
6. Verification against the reset migration contract

### Out of scope
1. Unrelated UI redesign
2. New product features
3. Large refactors that do not serve schema alignment
4. Adding compatibility shims for the old schema beyond what is required to land the migration-first model

## Design decisions

### 1. Admin authorization will be role-based everywhere
All admin checks will use `public.users.role = 'admin'`.

Implementation direction:
- create a shared server-only helper for:
  - authenticated user lookup
  - `public.users` profile lookup
  - admin-role verification
  - service-role client creation after authorization passes
- use that helper in:
  - `src/middleware.ts`
  - `src/app/admin/layout.tsx`
  - all `/api/admin/*` routes
- treat `contact@digitn.tech` as bootstrap behavior handled by the migration trigger, not as the runtime authorization rule

Expected outcome:
- no drift between DB role policy and app admin policy
- no unauthenticated access to admin config/stats/users endpoints

### 2. Missing user/profile state will stop degrading silently to `free`
Code currently falls back to `free` in many places if `public.users` lookup fails.

Implementation direction:
- create one shared server helper for loading the current profile
- use explicit failure handling when auth exists but profile row is missing
- only use default tier values where they are clearly safe and intentional
- add consistent logging around profile/config lookup failure points

Expected outcome:
- fewer false “FAST/free” behaviors caused by missing DB state
- clearer debugging when reset data is incomplete

### 3. Tier limits will use the reset migration’s explicit dual-quota shape
The app will standardize on:
- `chat_requests_per_day`
- `builder_requests_per_day`
- `max_active_projects`

Implementation direction:
- update dynamic limit readers to consume only the explicit fields above
- remove old `requests_per_day` assumptions and chat=`builder*5` derivation
- align admin limits UI and API payloads with the same JSON shape
- align dashboard/settings displays with the same effective values used by backend enforcement

Expected outcome:
- chat and builder quotas behave and display consistently
- admin changes do not rewrite config into an incompatible shape

### 4. Project type and stack semantics will be separated correctly
The reset migration constrains `projects.type` to broad categories and stores stack separately.

Implementation direction:
- ensure project creation/analyze routes write valid `projects.type` values only
- store detailed stack values in `projects.stack`
- remove any route that still writes stack values directly into `type`, or rewrite it to map correctly

Expected outcome:
- project inserts comply with the DB check constraint
- stack-specific UI still works without corrupting the schema contract

### 5. Builder history will align to the structured terminal-event model
`builder_chat_messages` is now a terminal-event log, not a plain chat transcript.

Implementation direction:
- use `sequence_number` semantics consistently when reconstructing terminal history
- use `get_terminal_history()` where appropriate
- persist modification-time file/status events in structured form instead of only embedding them inside freeform assistant text
- decide whether deletion should gain a real event type or stay represented as structured status metadata; choose one consistent representation across DB, bridge, and UI

Expected outcome:
- page refresh reconstructs terminal history reliably
- modification/build history better matches the schema already in place

### 6. Build jobs will align with the fields already present in the migration
The migration includes `answers`, `claimed_by`, and `worker_id`.

Implementation direction:
- either persist `answers` when queuing jobs or remove usage assumptions around it
- choose a single worker-ownership field contract and use it consistently
- align job creation, claiming, completion, and retry flows to the chosen contract

Expected outcome:
- build queue data is internally consistent
- retry/worker diagnostics become easier to reason about

### 7. File-serving routes will use DB-backed project paths
The reset migration stores `serve_path` and `zip_path` explicitly.

Implementation direction:
- use `projects.serve_path` and `projects.zip_path` from DB where routes currently reconstruct file system paths heuristically
- keep ownership checks before file access

Expected outcome:
- file serving matches the DB contract used by the builder
- fewer path mismatches across environments

### 8. Subscription writes will match the generic schema contract
The reset migration uses provider-agnostic subscription fields.

Implementation direction:
- normalize Stripe/Konnect webhook writes to supported fields like `provider_subscription_id` and `current_period_end`
- remove or remap provider-specific DB columns that are no longer part of the reset schema contract
- make subscription-create derive the acting user from authenticated session, not request body `userId`

Expected outcome:
- payment upgrades persist cleanly against the actual schema
- less chance of silent webhook write failures

## File groups likely to change

### Auth/admin
- `src/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts` (new or rewritten shared helper)
- `src/app/admin/layout.tsx`
- `src/app/api/admin/config/route.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/auth/callback/route.ts`

### Tier/quota/config
- `src/lib/quota.ts`
- `src/config/platform.ts`
- `src/app/(platform)/layout.tsx`
- `src/app/(platform)/app/page.tsx`
- `src/app/(platform)/app/settings/page.tsx`
- `src/app/admin/limits/page.tsx`
- `src/app/api/chat/stream/route.ts`
- `src/app/api/builder/analyze/route.ts`
- `src/app/api/builder/start/route.ts`
- `src/app/api/builder/chat/route.ts`
- `src/app/api/builder/chat/[id]/route.ts`

### Projects/builder/build jobs
- `src/app/api/builder/create/route.ts`
- `src/app/api/projects/[id]/route.ts`
- `src/app/api/projects/[id]/files/route.ts`
- `src/app/api/projects/[id]/[...path]/route.ts`
- `src/app/(platform)/app/builder/terminal/[id]/page.tsx`
- `bridge/src/routes/build.js`
- `bridge/src/routes/chat.js`
- `bridge/src/routes/builder-analyze.js`
- `bridge/src/lib/direct-builder.js`
- `bridge/src/lib/direct-chat.js`
- `bridge/src/workers/job-queue.js`
- `bridge/src/workers/build-worker.js`

### Payments/subscriptions
- `src/app/api/subscriptions/create/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/webhooks/konnect/route.ts`

## Verification plan
Before considering the work complete:

1. verify every admin route is protected server-side
2. verify no user/profile lookup silently downgrades to `free` in critical paths
3. verify tier-limits reads/writes use explicit chat/builder keys
4. verify project inserts use valid `projects.type` values and separate `stack`
5. verify builder terminal history still loads and streams correctly
6. verify subscription webhooks write only supported schema fields
7. verify app/bridge code references match `001_fresh_reset.sql`

## Risks and mitigations

### Risk: broad code churn
Mitigation:
- group work by contract area
- keep changes schema-focused
- avoid unrelated refactors

### Risk: UI copy and backend behavior drift during rollout
Mitigation:
- update backend helpers first
- then update pages/components that display derived limits/state

### Risk: payment flow regressions
Mitigation:
- keep provider-specific logic at the API layer and map it into the generic DB schema at the final write boundary

## Success criteria
The work is successful when:
- admin access is determined solely by the DB role model in the reset migration
- free/pro/plus behavior matches `public.users.tier` without hidden fallback masking
- quota/config UI and backend enforcement use the same dual-quota contract
- project and builder persistence comply with the reset migration fields and constraints
- payment webhooks persist subscription data using the reset schema contract
- the app no longer behaves differently from what `001_fresh_reset.sql` defines
