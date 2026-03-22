'use client'

import { useEffect, useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('digitn-theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
    } else {
      // Default to dark, or follow device preference
      const prefersDark = !window.matchMedia('(prefers-color-scheme: light)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('digitn-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--card-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? <FiMoon size={15} /> : <FiSun size={15} />}
    </button>
  )
}
