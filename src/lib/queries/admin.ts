export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  config: (key: string) => [...adminKeys.all, 'config', key] as const,
  users: () => [...adminKeys.all, 'users'] as const,
}

export async function fetchAdminStats() {
  const res = await fetch('/api/admin/stats')
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function fetchAdminConfig(key: string) {
  const res = await fetch(`/api/admin/config?key=${key}`)
  if (!res.ok) throw new Error(`Failed to fetch config: ${key}`)
  return res.json()
}

export async function fetchAdminUsers() {
  const res = await fetch('/api/admin/users')
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function saveAdminConfig(key: string, value: unknown) {
  const res = await fetch('/api/admin/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
  if (!res.ok) throw new Error(`Failed to save config: ${key}`)
  return res.json()
}

export async function updateUserTier(userId: string, newTier: string) {
  const res = await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newTier }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update user tier')
  return data
}
