'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function LimitsAdmin() {
  const [limits, setLimits] = useState<any>({
    free: { requests_per_day: 10, preview_minutes: 15, max_active_projects: 1 },
    pro: { requests_per_day: 50, preview_minutes: 15, max_active_projects: 3 },
    plus: { requests_per_day: 9999, preview_minutes: 15, max_active_projects: 999 }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadLimits() {
      try {
        const { data, error } = await supabase
          .from('admin_config')
          .select('value')
          .eq('key', 'tier_limits')
          .single();

        if (error) throw error;
        if (data?.value) setLimits(data.value);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tier limits");
      } finally {
        setLoading(false);
      }
    }
    loadLimits();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'tier_limits', value: limits })
      });

      if (!res.ok) throw new Error('Failed to save');
      toast.success('Tier limits updated successfully');
    } catch (err) {
      toast.error('Failed to save limits');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = (tier: string, field: string, value: string) => {
    setLimits((prev: any) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: parseInt(value) || 0
      }
    }));
  };

  if (loading) return <div className="p-10">Loading configuration...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2" style={{ color: 'var(--text-primary)' }}>Tier Limits</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Configure global quota limits for each subscription tier</p>
        <p className="text-xs mt-2 p-3 bg-blue-50 text-blue-800 rounded border border-blue-200">
          Note: Changes here will affect the backend limits globally. The frontend display in the Dashboard relies on src/config/platform.ts. Update that file and redeploy for UI consistency.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {['free', 'pro', 'plus'].map((tier) => (
          <div key={tier} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-serif mb-4 uppercase tracking-wider text-[var(--accent)]">{tier} Tier</h2>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Daily Builder Requests</label>
                <input
                  type="number"
                  value={limits[tier]?.requests_per_day || 0}
                  onChange={(e) => handleUpdate(tier, 'requests_per_day', e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Active Projects Limit</label>
                <input
                  type="number"
                  value={limits[tier]?.max_active_projects || 0}
                  onChange={(e) => handleUpdate(tier, 'max_active_projects', e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Preview Minutes</label>
                <input
                  type="number"
                  value={limits[tier]?.preview_minutes || 15}
                  onChange={(e) => handleUpdate(tier, 'preview_minutes', e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[var(--accent)] text-white rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save Global Limits'}
          </button>
        </div>
      </form>
    </div>
  );
}