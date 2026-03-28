/**
 * Server-side Django API client.
 * Used in Next.js Server Components and API Routes.
 * Passes cookies from the incoming request for session auth.
 */
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// ──────────────────────────────────────────────
// Types — match Django serializer field names exactly
// ──────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  tier: 'free' | 'pro' | 'plus'
  role: 'user' | 'admin'
  language?: string
  stripe_customer_id?: string
  konnect_customer_id?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user: string
  /** @deprecated use id */
  user_id?: string
  mode: 'chat' | 'builder'
  title?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface Project {
  id: string
  user: string
  /** @deprecated use user */
  user_id?: string
  conversation?: string
  name: string
  description?: string
  stack?: string
  type?: 'website' | 'webapp' | 'ecommerce' | 'api'
  plan_json?: Record<string, unknown>
  status: 'analyzing' | 'planning' | 'building' | 'ready' | 'failed'
  serve_path?: string
  public_url?: string
  zip_path?: string
  last_accessed_at?: string
  analysis_result?: Record<string, unknown>
  questionnaire_answers?: string
  current_phase?: string
  current_task?: string
  plan_text?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  tier: 'pro' | 'plus'
  status: 'active' | 'cancelled' | 'past_due'
  provider: 'stripe' | 'konnect' | 'manual'
  provider_subscription_id?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

export interface QuotaStats {
  chat: { used: number; limit: number; remaining: number }
  builder: { used: number; limit: number; remaining: number }
  tier: string
}

// ──────────────────────────────────────────────
// HTTP Client
// ──────────────────────────────────────────────

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const url = `${API_URL}${endpoint}`

  // Read the auth token from cookies (set by client after login)
  let authHeader: Record<string, string> = {}
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('digitn_token')?.value
    if (token) {
      authHeader = { Authorization: `Token ${token}` }
    }
  } catch {
    // cookies() throws outside of a request context — safe to ignore
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
    })
  } catch {
    console.error(`[API] Network error reaching ${url}`)
    return null
  }

  if (response.status === 401 || response.status === 403) {
    return null
  }

  if (response.status === 204) {
    return null
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message =
      body.error
        ? typeof body.error === 'string' ? body.error : JSON.stringify(body.error)
        : body.detail || `API error ${response.status}`
    console.error(`[API] ${response.status} ${endpoint}: ${message}`)
    return null
  }

  return response.json()
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export async function getUser(): Promise<User | null> {
  return fetchApi<User>('/auth/me')
}

export async function getUserProfile(): Promise<User | null> {
  return fetchApi<User>('/users/me')
}

// ──────────────────────────────────────────────
// Admin: Users
// ──────────────────────────────────────────────

export async function listUsers(): Promise<User[] | null> {
  const data = await fetchApi<{ results: User[] }>('/admin/users')
  return data?.results ?? null
}

export async function getUserTier(userId: string): Promise<string> {
  const user = await fetchApi<User>(`/admin/users/${userId}`)
  return user?.tier || 'free'
}

export async function updateUserTier(userId: string, tier: string): Promise<User | null> {
  return fetchApi<User>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ tier }),
  })
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User | null> {
  return fetchApi<User>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

// ──────────────────────────────────────────────
// Admin: Config
// ──────────────────────────────────────────────

export async function getAdminConfig(key: string): Promise<unknown | null> {
  try {
    const data = await fetchApi<{ key: string; value: unknown }>(`/admin/config/${key}`)
    return data?.value ?? null
  } catch {
    return null
  }
}

export async function setAdminConfig(key: string, value: unknown): Promise<boolean> {
  try {
    // Use POST (upsert) instead of PUT — more reliable across Django versions
    const result = await fetchApi<unknown>(`/admin/config`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    })
    return result !== null
  } catch {
    return false
  }
}

// ──────────────────────────────────────────────
// Admin: Subscriptions
// ──────────────────────────────────────────────

export async function createSubscription(data: {
  user_id: string
  tier: 'pro' | 'plus'
  provider?: 'stripe' | 'konnect' | 'manual'
  provider_subscription_id?: string
  current_period_end?: string
}): Promise<Subscription | null> {
  return fetchApi<Subscription>('/admin/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ──────────────────────────────────────────────
// Quotas
// ──────────────────────────────────────────────

export async function getQuotaStats(): Promise<QuotaStats | null> {
  return fetchApi<QuotaStats>('/quotas')
}

export async function checkAndConsumeQuota(
  type: 'chat' | 'builder'
): Promise<{ allowed: boolean; remaining: number } | null> {
  return fetchApi<{ allowed: boolean; remaining: number }>('/quotas/check', {
    method: 'POST',
    body: JSON.stringify({ type }),
  })
}

// ──────────────────────────────────────────────
// Conversations
// ──────────────────────────────────────────────

export async function listConversations(mode?: 'chat' | 'builder'): Promise<Conversation[] | null> {
  const qs = mode ? `?mode=${mode}` : ''
  const data = await fetchApi<{ results: Conversation[] }>(`/conversations${qs}`)
  return data?.results ?? null
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return fetchApi<Conversation>(`/conversations/${id}`)
}

export async function createConversation(mode: string, title?: string): Promise<Conversation | null> {
  return fetchApi<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ mode, title }),
  })
}

export async function deleteConversation(id: string): Promise<boolean> {
  const result = await fetchApi<null>(`/conversations/${id}`, { method: 'DELETE' })
  return result !== undefined
}

// ──────────────────────────────────────────────
// Messages
// ──────────────────────────────────────────────

export async function listMessages(conversationId: string): Promise<Message[] | null> {
  const data = await fetchApi<{ results: Message[] }>(`/conversations/${conversationId}/messages`)
  return data?.results ?? null
}

// ──────────────────────────────────────────────
// Projects
// ──────────────────────────────────────────────

export async function listProjects(): Promise<Project[] | null> {
  const data = await fetchApi<{ results: Project[] }>('/projects')
  return data?.results ?? null
}

export async function getProject(id: string): Promise<Project | null> {
  return fetchApi<Project>(`/projects/${id}`)
}

export async function createProject(data: Partial<Project>): Promise<Project | null> {
  return fetchApi<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  return fetchApi<Project>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('digitn_token')?.value
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Token ${token}`
    await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
      headers,
    })
    return true
  } catch {
    return false
  }
}

// ──────────────────────────────────────────────
// Admin helpers
// ──────────────────────────────────────────────

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@digitn.tech'

export async function requireAdmin(): Promise<User> {
  const user = await getUser()
  if (!user || user.role !== 'admin') {
    throw new Error('Forbidden: admin access required')
  }
  return user
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

// ──────────────────────────────────────────────
// Project Messages
// ──────────────────────────────────────────────

export async function listProjectMessages(projectId: string): Promise<any[] | null> {
  const data = await fetchApi<{ results: any[] } | any[]>(`/projects/${projectId}/messages`)
  if (Array.isArray(data)) return data
  return data?.results ?? null
}
