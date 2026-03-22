# Builder Instant Terminal Redesign

**Date:** 2026-03-22
**Status:** Approved
**Author:** Claude (Sonnet 4.5)

---

## Overview

Complete redesign of the Builder flow to eliminate the separate planning chat phase and create a unified terminal-style interface where users can see Claude Code working in real-time and continue iterating on the project after completion.

---

## Problem Statement

**Current Builder Flow Issues:**
1. Three-phase flow is confusing (form → planning chat → build button → terminal)
2. "Build it" button is unclear - users don't understand when planning ends
3. Planning chat and build terminal are separate interfaces
4. No way to iterate on completed projects
5. Builder quota only consumed on form submission, not during planning chat

**User Request:**
- Form submission should immediately trigger build (or questionnaire if unclear)
- Show Claude Code working in real-time in a terminal-style chat
- After build completes, allow user to continue chatting to fix/modify/add features
- AI should ask clarifying questions (with multiple-choice options) if description is vague
- All interactions use builder quota, not chat quota

---

## Goals

1. **Simplify flow:** Form → (Optional Questionnaire) → Terminal → Download
2. **Unified interface:** Terminal shows build logs + allows post-build chat
3. **Intelligent clarification:** AI generates contextual multiple-choice questions when needed
4. **Iterative development:** Users can modify projects through conversation
5. **Clear quota usage:** Every interaction (analysis, build, chat) uses builder quota

---

## Architecture

### **New Data Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User submits form (name, stack, description)                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. POST /api/builder/analyze                                    │
│    - Check builder quota (consume 1)                            │
│    - Send to Bridge: /builder/analyze                           │
│    - AI analyzes: "Is this clear enough to build?"              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
            ┌───────▼─────┐   ┌────▼──────┐
            │ ready: true │   │ready:false│
            │             │   │questions[]│
            └───────┬─────┘   └────┬──────┘
                    │               │
                    │         ┌─────▼──────────────────────────┐
                    │         │ 3. Show Questionnaire Page     │
                    │         │    - Multiple choice questions │
                    │         │    - User selects answers      │
                    │         │    - Format as Q&A text        │
                    │         └─────┬──────────────────────────┘
                    │               │
                    └───────┬───────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. POST /api/builder/start                                      │
│    - Check builder quota (consume 1 if from questionnaire)      │
│    - Create project record (status: 'building')                 │
│    - Trigger Bridge: /build/start                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Terminal Page Opens (/app/builder/terminal/[id])            │
│    - SSE stream: /api/builder/stream/:id                        │
│    - Shows Claude Code build logs in real-time                  │
│    - Displays: "Initializing...", "Generating files...", etc.   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Build Completes                                              │
│    - Status: 'ready'                                            │
│    - Download button appears                                    │
│    - Terminal becomes chat interface                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Post-Build Chat (Optional)                                   │
│    - User types: "Change background to blue"                    │
│    - POST /api/builder/chat/:id (consume 1 builder quota)       │
│    - AI modifies files in same project directory                │
│    - Shows changes in terminal                                  │
│    - User can download updated version                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Design

### **1. Builder Form Page (`/app/builder/page.tsx`)**

**Changes:**
- Remove navigation to `/app/builder/[id]` (planning chat)
- On submit → Call `/api/builder/analyze`
- If `ready: true` → Navigate to `/app/builder/terminal/[projectId]`
- If `ready: false` → Navigate to `/app/builder/questionnaire/[projectId]` with questions

**UI:**
- Same form (name, stack, description)
- Loading state: "Analyzing your project..."
- Error handling for quota exceeded

---

### **2. NEW: Questionnaire Page (`/app/builder/questionnaire/[id]/page.tsx`)**

**Purpose:** Show AI-generated multiple-choice questions to clarify vague descriptions

**Data Structure (from AI):**
```typescript
interface Question {
  id: string
  text: string
  type: 'single' | 'multiple' // single choice or multi-select
  options: Array<{
    value: string
    label: string
  }>
  allowCustom?: boolean // Show "Something else" text input
}

interface AnalysisResponse {
  ready: boolean
  questions?: Question[]
  projectId: string
}
```

