import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserProfile = vi.fn()
const getProject = vi.fn()
const stat = vi.fn()
const readFile = vi.fn()

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getProject: (...args: unknown[]) => getProject(...args),
}))

vi.mock('fs/promises', () => ({
  default: {
    stat: (...args: unknown[]) => stat(...args),
    readFile: (...args: unknown[]) => readFile(...args),
  },
}))

describe('project preview path route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows the owner when the project is returned with project.user', async () => {
    getUserProfile.mockResolvedValue({ id: 'user-1' })
    getProject.mockResolvedValue({ id: 'project-1', user: 'user-1' })
    stat.mockResolvedValue({ isDirectory: () => false })
    readFile.mockResolvedValue(Buffer.from('<html></html>'))

    const { GET } = await import('@/app/api/projects/[id]/[...path]/route')
    const response = await GET(new Request('http://localhost/api/projects/project-1/index.html'), {
      params: { id: 'project-1', path: ['index.html'] },
    })

    expect(response.status).toBe(200)
  })
})
