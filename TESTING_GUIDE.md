# Testing Guide - DIGITN Platform

## Prerequisites

Before testing, ensure:
- ✅ Database migration has been run in Supabase
- ✅ `.env.local` file is configured with all required variables
- ✅ Dependencies installed: `npm install` (root) and `cd bridge && npm install`
- ✅ 9Router is running at `localhost:20128`
- ✅ Claude Code CLI is installed: `npm install -g @anthropic-ai/claude-code`

---

## Starting the Platform

### Terminal 1: Next.js Frontend
```bash
npm run dev
```
Should start at: http://localhost:3000

### Terminal 2: Bridge Server
```bash
cd bridge
npm start
```
Should start at: http://localhost:3001

### Terminal 3: 9Router (if not already running)
```bash
# Follow 9Router installation instructions
# Should be accessible at http://localhost:20128
```

---

## Test Plan

### 1. Authentication Flow ✓

#### Sign Up
1. Navigate to http://localhost:3000/auth/signup
2. Enter email and password
3. Click "Sign Up"
4. **Expected:** User created, redirected to /app dashboard
5. **Check:** User appears in Supabase `users` table with `tier='free'`

#### Login
1. Navigate to http://localhost:3000/auth/login
2. Enter credentials
3. Click "Login"
4. **Expected:** Redirected to /app dashboard

#### Logout
1. Click logout button in sidebar
2. **Expected:** Redirected to login page

---

### 2. Dashboard ✓

1. Navigate to /app
2. **Check:**
   - Welcome message with user name
   - Tier badge (DIGITN FAST for free tier)
   - Quota stats card showing "0 / 10" for builder
   - Projects count
   - Preview time (15 min)
   - Quick action cards for Chat and Builder

---

### 3. Chat Mode ✓

#### Create New Chat
1. Click "Chat with AI" from dashboard
2. Type a message: "Hello, what can you help me with?"
3. Click send
4. **Expected:**
   - Message appears immediately
   - AI response streams in real-time
   - Chat quota increments by 1
   - Conversation saved to database

#### Check Quota
1. Open browser DevTools → Network tab
2. Send a chat message
3. **Check:** POST to `/api/chat/stream`
4. **Verify in DB:**
   ```sql
   SELECT * FROM usage_quotas
   WHERE user_id = 'your-user-id'
   AND date = '2026-03-23-chat';
   ```
   Should show `requests_used = 1`

#### Chat History
1. Refresh page
2. **Expected:** Previous messages load from database
3. Send another message
4. **Expected:** Conversation continues

---

### 4. Builder Mode - Complete Flow ✓

#### Step 1: Create Project
1. Click "Project Builder" from dashboard
2. Fill form:
   - **Stack:** Select "React + Tailwind CSS"
   - **Name:** "Test Restaurant Site"
   - **Description:** "A simple restaurant website with a menu page, about page, and contact form. Use modern design with images."
3. Click "Start Building"

**Expected:**
- POST to `/api/builder/analyze`
- Builder quota increments by 1
- Project created with status 'analyzing'

#### Step 2: AI Analysis
**Scenario A: Clear Description (No Questionnaire)**
- Redirects directly to `/app/builder/terminal/[id]`
- Build starts immediately

**Scenario B: Vague Description (Questionnaire Needed)**
- Redirects to `/app/builder/questionnaire/[id]`
- Shows 3-6 multiple-choice questions
- Example questions:
  - "What's the visual style?" (Modern / Classic / Minimalist)
  - "What colors?" (Warm / Cool / Neutral)
  - "Include online ordering?" (Yes / No)

#### Step 3: Answer Questionnaire (if shown)
1. Select answers for all questions
2. Click "Start Building"
3. **Expected:**
   - POST to `/api/builder/start` with answers
   - Redirects to `/app/builder/terminal/[id]`

#### Step 4: Watch Build Stream
1. Terminal page loads
2. **Expected:**
   - Header shows project name and status "building"
   - Terminal displays real-time logs:
     ```
     > Initializing workspace for Test Restaurant Site...
     Starting Claude Code agent (Model: free tier)...
     [Claude Code output streams here...]
     ```
   - Status badge changes: analyzing → building → ready
   - Build takes 2-5 minutes

**Verify in DB:**
```sql
SELECT status, serve_path, public_url, zip_path
FROM projects
WHERE id = 'project-id';
```

#### Step 5: Build Complete
**Expected:**
- Terminal shows: `> ✓ Build complete! Your project is ready.`
- Status changes to "ready"
- Preview iframe appears (right side on desktop)
- Download ZIP button appears
- Chat input becomes enabled

#### Step 6: Preview Project
1. **Check:** iframe loads at `/projects/[id]/`
2. **Verify:** Generated website displays correctly
3. **Test:** Click around the generated site

#### Step 7: Download ZIP
1. Click "Download ZIP"
2. **Expected:** Downloads `[project-id].zip`
3. Extract and verify files are present

#### Step 8: Modify Project via Chat
1. Type in chat input: "Change the header background to blue"
2. Press Enter
3. **Expected:**
   - Message appears in terminal
   - POST to `/api/builder/chat/[id]`
   - Builder quota increments by 1
   - Claude Code runs in project directory
   - Modification streams in terminal
   - Preview iframe refreshes automatically
   - Status briefly shows "modifying" then back to "ready"

**Verify in DB:**
```sql
SELECT * FROM builder_chat_messages
WHERE project_id = 'project-id'
ORDER BY created_at;
```
Should show user message and assistant response.

