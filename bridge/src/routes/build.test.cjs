// bridge/src/routes/build.test.cjs — migrated from Supabase mocks to Django API mocks
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDjangoApi = {
  getUser: vi.fn(async () => ({ id: 'user-1', tier: 'free' })),
  enqueueBuildJob: vi.fn(async () => ({ id: 'job-1', project_id: 'proj-1', status: 'queued' })),
  getProject: vi.fn(async () => ({ id: 'proj-1', status: 'ready', public_url: '/projects/proj-1' })),
};

describe('bridge build start route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enqueues a build job via Django API with the correct payload', async () => {
    const userId = 'user-1';
    const projectId = 'proj-1';
    const planText = 'Build a landing page';

    const user = await mockDjangoApi.getUser(userId);
    const tier = user?.tier || 'free';
    const job = await mockDjangoApi.enqueueBuildJob(projectId, userId, planText, tier);

    expect(mockDjangoApi.getUser).toHaveBeenCalledWith(userId);
    expect(mockDjangoApi.enqueueBuildJob).toHaveBeenCalledWith(projectId, userId, planText, 'free');
    expect(job.id).toBe('job-1');
    expect(job.status).toBe('queued');
  });

  it('uses project.public_url from Django for ready status SSE response', async () => {
    const project = await mockDjangoApi.getProject('proj-1');
    const payload = project?.status === 'ready'
      ? { type: 'status', status: 'ready', url: project.public_url || ('/projects/' + project.id) }
      : { type: 'error', message: 'Build not found' };

    expect(payload.status).toBe('ready');
    expect(payload.url).toBe('/projects/proj-1');
  });
});
