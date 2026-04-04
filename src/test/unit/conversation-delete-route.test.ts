import { beforeEach, describe, expect, it, vi } from 'vitest'

const getUserProfile = vi.fn()
const getConversation = vi.fn()
const deleteConversation = vi.fn()

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getConversation: (...args: unknown[]) => getConversation(...args),
  deleteConversation: (...args: unknown[]) => deleteConversation(...args),
}))

describe('conversation delete route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes the conversation when the owner is returned in conversation.user', async () => {
    getUserProfile.mockResolvedValue({ id: 'user-1' })
    getConversation.mockResolvedValue({ id: 'conv-1', user: 'user-1' })
    deleteConversation.mockResolvedValue(true)

    const { DELETE } = await import('@/app/api/conversations/[id]/route')
    const response = await DELETE(new Request('http://localhost/api/conversations/conv-1'), {
      params: { id: 'conv-1' },
    })

    expect(response.status).toBe(200)
    expect(deleteConversation).toHaveBeenCalledWith('conv-1')
  })
})
