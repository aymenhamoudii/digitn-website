import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserProfile = vi.fn()
const getProject = vi.fn()
const listProjects = vi.fn()
const createProject = vi.fn()
const checkAndConsumeQuota = vi.fn()
const updateProject = vi.fn()

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getProject: (...args: unknown[]) => getProject(...args),
  listProjects: (...args: unknown[]) => listProjects(...args),
  createProject: (...args: unknown[]) => createProject(...args),
  checkAndConsumeQuota: (...args: unknown[]) => checkAndConsumeQuota(...args),
  updateProject: (...args: unknown[]) => updateProject(...args),
}))

vi.mock('@/config/platform', () => ({
  BRIDGE_URL: 'http://bridge.test',
}))

describe('builder analyze route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('persists questionnaire analysis to the project when analysis is not ready', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ready: false,
        questions: [
          { id: 'q1', text: 'Style?', type: 'single', options: [{ value: 'modern', label: 'Modern' }] },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    getUserProfile.mockResolvedValue({ id: 'user-1', tier: 'free' })
    listProjects.mockResolvedValue([])
    checkAndConsumeQuota.mockResolvedValue({ allowed: true })
    createProject.mockResolvedValue({ id: 'project-1' })
    updateProject.mockResolvedValue({})

    const { POST } = await import('@/app/api/builder/analyze/route')
    const response = await POST(new Request('http://localhost/api/builder/analyze', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test project',
        description: 'Build me a nice landing page',
        stack: 'react-tailwind',
      }),
    }))

    expect(response.status).toBe(200)
    expect(updateProject).toHaveBeenCalledWith('project-1', {
      analysis_result: {
        ready: false,
        questions: [
          { id: 'q1', text: 'Style?', type: 'single', options: [{ value: 'modern', label: 'Modern' }] },
        ],
      },
      status: 'planning',
    })
  })
})
