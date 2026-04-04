import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserProfile = vi.fn()
const getProject = vi.fn()

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getProject: (...args: unknown[]) => getProject(...args),
}))

vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn().mockResolvedValue([]),
  },
}))

describe('project files route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows the owner when the project is returned with project.user', async () => {
    getUserProfile.mockResolvedValue({ id: 'user-1' })
    getProject.mockResolvedValue({ id: 'project-1', user: 'user-1', serve_path: 'C:/tmp/project-1' })

    const { GET } = await import('@/app/api/projects/[id]/files/route')
    const response = await GET(new Request('http://localhost/api/projects/project-1/files'), {
      params: Promise.resolve({ id: 'project-1' }),
    })

    expect(response.status).toBe(200)
  })
})
