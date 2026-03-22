import { TIERS, Tier, QuotaType } from '@/config/platform'

/**
 * Checks and increments quota for either 'chat' or 'builder'.
 * Chat and builder have separate daily counters and separate limits.
 * Throws { code: 'QUOTA_EXCEEDED' } if limit reached.
 */
export async function checkAndIncrementQuota(
  supabase: any,
  userId: string,
  tier: string,
  quotaType: QuotaType = 'chat'
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  const tierConfig = TIERS[tier as Tier] ?? TIERS.free

  const limit = quotaType === 'builder'
    ? tierConfig.builderRequestsPerDay
    : tierConfig.chatRequestsPerDay

  // Separate DB rows per quota type: use date + type composite
  const quotaDate = `${today}-${quotaType}`

  let { data: quota } = await supabase
    .from('usage_quotas')
    .select('*')
    .eq('user_id', userId)
    .eq('date', quotaDate)
    .maybeSingle()

  if (!quota) {
    const { data: newQuota, error: insertErr } = await supabase
      .from('usage_quotas')
      .insert({ user_id: userId, date: quotaDate, requests_used: 0, requests_limit: limit })
      .select()
      .maybeSingle()

    if (insertErr) {
      // Race condition — another request may have created it
      const { data: retryQuota } = await supabase
        .from('usage_quotas')
        .select('*')
        .eq('user_id', userId)
        .eq('date', quotaDate)
        .maybeSingle()
      quota = retryQuota
    } else {
      quota = newQuota
    }
  }

  if (quota && quota.requests_used >= quota.requests_limit) {
    throw Object.assign(new Error('Quota exceeded'), { code: 'QUOTA_EXCEEDED', status: 429, quotaType })
  }

  if (quota) {
    await supabase
      .from('usage_quotas')
      .update({ requests_used: quota.requests_used + 1 })
      .eq('id', quota.id)
  }
}

/**
 * Returns current quota stats for a user (both chat and builder).
 */
export async function getQuotaStats(supabase: any, userId: string, tier: string) {
  const today = new Date().toISOString().split('T')[0]
  const tierConfig = TIERS[tier as Tier] ?? TIERS.free

  const [chatQuota, builderQuota] = await Promise.all([
    supabase.from('usage_quotas').select('requests_used, requests_limit').eq('user_id', userId).eq('date', `${today}-chat`).maybeSingle(),
    supabase.from('usage_quotas').select('requests_used, requests_limit').eq('user_id', userId).eq('date', `${today}-builder`).maybeSingle(),
  ])

  return {
    chat: {
      used: chatQuota.data?.requests_used ?? 0,
      limit: tierConfig.chatRequestsPerDay,
    },
    builder: {
      used: builderQuota.data?.requests_used ?? 0,
      limit: tierConfig.builderRequestsPerDay,
    },
  }
}
