# DIGITN SaaS Platform — Phase 2: Chat Mode & AI Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Express.js AI Bridge server to handle connections to 9Router, and implement the real-time AI Chat interface in the Next.js frontend with message streaming, history persistence, and quota enforcement.

**Architecture:** Next.js frontend sends POST requests to `/api/chat/stream` which connects to the Express Bridge at `localhost:3001`. The Bridge connects to 9Router (`localhost:20128`), streams the LLM chunks via Server-Sent Events (SSE) back to Next.js, and saves conversations/messages to Supabase securely.

**Tech Stack:** Express.js, SSE (Server-Sent Events), OpenAI SDK (for 9Router), Supabase (DB), React, Tailwind CSS

---

## File Structure

### AI Bridge Server (VPS)
- Create: `bridge/package.json` — bridge dependencies
- Create: `bridge/server.js` — Express server, auth middleware
- Create: `bridge/src/routes/chat.js` — chat endpoint logic
- Create: `bridge/src/lib/router9.js` — 9Router connection wrapper
- Create: `bridge/src/lib/supabase.js` — Supabase admin client

### Next.js Frontend
- Modify: `src/middleware.ts` — add quota checking logic
- Create: `src/components/chat/ChatInterface.tsx` — main chat layout
- Create: `src/components/chat/MessageBubble.tsx` — individual messages (Markdown)
- Create: `src/components/chat/ChatInput.tsx` — textarea and send button
- Create: `src/app/api/chat/stream/route.ts` — proxy SSE stream from Bridge to client
- Create: `src/app/(platform)/app/chat/page.tsx` — chat page container
- Create: `src/app/(platform)/app/chat/[id]/page.tsx` — specific chat history

---

## Task 1: Set Up Bridge Server Foundation

**Files:**
- Create: `bridge/package.json`
- Create: `bridge/server.js`
- Create: `bridge/src/lib/supabase.js`

- [ ] **Step 1: Initialize Bridge project and install dependencies**

```bash
mkdir -p bridge/src/lib bridge/src/routes
cd bridge
npm init -y
npm install express cors dotenv openai @supabase/supabase-js
```

- [ ] **Step 2: Create Bridge Supabase client**

Create `bridge/src/lib/supabase.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Bridge needs SERVICE ROLE to bypass RLS and verify users
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };
```

- [ ] **Step 3: Create Express Server skeleton**

Create `bridge/server.js`:
```javascript
require('dotenv').config({ path: '../.env.local' });
const express = require('express');
const cors = require('cors');
const { supabase } = require('./src/lib/supabase');
const chatRoutes = require('./src/routes/chat');

const app = express();
app.use(cors());
app.use(express.json());

// Auth Middleware: Verify Next.js sent a valid Bridge Secret or User Token
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization' });

  const token = authHeader.split(' ')[1];

  // Internal service-to-service auth (Next.js API routes)
  if (token === process.env.BRIDGE_SECRET) {
    req.isServiceCall = true;
    return next();
  }

  // Direct client auth (if needed later)
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
});

app.use('/chat', chatRoutes);

const PORT = process.env.BRIDGE_PORT || 3001;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`AI Bridge running on http://127.0.0.1:${PORT}`);
});
```

- [ ] **Step 4: Commit**

```bash
git add bridge/
git commit -m "feat: setup Express AI bridge server foundation"
```

---

## Task 2: Create 9Router Integration & Chat Route

**Files:**
- Create: `bridge/src/lib/router9.js`
- Create: `bridge/src/routes/chat.js`

- [ ] **Step 1: Create 9Router client**

Create `bridge/src/lib/router9.js`:
```javascript
const { OpenAI } = require('openai');
const { supabase } = require('./supabase');

async function getRouterClient(tier) {
  // Fetch config from admin_config table
  const { data, error } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', 'bridge_settings')
    .single();

  const config = data?.value || {
    base_url: 'http://localhost:20128/v1',
    auth_token: ''
  };

  const { data: modelsData } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', tier === 'free' ? 'free_models' : 'paid_models')
    .single();

  const models = modelsData?.value || (tier === 'free'
    ? ["ag/gemini-3-flash", "gh/gpt-5-mini", "qw/qwen3-coder-flash"]
    : ["ag/claude-sonnet-4-6", "gh/claude-sonnet-4.6", "kr/claude-sonnet-4.5"]);

  const client = new OpenAI({
    baseURL: config.base_url,
    apiKey: config.auth_token || 'dummy-key',
  });

  return { client, models };
}

