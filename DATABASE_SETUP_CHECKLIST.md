# Database Setup Checklist for DIGITN Platform

## ✅ Required Database Setup

### 1. Run the Migration SQL
**Location:** `supabase/migrations/001_initial_schema.sql`

**How to run:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `deccdkiiegniqbvqredq`
3. Go to **SQL Editor**
4. Copy the entire contents of `001_initial_schema.sql`
5. Paste and click **Run**

This will create:
- ✅ `users` table (extends auth.users)
- ✅ `usage_quotas` table (tracks daily chat/builder requests)
- ✅ `subscriptions` table (payment records)
- ✅ `conversations` table (chat sessions)
- ✅ `messages` table (chat messages)
- ✅ `projects` table (builder projects)
- ✅ `builder_chat_messages` table (project modification chat)
- ✅ `admin_config` table (dynamic settings)
- ✅ All RLS policies
- ✅ All indexes
- ✅ Trigger for auto-creating user records

### 2. Disable Email Confirmation (CRITICAL)
**Why:** Users can't log in if email confirmation is required but not configured

**How to disable:**
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Email**
3. Toggle **OFF** the "Confirm email" option
4. Click **Save**

### 3. Enable Google OAuth (Optional but Recommended)
**How to enable:**
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Google**
3. Toggle **ON** "Enable Google provider"
4. Add your Google OAuth credentials:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)
5. Add authorized redirect URL: `https://deccdkiiegniqbvqredq.supabase.co/auth/v1/callback`
6. Click **Save**

### 4. Verify Tables Exist
Run this query in SQL Editor to check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'users',
  'usage_quotas',
  'subscriptions',
  'conversations',
  'messages',
  'projects',
  'builder_chat_messages',
  'admin_config'
)
ORDER BY table_name;
```

You should see all 8 tables listed.

### 5. Verify RLS is Enabled
Run this query:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'users',
  'usage_quotas',
  'subscriptions',
  'conversations',
  'messages',
  'projects',
  'builder_chat_messages',
  'admin_config'
);
```

All tables should show `rowsecurity = true`.

### 6. Verify Admin Config Data
Run this query:

```sql
SELECT key, value
FROM admin_config
ORDER BY key;
```

You should see:
- `bridge_settings`
- `free_models`
- `paid_models`
- `tier_limits`

### 7. Test User Creation
1. Try signing up with a test email
2. Check if user appears in `users` table:

```sql
SELECT id, email, tier, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

## 🔧 Environment Variables Check

Make sure `.env.local` has:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://deccdkiiegniqbvqredq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Your anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Your service role key

# Bridge
BRIDGE_SECRET=sec_digitn_89x_bridge_f3q9v2p4k7m1l5
BRIDGE_URL=http://localhost:3001

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Konnect (if using Tunisian payments)
KONNECT_API_KEY=...
KONNECT_WALLET_ID=...

# App
NEXT_PUBLIC_APP_URL=https://digitn.tech  # or http://localhost:3000 for dev
```

## 🚀 Quick Test After Setup

1. **Sign up** with a test account
2. **Check dashboard** - should show quota (10 builder requests for free tier)
3. **Create a project** - should start building
4. **Check projects table**:
   ```sql
   SELECT id, name, status, created_at
   FROM projects
   ORDER BY created_at DESC
   LIMIT 5;
   ```
5. **Download ZIP** - should work
6. **Refresh preview** - should not show 404

## ❌ Common Issues

### Issue: "relation 'public.users' does not exist"
**Solution:** Run the migration SQL in Supabase SQL Editor

### Issue: "new row violates row-level security policy"
**Solution:** Check that RLS policies are created (step 5 above)

### Issue: Users can't sign up
**Solution:** Disable email confirmation (step 2 above)

### Issue: "handle_new_user() does not exist"
**Solution:** The trigger wasn't created. Re-run the migration SQL

### Issue: Quota not working
**Solution:** Check `usage_quotas` table exists and has the UNIQUE constraint on (user_id, date)

## 📝 Notes

- The migration is **idempotent** - safe to run multiple times
- All tables use UUID primary keys
- RLS is enabled on all tables for security
- The `handle_new_user()` trigger automatically creates a user record when someone signs up
- Admin config is protected - only service role can write to it
