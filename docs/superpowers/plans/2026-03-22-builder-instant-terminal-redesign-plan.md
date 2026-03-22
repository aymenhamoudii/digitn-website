# Builder Instant Terminal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Builder flow into a unified terminal-style interface where form submission immediately triggers analysis, shows an optional questionnaire if vague, and provides a real-time terminal that transitions into a post-build chat interface.

**Architecture:** We will create a new analysis endpoint that uses the AI Bridge to determine project clarity. If unclear, it returns multiple-choice questions displayed on a new Questionnaire page. If clear (or after questionnaire submission), the build starts and streams logs to a new Terminal page. The Terminal page doubles as a post-build chat interface, storing message history in a new database table and streaming file modifications.

**Tech Stack:** Next.js (App Router), React, Server-Sent Events (SSE), Express.js (AI Bridge), Supabase (PostgreSQL), Claude Code CLI.

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/002_builder_redesign.sql`

- [ ] **Step 1: Write migration script**

```sql
-- migration file: supabase/migrations/002_builder_redesign.sql

-- Step 1: Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS analysis_result JSONB,
ADD COLUMN IF NOT EXISTS questionnaire_answers TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create post-build chat history table
CREATE TABLE IF NOT EXISTS builder_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create index on project_id and created_at
CREATE INDEX IF NOT EXISTS idx_builder_chat_project ON builder_chat_messages(project_id, created_at DESC);

-- Step 4: Enable RLS on builder_chat_messages
ALTER TABLE builder_chat_messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Add RLS policies for builder_chat_messages
CREATE POLICY "Users can view their own builder chat messages"
  ON builder_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = builder_chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own builder chat messages"
  ON builder_chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = builder_chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Step 6: Update project_status enum
-- Create new enum type
CREATE TYPE project_status_new AS ENUM ('planning', 'analyzing', 'building', 'ready', 'failed', 'expired');

-- Add temporary column
ALTER TABLE projects ADD COLUMN status_new project_status_new;

-- Copy data
UPDATE projects SET status_new = status::text::project_status_new;

-- Drop old column, rename new
ALTER TABLE projects DROP COLUMN status;
ALTER TABLE projects RENAME COLUMN status_new TO status;

-- Drop old type, rename new type
DROP TYPE project_status;
ALTER TYPE project_status_new RENAME TO project_status;