**UI Components:**
- Header: "Let's clarify a few details"
- For each question:
  - Question text (e.g., "What's the visual style?")
  - Radio buttons (single) or checkboxes (multiple)
  - "Something else" option with text input
- Submit button: "Start Building"

**On Submit:**
- Format answers as Q&A text:
  ```
  Q: What's the visual style?
  A: Classic retro (pixel grid)

  Q: What features should be included?
  A: High score + leaderboard, Pause / resume
  ```
- Call `/api/builder/start` with formatted Q&A appended to original description
- Navigate to terminal page

---

### **3. NEW: Terminal Page (`/app/builder/terminal/[id]/page.tsx`)**

**Purpose:** Unified interface showing build logs + post-build chat

**Phases:**

**Phase A: Building**
- SSE connection to `/api/builder/stream/:id`
- Display logs in terminal style (monospace, dark theme)
- Show status: "Building...", "Generating files...", "Packaging..."
- No input allowed during build

**Phase B: Build Complete**
- Show completion message: "✓ Build complete! Your project is ready."
- Show download button
- Show preview iframe (optional)
- Enable chat input at bottom

**Phase C: Post-Build Chat**
- User can type messages
- Each message → POST `/api/builder/chat/:id`
- AI responses stream back via SSE
- Terminal shows conversation + AI actions:
  ```
  You: Change the background to blue

  AI: I'll update the CSS to change the background color.

  [Modified: styles.css]
  - background: #fff
  + background: #0066cc

  Done! The background is now blue. Download the updated version.
  ```

**UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Project Name" | Status Badge | Download Button │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Terminal Output (scrollable)                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ > Initializing workspace...                      │   │
│  │ > Starting Claude Code agent...                  │   │
│  │ > Generating index.html...                       │   │
│  │ > ✓ Build complete!                              │   │
│  │                                                   │   │
│  │ You: Add a dark mode toggle                      │   │
│  │ AI: I'll add a theme switcher...                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
├─────────────────────────────────────────────────────────┤
│ [Type a message...                              ] [Send] │
└─────────────────────────────────────────────────────────┘
```

---

## API Routes

### **NEW: `/api/builder/analyze` (POST)**

**Purpose:** Analyze project description and determine if clarification is needed

**Request:**
```typescript
{
  name: string
  description: string
  stack: string
}
```

**Response:**
```typescript
{
  ready: boolean
  questions?: Question[]
  projectId: string // Created in DB with status 'analyzing'
}
```

**Logic:**
1. Check auth + builder quota (consume 1)
2. Create project record (status: 'analyzing') with idempotency key
3. Call Bridge `/builder/analyze` with description + stack
4. Store result in `analysis_result` JSONB column
5. Return AI response to frontend

**Idempotency:**
- Use `name + userId + timestamp` as idempotency key
- If duplicate request within 5 minutes, return existing project
- Prevents double quota consumption on accidental resubmits

**Error Response Format:**
```typescript
{
  error: string,
  code: 'QUOTA_EXCEEDED' | 'UNAUTHORIZED' | 'INTERNAL_ERROR',
  details?: any
}
```

---

### **MODIFIED: `/api/builder/start` (POST)**

**Purpose:** Start the actual build process

**Request:**
```typescript
{
  projectId: string
  answers?: string // Formatted Q&A text from questionnaire (optional)
}
```

**Response:**
```typescript
{
  success: boolean
  projectId: string
}
```

**Logic:**
1. Check auth + ownership
2. Verify project exists and is in 'analyzing' status
3. If `answers` provided:
   - Check if quota already consumed (check project created_at < 5 min ago)
   - If fresh project, consume 1 builder quota
   - Append answers to project description in DB
4. Update project status to 'building'
5. Call Bridge `/build/start` with full description + answers
6. Return success

**Idempotency:**
- If project already in 'building' or 'ready' status, return success without re-triggering
- Prevents duplicate builds on page refresh

**Error Response Format:**
```typescript
{
  error: string,
  code: 'QUOTA_EXCEEDED' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR',
  details?: any
}
```

---

### **NEW: `/api/builder/chat/:id` (POST)**

**Purpose:** Post-build chat to modify/fix/enhance the project

**Request:**
```typescript
{
  message: string
}
```

**Response:** SSE stream with events:
```typescript
// Event format:
data: {"type":"content","text":"Analyzing your request..."}
data: {"type":"file_modified","file":"styles.css","diff":"- background: #fff\n+ background: #0066cc"}
data: {"type":"status","status":"complete"}
data: {"type":"error","message":"Failed to modify file"}
```

**Logic:**
1. Check auth + ownership + builder quota (consume 1)
2. Verify project status is 'ready'
3. Get project directory and file list
4. Call Bridge `/builder/chat/:id` with message + context
5. Stream AI response back to frontend
6. Bridge resets expiry timer to now + 15 minutes
7. Update project `updated_at` timestamp

**Context Handling:**
- Each request includes full conversation history (last 10 messages max)
- Stored in new `builder_chat_messages` table:
  ```sql
  CREATE TABLE builder_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user' | 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- This ensures AI has context for follow-up requests

