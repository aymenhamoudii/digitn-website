import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TIERS } from '@/config/platform'

// ─── Django quota API mocks ───────────────────────────────────────────────────
vi.mock('@/lib/api/client', () => ({
  checkQuota: vi.fn(),
  getQuotaStats: vi.fn(),
}))

import { checkQuota, getQuotaStats } from '@/lib/api/client'
import { consumeQuota, getUserQuota } from '@/lib/quota'

describe('Quota System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Tier config sanity checks ─────────────────────────────────────────────
  describe('getDynamicLimits - tier defaults', () => {
    it('returns correct defaults for free tier', () => {
      expect(TIERS.free.chatRequestsPerDay).toBe(50)
      expect(TIERS.free.builderRequestsPerDay).toBe(10)
      expect(TIERS.free.maxActiveProjects).toBe(1)
    })

    it('returns correct defaults for pro tier', () => {
      expect(TIERS.pro.chatRequestsPerDay).toBe(300)
      expect(TIERS.pro.builderRequestsPerDay).toBe(50)
      expect(TIERS.pro.maxActiveProjects).toBe(3)
    })

    it('returns correct defaults for plus tier', () => {
      expect(TIERS.plus.chatRequestsPerDay).toBe(9999)
      expect(TIERS.plus.builderRequestsPerDay).toBe(9999)
      expect(TIERS.plus.maxActiveProjects).toBe(9999)
    })
  })

  // ── consumeQuota — delegates to Django /quotas/check ──���──────────────────
  describe('consumeQuota', () => {
    it('returns true when Django allows the request', async () => {
      vi.mocked(checkQuota).mockResolvedValue({ allowed: true, used: 1, limit: 50, remaining: 49 })
      const result = await consumeQuota('chat')
      expect(result).toBe(true)
      expect(checkQuota).toHaveBeenCalledWith('chat')
    })

    it('returns false when Django quota is exceeded', async () => {
      vi.mocked(checkQuota).mockResolvedValue({ allowed: false, used: 50, limit: 50, remaining: 0 })
      const result = await consumeQuota('chat')
      expect(result).toBe(false)
    })

    it('returns false when Django API is unavailable (fail-safe)', async () => {
      vi.mocked(checkQuota).mockRejectedValue(new Error('Network error'))
      const result = await consumeQuota('chat')
      expect(result).toBe(false)
    })

    it('returns false when Django returns null', async () => {
      vi.mocked(checkQuota).mockResolvedValue(null)
      const result = await consumeQuota('chat')
      expect(result).toBe(false)
    })

    it('passes builder quota type correctly', async () => {
      vi.mocked(checkQuota).mockResolvedValue({ allowed: true, used: 1, limit: 10, remaining: 9 })
      await consumeQuota('builder')
      expect(checkQuota).toHaveBeenCalledWith('builder')
    })
  })

  // ── getUserQuota — reads from Django /quotas ──────────────���────────────────
  describe('getUserQuota', () => {
    it('returns chat quota stats from Django', async () => {
      vi.mocked(getQuotaStats).mockResolvedValue({
        chat: { used: 25, limit: 300, remaining: 275 },
        builder: { used: 3, limit: 50, remaining: 47 },
        tier: 'pro',
      })
      const result = await getUserQuota('chat')
      expect(result).toEqual({ used: 25, limit: 300, remaining: 275 })
    })

    it('returns builder quota stats from Django', async () => {
      vi.mocked(getQuotaStats).mockResolvedValue({
        chat: { used: 10, limit: 50, remaining: 40 },
        builder: { used: 2, limit: 10, remaining: 8 },
        tier: 'free',
      })
      const result = await getUserQuota('builder')
      expect(result).toEqual({ used: 2, limit: 10, remaining: 8 })
    })

    it('returns safe defaults when Django API fails', async () => {
      vi.mocked(getQuotaStats).mockRejectedValue(new Error('Network error'))
      const result = await getUserQuota('chat')
      expect(result).toEqual({ used: 0, limit: 50, remaining: 50 })
    })

    it('returns safe defaults when Django returns null', async () => {
      vi.mocked(getQuotaStats).mockResolvedValue(null)
      const result = await getUserQuota('chat')
      expect(result).toEqual({ used: 0, limit: 50, remaining: 50 })
    })
  })
})

