# Build System Fixed - 2026-03-23

## Problem
The snake game build was failing with 500 errors. The issue was that multiple Node.js processes were running on conflicting ports, preventing the Bridge server from starting correctly.

## Root Cause
- Multiple Next.js dev server instances were running on ports 3000, 3001, 3002, 3003, 3004
- Bridge server couldn't bind to port 3001 because Next.js was using it
- API requests to `/api/builder/start` were hitting Next.js instead of the Bridge

## Solution Applied

### 1. Cleaned Up Processes
Killed all conflicting Node.js processes to free up ports.

### 2. Started Services in Correct Order

**Bridge Server (Port 3001):**
```bash
cd bridge
node server.js > bridge.log 2>&1 &
```

**Next.js Dev Server (Port 3000):**
```bash
PORT=3000 npm run dev > nextjs.log 2>&1 &
```

### 3. Verified Services

**Bridge Status:**
```bash
curl http://127.0.0.1:3001/build/start \
  -H "Authorization: Bearer sec_digitn_89x_bridge_f3q9v2p4k7m1l5" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test","planText":"test","userId":"test"}'
```
✓ Returns: `{"success":true,"projectId":"test"}`

**Next.js Status:**
```bash
curl http://localhost:3000
```
✓ Returns: HTML homepage

## Current Status

### ✅ Services Running
- **Next.js**: http://localhost:3000
- **Bridge**: http://127.0.0.1:3001
- **Environment**: All variables configured in `.env.local`

### ✅ Configuration Verified
- `BRIDGE_URL=http://localhost:3001`
- `BRIDGE_SECRET=sec_digitn_89x_bridge_f3q9v2p4k7m1l5`
- Supabase credentials present
- API routes exist at `src/app/api/builder/`

## How to Start Services (Correct Way)

### Terminal 1 - Bridge Server
```bash
cd bridge
node server.js
```
Should show: `AI Bridge running on http://127.0.0.1:3001`

### Terminal 2 - Next.js
```bash
npm run dev
```
Should show: `ready - started server on 0.0.0.0:3000`

## Testing the Build System

1. **Login** to the platform at http://localhost:3000/auth/login
2. **Go to Builder** at http://localhost:3000/app/builder
3. **Create a project** (e.g., "snake game")
4. **Watch the build** in the terminal view

## Important Notes

- **Never run Next.js on port 3001** - that's reserved for Bridge
- **Always start Bridge first** to ensure it gets port 3001
- **Check ports before starting**: `netstat -ano | grep -E ":(3000|3001)"`
- **Kill conflicting processes**: Find PID with netstat, then `taskkill //F //PID <PID>`

## Files Modified
- None - this was a process management issue, not a code issue

## Next Steps
The build system is now ready to use. Try creating a new project through the web interface.
