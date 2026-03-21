'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [config, setConfig] = useState<any>({ base_url: '', auth_token: '' });
  const [stats, setStats] = useState({ users: 0, pro: 0, plus: 0 });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Load config
      const { data: cfg } = await supabase.from('admin_config').select('value').eq('key', 'bridge_settings').single();
      if (cfg) setConfig(cfg.value);

      // Load stats
      const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: pro } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'pro');
      const { count: plus } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'plus');

      setStats({ users: users || 0, pro: pro || 0, plus: plus || 0 });
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
      <h1 className="text-3xl font-serif text-[var(--text-primary)] mb-8">System Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">Total Users</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.users}</p>
        </div>
        <div className="p-6 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">PRO Subscriptions</p>
          <p className="text-3xl font-bold text-[var(--accent)]">{stats.pro}</p>
        </div>
        <div className="p-6 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-2">PLUS Subscriptions</p>
          <p className="text-3xl font-bold text-green-600">{stats.plus}</p>
        </div>
      </div>

      {/* 9Router Config */}
      <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-6">9Router Configuration</h2>
      <form onSubmit={handleSaveConfig} className="max-w-2xl bg-[var(--card-bg)] p-8 rounded-xl border border-[var(--border)] space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">9Router Base URL</label>
          <input
            type="url"
            value={config.base_url}
            onChange={e => setConfig({...config, base_url: e.target.value})}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Auth Token (API Key)</label>
          <input
            type="password"
            value={config.auth_token}
            onChange={e => setConfig({...config, auth_token: e.target.value})}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md focus:border-[var(--accent)] outline-none"
            placeholder="sk-..."
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
