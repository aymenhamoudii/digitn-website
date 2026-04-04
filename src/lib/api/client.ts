const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const TOKEN_KEY = 'digitn_token'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  // Also store in cookie so Next.js middleware can read it for SSR auth checks
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  // Clear the cookie too
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`
}

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
  /** @deprecated use id — kept for backward-compat with old code */
  user_id?: string
  mode: 'chat' | 'builder'
  title?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation: string   // conversation UUID
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export interface Project {
  id: string
  user: string           // user UUID
  /** @deprecated use user — kept for backward-compat with old code */
  user_id?: string
  conversation?: string  // conversation UUID
  name: string
  description?: string
  stack?: string
  type?: 'website' | 'webapp' | 'ecommerce' | 'api' | 'presentation'
  plan_json?: Record<string, unknown>
  status: 'analyzing' | 'planning' | 'building' | 'ready' | 'failed'
  serve_path?: string
  public_url?: string
  zip_path?: string
  last_accessed_at?: string
  analysis_result?: Record<string, unknown>
  questionnaire_answers?: string
  /** Runtime phase tracking (stored in analysis_result or plan_json) */
  current_phase?: string
  current_task?: string
  plan_text?: string
  source_text?: string
  presentation_json?: Record<string, unknown>
  total_slides?: number
  created_at: string
  updated_at: string
}

export interface BuilderChatMessage {
  id: string
  project: string
  role: 'user' | 'assistant'
  content: string
  event_type: 'file_created' | 'file_updated' | 'message' | 'error'
  task_name?: string
  phase?: 'analyzing' | 'planning' | 'building' | 'ready'
  sequence_number: number
  metadata?: Record<string, unknown>
  created_at: string
}

export interface QuotaStats {
  chat: { used: number; limit: number; remaining: number }
  builder: { used: number; limit: number; remaining: number }
  tier: string
  /** @deprecated use chat.used */
  chat_requests_used?: number
  /** @deprecated use chat.limit */
  chat_requests_limit?: number
  /** @deprecated use builder.used */
  builder_requests_used?: number
  /** @deprecated use builder.limit */
  builder_requests_limit?: number
}

export interface QuotaCheckResult {
  allowed: boolean
  used: number
  limit: number
  remaining: number
  error?: string
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

// ──────────────────────────────────────────────
// HTTP Client
// ──────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const MAX_THROTTLE_RETRIES = 3

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const url = `${API_URL}${endpoint}`

  // Don't send auth tokens on public auth endpoints (login, register, forgot-password)
  const isPublicAuthEndpoint = /^\/auth\/(login|register|forgot-password|reset-password)/.test(endpoint)
  const token = isPublicAuthEndpoint ? null : getStoredToken()
  const authHeader: Record<string, string> = token
    ? { Authorization: `Token ${token}` }
    : {}

  for (let attempt = 0; attempt <= MAX_THROTTLE_RETRIES; attempt++) {
    let response: Response
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
          ...options.headers,
        },
      })
    } catch (networkError) {
      throw new ApiError(0, 'Network error — is the Django server running?')
    }

    if (response.status === 401) {
      return null
    }

    if (response.status === 204) {
      return null
    }

    // Handle throttling (429) with automatic retry
    if (response.status === 429) {
      if (attempt < MAX_THROTTLE_RETRIES) {
        const body = await response.json().catch(() => ({}))
        // Parse wait time from DRF message like "Expected available in 8 seconds."
        const waitMatch = (body.detail || '').match(/(\d+)\s*seconds?/)
        const waitSeconds = waitMatch ? parseInt(waitMatch[1], 10) : (attempt + 1) * 2
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000))
        continue
      }
      // Exhausted retries — fall through to throw
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const message =
        body.error
          ? typeof body.error === 'string'
            ? body.error
            : JSON.stringify(body.error)
          : body.detail || body.message || `API error ${response.status}`
      throw new ApiError(response.status, message, body)
    }

    return response.json()
  }

  // Should not reach here, but TypeScript needs a return
  throw new ApiError(429, 'Request throttled after multiple retries')
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export async function register(email: string, password: string, name?: string) {
  const data = await fetchApi<User & { token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
  if (data?.token) setStoredToken(data.token)
  return data
}

export async function login(email: string, password: string) {
  // Clear any stale token before login attempt
  clearStoredToken()
  const data = await fetchApi<User & { token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!data || !data.token) {
    throw new Error('Invalid email or password.')
  }
  setStoredToken(data.token)
  return data
}

export async function logout() {
  const result = await fetchApi<{ message: string }>('/auth/logout', { method: 'POST' })
  clearStoredToken()
  return result
}

export async function getUser(): Promise<User | null> {
  return fetchApi<User>('/auth/me')
}

export async function changePassword(oldPassword: string, newPassword: string) {
  return fetchApi<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  })
}

/**
 * @deprecated No-op — no backend endpoint exists yet.
 * TODO: Implement when Django password-reset endpoint is added
 *       (e.g. POST /auth/password-reset). Currently unused;
 *       the forgot-password page shows "Coming soon".
 */
export async function requestPasswordReset(_email: string) {
  console.warn('requestPasswordReset: no backend endpoint configured')
  return null
}

/**
 * @deprecated No-op — no backend endpoint exists yet.
 * TODO: Implement when Django password-reset-confirm endpoint is added
 *       (e.g. POST /auth/password-reset-confirm). The reset-password
 *       page calls this but the function is a no-op stub.
 */
export async function resetPassword(_newPassword: string) {
  console.warn('resetPassword: no backend endpoint configured')
  return null
}

// ──────────────────────────────────────────────
// User Profile
// ──────────────────────────────────────────────

export async function getUserProfile() {
  return fetchApi<User>('/users/me')
}

export async function updateUserProfile(data: Partial<Pick<User, 'name' | 'avatar_url' | 'language'>>) {
  return fetchApi<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ──────────────────────────────────────────────
// Admin: Users
// ──────────────────────────────────────────────

export async function listUsers(): Promise<User[] | null> {
  const data = await fetchApi<{ results: User[] } | User[]>('/admin/users')
  if (!data) return null
  return Array.isArray(data) ? data : data.results
}

export async function getAdminUser(userId: string) {
  return fetchApi<User>(`/admin/users/${userId}`)
}

export async function updateUserTier(userId: string, tier: 'free' | 'pro' | 'plus') {
  return fetchApi<User>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ tier }),
  })
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  return fetchApi<User>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

// ──────────────────────────────────────────────
// Admin: Config
// ──────────────────────────────────────────────

export async function getAdminConfig(key: string) {
  try {
    return await fetchApi<{ id: string | null; key: string; value: unknown }>(`/admin/config?key=${encodeURIComponent(key)}`)
  } catch {
    // Key doesn't exist or server error — return null value so callers use defaults
    return { id: null, key, value: null }
  }
}

export async function setAdminConfig(key: string, value: unknown) {
  try {
    return await fetchApi<{ id: string; key: string; value: unknown }>('/admin/config', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    })
  } catch {
    return null
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
}) {
  return fetchApi<Subscription>('/admin/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ──────────────────────────────────────────────
// Quotas
// ──────────────────────────────────────────────

export async function getQuotaStats() {
  return fetchApi<QuotaStats>('/quotas')
}

export async function checkQuota(type: 'chat' | 'builder') {
  return fetchApi<QuotaCheckResult>('/quotas/check', {
    method: 'POST',
    body: JSON.stringify({ type }),
  })
}

// ──────────────────────────────────────────────
// Subscriptions (user)
// ──────────────────────────────────────────────

export async function listSubscriptions() {
  return fetchApi<Subscription[]>('/subscriptions')
}

// ──────────────────────────────────────────────
// Conversations
// ──────────────────────────────────────────────

export async function listConversations(mode?: 'chat' | 'builder'): Promise<Conversation[] | null> {
  const qs = mode ? `?mode=${mode}` : ''
  const data = await fetchApi<{ results: Conversation[] } | Conversation[]>(`/conversations${qs}`)
  if (!data) return null
  return Array.isArray(data) ? data : data.results
}

export async function getConversation(id: string) {
  return fetchApi<Conversation>(`/conversations/${id}`)
}

export async function createConversation(mode: 'chat' | 'builder', title?: string) {
  return fetchApi<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ mode, title }),
  })
}

export async function updateConversation(id: string, data: Partial<Pick<Conversation, 'title'>>) {
  return fetchApi<Conversation>(`/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteConversation(id: string) {
  return fetchApi<null>(`/conversations/${id}`, { method: 'DELETE' })
}