**Error Response Format:**
```typescript
{
  error: string,
  code: 'QUOTA_EXCEEDED' | 'NOT_FOUND' | 'PROJECT_NOT_READY' | 'UNAUTHORIZED' | 'INTERNAL_ERROR',
  details?: any
}
```

---

## Bridge Changes

### **NEW: `/builder/analyze` (POST)**

**Purpose:** AI analyzes description and generates questions if needed

**Request:**
```javascript
{
  description: string,
  stack: string,
  userId: string
}
```

**Response:**
```javascript
{
  ready: boolean,
  questions?: Question[]
}
```

**Implementation:**
```javascript
const express = require('express');
const { getRouterClient } = require('../lib/router9');
const { supabase } = require('../lib/supabase');
const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { description, stack, userId } = req.body;

  try {
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';
    const { client } = await getRouterClient(tier);

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
      model: tier === 'free' ? 'ag/gemini-3-flash' : 'ag/claude-sonnet-4-6',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content.trim();

    // Parse JSON with fallback
    let result;
    try {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
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

**Error Handling:**
- Invalid JSON from AI → Fallback to `{ ready: true }`
- 9Router unavailable → Fallback to `{ ready: true }`
- Malformed questions → Fallback to `{ ready: true }`

---

### **MODIFIED: `/build/start` (POST)**

**Changes:**
- Accept optional `answers` field
- Append answers to instruction prompt if provided

---

### **NEW: `/builder/chat/:id` (POST)**

**Purpose:** Handle post-build modification requests

**Request:**
```javascript
{
  projectId: string,
  message: string,
  userId: string
}
```

**Response:** SSE stream with events:
```javascript
// Event types:
{ type: 'content', text: string }      // AI response text
{ type: 'file_modified', file: string, diff: string } // File change
{ type: 'status', status: 'complete' } // Done
{ type: 'error', message: string }     // Error
```

**Implementation:**
```javascript
const express = require('express');
const { spawn } = require('child_process');
const { getRouterClient } = require('../lib/router9');
const { supabase } = require('../lib/supabase');
const fs = require('fs/promises');
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

    // List current files (for context)
    const files = await fs.readdir(projectDir, { recursive: true });
    const fileList = files.filter(f => !f.includes('node_modules')).slice(0, 20).join(', ');

    // Get user tier
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';
    const { client, models } = await getRouterClient(tier);

    const instruction = `You are modifying an existing project. The user wants to make changes.

Project directory: ${projectDir}
Project type: ${project.type}
Original description: ${project.description}
${project.questionnaire_answers ? `Questionnaire answers:\n${project.questionnaire_answers}` : ''}

Current files: ${fileList}

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

    // Use Claude Code CLI for modifications
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

    claudeProcess.stdout.on('data', (data) => {
      emit({ type: 'content', text: data.toString() });
    });

    claudeProcess.stderr.on('data', (data) => {
      emit({ type: 'content', text: `[WARN] ${data.toString()}` });
    });

    claudeProcess.on('close', async (code) => {
      if (code === 0) {
        // Update project timestamp
        await supabase.from('projects').update({
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 15 * 60000).toISOString() // Reset 15min timer
        }).eq('id', projectId);

        emit({ type: 'status', status: 'complete' });
      } else {
        emit({ type: 'error', message: `Process exited with code ${code}` });
      }
      res.end();
    });

  } catch (err) {
    emit({ type: 'error', message: err.message });
    res.end();
  }
});

module.exports = router;
```

