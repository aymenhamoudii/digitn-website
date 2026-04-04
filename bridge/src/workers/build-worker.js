/**
 * Build Worker — queue/worker execution model (ACTIVE)
 *
 * Polls Django's build_jobs endpoint every POLL_INTERVAL_MS and executes
 * queued jobs using startDirectBuild() — same proven logic as before,
 * now dispatched via Django API for crash recovery, retries, and concurrency control.
 *
 * Each worker instance gets a unique WORKER_ID to prevent double-claiming
 * in future multi-worker deployments.
 */

const crypto = require('crypto');
const djangoApi = require('../lib/django-api');
const { startDirectBuild } = require('../lib/direct-builder');

const POLL_INTERVAL_MS = 2000;
const MAX_CONCURRENT_BUILDS = 3;
const WORKER_ID = crypto.randomUUID();

let activeBuildCount = 0;
let isRunning = false;

/**
 * On startup: reset any jobs left in 'running' from a crashed worker.
 * Delegates to Django via resetStuckBuilds().
 */
async function recoverStuckJobs() {
  console.log(`[Worker:${WORKER_ID.slice(0, 8)}] Recovering stuck jobs from previous crash...`);
  await djangoApi.resetStuckBuilds();
  console.log('[Worker] Recovery complete.');
}

/**
 * Claim the next available queued job via Django.
 */
async function claimNextJob() {
  return djangoApi.claimNextBuildJob();
}

/**
 * Execute a claimed build job.
 * On success: mark completed. On failure: retry or mark failed.
 */
async function executeJob(job) {
  activeBuildCount++;
  try {
    const projectId = job.project_id || (typeof job.project === 'string' ? job.project : job.project?.id);
    const planText = job.prompt || job.plan_text || '';
    // tier = user's subscription tier (free/pro/plus), determines model selection
    const tier = (job.tier && ['free', 'pro', 'plus'].includes(job.tier)) ? job.tier : 'free';

    if (!projectId) {
      console.error(`[Worker] Job ${job.id} has no project_id — skipping`);
      await djangoApi.updateBuildJob(job.id, { status: 'failed', error_message: 'Missing project_id' });
      return;
    }

    console.log(`[Worker:${WORKER_ID.slice(0, 8)}] Starting job ${job.id} → project ${projectId} (tier: ${tier})`);

    try {
      await startDirectBuild(projectId, planText, tier);

      await djangoApi.updateBuildJob(job.id, {
        status: 'completed',
        claimed_by: null,
        completed_at: new Date().toISOString(),
      });

      console.log(`[Worker:${WORKER_ID.slice(0, 8)}] Job ${job.id} completed ✓`);
    } catch (err) {
      console.error(`[Worker:${WORKER_ID.slice(0, 8)}] Job ${job.id} failed:`, err.message);
      const retries = (job.retry_count || 0) + 1;
      const exhausted = retries >= (job.max_retries || 2);

      await djangoApi.updateBuildJob(job.id, {
        status: exhausted ? 'failed' : 'queued',
        claimed_by: null,
        retry_count: retries,
        error_message: err.message,
      });

      if (exhausted) {
        console.log(`[Worker] Job ${job.id} exhausted retries — marked failed.`);
      } else {
        console.log(`[Worker] Job ${job.id} will retry (attempt ${retries}).`);
      }
    }
  } finally {
    activeBuildCount--;
  }
}

/**
 * Poll loop — runs every POLL_INTERVAL_MS.
 * Respects MAX_CONCURRENT_BUILDS to prevent overload.
 */
async function poll() {
  if (!isRunning) return;
  try {
    if (activeBuildCount < MAX_CONCURRENT_BUILDS) {
      const job = await claimNextJob();
      if (job) {
        executeJob(job); // fire-and-forget: poll continues while build runs
      }
    }
  } catch (err) {
    console.error('[Worker] Poll error:', err.message);
  }
  setTimeout(poll, POLL_INTERVAL_MS);
}

async function startWorker() {
  console.log(`[Worker:${WORKER_ID.slice(0, 8)}] Build worker starting (max ${MAX_CONCURRENT_BUILDS} concurrent builds)...`);
  isRunning = true;
  await recoverStuckJobs();
  poll();
}

function stopWorker() {
  console.log(`[Worker:${WORKER_ID.slice(0, 8)}] Build worker stopping...`);
  isRunning = false;
}

module.exports = { startWorker, stopWorker, WORKER_ID };
