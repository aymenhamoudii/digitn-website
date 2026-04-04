import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserProfile = vi.fn()
const getProject = vi.fn()
const updateProject = vi.fn()
const listProjects = vi.fn()
const createProject = vi.fn()
const checkAndConsumeQuota = vi.fn()
const deleteProject = vi.fn()

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getProject: (...args: unknown[]) => getProject(...args),
  updateProject: (...args: unknown[]) => updateProject(...args),
  listProjects: (...args: unknown[]) => listProjects(...args),
  createProject: (...args: unknown[]) => createProject(...args),
  checkAndConsumeQuota: (...args: unknown[]) => checkAndConsumeQuota(...args),
  deleteProject: (...args: unknown[]) => deleteProject(...args),
  ADMIN_EMAIL: 'contact@digitn.tech',
}))

vi.mock('@/config/platform', () => ({
  BRIDGE_URL: 'http://bridge.test',
}))

describe('builder retry route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    getUserProfile.mockResolvedValue(null)
    const { POST } = await import('@/app/api/builder/retry/route')

    const response = await POST(
      new Request('http://localhost/api/builder/retry', {
        method: 'POST',
        body: JSON.stringify({ projectId: 'project-1' }),
      })
    )

    expect(response.status).toBe(401)
  })

  it('deletes the old failed project through the server helper instead of a fake token fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    getUserProfile.mockResolvedValue({ id: 'user-1', tier: 'free' })
    getProject.mockResolvedValue({
      id: 'project-1',
      user: 'user-1',
      status: 'failed',
      name: 'Test',
      description: 'Desc',
      stack: 'react',
      type: 'website',
      questionnaire_answers: 'answers',
    })
    listProjects.mockResolvedValue([])
    checkAndConsumeQuota.mockResolvedValue({ allowed: true })
    createProject.mockResolvedValue({ id: 'project-2' })
    deleteProject.mockResolvedValue(true)
    updateProject.mockResolvedValue({})

    const { POST } = await import('@/app/api/builder/retry/route')

    const response = await POST(
      new Request('http://localhost/api/builder/retry', {
        method: 'POST',
        body: JSON.stringify({ projectId: 'project-1' }),
      })
    )

    expect(response.status).toBe(200)
    expect(deleteProject).toHaveBeenCalledWith('project-1')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toBe('http://bridge.test/build/project-1')
    expect(fetchMock.mock.calls[1][0]).toBe('http://bridge.test/build/start')
  })
})
