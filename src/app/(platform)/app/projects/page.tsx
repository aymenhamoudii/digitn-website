import { Header } from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FiGlobe, FiClock, FiTrash2 } from 'react-icons/fi';

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Mes Projets" />

      <div className="p-8 max-w-platform mx-auto w-full">
        {(!projects || projects.length === 0) ? (
          <div className="text-center py-20 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Aucun projet trouvé</h3>
            <p className="text-[var(--text-secondary)] mt-2 mb-6">Commencez par générer un projet avec l'IA.</p>
            <Link href="/app/builder" className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-md font-medium text-sm">
              Créer un projet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => {
              const isExpired = p.status === 'expired' || new Date(p.expires_at) < new Date();

              return (
                <div key={p.id} className={`p-6 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] transition-all ${isExpired ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-1'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-[var(--text-primary)] truncate" title={p.name}>{p.name}</h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm ${
                      isExpired ? 'bg-[var(--card-strong)] text-[var(--text-tertiary)]' :
                      p.status === 'ready' ? 'bg-green-500/15 text-green-600' : 'bg-yellow-500/15 text-yellow-600'
                    }`}>
                      {isExpired ? 'Expiré' : p.status}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-6 flex items-center gap-1.5">
                    <FiClock size={12} /> {new Date(p.created_at).toLocaleDateString()}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-[var(--border-strong)]">
                    {p.status === 'ready' && !isExpired ? (
                      <a href={p.public_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--accent-blue)] flex items-center gap-1.5 hover:underline">
                        <FiGlobe size={14} /> Ouvrir le site
                      </a>
                    ) : (
                      <span className="text-sm text-[var(--text-tertiary)]">Non disponible</span>
                    )}

                    <button className="text-[var(--text-tertiary)] hover:text-red-500 transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
