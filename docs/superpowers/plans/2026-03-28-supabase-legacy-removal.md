# Supabase Legacy Removal and Django Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove remaining Supabase-era database dependencies, docs, SQL files, and references from the repo, and align all remaining references to the current Django-backed data flow.

**Architecture:** The app already uses Django API clients as the runtime DB access method. This plan removes leftover Supabase dependencies and stale documentation in small, verifiable steps, while preserving current app behavior. Cleanup is limited to legacy database integration surface, not unrelated product code.

**Tech Stack:** Next.js 14, TypeScript, Django REST API, Node.js bridge, Vitest, npm

---

## File Structure / Responsibility Map

### Runtime code that should remain and be clarified
- Modify: `bridge/src/lib/django-api.js`
  - Keep as the bridge's DB/API integration layer
  - Update comments that still describe behavior in Supabase terms
- Modify: `bridge/src/routes/chat.js`
  - Keep current Django-based logic
  - Only adjust stale comments if needed

### Dependency/config files that may still expose Supabase-era setup
- Modify: `package.json`
  - Remove unused Supabase packages if no active source imports remain
- Modify: `package-lock.json`
  - Regenerate after dependency removal
- Modify: `.env.example`
  - Remove Supabase variables if they are no longer required by active code
- Modify: `AGENTS.md`
  - Replace Supabase-oriented environment and architecture guidance with current Django guidance
- Modify: `CLAUDE.md`
  - Remove or rewrite stale Supabase instructions only if they conflict with the current architecture

### Legacy docs / notes to remove or rewrite
- Modify or delete: `bridge/scripts/README.md`
- Modify or delete: `bridge/src/workers/README.md`
- Delete or rewrite: `RBAC_IMPLEMENTATION_CHECKLIST.md`
- Delete or rewrite: `RBAC_IMPLEMENTATION_SUMMARY.md`
- Review for deletion: old root-level status docs and summaries that describe Supabase-first architecture

### Legacy SQL files to review
- Delete candidate: `supabase/migrations/001_fresh_reset.sql`
- Delete candidate: `supabase/migrations/002_fix_existing_users.sql`
- Delete candidate: `supabase/migrations/003_fix_quota_rpc.sql`

### Verification files
- Modify: `src/test/unit/terminal-chat-history.test.tsx` only if current cleanup touches behavior indirectly
- Test via commands rather than adding new product tests unless behavior changes

---

### Task 1: Prove current runtime no longer imports Supabase packages

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Verify: `src/**/*.ts*`
- Verify: `bridge/**/*.js`

- [ ] **Step 1: Write the failing audit check**

Create a local command checklist for the exact imports that must disappear from active source:

```bash
grep_targets='@supabase/supabase-js|@supabase/ssr|createBrowserClient|createServerClient'
```

- [ ] **Step 2: Run the audit to verify current state**

Run:

```bash
npm test -- src/test/unit/terminal-chat-history.test.tsx src/test/unit/builder-questionnaire-page.test.tsx && node -e "const fs=require('fs');const pkg=require('./package.json');const deps={...pkg.dependencies,...pkg.devDependencies};const hits=['@supabase/supabase-js','@supabase/ssr'].filter(k=>deps[k]);if(!hits.length){process.exit(0)}console.error('FOUND_DEPENDENCIES:'+hits.join(','));process.exit(1)"
```

Expected before implementation:
- existing tests pass
- dependency check fails with `FOUND_DEPENDENCIES:@supabase/supabase-js,@supabase/ssr` if those packages are still present

- [ ] **Step 3: Remove the unused Supabase packages from `package.json`**

