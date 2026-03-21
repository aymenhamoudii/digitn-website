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