const AI_IDENTITY = `You are DIGITN AI, an advanced AI assistant built into the DIGITN platform.
CRITICAL RULES:
1. NEVER mention your underlying model name, provider, or technology (never say Claude, Sonnet, GPT, Gemini, Anthropic, Google, OpenAI)
2. If asked what AI you are, say: "I'm DIGITN AI, the platform's built-in AI engine."
3. Always respond in the same language the user writes in.`;

module.exports = { getRouterClient, AI_IDENTITY };
```

- [ ] **Step 2: Create Chat SSE Route**

Create `bridge/src/routes/chat.js`:
```javascript
const express = require('express');
const { supabase } = require('../lib/supabase');
const { getRouterClient, AI_IDENTITY } = require('../lib/router9');
const router = express.Router();

router.post('/stream', async (req, res) => {
  const { userId, messages, conversationId, isNew } = req.body;

  if (!userId || !messages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get user tier
    const { data: user } = await supabase.from('users').select('tier').eq('id', userId).single();
    const tier = user?.tier || 'free';

    // 2. Setup DB context
    let activeConvId = conversationId;
    if (isNew) {
      const { data: conv } = await supabase.from('conversations')
        .insert({ user_id: userId, mode: 'chat', title: messages[0].content.substring(0, 30) + '...' })
        .select().single();
      activeConvId = conv.id;
    }

    // Save user message
    const userMsg = messages[messages.length - 1];
    await supabase.from('messages').insert({
      conversation_id: activeConvId,
      user_id: userId,
      role: 'user',
      content: userMsg.content
    });

    // 3. Prepare AI request
    const { client, models } = await getRouterClient(tier);
    const systemMessage = { role: 'system', content: AI_IDENTITY };

    // 4. Setup SSE Response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send conversation ID immediately so frontend can update URL
    res.write(`data: ${JSON.stringify({ type: 'meta', conversationId: activeConvId })}\n\n`);

    // 5. Stream from 9Router
    const stream = await client.chat.completions.create({
      model: models[0], // 9Router handles fallback if this fails
      messages: [systemMessage, ...messages.map(m => ({ role: m.role, content: m.content }))],
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ type: 'content', text: content })}\n\n`);
      }
    }

    // 6. Save AI response & finish
    await supabase.from('messages').insert({
      conversation_id: activeConvId,
      user_id: userId,
      role: 'assistant',
      content: fullResponse
    });

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error('Chat stream error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to process request' })}\n\n`);
    res.end();
  }
});

