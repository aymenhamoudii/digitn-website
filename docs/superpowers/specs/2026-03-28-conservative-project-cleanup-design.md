# 2026-03-28 Conservative Project Cleanup

## Goal
Clean the repository by removing files that are clearly old, temporary, generated, or no longer aligned with the current Django + Next.js architecture, while avoiding risky deletion of active application code.

## Chosen approach
Conservative staged cleanup.

This means:
- remove obvious junk first
- remove stale tests/docs only when there is strong evidence they no longer match the current project
- keep active code unless proven dead
- put ambiguous files into a review list instead of deleting them immediately

## Why this approach
The repository currently contains a mix of:
- active product code
- generated project artifacts
- temporary debug/update scripts
- old migration/docs/status files from earlier architecture phases
- tests that may no longer reflect the current runtime

A broad delete pass would be fast but risky. The chosen approach minimizes accidental loss while still producing a meaningful cleanup.

## In scope
1. Root-level old status and summary files
2. Temporary helper scripts used for one-off edits or debugging
3. Debug logs and scratch output files
4. Generated artifacts that should not be versioned as source
5. Clearly stale tests/docs that no longer match the current architecture
6. Review of stray example or typo-named files

## Out of scope
1. Deleting active frontend/backend/bridge code without strong proof
2. Refactoring code just because it looks old
3. Broad removal of tests as a category
4. Destructive cleanup of user data or runtime project directories without explicit confirmation
5. Git history rewriting or forceful workspace cleanup

## Cleanup buckets

### Remove now
Files can go in this bucket if they are clearly one of these:
- temporary update scripts like `update_*.js`, `fix_*.js`, ad-hoc shell helpers
- old summary/checklist/result markdown or txt files that are superseded and not part of product/docs flow
- debug logs such as `*.log`, `build_output.txt`, `ts_errors.txt`
- stray typo/example files such as one-off scratch examples
- generated archives or generated project outputs that are not source of truth

### Keep
Files stay if they are:
- imported or referenced by current code
- part of the active backend/frontend/bridge architecture
- current test coverage for live routes/components
- active specs or plans still relevant to the current codebase
- config needed for local or production workflows

### Needs confirmation
Files go here if they are plausible cleanup candidates but not safe to remove automatically, such as:
- newer docs that may still be used operationally
- tests that look stale but still cover behavior not otherwise tested
- generated-looking directories that may hold user-important local data
- code modules with no obvious references but possible runtime/dynamic use

## Evidence standards before deletion
A file is only deleted automatically if one or more of these are true:
1. it is obviously temporary by name and purpose
2. it is a generated artifact, not source
3. it documents an old implementation path already replaced in the repo
4. it is incompatible with the current architecture and has no current references

If a file is only “probably unused,” it does not get deleted yet.

## Planned audit areas

### 1. Root directory cleanup
Review top-level markdown, txt, js, and log files that look like:
- implementation summaries
- debugging outputs
- one-off migration notes
- temporary patch scripts
- old result files

### 2. Generated artifacts
Review candidates such as:
- `projects/`
- `zips/`
- local logs and output dumps

These are especially likely to need confirmation if they may contain local user work.

### 3. Tests
Review tests for alignment with current architecture:
- current app uses Django API clients in `src/lib/api/client.ts` and `src/lib/api/server.ts`
- builder and terminal history behavior has changed recently
- tests tied to removed routes, removed Supabase-only flows, or replaced APIs are cleanup candidates

Tests are not removed just because they fail or look old; they must be clearly obsolete.

### 4. Docs/specs/checklists
Review docs for whether they are:
- active project documentation
- historical scratch notes
- superseded implementation notes
- duplicated by newer specs or checked-in project instructions

Older status files are strong removal candidates. Current design specs are not.

## Execution plan
1. Audit candidate files by category
2. Classify each candidate into `remove now`, `keep`, or `needs confirmation`
3. Present the exact list to the user
4. Only then delete the `remove now` set
5. Recheck the repo for obvious leftovers

## Safety constraints
- do not delete active source modules without strong proof
- do not delete runtime project data or generated user projects without explicit user confirmation
- do not remove tests unless they are clearly obsolete
- prefer specific deletions over broad directory wipes

## Expected output to user
The cleanup pass should produce a concrete review list with:
- file path
- bucket (`remove now`, `keep`, `needs confirmation`)
- short reason

Only after that review list is accepted should file deletion begin.
