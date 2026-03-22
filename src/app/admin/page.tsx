'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton, SkeletonStat } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [config, setConfig] = useState<any>({ base_url: '', auth_token: '' });
  const [stats, setStats] = useState({ users: 0, pro: 0, plus: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        // Load config
        const { data: cfg } = await supabase.from('admin_config').select('value').eq('key', 'bridge_settings').single();
        if (cfg) setConfig(cfg.value);

        // Load stats
        const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: pro } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'pro');
        const { count: plus } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'plus');

        setStats({ users: users || 0, pro: pro || 0, plus: plus || 0 });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'bridge_settings', value: config })
    });
    if (res.ok) toast.success('Configuration 9Router sauvegardée');
    else toast.error('Erreur de sauvegarde');
    setSaving(false);
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-serif mb-2" style={{ color: 'var(--text-primary)' }}>System Overview</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Monitor platform usage and manage configuration</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <SkeletonStat />
          </>
        ) : (
          <>
            <div
              className="p-6 rounded-xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <p className="text-xs uppercase tracking-[0.15em] font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
                Total Users
              </p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{stats.users}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>All registered accounts</p>
            </div>
            <div
              className="p-6 rounded-xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <p className="text-xs uppercase tracking-[0.15em] font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
                PRO Subscriptions
              </p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>{stats.pro}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>Active PRO plans</p>
            </div>
            <div
              className="p-6 rounded-xl transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <p className="text-xs uppercase tracking-[0.15em] font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
                PLUS Subscriptions
              </p>
              <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>{stats.plus}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>Active PLUS plans</p>
            </div>
          </>
        )}
      </div>

      {/* 9Router Config */}
      <h2 className="text-2xl font-serif mb-2" style={{ color: 'var(--text-primary)' }}>9Router Configuration</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Manage the AI routing proxy settings</p>

      {loading ? (
        <div className="max-w-2xl p-8 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <div className="space-y-6">
            <div>
              <Skeleton height={12} width="30%" rounded="sm" className="mb-3" />
              <Skeleton height={44} rounded="md" />
            </div>
            <div>
              <Skeleton height={12} width="25%" rounded="sm" className="mb-3" />
              <Skeleton height={44} rounded="md" />
            </div>
            <Skeleton height={44} width={160} rounded="md" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveConfig} className="max-w-2xl p-8 rounded-xl space-y-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>9Router Base URL</label>
            <input
              type="url"
              value={config.base_url}
              onChange={e => setConfig({...config, base_url: e.target.value})}
              className="w-full px-4 py-3 rounded-md outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Auth Token (API Key)</label>
            <input
              type="password"
              value={config.auth_token}
              onChange={e => setConfig({...config, auth_token: e.target.value})}
              className="w-full px-4 py-3 rounded-md outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              placeholder="sk-..."
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 font-medium rounded-md transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      )}
    </div>
  );
}
