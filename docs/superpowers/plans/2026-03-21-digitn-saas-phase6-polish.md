# DIGITN SaaS Platform — Phase 6: Polish & Auto-Cleanup Implementation Plan

**Goal:** Implement the auto-cleanup script to enforce the 15-minute project preview limit and polish the platform with a smooth user experience.

**Architecture:** A standalone Node.js script (`bridge/cleanup.js`) running on a timer (cron or interval) on the VPS. It queries Supabase for any `projects` where `expires_at < now()`, deletes the physical files from `/var/www/projects/[id]/`, removes the ZIP from `/var/www/zips/[id].zip`, and updates the database status to `expired`.

**Tech Stack:** Node.js, `fs/promises`, `@supabase/supabase-js`, `node-cron`

---

## File Structure

### Bridge Scripts
- Create: `bridge/cleanup.js` — The cron script that wipes expired projects
- Modify: `bridge/server.js` — Ensure cleanup runs automatically alongside the bridge

---

## Task 1: Auto-Cleanup Cron Script

**Files:**
- Modify: `bridge/package.json`
- Create: `bridge/cleanup.js`
- Modify: `bridge/server.js`

- [x] **Step 1: Install node-cron in Bridge**

```bash
cd bridge && npm install node-cron
```

- [x] **Step 2: Create cleanup script**

Create `bridge/cleanup.js`:
```javascript
require('dotenv').config({ path: '../.env.local' });
const fs = require('fs/promises');
const path = require('path');
const cron = require('node-cron');
const { supabase } = require('./src/lib/supabase');

async function cleanupExpiredProjects() {
  console.log('[Cleanup] Running expired project cleanup...', new Date().toISOString());

  try {
    // 1. Find all projects that have expired but are still marked as ready/building
    const { data: expiredProjects, error } = await supabase
      .from('projects')
      .select('id, serve_path, zip_path')
      .lt('expires_at', new Date().toISOString())
      .neq('status', 'expired');

    if (error) throw error;

    if (!expiredProjects || expiredProjects.length === 0) {
      return;
    }

    console.log(`[Cleanup] Found ${expiredProjects.length} expired projects.`);

    for (const project of expiredProjects) {
      console.log(`[Cleanup] Wiping project: ${project.id}`);

      // 2. Delete project directory
      if (project.serve_path) {
        try {
          await fs.rm(project.serve_path, { recursive: true, force: true });
        } catch (err) {
          console.error(`[Cleanup Error] Failed to delete dir ${project.serve_path}:`, err.message);
        }
      }

      // 3. Delete ZIP file
      if (project.zip_path) {
        try {
          await fs.rm(project.zip_path, { force: true });
        } catch (err) {
          console.error(`[Cleanup Error] Failed to delete zip ${project.zip_path}:`, err.message);
        }
      }

      // 4. Update Database
      await supabase
        .from('projects')
        .update({
          status: 'expired',
          serve_path: null,
          public_url: null,
          zip_path: null
        })
        .eq('id', project.id);
    }
  } catch (err) {
    console.error('[Cleanup Error] Critical failure:', err);
  }
}

// Export for manual running or mounting in server.js
module.exports = { cleanupExpiredProjects };

// If run directly from CLI
if (require.main === module) {
  cleanupExpiredProjects().then(() => process.exit(0));
}
```

- [x] **Step 3: Mount Cron Job in Express Server**

Modify `bridge/server.js`. Add this to the very bottom, right before `app.listen()`:
```javascript
const cron = require('node-cron');
const { cleanupExpiredProjects } = require('./cleanup');

// Run cleanup every 2 minutes
cron.schedule('*/2 * * * *', () => {
  cleanupExpiredProjects();
});
console.log('Cleanup cron job scheduled (runs every 2 minutes)');
```

- [x] **Step 4: Commit**

```bash
git add bridge/
git commit -m "feat(bridge): add auto-cleanup cron for 15-minute project expiry"
```

---

## Verification

After completing the task:
- [x] Check `bridge/package.json` has `node-cron` installed
- [x] Ensure `bridge/cleanup.js` uses Service Role keys to update the database
- [x] Run `npm run build` in the main directory to ensure no Typescript errors

Which execution approach do you prefer?
1. Subagent-Driven
2. Inline Execution