# DIGITN Platform - Troubleshooting Guide

## Issue: Bridge Returns 404 or HTML Instead of JSON

### Symptoms
- POST to bridge endpoints returns HTML (Next.js 404 page)
- Bridge appears to be running but doesn't respond correctly
- Error: "Bridge returned 404" or "Bridge returned 500"

### Root Cause
Next.js dev server is running on port 3001, conflicting with the bridge server.

### Solution

**Check what's on port 3001:**
```bash
netstat -ano | grep ":3001"
```

If you see multiple processes, you need to:

1. **Kill the Next.js process:**
   ```bash
   # Find the PID from netstat output
   taskkill //F //PID <PID_NUMBER>
   ```

2. **Verify bridge is working:**
   ```bash
   curl http://127.0.0.1:3001/build/start \
     -H "Authorization: Bearer sec_digitn_89x_bridge_f3q9v2p4k7m1l5" \
     -H "Content-Type: application/json" \
     -d '{"projectId":"test","planText":"test","userId":"test"}'
   ```
   
   Should return: `{"success":true,"projectId":"test"}`

3. **Start Next.js on correct port (3000):**
   ```bash
   npm run dev
   ```

### Correct Setup

**Terminal 1 - Next.js (port 3000):**
```bash
npm run dev
```
Should show: `ready - started server on 0.0.0.0:3000`

**Terminal 2 - Bridge (port 3001):**
```bash
cd bridge
node server.js
```
Should show: `AI Bridge running on http://127.0.0.1:3001`

### Verification

**Test Next.js:**
```bash
curl http://localhost:3000
```
Should return HTML homepage

**Test Bridge:**
```bash
curl http://127.0.0.1:3001/build/start \
  -H "Authorization: Bearer sec_digitn_89x_bridge_f3q9v2p4k7m1l5" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test","planText":"test","userId":"test"}'
```
Should return JSON: `{"success":true,"projectId":"test"}`

---

## Issue: Database Migration Errors

See: MIGRATION_FIX.md

---

## Issue: Build Fails Immediately

### Symptoms
- Project status goes to 'failed' immediately
- No build output in terminal

### Possible Causes

1. **Claude Code CLI not installed:**
   ```bash
   npm list -g @anthropic-ai/claude-code
   ```
   
   If not found:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **9Router not running:**
   ```bash
   curl http://localhost:20128/v1/models
   ```
   
   Should return list of models

3. **Bridge can't write to project directory:**
   ```bash
   mkdir -p /var/www/projects /var/www/zips
   chmod 755 /var/www/projects /var/www/zips
   ```

---

## Issue: Quota Not Working

### Symptoms
- Can create unlimited projects
- Quota doesn't increment

### Solution

1. **Verify database migration ran:**
   ```sql
   SELECT * FROM usage_quotas LIMIT 1;
   ```

2. **Check date format:**
   ```sql
   SELECT date FROM usage_quotas;
   ```
   Should show: `YYYY-MM-DD-chat` or `YYYY-MM-DD-builder`

3. **Run safe migration:**
   See: MIGRATION_FIX.md

---

## Issue: Preview Not Loading

### Symptoms
- Iframe shows blank or 404
- Project status is 'ready' but no preview

### Solution

1. **Check project files exist:**
   ```bash
   ls /var/www/projects/[project-id]
   ```

2. **Check Nginx configuration:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Verify serve_path in database:**
   ```sql
   SELECT id, serve_path, public_url FROM projects WHERE id = 'project-id';
   ```

---

## Issue: Chat Modifications Not Working

### Symptoms
- Can't send messages after build completes
- Chat input disabled

### Solution

1. **Verify project status is 'ready':**
   ```sql
   SELECT id, status FROM projects WHERE id = 'project-id';
   ```

2. **Check builder_chat_messages table exists:**
   ```sql
   SELECT * FROM builder_chat_messages LIMIT 1;
   ```
   
   If error, run: supabase/migrations/002_safe_update.sql

3. **Verify bridge route is mounted:**
   Check bridge/server.js has:
   ```javascript
   app.use('/builder', builderChatRoutes);
   ```

---

## Quick Diagnostics

**Check all services:**
```bash
# Next.js (should be on 3000)
curl http://localhost:3000

# Bridge (should be on 3001)
curl http://127.0.0.1:3001/build/start \
  -H "Authorization: Bearer sec_digitn_89x_bridge_f3q9v2p4k7m1l5" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test","planText":"test","userId":"test"}'

# 9Router (should be on 20128)
curl http://localhost:20128/v1/models
```

**Check ports:**
```bash
netstat -ano | grep -E ":(3000|3001|20128)"
```

**Check processes:**
```bash
ps aux | grep -E "node|next"
```

---

## Getting Help

1. Check this troubleshooting guide
2. Review MIGRATION_FIX.md for database issues
3. Follow TESTING_GUIDE.md for verification steps
4. Check QUICK_START.md for setup instructions

---

**Last Updated:** 2026-03-23
**Status:** Bridge working correctly on port 3001
