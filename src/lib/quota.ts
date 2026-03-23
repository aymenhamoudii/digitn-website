import { TIERS, Tier, QuotaType } from '@/config/platform'

/**
 * Helper to fetch dynamic limits from admin_config
 */
async function getDynamicLimits(supabase: any, tier: string) {
  try {
    const { data } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'tier_limits')
      .single()

    if (data?.value && data.value[tier]) {
      return {
        builderRequestsPerDay: data.value[tier].requests_per_day,
        chatRequestsPerDay: data.value[tier].requests_per_day * 5, // Fallback if chat isn't specified
        maxActiveProjects: data.value[tier].max_active_projects
      }
    }
  } catch (err) {
    console.error('Failed to fetch dynamic limits', err)
  }

  // Fallback to static config
  const tierConfig = TIERS[tier as Tier] ?? TIERS.free
  return {
    builderRequestsPerDay: tierConfig.builderRequestsPerDay,
    chatRequestsPerDay: tierConfig.chatRequestsPerDay,
    maxActiveProjects: tierConfig.maxActiveProjects
  }
}

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
  const limits = await getDynamicLimits(supabase, tier)

  const limit = quotaType === 'builder'
    ? limits.builderRequestsPerDay
    : limits.chatRequestsPerDay

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
  } else {
    // Always update the limit in the DB to match current tier/config
    if (quota.requests_limit !== limit) {
      await supabase
        .from('usage_quotas')
        .update({ requests_limit: limit })
        .eq('id', quota.id)
      quota.requests_limit = limit
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
  const limits = await getDynamicLimits(supabase, tier)

  const [chatQuota, builderQuota] = await Promise.all([
    supabase.from('usage_quotas').select('requests_used, requests_limit').eq('user_id', userId).eq('date', `${today}-chat`).maybeSingle(),
    supabase.from('usage_quotas').select('requests_used, requests_limit').eq('user_id', userId).eq('date', `${today}-builder`).maybeSingle(),
  ])

  return {
    chat: {
      used: chatQuota.data?.requests_used ?? 0,
      limit: limits.chatRequestsPerDay,
    },
    builder: {
      used: builderQuota.data?.requests_used ?? 0,
      limit: limits.builderRequestsPerDay,
    },
  }
}
