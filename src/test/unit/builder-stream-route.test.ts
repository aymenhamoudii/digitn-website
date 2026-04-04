import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserProfile = vi.fn()
const getProject = vi.fn()

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getProject: (...args: unknown[]) => getProject(...args),
}))

describe('builder stream route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows the owner when the project is returned with project.user', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, body: 'stream-body' })
    vi.stubGlobal('fetch', fetchMock)

    getUserProfile.mockResolvedValue({ id: 'user-1' })
    getProject.mockResolvedValue({ id: 'project-1', user: 'user-1' })

    const { GET } = await import('@/app/api/builder/stream/[id]/route')
    const response = await GET(new Request('http://localhost/api/builder/stream/project-1'), {
      params: { id: 'project-1' },
    })

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3001/build/stream/project-1', {
      headers: { Authorization: 'Bearer undefined', Connection: 'keep-alive' },
      keepalive: true
    })
  })
})
