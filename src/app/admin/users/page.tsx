'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, tier, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load users');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  const changeUserTier = async (userId: string, newTier: string) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ tier: newTier })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User tier updated to ${newTier.toUpperCase()}`);

      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, tier: newTier } : u
      ));
    } catch (error: any) {
      toast.error(`Error updating user: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2" style={{ color: 'var(--text-primary)' }}>Manage Users</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Upgrade or downgrade user subscription tiers</p>
        </div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 text-sm bg-[var(--card-bg)] border border-[var(--border)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
        >
          Refresh List
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--text-secondary)]">Loading users...</div>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-[var(--text-tertiary)]">User</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-[var(--text-tertiary)]">Joined</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-[var(--text-tertiary)]">Current Tier</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-[var(--text-tertiary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">{user.name || 'No Name'}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider
                      ${user.tier === 'plus' ? 'bg-[var(--accent)] text-white' :
                        user.tier === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
                    >
                      {user.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      disabled={updating === user.id}
                      value={user.tier}
                      onChange={(e) => changeUserTier(user.id, e.target.value)}
                      className="text-sm px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="plus">Plus</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}