// ──────────────────────────────────────────────
// Messages
// ──────────────────────────────────────────────

export async function listMessages(conversationId: string): Promise<Message[] | null> {
  const data = await fetchApi<{ results: Message[] } | Message[]>(`/conversations/${conversationId}/messages`)
  if (!data) return null
  return Array.isArray(data) ? data : data.results
}

export async function createMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
) {
  return fetchApi<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ role, content }),
  })
}

// ──────────────────────────────────────────────
// Projects
// ──────────────────────────────────────────────

export async function listProjects(statusFilter?: string): Promise<Project[] | null> {
  const qs = statusFilter ? `?status=${statusFilter}` : ''
  const data = await fetchApi<{ results: Project[] } | Project[]>(`/projects${qs}`)
  if (!data) return null
  return Array.isArray(data) ? data : data.results
}

export async function getProject(id: string) {
  return fetchApi<Project>(`/projects/${id}`)
}

export async function createProject(data: Partial<Project>) {
  return fetchApi<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProject(id: string, data: Partial<Project>) {
  return fetchApi<Project>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteProject(id: string) {
  return fetchApi<null>(`/projects/${id}`, { method: 'DELETE' })
}

// ──────────────────────────────────────────────
// Builder Chat Messages
// ──────────────────────────────────────────────

export async function listBuilderMessages(projectId: string): Promise<BuilderChatMessage[] | null> {
  const data = await fetchApi<{ results: BuilderChatMessage[] } | BuilderChatMessage[]>(`/projects/${projectId}/messages`)
  if (!data) return null
  return Array.isArray(data) ? data : data.results
}

export async function createBuilderMessage(
  projectId: string,
  data: Partial<BuilderChatMessage>
) {
  return fetchApi<BuilderChatMessage>(`/projects/${projectId}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