#### Step 9: Project Expiry
1. Wait 15 minutes (or manually update DB for testing)
2. **Expected:**
   - Project status changes to 'expired'
   - Files deleted from `/var/www/projects/[id]`
   - ZIP deleted from `/var/www/zips/[id].zip`

**Test Expiry Manually:**
```sql
UPDATE projects
SET expires_at = NOW() - INTERVAL '1 minute'
WHERE id = 'project-id';
```
Wait 2 minutes for cleanup cron to run.

---

### 5. Quota System Testing ✓

#### Test Separate Quotas
1. Send 5 chat messages
2. Create 2 builder projects
3. **Verify in DB:**
   ```sql
   SELECT * FROM usage_quotas
   WHERE user_id = 'your-user-id'
   AND date LIKE '2026-03-23-%';
   ```
   Should show:
   - `2026-03-23-chat` with `requests_used = 5`
   - `2026-03-23-builder` with `requests_used = 2`

#### Test Quota Limits (Free Tier)
1. Create 10 builder projects (free tier limit)
2. Try to create 11th project
3. **Expected:**
   - Error: "Builder limit reached. Resets at midnight — or upgrade your plan."
   - HTTP 429 status
   - No project created

#### Test Quota Reset
1. **Manually test by updating date:**
   ```sql
   UPDATE usage_quotas
   SET date = '2026-03-22-builder'
   WHERE user_id = 'your-user-id';
   ```
2. Create new project
3. **Expected:** New quota row created for today

---

### 6. Projects Page ✓

1. Navigate to /app/projects
2. **Expected:**
   - List of all user's projects
   - Status badges (analyzing/building/ready/expired)
   - Created date
   - Click project → opens terminal page

---

### 7. Settings/Billing ✓

1. Navigate to /app/settings
2. **Check:**
   - Current tier displayed
   - Quota limits shown
   - Upgrade buttons (if Stripe/Konnect configured)

---

### 8. Admin Dashboard ✓

1. Login with `contact@digitn.tech`
2. Navigate to /admin
3. **Expected:**
   - Stats cards (total users, PRO count, PLUS count)
   - 9Router configuration form
   - Can update API key

**Test with non-admin:**
- Should redirect to /app (middleware blocks access)

---

## Error Scenarios to Test

### 1. Bridge Server Down
1. Stop bridge server
2. Try to create project
3. **Expected:** Error message, graceful failure

### 2. 9Router Down
1. Stop 9Router
2. Try to send chat message
3. **Expected:** Error message from bridge

### 3. Invalid Project ID
1. Navigate to `/app/builder/terminal/invalid-uuid`
2. **Expected:** 404 page

### 4. Unauthorized Access
1. Logout
2. Try to access `/app/builder`
3. **Expected:** Redirect to login

### 5. Expired Project Access
1. Access expired project terminal
2. **Expected:** Shows expired status, no chat input

---

## Database Verification Queries

### Check User Creation
```sql
SELECT id, email, tier, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

### Check Quotas
```sql
SELECT u.email, q.date, q.requests_used, q.requests_limit
FROM usage_quotas q
JOIN users u ON u.id = q.user_id
WHERE q.date LIKE '2026-03-23-%'
ORDER BY q.date;
```

### Check Projects
```sql
SELECT p.id, p.name, p.status, p.type, u.email, p.created_at
FROM projects p
JOIN users u ON u.id = p.user_id
ORDER BY p.created_at DESC
LIMIT 10;
```

### Check Builder Chat History
```sql
SELECT m.role, m.content, m.created_at, p.name
FROM builder_chat_messages m
JOIN projects p ON p.id = m.project_id
WHERE p.id = 'project-id'
ORDER BY m.created_at;
```

### Check Active Projects
```sql
SELECT id, name, status, expires_at
FROM projects
WHERE status IN ('analyzing', 'building', 'ready')
AND expires_at > NOW()
ORDER BY created_at DESC;
```

---

## Performance Checks

### 1. Build Time
- **Expected:** 2-5 minutes for simple projects
- **Monitor:** Bridge terminal for Claude Code output

### 2. Chat Response Time
- **Expected:** First token within 1-2 seconds
- **Monitor:** Network tab for SSE stream

### 3. Preview Load Time
- **Expected:** Instant (served by Nginx)
- **Check:** iframe loads without delay

---

## Common Issues & Solutions

### Issue: "Bridge not responding"
**Solution:** Check bridge server is running on port 3001

### Issue: "Build fails immediately"
**Solution:**
- Check Claude Code CLI is installed
- Verify 9Router is accessible
- Check bridge has write permissions to /var/www/projects

### Issue: "Quota not incrementing"
**Solution:** Check date format in usage_quotas table matches `YYYY-MM-DD-{type}`

### Issue: "Preview not loading"
**Solution:**
- Check Nginx is serving /projects/[id]
- Verify serve_path in database matches actual directory

### Issue: "Chat modifications not working"
**Solution:**
- Check project status is 'ready'
- Verify builder_chat_messages table exists
- Check bridge builder-chat route is mounted

---

## Success Criteria

✅ All authentication flows work
✅ Dashboard displays correct data
✅ Chat mode works with streaming
✅ Builder creates projects successfully
✅ Questionnaire appears when needed
✅ Build streams in real-time
✅ Preview displays generated project
✅ Post-build chat modifies project
✅ Separate quotas for chat and builder
✅ Quota limits enforced correctly
✅ Projects expire after 15 minutes
✅ Admin dashboard accessible only to owner

---

**Testing Date:** 2026-03-23
**Platform Version:** 1.0.0
**Status:** Ready for Testing
