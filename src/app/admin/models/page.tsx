'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ModelsAdmin() {
  const [freeModels, setFreeModels] = useState<string[]>([]);
  const [paidModels, setPaidModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadModels() {
      try {
        const [freeRes, paidRes] = await Promise.all([
          fetch('/api/admin/config?key=free_models').then(r => r.json()),
          fetch('/api/admin/config?key=paid_models').then(r => r.json())
        ]);

        if (freeRes.value) setFreeModels(freeRes.value || []);
        if (paidRes.value) setPaidModels(paidRes.value || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load models");
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await Promise.all([
        fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'free_models', value: freeModels })
        }),
        fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'paid_models', value: paidModels })
        })
      ]);

      toast.success('Models updated successfully');
    } catch (err) {
      toast.error('Failed to save models');
    } finally {
      setSaving(false);
    }
  };

  const handleFreeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Convert newline separated string back to array
    const text = e.target.value;
    setFreeModels(text.split('\n').filter(m => m.trim() !== ''));
  };

  const handlePaidChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPaidModels(text.split('\n').filter(m => m.trim() !== ''));
  };

  if (loading) return <div className="p-10">Loading configuration...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2" style={{ color: 'var(--text-primary)' }}>AI Models</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage which 9Router models each tier has access to</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-serif mb-2 text-[var(--text-primary)]">Free Tier Models</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Enter one model name per line</p>

          <textarea
            value={freeModels.join('\n')}
            onChange={handleFreeChange}
            rows={6}
            className="w-full px-4 py-3 rounded-md outline-none transition-colors bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] font-mono text-sm"
          />
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-serif mb-2 text-[var(--text-primary)]">Pro & Plus Tier Models</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Enter one model name per line. Premium users get access to these faster models.</p>

          <textarea
            value={paidModels.join('\n')}
            onChange={handlePaidChange}
            rows={6}
            className="w-full px-4 py-3 rounded-md outline-none transition-colors bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] font-mono text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[var(--accent)] text-white rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save Model Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}