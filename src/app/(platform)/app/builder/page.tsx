'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { DigItnLogo } from '@/components/ui/DigItnLogo';
import { BUILDER_STACKS } from '@/config/platform';
import { FiCode, FiArrowRight, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BuilderPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [stack, setStack] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stack || !description.trim()) {
      toast.error('Please choose a stack and describe your project.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/builder/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || description.trim().substring(0, 40), description, stack })
      });

      const data = await res.json();

      if (res.status === 429) {
        toast.error(data.error || 'Builder limit reached. Resets at midnight.');
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // If clear, start build immediately
      if (data.ready) {
         const startRes = await fetch('/api/builder/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: data.projectId })
         });

         if (!startRes.ok) {
             const startData = await startRes.json();
             throw new Error(startData.error || 'Failed to start build');
         }

         router.push(`/app/builder/terminal/${data.projectId}`);
      } else {
         // Show questionnaire
         router.push(`/app/builder/questionnaire/${data.projectId}`);
      }

    } catch (error: any) {
      toast.error(error.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header title="New Project" />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px]">

          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="mb-4" style={{ color: 'var(--text-primary)' }}>
              <DigItnLogo size={40} />
            </div>
            <h1
              className="text-2xl font-semibold text-center mb-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
            >
              What are we building?
            </h1>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Tell DIGITN AI about your project. We'll start building right away.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Stack selector */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Tech stack <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BUILDER_STACKS.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStack(s.value)}
                    className="text-left px-4 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{
                      backgroundColor: stack === s.value ? 'rgba(217, 119, 87, 0.1)' : 'var(--card-bg)',
                      border: stack === s.value ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      color: stack === s.value ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: stack === s.value ? 600 : 400,
                    }}
                  >
                    <FiCode size={13} className="inline mr-2 opacity-70" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project name (optional) */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Project name <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. My Restaurant Website"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Describe your project <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. A restaurant website with an online reservation system, a menu page with photos, and a contact form. Modern design, mobile-friendly."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                The more detail you give, the better the result.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !stack || !description.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              {submitting ? (
                <>
                  <FiLoader size={15} className="animate-spin" />
                  Creating project…
                </>
              ) : (
                <>
                  Start Building
                  <FiArrowRight size={15} />
                </>
              )}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              Submitting this form uses 1 builder request from your daily quota.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