**Key Features:**
- Uses Claude Code CLI in modification mode (not full build)
- Resets 15-minute expiry timer on each modification
- Streams output in real-time
- Updates `updated_at` timestamp
- Handles file conflicts gracefully (Claude Code manages this)

---

## Database Changes

### **Projects Table**

**Add columns:**
```sql
ALTER TABLE projects
ADD COLUMN analysis_result JSONB, -- Store questions if any
ADD COLUMN questionnaire_answers TEXT, -- Store formatted Q&A
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add new table for post-build chat history
CREATE TABLE builder_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_builder_chat_project ON builder_chat_messages(project_id, created_at DESC);
```

**Update status enum (safe migration):**
```sql
-- Step 1: Create new enum type with 'analyzing' status
CREATE TYPE project_status_new AS ENUM ('planning', 'analyzing', 'building', 'ready', 'failed', 'expired');

-- Step 2: Add temporary column with new type
ALTER TABLE projects ADD COLUMN status_new project_status_new;

-- Step 3: Copy data (map old values to new)
UPDATE projects SET status_new = status::text::project_status_new;

-- Step 4: Drop old column and rename new one
ALTER TABLE projects DROP COLUMN status;
ALTER TABLE projects RENAME COLUMN status_new TO status;

-- Step 5: Drop old enum type
DROP TYPE project_status;

-- Step 6: Rename new type to original name
ALTER TYPE project_status_new RENAME TO project_status;

-- Step 7: Set default
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'planning'::project_status;
```

**Rollback strategy:**
```sql
-- If migration fails, restore from backup or:
-- 1. Keep old enum, remove 'analyzing' references
-- 2. Set any 'analyzing' projects to 'planning'
UPDATE projects SET status = 'planning' WHERE status = 'analyzing';
```

**Define analysis_result schema:**
```typescript
// analysis_result JSONB structure:
{
  ready: boolean,
  questions?: Array<{
    id: string,
    text: string,
    type: 'single' | 'multiple',
    options: Array<{ value: string, label: string }>
  }>
}
```

---

## Project Status State Machine

**Valid Status Transitions:**

```
analyzing → building → ready → (stays ready, updated_at changes on chat)
analyzing → building → failed
analyzing → expired (if abandoned for 15+ min)
building → expired (if takes too long)
ready → expired (after 15 min of inactivity)
```

**Status Definitions:**
- `analyzing`: AI is determining if clarification is needed
- `building`: Claude Code is generating project files
- `ready`: Project is complete and available for download/chat
- `failed`: Build process encountered an error
- `expired`: Project preview has expired (files deleted)

**Cleanup Rules:**
- Projects in `analyzing` status for >5 minutes → Set to `expired`
- Projects in `building` status for >30 minutes → Set to `failed`
- Projects in `ready` status where `expires_at < NOW()` → Set to `expired`, delete files
- Post-build chat resets `expires_at` to NOW() + 15 minutes

**State Transitions on User Actions:**
- Form submit → Create project with `analyzing`
- Analysis complete (ready: true) → Update to `building`
- Analysis complete (ready: false) → Stay `analyzing`, wait for questionnaire
- Questionnaire submit → Update to `building`
- Build complete → Update to `ready`
- Build error → Update to `failed`
- Post-build chat → Stay `ready`, update `expires_at` and `updated_at`

---

## Quota Logic

**Builder Quota Consumption:**

1. **Form submission** → `/api/builder/analyze` → **1 quota**
2. **Questionnaire submission** → `/api/builder/start` → **1 quota**
3. **Each post-build chat message** → `/api/builder/chat/:id` → **1 quota**

**Example for free tier (10 builder requests/day):**
- Analyze: 1
- Build: 1
- Chat message 1: 1
- Chat message 2: 1
- Chat message 3: 1
- **Total: 5 requests used**

**If user runs out of quota during post-build chat:**
- Show error: "Builder limit reached. Resets at midnight."
- Disable chat input
- Download button still works

---

## Error Handling

**Quota Exceeded:**
- During analysis → Show error on form page
- During build start → Show error on questionnaire page
- During post-build chat → Show error in terminal, disable input

