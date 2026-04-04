/**
 * Django API client for the bridge server.
 * Centralizes bridge-to-Django data access for users, projects, jobs, and terminal events.
 */
// Use built-in fetch (Node 18+) — no node-fetch dependency needed
const fetch = globalThis.fetch;

const DJANGO_URL = process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BRIDGE_SECRET = process.env.BRIDGE_SECRET || '';

function bridgeHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BRIDGE_SECRET}`,
  };
}

async function djangoFetch(endpoint, options = {}) {
  const url = `${DJANGO_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error("Timeout")), 10000);

    const res = await fetch(url, {
      ...options,
      headers: { ...bridgeHeaders(), ...(options.headers || {}) },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error(`[Django API] ${options.method || 'GET'} ${endpoint} → ${res.status}`, body);
      return null;
    }
    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    console.error(`[Django API] Network error ${endpoint}:`, err.message);
    return null;
  }
}

// ── Users ──────────────────────────────────────────────────────────────────
async function getUser(userId) {
  return djangoFetch(`/bridge/users/${userId}`);
}

// ── Admin Config ───────────────────────────────────────────────────────────
async function getAdminConfig(key) {
  const data = await djangoFetch(`/bridge/config/${key}`);
  return data?.value ?? null;
}

// ── Conversations ──────────────────────────────────────────────────────────
async function createConversation(userId, mode = 'chat', title = null) {
  return djangoFetch('/bridge/conversations', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, mode, title }),
  });
}

async function updateConversationTitle(conversationId, title) {
  return djangoFetch(`/bridge/conversations/${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

// ── Messages ───────────────────────────────────────────────────────────────
async function saveMessage(conversationId, userId, role, content) {
  return djangoFetch('/bridge/messages', {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId, user_id: userId, role, content }),
  });
}

// ── Projects ───────────────────────────────────────────────────────────────
async function getProject(projectId) {
  return djangoFetch(`/bridge/projects/${projectId}`);
}

async function updateProject(projectId, data) {
  return djangoFetch(`/bridge/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Terminal Events ─────────────────────────────────────────────────────────
async function saveTerminalEvent({ project_id, role = 'assistant', content, event_type = 'message', task_name = null, phase = null, metadata = null }) {
  return djangoFetch('/bridge/events', {
    method: 'POST',
    body: JSON.stringify({ project_id, role, content, event_type, task_name, phase, metadata }),
  });
}

// ── Build Jobs ─────────────────────────────────────────────────────────────
// tier = user's subscription tier (free/pro/plus), NOT the project's tech stack
async function enqueueBuildJob(projectId, userId, prompt, tier) {
  return djangoFetch('/bridge/jobs', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, user_id: userId, prompt, tier }),
  });
}

async function claimNextBuildJob() {
  const data = await djangoFetch('/bridge/jobs', { method: 'GET' });
  return data?.job ?? null;
}

async function updateBuildJob(jobId, updates) {
  return djangoFetch('/bridge/jobs', {
    method: 'PATCH',
    body: JSON.stringify({ job_id: jobId, ...updates }),
  });
}

// ── Stuck builds recovery ──────────────────────────────────────────────────
async function resetStuckBuilds() {
  // Find jobs stuck in "running" status for over 10 minutes and reset to "queued"
  try {
    const result = await djangoFetch('/bridge/jobs/reset-stuck', {
      method: 'POST',
      body: JSON.stringify({ timeout_minutes: 10 }),
    });
    if (result) {
      const count = result.reset_count ?? 0;
      if (count > 0) {
        console.log(`[Django API] Reset ${count} stuck build job(s) back to queued.`);
      } else {
        console.log('[Django API] No stuck build jobs found.');
      }
    } else {
      console.warn('[Django API] Stuck build reset endpoint returned no data — endpoint may not exist yet.');
    }
  } catch (err) {
    console.error('[Django API] resetStuckBuilds error:', err.message);
  }
}

// ── Builder Chat History ───���───────────────────────────────���──────────────
async function getBuilderChatHistory(projectId, limit = 10) {
  // Use the bridge/events endpoint (bearer-auth) — GET /bridge/events?project_id=<id>
  const data = await djangoFetch(`/bridge/events?project_id=${projectId}&page_size=${limit}`);
  if (!data) return [];
  // Response is already an array in chronological order (oldest first)
  return Array.isArray(data) ? data : (data.results || []);
}

module.exports = {
  getUser,
  getAdminConfig,
  createConversation,
  updateConversationTitle,
  saveMessage,
  getProject,
  updateProject,
  saveTerminalEvent,
  enqueueBuildJob,
  claimNextBuildJob,
  updateBuildJob,
  resetStuckBuilds,
  getBuilderChatHistory,
};