module.exports = router;
```

- [ ] **Step 3: Commit**

```bash
git add bridge/src/
git commit -m "feat: add 9Router integration and SSE chat streaming to Bridge"
```

---

## Task 3: Create Next.js API Proxy & Quota Enforcement

**Files:**
- Create: `src/app/api/chat/stream/route.ts`

- [ ] **Step 1: Install event-source-parser (if not present)**

```bash
npm install react-markdown remark-gfm date-fns
```

- [ ] **Step 2: Create Next.js API Route proxy**

Create `src/app/api/chat/stream/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Check & Update Quota
    const today = new Date().toISOString().split('T')[0];

    // Get tier limits
    const { data: userData } = await supabase.from('users').select('tier').eq('id', user.id).single();
    const tier = userData?.tier || 'free';

    const limit = tier === 'free' ? 10 : tier === 'pro' ? 50 : 9999;

    // Get or create today's quota
    let { data: quota } = await supabase
      .from('usage_quotas')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (!quota) {
      const { data: newQuota } = await supabase
        .from('usage_quotas')
        .insert({ user_id: user.id, date: today, requests_used: 0, requests_limit: limit })
        .select().single();
      quota = newQuota;
    }

    if (quota!.requests_used >= quota!.requests_limit) {
      return NextResponse.json({ error: 'Quota exceeded', code: 'QUOTA_EXCEEDED' }, { status: 429 });
    }

    // Increment quota
    await supabase.rpc('increment_usage', { row_id: quota!.id });
    // Note: You need to create this RPC function in Supabase, or do a standard update for now:
    await supabase.from('usage_quotas').update({ requests_used: quota!.requests_used + 1 }).eq('id', quota!.id);

    // 2. Forward to Bridge Server
    const body = await req.json();

    const bridgeUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3001';

    const response = await fetch(`${bridgeUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRIDGE_SECRET}`,
      },
      body: JSON.stringify({
        ...body,
        userId: user.id
      }),
    });

    if (!response.ok) throw new Error('Bridge server error');

    // 3. Return stream to client
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/app/api/chat/
git commit -m "feat: add next.js chat proxy with quota enforcement"
```

---

## Task 4: Build Chat UI Components

**Files:**
- Create: `src/components/chat/MessageBubble.tsx`
- Create: `src/components/chat/ChatInput.tsx`

- [ ] **Step 1: Create MessageBubble component**

Create `src/components/chat/MessageBubble.tsx`:
```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiUser, FiCpu } from 'react-icons/fi';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
          isUser ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card-strong)] text-[var(--text-primary)]'
        }`}>
          {isUser ? <FiUser size={14} /> : <FiCpu size={14} />}
        </div>

        {/* Content */}
        <div className={`px-5 py-3.5 rounded-2xl ${
          isUser
            ? 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-tr-sm'
            : 'bg-transparent text-[var(--text-primary)] pt-1'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-[15px]">{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-[var(--card-bg)] prose-pre:border prose-pre:border-[var(--border)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 animate-pulse" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ChatInput component**

Create `src/components/chat/ChatInput.tsx`:
```typescript
import { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations('chat');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-end bg-[var(--bg-primary)] border border-[var(--border-strong)] rounded-xl overflow-hidden shadow-sm focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          disabled={disabled}
          className="w-full max-h-[200px] min-h-[56px] py-4 pl-5 pr-14 bg-transparent outline-none resize-none text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          rows={1}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="absolute right-3 bottom-3 p-2 rounded-lg bg-[var(--accent)] text-white disabled:opacity-50 disabled:bg-[var(--card-strong)] disabled:text-[var(--text-tertiary)] transition-colors"
        >
          <FiSend size={16} />
        </button>
      </div>
      <div className="text-center mt-2">
        <span className="text-[11px] text-[var(--text-tertiary)]">
          DIGITN AI peut faire des erreurs. Vérifiez les informations importantes.
        </span>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/
git commit -m "feat: add chat ui components (MessageBubble, ChatInput)"
```

---

## Task 5: Create Main Chat Interface

**Files:**
- Create: `src/components/chat/ChatInterface.tsx`
- Create: `src/app/(platform)/app/chat/page.tsx`
- Create: `src/app/(platform)/app/chat/[id]/page.tsx`

- [ ] **Step 1: Create ChatInterface logic**

Create `src/components/chat/ChatInterface.tsx`:
```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  conversationId?: string;
}

export function ChatInterface({ initialMessages = [], conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom() }, [messages]);

  const handleSend = async (content: string) => {
    const newMessages = [...messages, { role: 'user' as const, content }];
    setMessages(newMessages);
    setIsLoading(true);

    // Add empty assistant message for streaming
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          conversationId: currentConvId,
          isNew: !currentConvId
        }),
      });

      if (response.status === 429) {
        toast.error('Quota quotidien atteint. Veuillez passer à DIGITN PRO.');
        setMessages(prev => prev.slice(0, -1)); // Remove empty assistant msg
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error('Failed to send');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      let currentResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'meta' && data.conversationId) {
                if (!currentConvId) {
                  setCurrentConvId(data.conversationId);
                  // Silently update URL without reload
                  window.history.replaceState({}, '', `/app/chat/${data.conversationId}`);
                }
              } else if (data.type === 'content') {
                currentResponse += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = currentResponse;
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      toast.error('Erreur de connexion');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      router.refresh(); // Refresh layout to update quota in header
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-[var(--bg-primary)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[800px] mx-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center mt-32">
              <div className="w-16 h-16 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center mb-6">
                <span className="text-[var(--accent)] font-serif text-2xl font-bold">D</span>
              </div>
              <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-2">Comment puis-je vous aider ?</h2>
              <p className="text-[var(--text-secondary)] max-w-md">
                Je suis DIGITN AI. Je peux répondre à vos questions, analyser du code, ou vous aider à planifier votre prochain projet.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <MessageBubble
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent">
        <div className="max-w-[800px] mx-auto">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Page containers**

Create `src/app/(platform)/app/chat/page.tsx` (New Chat):
```typescript
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function NewChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header title="Nouvelle discussion" />
      <ChatInterface />
    </div>
  );
}
```

Create `src/app/(platform)/app/chat/[id]/page.tsx` (Existing Chat):
```typescript
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ChatHistoryPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify ownership and get conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('title')
    .eq('id', params.id)
    .eq('user_id', user?.id)
    .single();

  if (!conv) notFound();

  // Get messages
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="h-screen flex flex-col">
      <Header title={conv.title || "Discussion"} />
      <ChatInterface
        conversationId={params.id}
        initialMessages={messages || []}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(platform\)/app/chat/ src/components/chat/ChatInterface.tsx
git commit -m "feat: complete chat interface with SSE streaming and history"
```

---

## Verification

After completing the tasks:

- [ ] `npm run build` succeeds
- [ ] No TypeScript errors in the new files

Let me know your execution choice!
