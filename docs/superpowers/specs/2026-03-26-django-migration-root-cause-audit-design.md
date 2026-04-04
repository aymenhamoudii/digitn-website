# 2026-03-26 Django Migration Root-Cause Audit and Remediation Design

## Goal
Make Django the source of truth for app/business data across the Next.js app and bridge runtime, eliminate remaining Supabase-era contract mismatches that break project/conversation/builder flows, and verify the migration with regression tests that cover the full user-visible runtime path.

## Why this work is needed
The repo currently contains a split-brain migration state:

- the Next.js app has Django API clients in `src/lib/api/client.ts` and `src/lib/api/server.ts`
- the bridge also has a Django bridge client in `bridge/src/lib/django-api.js`
- but important runtime paths still read/write project, build queue, and stream state directly through Supabase in bridge routes and workers
- that creates mismatched ownership checks, stale response-shape assumptions, and state divergence between what Django returns and what the bridge persists

This directly explains symptoms like:

- projects not being saved where the app expects them
- projects not appearing on the projects page
- build stream fallback returning `Build not found`
- retry/build queue state drifting from project status
- page/route behavior depending on stale `user_id` vs `user` assumptions

## Source of truth
For app/business data, the authoritative contract is now Django REST API behavior, not direct Supabase table access.

### Django should own
- authenticated current user
- user profile / tier / role
- conversations and messages
- projects and project status
- questionnaire and builder state
- builder terminal events/history
- build jobs / queue state
- subscription and business-level app data returned to the frontend

### Supabase may still remain legitimate for
- underlying PostgreSQL storage used by Django
- auth/infrastructure pieces that are still intentionally external to Django, if any current runtime path truly depends on them
- non-business infrastructure configuration only where Django is not yet the serving contract

The audit must classify each remaining Supabase use as keep, replace, or verify.

## Scope

### In scope
1. Full audit of remaining Supabase usages in:
   - `src/app/api/**`
   - `src/app/(platform)/**`
   - `src/lib/api/**`
   - `bridge/src/routes/**`
   - `bridge/src/lib/**`
   - `bridge/src/workers/**`
2. Root-cause tracing of builder flow:
   - analyze
   - questionnaire
   - start
   - retry
   - stream
   - terminal
   - preview/files
   - chat modifications
   - build queue / worker
3. Root-cause tracing of auth/data flows:
   - login
   - current user
   - conversation CRUD
   - project CRUD
4. Regression tests for each confirmed runtime bug before fixing it
5. Focused fixes that remove concrete Django/Supabase contract mismatches
6. Final classification of what still intentionally uses Supabase and why

### Out of scope
1. Unrelated refactors
2. UI redesign unrelated to migration breakages
3. New product features
4. Large architectural rewrites beyond what is required to stop runtime breakages and align ownership/source-of-truth

## Design decisions

### 1. Django becomes the only business-data contract at runtime
Any route/page/worker code that currently reaches into Supabase directly for conversations, projects, build jobs, messages, or builder events is suspect and will be replaced if Django already owns that entity.

Implementation direction:
- audit every remaining direct Supabase import/use in runtime code
- replace stale direct reads/writes with the existing Django clients where endpoints already exist
- where bridge runtime needs a Django endpoint that the bridge client already assumes exists, verify the backend contract before changing callers
- keep fixes minimal and entity-specific

Expected outcome:
- no split-brain runtime between Django-returned state and Supabase-written state
- the frontend sees the same project/conversation/build state that the bridge mutates

### 2. The bridge queue/worker path is the highest-priority runtime breakage
The strongest current mismatch is in the build pipeline:

- `bridge/src/routes/build.js` enqueues jobs via Django
- but the same route falls back to Supabase for project/build status during stream reconnects
- `bridge/src/workers/job-queue.js` and `bridge/src/workers/build-worker.js` still operate directly on Supabase `build_jobs`

Implementation direction:
- trace the exact enqueue → claim → execute → update → stream-reconnect flow end-to-end
- confirm failing behavior with regression tests
- make queue ownership consistent so start/retry/stream all observe the same source of truth
- fix concrete causes of `Build not found`, stale queued/running state, and missing project visibility first

