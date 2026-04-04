import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const push = vi.fn()
const replace = vi.fn()
const refresh = vi.fn()
const getUser = vi.fn()
const login = vi.fn()
const register = vi.fn()
const toastError = vi.fn()
const toastSuccess = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace, refresh }),
}))

vi.mock('@/lib/api/client', () => ({
  getUser: (...args: unknown[]) => getUser(...args),
  login: (...args: unknown[]) => login(...args),
  register: (...args: unknown[]) => register(...args),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}))

vi.mock('@/components/ui/Skeleton', () => ({
  LoadingSpinner: ({ size }: { size?: number }) => <div data-testid="spinner">spinner-{size}</div>,
}))

vi.mock('@/components/ui/DigItnLogo', () => ({
  DigItnLogo: () => <div>logo</div>,
}))

describe('auth Google entrypoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUser.mockResolvedValue(null)
  })

  it('login page shows a toast instead of redirecting to a dead Google backend route', async () => {
    const { default: LoginPage } = await import('@/app/auth/login/page')

    render(<LoginPage />)

    await waitFor(() => {
      expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Continue with Google'))

    expect(toastError).toHaveBeenCalledWith('Google sign-in is currently unavailable. Please use email and password.')
  })

  it('signup page shows a toast instead of redirecting to a dead Google backend route', async () => {
    const { default: SignupPage } = await import('@/app/auth/signup/page')

    render(<SignupPage />)

    await waitFor(() => {
      expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Continue with Google'))

    expect(toastError).toHaveBeenCalledWith('Google sign-up is currently unavailable. Please use email and password.')
  })
})