-- Set default
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'planning'::project_status;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/002_builder_redesign.sql
git commit -m "feat(db): add schema migration for builder redesign"
```

### Task 2: AI Bridge - Analysis Route

**Files:**
- Create: `bridge/src/routes/builder-analyze.js`
- Modify: `bridge/server.js`

- [ ] **Step 1: Implement the analysis route**

```javascript
// bridge/src/routes/builder-analyze.js
const express = require('express');
const { getRouterClient } = require('../lib/router9');
const { supabase } = require('../lib/supabase');
const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { description, stack, userId } = req.body;

  try {
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';
    const { client, models } = await getRouterClient(tier);

    const prompt = `You are analyzing a project description to determine if it's clear enough to build.

Project: ${description}
Stack: ${stack}

If the description is clear and detailed enough to build immediately, respond with ONLY this JSON:
{ "ready": true }

If the description is vague or missing critical details, generate 3-6 multiple-choice questions. Respond with ONLY this JSON:
{
  "ready": false,
  "questions": [
    {
      "id": "q1",
      "text": "What's the visual style?",
      "type": "single",
      "options": [
        { "value": "retro", "label": "Classic retro (pixel grid)" },
        { "value": "modern", "label": "Modern / clean UI" }
      ]
    }
  ]
}

Rules:
- Maximum 6 questions
- Use "single" for one choice, "multiple" for multi-select
- Make questions specific to the project type
- Each question must have 2-5 options
- Return ONLY valid JSON, no markdown, no explanation`;

    const completion = await client.chat.completions.create({
      model: models[0],
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content.trim();

    // Parse JSON with fallback
    let result;
    try {
      const cleaned = responseText.replace(/\`\`\`json\n?|\n?\`\`\`/g, '').trim();
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('AI returned invalid JSON:', responseText);
      result = { ready: true }; // Fallback: skip questionnaire
    }

    // Validate structure
    if (result.ready === false && (!result.questions || !Array.isArray(result.questions))) {
      result = { ready: true };
    }

    return res.json(result);

  } catch (err) {
    console.error('Analysis error:', err);
    return res.json({ ready: true }); // Fail open
  }
});

module.exports = router;
```

- [ ] **Step 2: Update bridge/server.js to use the new route**

```javascript
// Add these lines to bridge/server.js around line 24:
const builderAnalyzeRoutes = require('./src/routes/builder-analyze');
app.use('/builder', builderAnalyzeRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add bridge/src/routes/builder-analyze.js bridge/server.js
git commit -m "feat(bridge): add project analysis route"
```

### Task 3: Next.js API - Analyze Route

**Files:**
- Create: `src/app/api/builder/analyze/route.ts`

- [ ] **Step 1: Implement Next.js analyze proxy route**

```typescript
// src/app/api/builder/analyze/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAndIncrementQuota } from '@/lib/quota';
import { BRIDGE_URL } from '@/config/platform';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { name, description, stack } = await req.json();

    if (!name || !description || !stack) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Idempotency check: Look for existing 'analyzing' project in last 5 minutes
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id, analysis_result')
      .eq('user_id', user.id)
      .eq('name', name)
      .eq('status', 'analyzing')
      .gte('created_at', fiveMinsAgo);

    if (existingProjects && existingProjects.length > 0) {
      // Return existing analysis result if available, otherwise just the ID
      const existing = existingProjects[0];
      const result = existing.analysis_result || { ready: true }; // Assume ready if analysis not complete yet
      return NextResponse.json({ ...result, projectId: existing.id });
    }

    // Check active project limit
    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).maybeSingle();
    const tier = userData?.tier || 'free';

    const maxProjects = tier === 'plus' ? 9999 : tier === 'pro' ? 3 : 1;

    const { count: activeCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['analyzing', 'planning', 'building', 'ready']);

    if ((activeCount || 0) >= maxProjects) {
      return NextResponse.json(
        { error: `You've reached your active project limit (${maxProjects}). Delete or wait for a project to expire.`, code: 'PROJECT_LIMIT' },
        { status: 429 }
      );
    }

    // Check and consume Quota
    try {
      await checkAndIncrementQuota(supabase, user.id, tier, 'builder');
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED') {
        return NextResponse.json(
          { error: 'Builder limit reached. Resets at midnight — or upgrade your plan.', code: 'QUOTA_EXCEEDED' },
          { status: 429 }
        );
      }
      throw err;
    }

    // Create project record with 'analyzing' status
    const { data: project, error: dbError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        description,
        type: stack,
        status: 'analyzing'
      })
      .select('id')
      .single();

    if (dbError || !project) {
      console.error('DB Error creating project:', dbError);
      return NextResponse.json({ error: 'Failed to create project', code: 'INTERNAL_ERROR' }, { status: 500 });
    }

    // Call Bridge /builder/analyze
    const bridgeResponse = await fetch(`${BRIDGE_URL}/builder/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`
      },
      body: JSON.stringify({
        description,
        stack,
        userId: user.id
      })
    });

    if (!bridgeResponse.ok) {
      console.error('Bridge analysis failed:', await bridgeResponse.text());
      return NextResponse.json({ ready: true, projectId: project.id });
    }

    const result = await bridgeResponse.json();

    // Store analysis result
    await supabase
      .from('projects')
      .update({ analysis_result: result })
      .eq('id', project.id);

    return NextResponse.json({ ...result, projectId: project.id });

  } catch (error: any) {
    console.error('Analyze route error:', error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/builder/analyze/route.ts
git commit -m "feat(api): add builder analysis proxy route with idempotency and active limit check"
```

### Task 4: Next.js API - Start Route Modifications

**Files:**
- Modify: `src/app/api/builder/start/route.ts`

- [ ] **Step 1: Modify existing /api/builder/start/route.ts**

```typescript
// src/app/api/builder/start/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { BRIDGE_URL } from '@/config/platform';
import { checkAndIncrementQuota } from '@/lib/quota';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { projectId, answers } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // Get project and verify ownership/status
    const { data: project, error: getError } = await supabase
      .from('projects')
      .select('status, user_id, description, created_at')
      .eq('id', projectId)
      .single();

    if (getError || !project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Project not found or unauthorized', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Idempotency: if already building or ready, return success
    if (project.status === 'building' || project.status === 'ready') {
      return NextResponse.json({ success: true, projectId });
    }

    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).maybeSingle();
    const tier = userData?.tier || 'free';

    // Check if analysis was done recently AND there are no answers (meaning it's part of the same original request)
    // If it's a resume after questionnaire (has answers) or a late retry, consume quota
    let shouldConsumeQuota = true;
    if (!answers) {
       const createdTime = new Date(project.created_at).getTime();
       const now = new Date().getTime();
       if (now - createdTime < 5 * 60 * 1000) {
           shouldConsumeQuota = false; // Already consumed in /analyze
       }
    }

    if (shouldConsumeQuota) {
      try {
        await checkAndIncrementQuota(supabase, user.id, tier, 'builder');
      } catch (err: any) {
        if (err.code === 'QUOTA_EXCEEDED') {
          return NextResponse.json(
            { error: 'Builder limit reached. Resets at midnight — or upgrade your plan.', code: 'QUOTA_EXCEEDED' },
            { status: 429 }
          );
        }
        throw err;
      }
    }

    let fullDescription = project.description;
    if (answers) {
      fullDescription = `${project.description}\n\nAdditional Clarifications:\n${answers}`;

      // Save answers to DB
      await supabase
        .from('projects')
        .update({ questionnaire_answers: answers, description: fullDescription })
        .eq('id', projectId);
    }

    // Update status to 'building'
    await supabase
      .from('projects')
      .update({
        status: 'building',
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
      })
      .eq('id', projectId);

    // Trigger Bridge Build, pass fullDescription and answers
    const bridgeResponse = await fetch(`${BRIDGE_URL}/build/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`
      },
      body: JSON.stringify({
        projectId,
        planText: fullDescription,
        answers, // passing answers too, just in case bridge needs it directly
        userId: user.id
      })
    });

    if (!bridgeResponse.ok) {
       await supabase.from('projects').update({ status: 'failed' }).eq('id', projectId);
       throw new Error(`Bridge returned ${bridgeResponse.status}`);
    }

    return NextResponse.json({ success: true, projectId });

  } catch (error: any) {
    console.error('Builder start error:', error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/builder/start/route.ts
git commit -m "refactor(api): update start route to handle questionnaire answers and consume quota"
```

### Task 5: AI Bridge - Build Start Mod

**Files:**
- Modify: `bridge/src/routes/build.js`

- [ ] **Step 1: Update Bridge `/build/start` route**

```javascript
// In bridge/src/routes/build.js, modify the /start route to accept answers
// and append them to the plan text if provided (as requested in spec)
const express = require('express');
const { supabase } = require('../lib/supabase');
const { startProjectBuild, attachClientToStream } = require('../lib/builder');
const router = express.Router();

// Trigger a new build
router.post('/start', async (req, res) => {
  const { projectId, planText, answers, userId } = req.body;
  if (!projectId || !planText) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';

    // Construct full instruction if answers are provided (though Next.js also appends them)
    // This ensures bridge logic aligns with spec
    let fullPlanText = planText;
    if (answers && !planText.includes('Additional Clarifications')) {
        fullPlanText = `${planText}\n\nAdditional Clarifications:\n${answers}`;
    }

    // Start asynchronously (don't await)
    startProjectBuild(projectId, fullPlanText, tier);

    return res.json({ success: true, projectId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ... rest of the file (stream route) remains unchanged
```
*Note: Ensure the stream route in `bridge/src/routes/build.js` is kept intact.*

- [ ] **Step 2: Commit**

```bash
git add bridge/src/routes/build.js
git commit -m "refactor(bridge): update build start to handle answers"
```

### Task 6: AI Bridge - Chat Route

**Files:**
- Create: `bridge/src/routes/builder-chat.js`
- Modify: `bridge/server.js`

- [ ] **Step 1: Implement bridge post-build chat route**

```javascript
// bridge/src/routes/builder-chat.js
const express = require('express');
const { spawn } = require('child_process');
const { getRouterClient } = require('../lib/router9');
const { supabase } = require('../lib/supabase');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

router.post('/chat/:id', async (req, res) => {
  const { projectId, message, userId } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const emit = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    // Get project info
    const { data: project } = await supabase
      .from('projects')
      .select('serve_path, type, description, questionnaire_answers')
      .eq('id', projectId)
      .single();

    if (!project || !project.serve_path) {
      emit({ type: 'error', message: 'Project not found' });
      return res.end();
    }

    const projectDir = project.serve_path;

    // Check if directory exists
    try {
      await fs.access(projectDir);
    } catch {
      emit({ type: 'error', message: 'Project files have expired or are missing' });
      return res.end();
    }

    // List current files (for context)
    let fileList = '';
    try {
      const getFiles = async (dir, baseDir = '') => {
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        let files = [];
        for (const dirent of dirents) {
          if (dirent.name === 'node_modules' || dirent.name === '.git') continue;
          const res = path.resolve(dir, dirent.name);
          const relative = path.join(baseDir, dirent.name);
          if (dirent.isDirectory()) {
            files = files.concat(await getFiles(res, relative));
          } else {
            files.push(relative);
          }
        }
        return files;
      };
      const files = await getFiles(projectDir);
      fileList = files.slice(0, 30).join(', '); // limit to 30 files for prompt context
    } catch (e) {
      console.warn("Could not list files", e);
      fileList = "Unable to list files";
    }

    // Get user tier
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';
    const { client, models } = await getRouterClient(tier);

    // Fetch recent chat history
    const { data: history } = await supabase
        .from('builder_chat_messages')
        .select('role, content')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

    let historyText = '';
    if (history && history.length > 0) {
        // Reverse because we fetched descending
        history.reverse().forEach(msg => {
            historyText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
        });
    }

    const instruction = `You are modifying an existing project. The user wants to make changes.

Project directory: ${projectDir}
Project type: ${project.type}
Original description: ${project.description}
${project.questionnaire_answers ? `Questionnaire answers:\n${project.questionnaire_answers}` : ''}

Current files: ${fileList}

${historyText ? `Recent conversation history:\n${historyText}` : ''}

User request: ${message}

Instructions:
1. Modify the necessary files to fulfill the request
2. Show what you changed in this format:
   [Modified: filename.ext]
   - old line
   + new line
3. If you need to ask a clarifying question, just ask it naturally
4. When done, say "Done! [brief confirmation]"

DO NOT create new files unless absolutely necessary. Modify existing files.
DO NOT wait for user input. Just make the changes.`;

    // Use Claude Code CLI
    const claudeProcess = spawn('npx', [
      '-y', '@anthropic-ai/claude-code',
      '--print',
      '-p', instruction
    ], {
      cwd: projectDir,
      env: {
        ...process.env,
        ANTHROPIC_BASE_URL: 'http://localhost:20128/v1',
        ANTHROPIC_AUTH_TOKEN: process.env.BRIDGE_SECRET,
        ANTHROPIC_MODEL: models[0]
      }
    });

    let assistantFullResponse = '';

    claudeProcess.stdout.on('data', (data) => {
      const text = data.toString();
      assistantFullResponse += text;
      emit({ type: 'content', text });
    });

    claudeProcess.stderr.on('data', (data) => {
      // Send stderr as well so they see it
      emit({ type: 'content', text: `\n[Log] ${data.toString()}` });
    });

    claudeProcess.on('close', async (code) => {
      if (code === 0) {
        // Update project timestamp
        await supabase.from('projects').update({
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 15 * 60000).toISOString() // Reset 15min timer
        }).eq('id', projectId);

        // Save AI response to chat history
        if (assistantFullResponse.trim()) {
            await supabase.from('builder_chat_messages').insert({
                project_id: projectId,
                role: 'assistant',
                content: assistantFullResponse.trim()
            });
        }

        
        // Repackage ZIP
        const archiver = require('archiver');
        const zipPath = `/var/www/zips/${projectId}.zip`;
        await new Promise((resolve, reject) => {
          const output = require('fs').createWriteStream(zipPath);
          const archive = archiver('zip', { zlib: { level: 9 } });
          output.on('close', resolve);
          archive.on('error', reject);
          archive.pipe(output);
          archive.glob('**/*', { cwd: projectDir, ignore: ['node_modules/**', '.build-prompt.txt'] });
          archive.finalize();
        });

        emit({ type: 'status', status: 'complete' });
      } else {
        emit({ type: 'error', message: `Process exited with code ${code}` });
      }
      res.end();
    });

  } catch (err) {
    console.error('Bridge Builder Chat Error:', err);
    emit({ type: 'error', message: err.message });
    res.end();
  }
});

module.exports = router;
```

- [ ] **Step 2: Update bridge/server.js to use the new route**

```javascript
// Add these lines to bridge/server.js around line 26:
const builderChatRoutes = require('./src/routes/builder-chat');
app.use('/builder', builderChatRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add bridge/src/routes/builder-chat.js bridge/server.js
git commit -m "feat(bridge): add post-build chat proxy route with history saving"
```

### Task 7: Next.js API - Chat Route

**Files:**
- Create: `src/app/api/builder/chat/[id]/route.ts`

- [ ] **Step 1: Implement Next.js chat proxy route**

```typescript
// src/app/api/builder/chat/[id]/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { checkAndIncrementQuota } from '@/lib/quota';
import { BRIDGE_URL } from '@/config/platform';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const projectId = params.id;
    const { message } = await req.json();

    if (!message || !projectId) {
      return NextResponse.json({ error: 'Missing message or projectId' }, { status: 400 });
    }

    // 1. Check ownership and status
    const { data: project, error: getError } = await supabase
      .from('projects')
      .select('status, user_id')
      .eq('id', projectId)
      .single();

    if (getError || !project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Project not found or unauthorized', code: 'NOT_FOUND' }, { status: 404 });
    }

    if (project.status !== 'ready') {
      return NextResponse.json({ error: 'Project is not ready for modifications', code: 'PROJECT_NOT_READY' }, { status: 400 });
    }

    // 2. Check Quota
    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).maybeSingle();
    const tier = userData?.tier || 'free';

    try {
      await checkAndIncrementQuota(supabase, user.id, tier, 'builder');
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED') {
        return NextResponse.json(
          { error: 'Builder limit reached. Resets at midnight — or upgrade your plan.', code: 'QUOTA_EXCEEDED' },
          { status: 429 }
        );
      }
      throw err;
    }

    // 3. Save user message to history
    await supabase.from('builder_chat_messages').insert({
        project_id: projectId,
        role: 'user',
        content: message
    });

    // 4. Proxy to Bridge as SSE
    const bridgeUrl = `${BRIDGE_URL}/builder/chat/${projectId}`;
    const response = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`
      },
      body: JSON.stringify({
        projectId,
        message,
        userId: user.id
      })
    });

    if (!response.ok) {
       console.error("Bridge Chat Proxy Error:", await response.text());
       return NextResponse.json({ error: 'Bridge error', code: 'INTERNAL_ERROR'}, { status: 500 });
    }

    // Instead of streaming proxy in Next.js which is complex, we just pipe the body
    return new Response(response.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    });

  } catch (error: any) {
    console.error('Builder chat proxy error:', error);
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
mkdir -p src/app/api/builder/chat/\[id\]
git add src/app/api/builder/chat/\[id\]/route.ts
git commit -m "feat(api): add nextjs builder chat proxy route"
```

### Task 8: Questionnaire Form Component

**Files:**
- Create: `src/components/builder/QuestionnaireForm.tsx`

- [ ] **Step 1: Create Questionnaire component**

```tsx
// src/components/builder/QuestionnaireForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: Option[];
  allowCustom?: boolean;
}

export default function QuestionnaireForm({
  projectId,
  questions
}: {
  projectId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSingleSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelect = (questionId: string, value: string) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [questionId]: current.filter(v => v !== value) };
      }
      return { ...prev, [questionId]: [...current, value] };
    });
  };

  const onSubmit = async () => {
    // Basic validation: ensure all questions are answered
    for (const q of questions) {
      const ans = answers[q.id];
      if (!ans || (Array.isArray(ans) && ans.length === 0)) {
         toast.error(`Please answer: ${q.text}`);
         return;
      }
    }

    setIsSubmitting(true);

    // Format answers
    let formattedAnswers = '';
    questions.forEach(q => {
      const ans = answers[q.id];
      let answerText = '';
      if (Array.isArray(ans)) {
         answerText = ans.join(', ');
      } else {
         answerText = ans as string;
         if (ans === 'custom') {
             answerText = customInputs[q.id] || 'Other';
         }
      }
      formattedAnswers += `Q: ${q.text}\nA: ${answerText}\n\n`;
    });

    try {
      const res = await fetch('/api/builder/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          answers: formattedAnswers.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start build');
      }

      router.push(`/app/builder/terminal/${projectId}`);
    } catch (err: any) {
      toast.error(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-2">Let's clarify a few details</h1>
        <p className="text-[var(--text-secondary)]">
          Your description was great, but DIGITN AI needs a bit more context to build exactly what you want.
        </p>
      </div>

      <div className="space-y-10">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border)]">
            <h3 className="font-medium text-[var(--text-primary)] mb-4 text-lg">
              <span className="text-[var(--accent)] mr-2">{index + 1}.</span> {q.text}
            </h3>

            <div className="space-y-3">
              {q.options.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                    ${(q.type === 'single' ? answers[q.id] === opt.value : (answers[q.id] as string[])?.includes(opt.value))
                      ? 'border-[var(--accent)] bg-[var(--bg-secondary)]'
                      : 'border-[var(--border)] hover:border-[var(--text-tertiary)] bg-[var(--bg-primary)]'
                    }
                  `}
                >
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type={q.type === 'single' ? 'radio' : 'checkbox'}
                      name={q.id}
                      value={opt.value}
                      className="w-4 h-4 text-[var(--accent)] bg-transparent border-[var(--border)] focus:ring-[var(--accent)]"
                      checked={q.type === 'single'
                        ? answers[q.id] === opt.value
                        : ((answers[q.id] as string[]) || []).includes(opt.value)
                      }
                      onChange={() => q.type === 'single'
                        ? handleSingleSelect(q.id, opt.value)
                        : handleMultiSelect(q.id, opt.value)
                      }
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="text-[var(--text-primary)]">{opt.label}</span>
                  </div>
                </label>
              ))}

              {q.allowCustom && (
                 <label className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                    ${answers[q.id] === 'custom' ? 'border-[var(--accent)] bg-[var(--bg-secondary)]' : 'border-[var(--border)] hover:border-[var(--text-tertiary)] bg-[var(--bg-primary)]'}
                 `}>
                    <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="radio"
                      name={q.id}
                      value="custom"
                      className="w-4 h-4 text-[var(--accent)]"
                      checked={answers[q.id] === 'custom'}
                      onChange={() => handleSingleSelect(q.id, 'custom')}
                    />
                  </div>
                  <div className="ml-3 text-sm w-full">
                    <span className="text-[var(--text-primary)] block mb-2">Something else</span>
                    {answers[q.id] === 'custom' && (
                        <input
                          type="text"
                          placeholder="Please specify..."
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                          value={customInputs[q.id] || ''}
                          onChange={(e) => setCustomInputs(prev => ({...prev, [q.id]: e.target.value}))}
                        />
                    )}
                  </div>
                 </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[#c26549] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Starting Build...' : 'Start Building'} <FiArrowRight />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/builder/QuestionnaireForm.tsx
git commit -m "feat(ui): add QuestionnaireForm component"
```

### Task 9: Questionnaire Page

**Files:**
- Create: `src/app/(platform)/app/builder/questionnaire/[id]/page.tsx`

- [ ] **Step 1: Create Questionnaire page**

```tsx
// src/app/(platform)/app/builder/questionnaire/[id]/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import QuestionnaireForm from '@/components/builder/QuestionnaireForm';

export default async function QuestionnairePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, analysis_result, status')
    .eq('id', params.id)
    .single();

  if (!project || project.user_id !== user.id) {
    notFound();
  }

  // If already building/ready, shouldn't be here
  if (project.status !== 'analyzing' && project.status !== 'planning') {
      redirect(`/app/builder/terminal/${project.id}`);
  }

  // Extract questions from analysis result
  const analysisResult = project.analysis_result as { ready: boolean, questions?: any[] } | null;
  const questions = analysisResult?.questions || [];

  if (questions.length === 0) {
      // Fallback if no questions but somehow ended up here
      redirect(`/app/builder/terminal/${project.id}`);
  }

  return (
    <div className="w-full">
      <QuestionnaireForm projectId={project.id} questions={questions} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
mkdir -p src/app/\(platform\)/app/builder/questionnaire/\[id\]
git add src/app/\(platform\)/app/builder/questionnaire/\[id\]/page.tsx
git commit -m "feat(pages): add questionnaire page"
```

### Task 10: Terminal Chat Component

**Files:**
- Create: `src/components/builder/TerminalChat.tsx`

- [ ] **Step 1: Create Terminal Chat component**

```tsx
// src/components/builder/TerminalChat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiDownload, FiLayout } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface TerminalChatProps {
  projectId: string;
  projectName: string;
  initialStatus: string;
  projectType: string;
}

export default function TerminalChat({ projectId, projectName, initialStatus, projectType }: TerminalChatProps) {
  const [logs, setLogs] = useState<string[]>([`> Initializing workspace for ${projectName}...`]);
  const [status, setStatus] = useState(initialStatus);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(initialStatus === 'building' || initialStatus === 'analyzing');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showPreview, setShowPreview] = useState(initialStatus === 'ready');
  const isWebProject = !projectType.includes('api') && !projectType.includes('backend');

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Initial Build Stream
  useEffect(() => {
    if (initialStatus === 'building' || initialStatus === 'analyzing') {
        const evtSource = new EventSource(`/api/builder/stream/${projectId}`);

        evtSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'log' || data.type === 'content') {
                    setLogs(prev => [...prev, data.text]);
                } else if (data.type === 'status') {
                    setStatus(data.status);
                    if (data.status === 'ready') {
                        setIsProcessing(false);
                        setLogs(prev => [...prev, '\n> ✓ Build complete! Your project is ready.', '> You can now request changes below or download the code.']);
                        if (isWebProject) setShowPreview(true);
                        evtSource.close();
                    } else if (data.status === 'failed') {
                        setIsProcessing(false);
                        setLogs(prev => [...prev, '\n> ❌ Build failed. Please try again.']);
                        evtSource.close();
                    }
                } else if (data.type === 'error') {
                    setLogs(prev => [...prev, `\n> Error: ${data.message}`]);
                    setIsProcessing(false);
                    setStatus('failed');
                    evtSource.close();
                }
            } catch (err) {
                console.error('Failed to parse SSE data', err);
            }
        };

        evtSource.onerror = () => {
            evtSource.close();
        };

        return () => evtSource.close();
    } else if (initialStatus === 'ready') {
        setLogs([`> Project ${projectName} loaded.`, `> You can request changes below or download the code.`]);
    }
  }, [projectId, initialStatus, isWebProject, projectName]);

  // Handle Post-Build Chat Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || status !== 'ready') return;

    const message = input.trim();
    setInput('');
    setLogs(prev => [...prev, `\nYou: ${message}\n`]);
    setIsProcessing(true);
    setStatus('modifying');

    try {
      const response = await fetch(`/api/builder/chat/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\\n\\n");\n        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.type === 'content') {
                 const text = data.text.replace(/\n$/, '');
                 setLogs(prev => [...prev, text]);
              } else if (data.type === 'error') {
                 setLogs(prev => [...prev, `\n[Error] ${data.message}`]);
                 toast.error(data.message);
              } else if (data.type === 'status' && data.status === 'complete') {
                 // complete
              }
            } catch (e) {
              console.error('Error parsing chat SSE line:', line, e);
            }
          }
        }
      }

      setIsProcessing(false);
      setStatus('ready');

      // Refresh the iframe preview
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) {
         iframe.src = iframe.src;
      }

    } catch (err: any) {
      setLogs(prev => [...prev, `\n[System Error] ${err.message}`]);
      setIsProcessing(false);
      setStatus('ready');
      toast.error(err.message);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] gap-4 ${showPreview && isWebProject ? 'lg:flex-row' : ''}`}>
      {/* Main Terminal Column */}
      <div className={`flex flex-col bg-[#1a1a19] rounded-xl border border-[#333] overflow-hidden ${showPreview && isWebProject ? 'lg:w-[40%]' : 'w-full'} h-full transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#222220] border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="font-mono text-sm text-gray-300 ml-2 hidden sm:inline-block truncate max-w-[150px]">{projectName}</span>
            <span className={`px-2 py-0.5 rounded text-xs ml-2 uppercase
              ${status === 'ready' ? 'bg-green-900/50 text-green-400' :
                status === 'failed' ? 'bg-red-900/50 text-red-400' :
                'bg-blue-900/50 text-blue-400'}`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status === 'ready' && isWebProject && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-1.5 rounded transition-colors ${showPreview ? 'bg-[var(--accent)] text-white' : 'bg-[#333] hover:bg-[#444] text-gray-300'}`}
                title="Toggle Preview"
              >
                <FiLayout />
              </button>
            )}
            {status === 'ready' && (
              <a
                href={`/zips/${projectId}.zip`}
                download
                className="flex items-center gap-2 px-3 py-1.5 bg-[#333] hover:bg-[#444] text-white text-sm rounded transition-colors"
              >
                <FiDownload />
                <span className="hidden sm:inline">Download ZIP</span>
              </a>
            )}
            {status === 'modifying' && (
              <button disabled className="flex items-center gap-2 px-3 py-1.5 bg-[#333] opacity-50 text-white text-sm rounded cursor-not-allowed">
                <FiDownload />
                <span className="hidden sm:inline">Updating...</span>
              </button>
            )}
          </div>
        </div>

        {/* Terminal Output */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"
        >
          {logs.map((log, i) => (
            <span key={i}>{log}</span>
          ))}
          {isProcessing && status !== 'modifying' && (
            <span className="animate-pulse">_</span>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-[#222220] border-t border-[#333]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <span className="absolute left-4 text-gray-500 font-mono text-lg">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'ready' || isProcessing}
              placeholder={status === 'ready' && !isProcessing ? "Type a message to modify the project..." : "Please wait..."}
              className="w-full bg-[#1a1a19] text-gray-200 font-mono text-sm py-3 pl-10 pr-12 rounded border border-[#444] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || status !== 'ready' || isProcessing}
              className="absolute right-3 p-1.5 text-gray-400 hover:text-[var(--accent)] disabled:opacity-50 transition-colors"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>

      {/* Live Preview Pane */}
      {showPreview && isWebProject && status === 'ready' && (
        <div className="flex-1 bg-white rounded-xl border border-[var(--border)] overflow-hidden h-full flex flex-col">
          <div className="bg-[var(--bg-secondary)] px-4 py-2 border-b border-[var(--border)] flex items-center text-sm text-[var(--text-secondary)]">
            <span className="font-mono bg-[var(--bg-primary)] px-2 py-1 rounded">https://digitn.tech/projects/{projectId}</span>
          </div>
          <iframe
            id="preview-iframe"
            src={`/projects/${projectId}/`}
            className="w-full flex-1 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Project Preview"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/builder/TerminalChat.tsx
git commit -m "feat(ui): add TerminalChat component with iframe preview"
```

### Task 11: Terminal Page

**Files:**
- Create: `src/app/(platform)/app/builder/terminal/[id]/page.tsx`

- [ ] **Step 1: Create Terminal page**

```tsx
// src/app/(platform)/app/builder/terminal/[id]/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import TerminalChat from '@/components/builder/TerminalChat';

export default async function TerminalPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, type, user_id, status')
    .eq('id', params.id)
    .single();

  if (!project || project.user_id !== user.id) {
    notFound();
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-8 px-4 lg:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-[var(--text-primary)]">Project Workspace</h1>
        <p className="text-[var(--text-secondary)]">Watch DIGITN AI build your project, then chat to modify it.</p>
      </div>

      <TerminalChat
        projectId={project.id}
        projectName={project.name}
        initialStatus={project.status}
        projectType={project.type}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
mkdir -p src/app/\(platform\)/app/builder/terminal/\[id\]
git add src/app/\(platform\)/app/builder/terminal/\[id\]/page.tsx
git commit -m "feat(pages): add terminal page"
```

### Task 12: Modify Builder Form Submission

**Files:**
- Modify: `src/app/(platform)/app/builder/page.tsx`

- [ ] **Step 1: Update form submission in Builder page to use /analyze**

```typescript
// In src/app/(platform)/app/builder/page.tsx, locate the Form submission handler
// Modify it to call /api/builder/analyze instead of creating project directly

// Replace the onSubmit function with this:
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !stack) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/builder/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, stack })
      });

      const data = await res.json();

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
      setIsSubmitting(false);
    }
  };
```

- [ ] **Step 2: Remove old planning chat page**

```bash
rm -rf src/app/\(platform\)/app/builder/\[id\]
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(platform\)/app/builder/page.tsx src/app/\(platform\)/app/builder/\[id\]
git commit -m "refactor(builder): switch form submission to analyze endpoint and remove old chat"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-03-22-builder-instant-terminal-redesign-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**