Expected outcome:
- start/retry correctly persist state visible to terminal/project pages
- stream reconnects reflect real Django-owned project/build state
- worker and route code agree on queue semantics

### 3. Project visibility bugs will be fixed at the persistence contract, not in the UI
If projects are not shown, the root cause is presumed to be missing/incorrect persistence, ownership, or response-shape alignment before any UI bug is assumed.

Implementation direction:
- trace project creation from analyze/create/start through the API layer into Django
- inspect project listing and detail routes/pages for stale response-shape assumptions
- verify `user` vs `user_id`, serializer field names, and ownership checks against Django responses
- fix the contract mismatch at the API boundary first, then adjust UI only if the UI still consumes the wrong shape

Expected outcome:
- newly created projects persist in the Django-owned data path
- projects page and terminal page receive the saved project in the shape they expect

### 4. Conversation and auth flow must stop relying on Supabase-era assumptions
The app already points at Django clients, but route/page code may still assume old fields or old auth state behavior.

Implementation direction:
- trace login/current-user flow through middleware, client token storage, server API client, and pages
- trace conversation create/list/delete/read flows and compare actual serializer fields to consuming code
- identify stale `user_id`, nested response, 403/404, and null-return assumptions
- add focused tests around current broken contracts before fixes

Expected outcome:
- authenticated state is consistent across client/server pages
- conversation CRUD uses current Django response shapes without hidden Supabase-era fallbacks

### 5. Supabase usage will be explicitly classified, not casually removed
Not every Supabase mention is stale. Some uses may still be legitimate infrastructure or storage access. The audit will separate them clearly.

Classification model:
- **Keep** — intentional infra/storage usage still required
- **Replace** — stale app/business-data path that should use Django now
- **Verify** — ambiguous; confirm via code path and test before changing

Expected outcome:
- clear final report on what remains and why
- less risk of deleting legitimate infrastructure behavior during migration cleanup

### 6. TDD is mandatory for confirmed runtime bugs
No implementation code will be changed for a confirmed bug until there is a failing regression test or equivalent focused reproduction that proves the mismatch.

Implementation direction:
- for each confirmed bug, write a failing Vitest/unit test first where feasible
- if the issue is route integration behavior, add focused route/client tests around the broken contract
- run the test and confirm it fails for the expected reason
- apply the minimal fix
- rerun the targeted test and then the combined regression suite

Expected outcome:
- each migration fix is pinned by regression coverage
- less risk of shifting bugs between Django and bridge boundaries

## File groups likely to change

### Frontend/server API contract
- `src/lib/api/client.ts`
- `src/lib/api/server.ts`
- `src/app/api/**`
- `src/app/(platform)/**`

### Bridge runtime
- `bridge/src/lib/django-api.js`
- `bridge/src/routes/build.js`
- `bridge/src/routes/chat.js`
- `bridge/src/routes/builder-analyze.js`
- `bridge/src/lib/direct-builder.js`
- `bridge/src/lib/direct-chat.js`
- `bridge/src/workers/job-queue.js`
- `bridge/src/workers/build-worker.js`

### Backend verification surface
- `backend/**` endpoints already serving bridge/app data, only if required to align an already-assumed runtime contract

### Tests
- `src/test/**`
- `bridge/src/routes/build.test.cjs`
- additional focused regression tests near the affected API/client/runtime modules

## Verification plan
Before considering the migration remediation complete:

1. enumerate all remaining runtime Supabase usages and classify them as keep/replace/verify
2. reproduce at least the current project persistence / project listing failure path
3. verify builder analyze/create/start persists project/build state in Django-visible paths
4. verify retry and stream reconnect no longer drift into `Build not found` due to split state
5. verify projects page loads newly created/saved projects from Django-backed APIs
6. verify project file/preview ownership routes match Django project ownership/state
7. verify conversation CRUD uses Django response shapes correctly
8. verify current-user/auth flow still works across client and server boundaries
9. run focused regressions after each fix and a combined regression suite at the end
10. produce a final audit of intentional Supabase usage that remains and why
