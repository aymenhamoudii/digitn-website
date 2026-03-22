# DIGITN SaaS Platform — Phase 3: AI Builder Mode & Execution Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Builder Mode" where users describe a project, the AI asks clarifying questions (planning phase), and then autonomously builds and deploys the codebase using the Claude Code SDK running on the VPS.

**Architecture:**
1. **Frontend:** Two-stage UI (Planning Chat → Build Progress → Live Preview)
2. **Bridge API:** Endpoints to manage planning states and trigger build jobs.
3. **Execution Engine:** A Node.js worker in the Bridge that spawns a headless `claude` CLI process in an isolated directory (`/var/www/projects/[id]`), passes the approved plan as a prompt, streams `stdout`/`stderr` back to the frontend as build progress, and zips the result.

**Tech Stack:** Next.js API Routes, Express.js (Bridge), Server-Sent Events (SSE), Node.js `child_process.spawn`, `archiver` (ZIP creation)

---

## File Structure

### AI Bridge Server (VPS)
- Create: `bridge/src/lib/builder.js` — manages `claude` CLI execution and streams
- Create: `bridge/src/routes/build.js` — endpoints for starting/streaming builds
- Modify: `bridge/server.js` — mount build routes

### Next.js Frontend
- Create: `src/components/builder/BuilderChat.tsx` — planning chat interface
- Create: `src/components/builder/BuildProgress.tsx` — terminal-like output stream
- Create: `src/components/builder/ProjectPreview.tsx` — iframe and controls
- Create: `src/app/(platform)/app/builder/page.tsx` — builder container
- Create: `src/app/(platform)/app/builder/[id]/page.tsx` — existing project view
- Create: `src/app/api/builder/create/route.ts` — API to trigger bridge build
- Create: `src/app/api/builder/stream/route.ts` — proxy SSE from bridge

---

## Task 1: Bridge Server Execution Engine (The Claude Spawner)

**Files:**
- Create: `bridge/src/lib/builder.js`
- Install: `archiver` in `bridge/`

- [ ] **Step 1: Install archiving dependency in Bridge**

```bash
cd bridge && npm install archiver
```

- [ ] **Step 2: Create builder execution logic**

Create `bridge/src/lib/builder.js`:
```javascript
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const archiver = require('archiver');
const { supabase } = require('./supabase');
const { getRouterClient } = require('./router9');

// Map to store active build streams
const activeStreams = new Map();

/**
 * Executes Claude Code in a headless state to build a project
 */
async function startProjectBuild(projectId, planText, tier) {
  const projectDir = `/var/www/projects/${projectId}`;
  const zipPath = `/var/www/zips/${projectId}.zip`;

  // Setup stream buffer
  activeStreams.set(projectId, { clients: [], log: '' });
  const emit = (data) => {
    const stream = activeStreams.get(projectId);
    if (!stream) return;
    stream.log += data;
    stream.clients.forEach(res => res.write(`data: ${JSON.stringify({ type: 'log', text: data })}\n\n`));
  };

  const emitStatus = (status, payload = {}) => {
    const stream = activeStreams.get(projectId);
    if (!stream) return;
    stream.clients.forEach(res => res.write(`data: ${JSON.stringify({ type: 'status', status, ...payload })}\n\n`));
  };

  try {
    // 1. Ensure directories exist
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir('/var/www/zips', { recursive: true });
    await supabase.from('projects').update({ status: 'building' }).eq('id', projectId);

    emit('Initializing workspace...\n');

    // 2. Fetch routing config for tier
    const { models } = await getRouterClient(tier);
    const selectedModel = models[0];

    // 3. Create instruction file
    const instruction = `You are an expert full-stack developer. Build the following project autonomously.
DO NOT wait for user input. DO NOT ask questions. Just implement it.
When you are done, output EXACTLY the phrase "PROJECT_BUILD_COMPLETE".

Here is the approved plan:
${planText}`;

    const promptPath = path.join(projectDir, '.build-prompt.txt');
    await fs.writeFile(promptPath, instruction);

    emit(`Starting Claude Code agent (Model: ${tier} tier)...\n`);

    // 4. Spawn Claude Code process
    // Note: We use --print to make it run non-interactively
    const claudeProcess = spawn('npx', [
      '-y', '@anthropic-ai/claude-code',
      '--print',
      '-p', instruction
    ], {
      cwd: projectDir,
      env: {
        ...process.env,
        ANTHROPIC_BASE_URL: 'http://localhost:20128/v1',
        ANTHROPIC_AUTH_TOKEN: process.env.BRIDGE_SECRET, // 9Router auth
        ANTHROPIC_MODEL: selectedModel
      }
    });

    claudeProcess.stdout.on('data', (data) => emit(data.toString()));
    claudeProcess.stderr.on('data', (data) => emit(`[WARN] ${data.toString()}`));

    await new Promise((resolve, reject) => {
      claudeProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Claude process exited with code ${code}`));
      });
    });

    emit('\nCode generation complete. Packaging project...\n');

    // 5. Generate ZIP
    await new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      // Zip everything except heavy node_modules if they exist
      archive.glob('**/*', { cwd: projectDir, ignore: ['node_modules/**', '.build-prompt.txt'] });
      archive.finalize();
    });

    // 6. Update DB
    await supabase.from('projects').update({
      status: 'ready',
      serve_path: projectDir,
      public_url: `https://digitn.tech/projects/${projectId}`,
      zip_path: zipPath
    }).eq('id', projectId);

    emitStatus('ready', { url: `https://digitn.tech/projects/${projectId}` });

  } catch (error) {
    emit(`\n[ERROR] Build failed: ${error.message}\n`);
    await supabase.from('projects').update({ status: 'failed' }).eq('id', projectId);
    emitStatus('failed', { error: error.message });
  } finally {
    // End streams and cleanup memory
    const stream = activeStreams.get(projectId);
    if (stream) {
      stream.clients.forEach(res => res.end());
      activeStreams.delete(projectId);
    }
  }
}

