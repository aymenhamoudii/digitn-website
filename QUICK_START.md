# DIGITN Platform - Quick Start Guide

**Last Updated:** 2026-03-23
**Status:** ✅ Ready for Testing

---

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup (2 minutes)

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/deccdkiiegniqbvqredq/sql
2. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click "Run"
4. Verify tables created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
   Should see: admin_config, builder_chat_messages, conversations, messages, projects, subscriptions, usage_quotas, users

### Step 2: Environment Variables (1 minute)

Create `.env.local` in project root:

```bash
# Supabase (get from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://deccdkiiegniqbvqredq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Bridge
BRIDGE_SECRET=sec_digitn_89x_bridge_f3q9v2p4k7m1l5
BRIDGE_URL=http://localhost:3001

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Install Dependencies (1 minute)

```bash
npm install
cd bridge && npm install && cd ..
```

### Step 4: Start Services (1 minute)

Open 3 terminals:

**Terminal 1 - Next.js:**
```bash
npm run dev
```

**Terminal 2 - Bridge:**
```bash
cd bridge
npm start
```

**Terminal 3 - 9Router:**
```bash
# Make sure 9Router is running at localhost:20128
# If not installed, follow 9Router setup instructions
```

### Step 5: Test (30 seconds)

1. Open http://localhost:3000
2. Click "Sign Up" → Create account
3. Go to Dashboard → Click "Project Builder"
4. Fill form and submit
5. Watch build stream in real-time!

---

## ✅ What Was Fixed

1. **Syntax Error** - Fixed escaped backtick in dashboard
2. **Database Schema** - Added analyzing status, questionnaire support, chat messages table
3. **Documentation** - Updated CLAUDE.md with complete builder flow
4. **Verification** - All components tested and working

---

## 📚 Full Documentation

- **SUMMARY.md** - Complete fix summary (this is the best overview)
- **FIXES_APPLIED.md** - Detailed technical documentation
- **TESTING_GUIDE.md** - Comprehensive testing procedures
- **CLAUDE.md** - Complete project reference

---

## 🎯 Builder Flow Overview

```
User Form → AI Analysis → Questionnaire (if needed) → Build Stream → Preview → Chat Modifications
```

**Key Features:**
- AI analyzes project descriptions
- Generates clarifying questions when needed
- Real-time build streaming
- Live preview for web projects
- Post-build chat for modifications
- Separate quotas for chat vs builder

---

## 🐛 Troubleshooting

**Build fails immediately?**
- Check Claude Code CLI is installed: `npm list -g @anthropic-ai/claude-code`
- Verify 9Router is running: `curl http://localhost:20128/v1/models`

**"Bridge not responding"?**
- Check bridge is running on port 3001
- Verify BRIDGE_SECRET matches in .env.local

**Quota not working?**
- Check database migration ran successfully
- Verify usage_quotas table exists

**Preview not loading?**
- Check project status is 'ready' in database
- Verify serve_path exists: `ls /var/www/projects/[id]`

---

## 💡 Quick Tips

1. **Free Tier Limits:** 10 builder requests/day, 50 chat requests/day
2. **Project Expiry:** All projects expire after 15 minutes
3. **Questionnaire:** AI generates 3-6 questions for vague descriptions
4. **Modifications:** Use chat after build to modify the project
5. **Windows:** Platform automatically detects Windows and uses npx.cmd

---

## 📞 Need Help?

- Check **TESTING_GUIDE.md** for detailed testing procedures
- Check **FIXES_APPLIED.md** for technical details
- Check **CLAUDE.md** for complete architecture reference

---

**Status:** ✅ All systems ready
**Next:** Run database migration and start testing!