Update dependencies so these entries are deleted:

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.1.0"
  }
}
```

Specifically remove:

```json
"@supabase/ssr": "^0.9.0",
"@supabase/supabase-js": "^2.99.3"
```

- [ ] **Step 4: Regenerate the lockfile minimally**

Run:

```bash
npm install
```

Expected:
- `package-lock.json` updates
- Supabase packages are removed from the lockfile graph if nothing else depends on them

- [ ] **Step 5: Re-run verification**

Run:

```bash
node -e "const fs=require('fs');const pkg=require('./package.json');const deps={...pkg.dependencies,...pkg.devDependencies};const hits=['@supabase/supabase-js','@supabase/ssr'].filter(k=>deps[k]);if(hits.length){console.error('FOUND_DEPENDENCIES:'+hits.join(','));process.exit(1)}console.log('OK_NO_SUPABASE_DEPS')" && npm test -- src/test/unit/terminal-chat-history.test.tsx src/test/unit/builder-questionnaire-page.test.tsx
```

Expected:
- `OK_NO_SUPABASE_DEPS`
- tests still pass

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove unused Supabase packages"
```

### Task 2: Remove Supabase SQL migrations that no longer match the active architecture

**Files:**
- Delete: `supabase/migrations/001_fresh_reset.sql`
- Delete: `supabase/migrations/002_fix_existing_users.sql`
- Delete: `supabase/migrations/003_fix_quota_rpc.sql`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Write the failing audit check**

Use the exact file list that should disappear if Supabase migration files are no longer the project DB source of truth:

```bash
supabase/migrations/001_fresh_reset.sql
supabase/migrations/002_fix_existing_users.sql
supabase/migrations/003_fix_quota_rpc.sql
```

- [ ] **Step 2: Run the audit to verify they exist now**

Run:

```bash
node -e "const fs=require('fs');const files=['supabase/migrations/001_fresh_reset.sql','supabase/migrations/002_fix_existing_users.sql','supabase/migrations/003_fix_quota_rpc.sql'];const existing=files.filter(f=>fs.existsSync(f));if(!existing.length){console.log('ALREADY_CLEAN');process.exit(0)}console.error('FOUND_SQL:'+existing.join(','));process.exit(1)"
```

Expected before implementation:
- command fails with `FOUND_SQL:...`

- [ ] **Step 3: Delete the stale SQL files**

Delete exactly these files:

```text
supabase/migrations/001_fresh_reset.sql
supabase/migrations/002_fix_existing_users.sql
supabase/migrations/003_fix_quota_rpc.sql
```

- [ ] **Step 4: Rewrite architecture guidance in `AGENTS.md`**

Update the DB and env sections to reflect the current method. Replace Supabase-oriented lines with Django-oriented guidance like:

```md
- **Backend**: Django 4.2 + Django REST Framework (in `/backend`)
- **Database access**: All app and bridge data access goes through Django API clients
```

And replace env guidance with:

