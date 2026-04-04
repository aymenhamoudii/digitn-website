import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserProfile = vi.fn()
const getProject = vi.fn()

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getProject: (...args: unknown[]) => getProject(...args),
}))

describe('builder chat route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows the owner when the project is returned with project.user', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, body: 'stream' })
    vi.stubGlobal('fetch', fetchMock)

    getUserProfile.mockResolvedValue({ id: 'user-1' })
    getProject.mockResolvedValue({ id: 'project-1', user: 'user-1', status: 'ready' })

    const { POST } = await import('@/app/api/builder/chat/[id]/route')
    const response = await POST(new Request('http://localhost/api/builder/chat/project-1', {
      method: 'POST',
      body: JSON.stringify({ message: 'hello' }),
    }), {
      params: { id: 'project-1' },
    })

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalled()
  })
})
