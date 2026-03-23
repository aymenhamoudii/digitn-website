# Database Migration Fix

## Issue
The original migration (001_initial_schema.sql) was partially run, causing policy conflicts.

## Solution
Use the new safe migration script: `002_safe_update.sql`

## Steps to Fix

### 1. Run the Safe Migration
Open Supabase SQL Editor and run:
```sql
supabase/migrations/002_safe_update.sql
```

This script:
- ✅ Checks if columns exist before adding them
- ✅ Drops and recreates constraints safely
- ✅ Creates tables only if they don't exist
- ✅ Drops policies before recreating them
- ✅ Verifies all changes at the end

### 2. Verify the Migration
After running, you should see:
```
status: "Tables created/updated successfully"
builder_chat_messages_exists: 1
analysis_result_exists: 1
questionnaire_answers_exists: 1
```

### 3. Verify Tables Manually
Run this query to check all tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- admin_config
- builder_chat_messages ✅ NEW
- conversations
- messages
- projects (with new columns)
- subscriptions
- usage_quotas
- users

### 4. Verify New Columns
Check projects table has new columns:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY column_name;
```

Should include:
- analysis_result (jsonb) ✅ NEW
- questionnaire_answers (text) ✅ NEW

### 5. Verify Status Constraint
Check that 'analyzing' status is allowed:
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.projects'::regclass 
AND conname = 'projects_status_check';
```

Should show: `CHECK (status IN ('analyzing', 'planning', 'building', 'ready', 'failed', 'expired'))`

### 6. Test Insert
Try creating a project with 'analyzing' status:
```sql
-- This should work without errors
INSERT INTO projects (user_id, name, description, status, type)
VALUES (
  (SELECT id FROM users LIMIT 1),
  'Test Project',
  'Test description',
  'analyzing',
  'website'
);

-- Clean up test
DELETE FROM projects WHERE name = 'Test Project';
```

## What Was Fixed

1. **Added Missing Columns:**
   - `projects.analysis_result` (JSONB) - Stores AI questionnaire
   - `projects.questionnaire_answers` (TEXT) - Stores user responses

2. **Updated Status Constraint:**
   - Added 'analyzing' to allowed project statuses

3. **Created New Table:**
   - `builder_chat_messages` - For post-build modifications

4. **Added RLS Policy:**
   - Users can only access chat messages for their own projects

5. **Added Index:**
   - `idx_builder_chat_messages_project` for performance

## Troubleshooting

### Error: "column already exists"
✅ Safe migration handles this - it checks before adding

### Error: "policy already exists"
✅ Safe migration drops policy before recreating

### Error: "constraint already exists"
✅ Safe migration drops constraint before recreating

### Error: "table already exists"
✅ Safe migration uses CREATE TABLE IF NOT EXISTS

## After Migration

Once migration is complete, you can:
1. Start the platform: `npm run dev`
2. Test builder flow: Follow TESTING_GUIDE.md
3. Verify everything works

## Rollback (if needed)

If you need to rollback:
```sql
-- Remove new columns
ALTER TABLE projects DROP COLUMN IF EXISTS analysis_result;
ALTER TABLE projects DROP COLUMN IF EXISTS questionnaire_answers;

-- Drop new table
DROP TABLE IF EXISTS builder_chat_messages;

-- Restore old constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('planning', 'building', 'ready', 'failed', 'expired'));
```

---

**Status:** Ready to run
**File:** supabase/migrations/002_safe_update.sql
**Safe:** Yes - checks before modifying
