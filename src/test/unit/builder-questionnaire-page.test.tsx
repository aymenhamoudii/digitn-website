import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const getUserProfile = vi.fn()
const getProject = vi.fn()
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`redirect:${url}`)
})
const mockNotFound = vi.fn(() => {
  throw new Error('notFound')
})

vi.mock('@/lib/api/server', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  getProject: (...args: unknown[]) => getProject(...args),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
  notFound: () => mockNotFound(),
}))

vi.mock('@/components/builder/QuestionnaireForm', () => ({
  default: ({ projectId }: { projectId: string }) => <div>questionnaire-{projectId}</div>,
}))

vi.mock('@/components/layout/Header', () => ({
  Header: ({ title }: { title: string }) => <div>{title}</div>,
}))

describe('questionnaire page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when the project owner is returned in project.user', async () => {
    getUserProfile.mockResolvedValue({ id: 'user-1' })
    getProject.mockResolvedValue({
      id: 'project-1',
      user: 'user-1',
      status: 'analyzing',
      analysis_result: {
        questions: [
          { id: 'q1', text: 'Question?', type: 'single', options: [{ value: 'a', label: 'A' }] },
        ],
      },
    })

    const { default: QuestionnairePage } = await import('@/app/(platform)/app/builder/questionnaire/[id]/page')
    const page = await QuestionnairePage({ params: Promise.resolve({ id: 'project-1' }) })

    render(page)

    expect(screen.getByText('Project Setup')).toBeInTheDocument()
    expect(screen.getByText('questionnaire-project-1')).toBeInTheDocument()
    expect(mockNotFound).not.toHaveBeenCalled()
  })
})
