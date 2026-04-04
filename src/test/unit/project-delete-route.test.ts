import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserProfile = vi.fn()
const getProject = vi.fn()
const deleteProject = vi.fn()

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getProject: (...args: unknown[]) => getProject(...args),
  deleteProject: (...args: unknown[]) => deleteProject(...args),
}))

describe('project delete route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes the project when the owner is returned in project.user', async () => {
    getUserProfile.mockResolvedValue({ id: 'user-1' })
    getProject.mockResolvedValue({ id: 'project-1', user: 'user-1' })
    deleteProject.mockResolvedValue(true)

    const { DELETE } = await import('@/app/api/projects/[id]/route')
    const response = await DELETE(new Request('http://localhost/api/projects/project-1'), {
      params: { id: 'project-1' },
    })

    expect(response.status).toBe(200)
    expect(deleteProject).toHaveBeenCalledWith('project-1')
  })
})
