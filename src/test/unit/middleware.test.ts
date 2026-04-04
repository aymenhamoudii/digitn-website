import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock fetch for Django API calls
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock next/server
vi.mock('next/server', () => ({
  NextRequest: class {
    url: string
    nextUrl: { pathname: string }
    cookies: { get: (name: string) => { value: string } | undefined }
    constructor(url: string) {
      this.url = url
      this.nextUrl = { pathname: new URL(url).pathname }
      this.cookies = {
        get: (name: string) => undefined,
      }
    }
  },
  NextResponse: {
    next: vi.fn(() => ({ cookies: { set: vi.fn(), delete: vi.fn() } })),
    redirect: vi.fn((url) => ({ url: url.toString(), cookies: { set: vi.fn(), delete: vi.fn() } })),
  },
}))

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /auth/login when no token cookie', async () => {
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/app')
    // No digitn_token cookie

    await middleware(req as any)

    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectCall = (NextResponse.redirect as any).mock.calls[0][0]
    expect(redirectCall.toString()).toContain('/auth/login')
  })

  it('allows access to /app when token cookie is present', async () => {
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/app') as any
    req.cookies.get = (name: string) =>
      name === 'digitn_token' ? { value: 'valid-token-123' } : undefined

    await middleware(req)

    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('allows access to /auth/login when no token', async () => {
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/auth/login')

    await middleware(req as any)

    expect(NextResponse.next).toHaveBeenCalled()
  })

  it('redirects /auth/login to /app when token is present', async () => {
    const { middleware } = await import('@/middleware')

    const req = new NextRequest('http://localhost:3000/auth/login') as any
    req.cookies.get = (name: string) =>
      name === 'digitn_token' ? { value: 'valid-token-123' } : undefined

    await middleware(req)

    expect(NextResponse.redirect).toHaveBeenCalled()
    const redirectCall = (NextResponse.redirect as any).mock.calls[0][0]
    expect(redirectCall.toString()).toContain('/app')
  })
})