**Build Failure:**
- Terminal shows error logs
- Status: 'failed'
- Allow user to retry (consumes quota again)

**AI Can't Understand:**
- During analysis → Generate questions
- During post-build chat → AI responds: "I'm not sure what you mean. Could you clarify?"

---

## UI/UX Details

**Terminal Styling:**
- Monospace font (Fira Code or JetBrains Mono)
- Dark theme (--bg-primary: #1a1a19)
- Green text for success, red for errors
- Smooth auto-scroll to bottom (pauses if user scrolls up manually)
- Copy button for code blocks

**Download Button:**
- Appears when status is 'ready'
- Shows file size
- Icon: FiDownload
- Disabled during post-build chat modifications (shows "Updating...")

**Preview (Optional):**
- Iframe showing project with sandbox attributes: `sandbox="allow-scripts allow-same-origin allow-forms"`
- Device toggle (desktop/mobile)
- Refresh button
- CSP headers for security

---

## Migration Path

**Files to Delete:**
- `src/app/(platform)/app/builder/[id]/page.tsx` (old planning chat)

**Files to Create:**
- `src/app/(platform)/app/builder/questionnaire/[id]/page.tsx`
- `src/app/(platform)/app/builder/terminal/[id]/page.tsx`
- `src/components/builder/QuestionnaireForm.tsx`
- `src/components/builder/TerminalChat.tsx`
- `src/app/api/builder/analyze/route.ts`
- `src/app/api/builder/chat/[id]/route.ts`
- `bridge/src/routes/builder-analyze.js`
- `bridge/src/routes/builder-chat.js`

**Files to Modify:**
- `src/app/(platform)/app/builder/page.tsx` (form submission logic)
- `src/app/api/builder/start/route.ts` (accept answers)
- `bridge/src/routes/build.js` (accept answers in prompt)
- `supabase/migrations/002_builder_redesign.sql` (new columns)

---

## Testing Checklist

- [ ] Form submission with clear description → Skip questionnaire, go to terminal
- [ ] Form submission with vague description → Show questionnaire
- [ ] Questionnaire with single-choice questions
- [ ] Questionnaire with multi-select questions
- [ ] Terminal shows build logs in real-time
- [ ] Build completes → Download button appears
- [ ] Post-build chat → AI modifies files
- [ ] Quota exceeded during analysis
- [ ] Quota exceeded during post-build chat
- [ ] Build failure → Error shown in terminal
- [ ] Multiple users building simultaneously

---

## Open Questions

1. **Should we show a preview iframe in the terminal?**
   - **Decision: Yes**, but make it collapsible/toggleable
   - Use iframe sandbox for security
   - Only show for web projects (not APIs/backends)

2. **Should post-build chat modifications reset the 15-minute expiry timer?**
   - **Decision: Yes**, treat each modification as activity
   - Implemented in Bridge `/builder/chat/:id` endpoint

3. **Should we allow users to download intermediate versions during post-build chat?**
   - **Decision: Yes**, always show latest version
   - Download button temporarily shows "Updating..." during modifications

4. **Should users be limited to one active build at a time?**
   - **Decision: No**, respect tier limits (1/3/unlimited active projects)
   - Multiple builds can run simultaneously

5. **Post-build chat context: full history or single message?**
   - **Decision: Full conversation history** (last 10 messages)
   - Stored in `builder_chat_messages` table
   - Ensures AI understands follow-up requests

---

## Success Metrics

- **Reduced confusion:** No more "what does Build it mean?" questions
- **Higher completion rate:** Users finish projects in one session
- **More iterations:** Users modify projects 2-3 times on average
- **Quota efficiency:** Users understand quota consumption better

---

## Future Enhancements

- **Voice input** for terminal chat
- **Diff viewer** showing file changes
- **Undo/redo** for modifications
- **Branch/version history** for projects
- **Collaborative editing** (multiple users on same project)

---

## Summary

This redesign transforms the Builder from a confusing 3-phase flow into a streamlined, terminal-style experience where users see Claude Code working in real-time and can iterate on their projects through natural conversation. The AI-powered questionnaire ensures clarity without adding friction, and the unified terminal interface makes the entire process feel cohesive and professional.
