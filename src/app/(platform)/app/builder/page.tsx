'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { BuildProgress } from '@/components/builder/BuildProgress';
import { ProjectPreview } from '@/components/builder/ProjectPreview';
import toast from 'react-hot-toast';

export default function BuilderPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'planning' | 'building' | 'preview'>('planning');
  const [projectData, setProjectData] = useState<any>(null);

  // In a real app, the ChatInterface would have a special "Approve Plan" button
  // For now, we simulate the transition from Chat -> Build
  const handleApprovePlan = async (planText: string, projectName: string, conversationId: string) => {
    try {
      const res = await fetch('/api/builder/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, planText, conversationId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProjectId(data.projectId);
      setPhase('building');

      // Fetch expiry immediately
      // ... (Implementation detail omitted for brevity)

    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header title="Créateur de Projets IA" />

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full max-w-platform mx-auto">
          {phase === 'planning' && (
            <div className="h-full bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
              {/* Note: In production, pass handleApprovePlan to a specialized BuilderChatInterface */}
              <ChatInterface />
            </div>
          )}

          {phase === 'building' && projectId && (
            <div className="h-full flex flex-col justify-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-serif mb-6 text-[var(--text-primary)]">Génération du code en cours...</h2>
              <BuildProgress
                projectId={projectId}
                onComplete={() => setPhase('preview')}
              />
            </div>
          )}

          {phase === 'preview' && projectId && (
            <ProjectPreview
              projectId={projectId}
              projectName="Nouveau Projet"
              expiresAt={new Date(Date.now() + 15 * 60000).toISOString()} // 15 min from now
              onRebuild={() => setPhase('building')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
