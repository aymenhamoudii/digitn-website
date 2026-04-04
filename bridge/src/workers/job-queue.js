/**
 * Job Queue Helper
 * Enqueues build jobs via Django API.
 * NOT YET ACTIVE — see README.md
 */

const djangoApi = require('../lib/django-api');

async function enqueueBuildJob({ projectId, userId, planText, tier = 'free' }) {
  const job = await djangoApi.enqueueBuildJob(projectId, userId, planText, tier);
  if (!job) throw new Error('Failed to enqueue build job via Django API');
  console.log(`[Queue] Enqueued build job ${job.id} for project ${projectId}`);
  return job;
}

async function cancelJob(jobId) {
  const result = await djangoApi.updateBuildJob(jobId, { status: 'cancelled' });
  if (!result) throw new Error('Failed to cancel job');
}

async function getJobStatus(jobId) {
  const data = await djangoApi.updateBuildJob(jobId, {});
  if (!data) throw new Error('Failed to get job status');
  return data;
}

module.exports = { enqueueBuildJob, cancelJob, getJobStatus };
