window.HTMLElement.prototype.scrollIntoView = function() {};
import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import TerminalChat from '@/components/builder/TerminalChat'

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/components/ui/DigItnLogo', () => ({
  DigItnLogo: ({ size }: { size?: number }) => <div data-testid="digitn-logo">logo-{size}</div>,
}))

vi.mock('@/components/ui/ThinkingBlock', () => ({
  ThinkingBlock: ({ thinking }: { thinking: string }) => <div>{thinking}</div>,
  parseThinkContent: (content: string) => ({
    thinking: '',
    content,
    isThinking: false,
  }),
}))

// ClientPreview was removed — mock is no longer needed

describe('TerminalChat refresh history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('renders persisted file_updated events after refresh', () => {
    render(
      <TerminalChat
        projectId="project-1"
        projectName="Demo"
        initialStatus="ready"
        projectType="website"
        history={[
          {
            id: 'msg-1',
            role: 'assistant',
            content: '[DIGITN] ✓ Updated index.html',
            event_type: 'file_updated',
            sequence_number: 1,
          },
        ]}
      />,
    )

    expect(screen.getByText('Updated')).toBeInTheDocument()
    expect(screen.getByText('index.html')).toBeInTheDocument()
  })

  it('prefers server history over stale cached terminal logs on refresh', () => {
    sessionStorage.setItem(
      'terminal-project-1',
      JSON.stringify([
        {
          type: 'system',
          content: '> Project Demo is ready.',
          id: 'ready-1',
        },
        {
          type: 'system',
          content: '> You can request changes below or download the code.',
          id: 'ready-2',
        },
      ]),
    )

    render(
      <TerminalChat
        projectId="project-1"
        projectName="Demo"
        initialStatus="ready"
        projectType="website"
        history={[
          {
            id: 'msg-1',
            role: 'assistant',
            content: '[DIGITN] ✓ Updated index.html',
            event_type: 'file_updated',
            sequence_number: 1,
          },
        ]}
      />,
    )

    expect(screen.getByText('Updated')).toBeInTheDocument()
    expect(screen.getByText('index.html')).toBeInTheDocument()
  })

  it('does not restore stale cached logs when the server loaded an empty history', () => {
    sessionStorage.setItem(
      'terminal-project-1',
      JSON.stringify([
        {
          type: 'system',
          content: '> Project Demo is ready.',
          id: 'ready-1',
        },
        {
          type: 'file_update',
          content: '[DIGITN] ✓ Updated stale.html',
          id: 'stale-file',
        },
      ]),
    )

    render(
      <TerminalChat
        projectId="project-1"
        projectName="Demo"
        initialStatus="ready"
        projectType="website"
        history={[]}
      />,
    )

    expect(screen.queryByText('stale.html')).not.toBeInTheDocument()
  })
})