function attachClientToStream(projectId, res) {
  const stream = activeStreams.get(projectId);
  if (!stream) return false;

  // Send backlog
  res.write(`data: ${JSON.stringify({ type: 'log', text: stream.log })}\n\n`);
  stream.clients.push(res);

  req.on('close', () => {
    stream.clients = stream.clients.filter(c => c !== res);
  });

  return true;
}

module.exports = { startProjectBuild, attachClientToStream };
```

- [ ] **Step 3: Commit**

```bash
git add bridge/src/lib/builder.js bridge/package.json bridge/package-lock.json
git commit -m "feat(bridge): add claude code execution engine and zipper"
```

---

## Task 2: Bridge Build API Routes

**Files:**
- Create: `bridge/src/routes/build.js`
- Modify: `bridge/server.js`

- [ ] **Step 1: Create build routes**

Create `bridge/src/routes/build.js`:
```javascript
const express = require('express');
const { supabase } = require('../lib/supabase');
const { startProjectBuild, attachClientToStream } = require('../lib/builder');
const router = express.Router();

// Trigger a new build
router.post('/start', async (req, res) => {
  const { projectId, planText, userId } = req.body;
  if (!projectId || !planText) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';

    // Start asynchronously (don't await)
    startProjectBuild(projectId, planText, tier);

    return res.json({ success: true, projectId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Stream build logs
router.get('/stream/:projectId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const attached = attachClientToStream(req.params.projectId, res);

  if (!attached) {
    // If not streaming, check if it's already done
    supabase.from('projects').select('status').eq('id', req.params.projectId).single()
      .then(({ data }) => {
        if (data && data.status === 'ready') {
          res.write(`data: ${JSON.stringify({ type: 'status', status: 'ready', url: `https://digitn.tech/projects/${req.params.projectId}` })}\n\n`);
        } else if (data && data.status === 'failed') {
          res.write(`data: ${JSON.stringify({ type: 'status', status: 'failed' })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ type: 'error', message: 'Build not found or expired' })}\n\n`);
        }
        res.end();
      });
  }
});

module.exports = router;
```

- [ ] **Step 2: Mount routes in Express**

Modify `bridge/server.js` to add the new routes under the chatRoutes line:
```javascript
// Add these lines near the top
const buildRoutes = require('./src/routes/build');

// Add this line after app.use('/chat', chatRoutes);
app.use('/build', buildRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add bridge/src/routes/build.js bridge/server.js
git commit -m "feat(bridge): add build trigger and stream endpoints"
```

---

## Task 3: Next.js Builder API Proxies

**Files:**
- Create: `src/app/api/builder/create/route.ts`
- Create: `src/app/api/builder/stream/[id]/route.ts`

- [ ] **Step 1: Create project generation trigger**

Create `src/app/api/builder/create/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, planText, conversationId } = body;

    // 1. Quota Check (Same logic as chat)
    const today = new Date().toISOString().split('T')[0];
    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).single();
    const limit = userData?.tier === 'free' ? 10 : userData?.tier === 'pro' ? 50 : 9999;

    let { data: quota } = await supabase.from('usage_quotas').select('*').eq('user_id', user.id).eq('date', today).single();
    if (!quota) {
      const { data: newQuota } = await supabase.from('usage_quotas').insert({ user_id: user.id, date: today, requests_used: 0, requests_limit: limit }).select().single();
      quota = newQuota;
    }

    if (quota!.requests_used >= quota!.requests_limit) {
      return NextResponse.json({ error: 'Quota exceeded', code: 'QUOTA_EXCEEDED' }, { status: 429 });
    }

    await supabase.from('usage_quotas').update({ requests_used: quota!.requests_used + 1 }).eq('id', quota!.id);

    // 2. Create DB Project Record
    // Set expiry: 15 minutes from now for ALL tiers
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

    const { data: project, error: dbErr } = await supabase.from('projects').insert({
      user_id: user.id,
      conversation_id: conversationId,
      name: name || 'Untitled Project',
      status: 'building',
      expires_at: expiresAt
    }).select().single();

    if (dbErr) throw dbErr;

    // 3. Trigger Bridge Async Build
    const bridgeUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';

    // We don't await the result of the stream, just the acknowledgement
    await fetch(`${bridgeUrl}/build/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`,
      },
      body: JSON.stringify({
        projectId: project.id,
        planText,
        userId: user.id
      }),
    });

    return NextResponse.json({ projectId: project.id });

  } catch (error) {
    console.error('Build trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create stream proxy**

Create `src/app/api/builder/stream/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const { data: project } = await supabase.from('projects').select('id').eq('id', params.id).eq('user_id', user.id).single();
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const bridgeUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';

    const response = await fetch(`${bridgeUrl}/build/stream/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`,
      }
    });

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Stream failed' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/builder/
git commit -m "feat: add Next.js builder trigger and stream proxies"
```

---

## Task 4: UI — Build Progress & Preview Components

**Files:**
- Create: `src/components/builder/BuildProgress.tsx`
- Create: `src/components/builder/ProjectPreview.tsx`

- [ ] **Step 1: Create BuildProgress**

Create `src/components/builder/BuildProgress.tsx`:
```typescript
'use client';

import { useEffect, useState, useRef } from 'react';
import { FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface BuildProgressProps {
  projectId: string;
  onComplete: () => void;
}

export function BuildProgress({ projectId, onComplete }: BuildProgressProps) {
  const [logs, setLogs] = useState<string>('');
  const [status, setStatus] = useState<'building' | 'ready' | 'failed'>('building');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/builder/stream/${projectId}`);

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'log') {
        setLogs(prev => prev + data.text);
      } else if (data.type === 'status') {
        setStatus(data.status);
        if (data.status === 'ready' || data.status === 'failed') {
          eventSource.close();
          if (data.status === 'ready') onComplete();
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setStatus('failed');
    };

    return () => eventSource.close();
  }, [projectId, onComplete]);

  return (
    <div className="w-full bg-[#1e1d1b] rounded-xl overflow-hidden border border-[var(--border)] font-mono text-sm text-green-400">
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/70">
          {status === 'building' ? <FiLoader className="animate-spin" /> :
           status === 'ready' ? <FiCheckCircle className="text-green-500" /> :
           <FiXCircle className="text-red-500" />}
          <span>Termial - DIGITN AI Builder</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
      </div>

      <div className="p-4 h-[400px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
        {logs}
        {status === 'building' && <span className="animate-pulse">_</span>}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ProjectPreview**

Create `src/components/builder/ProjectPreview.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { FiMonitor, FiSmartphone, FiExternalLink, FiDownload, FiRefreshCw } from 'react-icons/fi';

interface ProjectPreviewProps {
  projectId: string;
  projectName: string;
  expiresAt: string;
  onRebuild: () => void;
}

export function ProjectPreview({ projectId, projectName, expiresAt, onRebuild }: ProjectPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const url = `https://digitn.tech/projects/${projectId}`;
  const zipUrl = `https://digitn.tech/zips/${projectId}.zip`;

  // Calculate minutes left
  const minsLeft = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60000));

  return (
    <div className="w-full flex flex-col h-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">

      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--card-bg)] border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-[var(--text-primary)]">{projectName}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${minsLeft < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            Expire dans {minsLeft} min
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Device Toggles */}
          <div className="flex bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border)]">
            <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-[var(--card-bg)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}>
              <FiMonitor size={14} />
            </button>
            <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-[var(--card-bg)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}>
              <FiSmartphone size={14} />
            </button>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <button onClick={onRebuild} className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <FiRefreshCw size={14} /> Reconstruire
          </button>

          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
            <FiExternalLink size={14} /> Ouvrir
          </a>

          <a href={zipUrl} download className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity">
            <FiDownload size={14} /> Télécharger
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className={`transition-all duration-300 border border-[var(--border-strong)] bg-white rounded-md overflow-hidden shadow-lg ${
          device === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full'
        }`}>
          <iframe
            src={url}
            className="w-full h-full border-none"
            title="Project Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/builder/
git commit -m "feat: add builder UI components (progress terminal, preview iframe)"
```

---

## Task 5: Builder Pages

**Files:**
- Create: `src/app/(platform)/app/builder/page.tsx`
- Create: `src/app/(platform)/app/projects/page.tsx`

- [ ] **Step 1: Create Main Builder Page**

Create `src/app/(platform)/app/builder/page.tsx`:
```typescript
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
```

- [ ] **Step 2: Create Projects List Page**

Create `src/app/(platform)/app/projects/page.tsx`:
```typescript
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
                      isExpired ? 'bg-gray-200 text-gray-600' :
                      p.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
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
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(platform\)/app/builder/ src/app/\(platform\)/app/projects/
git commit -m "feat: add builder and projects list pages"
```

---

## Verification

After completing the tasks:

- [ ] Ensure `npm install archiver` succeeded inside the `bridge/` directory
- [ ] Ensure all 5 steps are complete and committed
- [ ] Run `npm run build` in the main directory to ensure no Typescript errors

Let me know which execution option you prefer!