```md
Required in `.env.local`:
- `NEXT_PUBLIC_API_URL` (Django, e.g. `http://localhost:8000/api`)
- `DJANGO_API_URL` (bridge-to-Django internal URL if used)
- `BRIDGE_SECRET`
- `BRIDGE_URL`
```

- [ ] **Step 5: Rewrite conflicting Supabase-first sections in `CLAUDE.md`**

Replace Supabase-specific source-of-truth guidance with Django/current architecture wording. Use edits like:

```md
- Database-backed app access flows through Django API endpoints and the clients in `src/lib/api/client.ts` and `src/lib/api/server.ts`.
- Legacy Supabase migration files are no longer the active database contract in this repository.
```

Do not rewrite unrelated product context.

- [ ] **Step 6: Re-run verification**

Run:

```bash
node -e "const fs=require('fs');const files=['supabase/migrations/001_fresh_reset.sql','supabase/migrations/002_fix_existing_users.sql','supabase/migrations/003_fix_quota_rpc.sql'];const existing=files.filter(f=>fs.existsSync(f));if(existing.length){console.error('FOUND_SQL:'+existing.join(','));process.exit(1)}console.log('OK_NO_SUPABASE_SQL')"
```

Expected:
- `OK_NO_SUPABASE_SQL`

- [ ] **Step 7: Commit**

```bash
git add AGENTS.md CLAUDE.md supabase/migrations
git commit -m "chore: remove legacy Supabase SQL files"
```

### Task 3: Rewrite stale bridge docs and comments to the Django method

**Files:**
- Modify: `bridge/src/lib/django-api.js`
- Modify: `bridge/src/workers/README.md`
- Modify: `bridge/scripts/README.md`
- Modify: `bridge/src/routes/chat.js`

- [ ] **Step 1: Write the failing audit check**

Target the stale phrases that describe old behavior:

```text
Supabase fetch
Run supabase migration to add build_jobs table
replaces Supabase
save_terminal_event
```

- [ ] **Step 2: Run the audit to verify stale text exists**

Run:

```bash
node -e "const fs=require('fs');const files=['bridge/src/lib/django-api.js','bridge/src/workers/README.md','bridge/scripts/README.md'];const terms=['Supabase fetch','Run supabase migration to add build_jobs table','Supabase','save_terminal_event'];let hits=[];for(const file of files){const text=fs.readFileSync(file,'utf8');for(const term of terms){if(text.includes(term))hits.push(file+'::'+term)}}if(!hits.length){console.log('ALREADY_CLEAN');process.exit(0)}console.error('FOUND_STALE_TEXT\n'+hits.join('\n'));process.exit(1)"
```

Expected before implementation:
- command fails with `FOUND_STALE_TEXT`

- [ ] **Step 3: Rewrite `bridge/src/lib/django-api.js` comments**

Keep the code intact but replace stale comments with Django-native wording:

```js
// ── Terminal Events ─────────────────────────────────────────────────────────
async function saveTerminalEvent({ project_id, role = 'assistant', content, event_type = 'message', task_name = null, phase = null, metadata = null }) {
```

And update the file header to:

```js
/**
 * Django API client for the bridge server.
 * Centralizes bridge-to-Django data access for users, projects, jobs, and terminal events.
 */
```

- [ ] **Step 4: Rewrite `bridge/src/workers/README.md`**

Replace the migration step block with Django/current wording:

```md
## Migration steps
1. Ensure the Django backend exposes the build job endpoints and model fields required by the worker flow
2. Wire build route to enqueue instead of direct execute
3. Start worker process alongside bridge
4. Update SSE route to read persisted terminal events from Django-backed storage
```

- [ ] **Step 5: Rewrite `bridge/scripts/README.md`**

Replace stale entries with current wording:

```md
- test-fetch.js — test Django API fetch
- test-query.js — inspect persisted builder event data
```

If the referenced script no longer exists, remove that bullet instead of renaming it.

- [ ] **Step 6: Re-run verification**

Run:

```bash
node -e "const fs=require('fs');const files=['bridge/src/lib/django-api.js','bridge/src/workers/README.md','bridge/scripts/README.md'];const terms=['Supabase fetch','Run supabase migration to add build_jobs table','save_terminal_event'];let hits=[];for(const file of files){const text=fs.readFileSync(file,'utf8');for(const term of terms){if(text.includes(term))hits.push(file+'::'+term)}}if(hits.length){console.error('FOUND_STALE_TEXT\n'+hits.join('\n'));process.exit(1)}console.log('OK_BRIDGE_DOCS_CLEAN')"
```

Expected:
- `OK_BRIDGE_DOCS_CLEAN`

- [ ] **Step 7: Commit**

```bash
git add bridge/src/lib/django-api.js bridge/src/workers/README.md bridge/scripts/README.md bridge/src/routes/chat.js
git commit -m "docs: align bridge docs with Django data flow"
```

### Task 4: Remove stale Supabase implementation notes and checklists

**Files:**
- Delete or rewrite: `RBAC_IMPLEMENTATION_CHECKLIST.md`
- Delete or rewrite: `RBAC_IMPLEMENTATION_SUMMARY.md`
- Review and delete if still present: old root-level status files about Supabase-first migration work

- [ ] **Step 1: Write the failing audit check**

Use the exact stale-note candidates:

```text
RBAC_IMPLEMENTATION_CHECKLIST.md
RBAC_IMPLEMENTATION_SUMMARY.md
```

- [ ] **Step 2: Run the audit to verify they still exist or still mention Supabase implementation output**

Run:

```bash
node -e "const fs=require('fs');const files=['RBAC_IMPLEMENTATION_CHECKLIST.md','RBAC_IMPLEMENTATION_SUMMARY.md'];const existing=files.filter(f=>fs.existsSync(f));if(!existing.length){console.log('ALREADY_CLEAN');process.exit(0)}const stale=existing.filter(f=>/supabase|getSupabaseAdminClient|SERVICE_ROLE_KEY/i.test(fs.readFileSync(f,'utf8')));if(!stale.length){console.log('NO_SUPABASE_CONTENT');process.exit(0)}console.error('FOUND_STALE_NOTES:'+stale.join(','));process.exit(1)"
```

Expected before implementation:
- command fails with `FOUND_STALE_NOTES:...` if the stale notes still contain Supabase-era implementation details

- [ ] **Step 3: Delete the stale notes if they are no longer active project docs**

Delete exactly these files if the audit confirms they are obsolete:

```text
RBAC_IMPLEMENTATION_CHECKLIST.md
RBAC_IMPLEMENTATION_SUMMARY.md
```

If one file contains still-valid Django guidance, rewrite it instead of deleting it.

- [ ] **Step 4: Re-run verification**

Run:

```bash
node -e "const fs=require('fs');const files=['RBAC_IMPLEMENTATION_CHECKLIST.md','RBAC_IMPLEMENTATION_SUMMARY.md'];const existing=files.filter(f=>fs.existsSync(f));const stale=existing.filter(f=>/supabase|getSupabaseAdminClient|SERVICE_ROLE_KEY/i.test(fs.readFileSync(f,'utf8')));if(stale.length){console.error('FOUND_STALE_NOTES:'+stale.join(','));process.exit(1)}console.log('OK_STALE_NOTES_CLEAN')"
```

Expected:
- `OK_STALE_NOTES_CLEAN`

- [ ] **Step 5: Commit**

```bash
git add RBAC_IMPLEMENTATION_CHECKLIST.md RBAC_IMPLEMENTATION_SUMMARY.md
git commit -m "docs: remove stale Supabase implementation notes"
```

### Task 5: Final repo-wide verification for active-source Supabase references

**Files:**
- Verify: `src/**`
- Verify: `bridge/**`
- Verify: `AGENTS.md`
- Verify: `CLAUDE.md`
- Verify: `.env.example`

- [ ] **Step 1: Run active-source verification**

Run:

```bash
node -e "const fs=require('fs');const path=require('path');const roots=['src','bridge'];const allow=['bridge/src/lib/django-api.js'];const hits=[];function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory()){if(['node_modules','dist','.next','projects','.claude'].includes(entry.name)) continue;walk(p);continue;}if(!/\.(ts|tsx|js|jsx|md)$/.test(entry.name)) continue;const text=fs.readFileSync(p,'utf8');if(/supabase/i.test(text)&&!allow.includes(p.replace(/\\/g,'/'))){hits.push(p.replace(/\\/g,'/'));}}}for(const root of roots){if(fs.existsSync(root)) walk(root)}for(const file of ['AGENTS.md','CLAUDE.md','.env.example']){if(fs.existsSync(file)&&/supabase/i.test(fs.readFileSync(file,'utf8'))) hits.push(file)}if(hits.length){console.error('FOUND_SUPABASE_REFERENCES\n'+hits.join('\n'));process.exit(1)}console.log('OK_NO_ACTIVE_SUPABASE_REFERENCES')"
```

Expected:
- `OK_NO_ACTIVE_SUPABASE_REFERENCES`

- [ ] **Step 2: Run behavioral verification**

Run:

```bash
npm test -- src/test/unit/terminal-chat-history.test.tsx src/test/unit/builder-questionnaire-page.test.tsx && npm run type-check
```

Expected:
- targeted tests pass
- type-check passes

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md CLAUDE.md .env.example bridge src package.json package-lock.json
git commit -m "chore: remove remaining Supabase legacy surface"
```

## Self-Review

### Spec coverage
- remove Supabase packages: covered in Task 1
- remove old SQL files: covered in Task 2
- replace Supabase references with current Django method: covered in Tasks 2-5
- keep runtime code intact while cleaning docs/comments: covered in Task 3

### Placeholder scan
- no `TODO`, `TBD`, or “appropriate handling” placeholders remain
- every task contains exact files, commands, and expected outcomes

### Type consistency
- plan consistently treats Django API clients as the active database method
- Supabase cleanup scope is limited to legacy dependencies, docs, SQL, and references
