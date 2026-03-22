'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { SkeletonProjectCard } from '@/components/ui/Skeleton'
import Link from 'next/link'
import { FiGlobe, FiClock, FiTrash2, FiBox, FiDownload } from 'react-icons/fi'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProjects(data || [])
      setLoading(false)
    }
    loadProjects()
  }, [])

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Delete this project? This cannot be undone.')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Delete error:', error)
      return
    }

    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="My Projects" />

      <div className="p-8 max-w-platform mx-auto w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonProjectCard />
            <SkeletonProjectCard />
            <SkeletonProjectCard />
            <SkeletonProjectCard />
            <SkeletonProjectCard />
            <SkeletonProjectCard />
          </div>
        ) : projects.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <FiBox size={28} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
              No projects yet
            </h3>
            <p className="mt-2 mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Start by creating your first AI-generated project.
            </p>
            <Link
              href="/app/builder"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-md font-medium text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <FiBox size={16} /> Create a project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => {
              const isExpired = p.status === 'expired' || new Date(p.expires_at) < new Date()

              return (
                <Link
                  key={p.id}
                  href={`/app/builder/${p.id}`}
                  className={`rounded-xl overflow-hidden transition-all block ${
                    isExpired ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-1'
                  }`}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {/* Status header bar */}
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: isExpired ? 'var(--text-tertiary)' : p.status === 'ready' ? '#22c55e' : '#eab308',
                        }}
                      />
                      <span
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{
                          color: isExpired ? 'var(--text-tertiary)' : p.status === 'ready' ? '#22c55e' : '#eab308',
                        }}
                      >
                        {isExpired ? 'Expired' : p.status}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {p.type || 'website'}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3
                      className="font-medium truncate mb-1"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
                      title={p.name}
                    >
                      {p.name}
                    </h3>

                    {p.description && (
                      <p
                        className="text-xs line-clamp-2 mb-4"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {p.description}
                      </p>
                    )}

                    <p className="text-xs flex items-center gap-1.5 mb-4" style={{ color: 'var(--text-tertiary)' }}>
                      <FiClock size={12} />
                      {new Date(p.created_at).toLocaleDateString()} at {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    <div
                      className="flex justify-between items-center pt-4"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <div className="flex items-center gap-2">
                        {p.status === 'ready' && !isExpired && (
                          <>
                            <a
                              href={p.public_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                              style={{ color: 'var(--accent-blue)' }}
                            >
                              <FiGlobe size={13} /> Open
                            </a>
                            {p.zip_path && (
                              <a
                                href={p.zip_path}
                                className="text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                                style={{ color: 'var(--accent)' }}
                              >
                                <FiDownload size={13} /> Download
                              </a>
                            )}
                          </>
                        )}
                        {(isExpired || p.status !== 'ready') && (
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {isExpired ? 'Preview expired' : 'Building...'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        className="transition-colors hover:text-red-500"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
