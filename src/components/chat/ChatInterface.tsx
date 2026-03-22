'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { DigItnLogo } from '@/components/ui/DigItnLogo';
import { createClient } from '@/lib/supabase/client';
import { FiPlus, FiMessageSquare, FiCode, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  mode: 'chat' | 'builder';
  created_at: string;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  conversationId?: string;
  hideHistory?: boolean;
}

const QUICK_PROMPTS = [
  { label: 'Build a landing page', prompt: 'Build a landing page for my startup' },
  { label: 'Create an API', prompt: 'Create a REST API for a todo app' },
  { label: 'Design a portfolio', prompt: 'Design a portfolio website for a developer' },
  { label: 'Write a component', prompt: 'Write a React dashboard component with charts' },
];

export function ChatInterface({ initialMessages = [], conversationId, hideHistory = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(conversationId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load all conversations (chat + builder) for history sidebar
  const loadConversations = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('conversations')
      .select('id, title, mode, created_at')
      .eq('user_id', user.id)
      .in('mode', ['chat', 'builder'])
      .order('created_at', { ascending: false })
      .limit(40);
    // Merge: keep optimistic local entries that aren't in DB yet
    setConversations(prev => {
      const dbIds = new Set((data || []).map((c: any) => c.id));
      const localOnly = prev.filter(c => !dbIds.has(c.id));
      return [...localOnly, ...((data || []) as Conversation[])];
    });
  }, []);

  useEffect(() => {
    if (!hideHistory) loadConversations();
  }, [loadConversations, hideHistory]);

  // Refresh title after AI generates it — poll at 5s and 10s to catch slow responses
  const refreshTitleAfterDelay = useCallback((convId: string) => {
    const pollTitle = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('conversations')
        .select('id, title, mode, created_at')
        .eq('id', convId)
        .single();
      if (data?.title) {
        setConversations(prev =>
          prev.map(c => c.id === convId ? { ...c, title: data.title } : c)
        );
      }
    };
    // Poll twice — once after stream finishes, once more in case title generation is slow
    setTimeout(pollTitle, 5000);
    setTimeout(pollTitle, 12000);
  }, []);

  const handleSend = async (content: string) => {
    const newMessages = [...messages, { role: 'user' as const, content }];
    setMessages(newMessages);
    setIsLoading(true);

    // Add empty assistant placeholder — dots show until first token arrives
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          conversationId: currentConvId,
          isNew: !currentConvId,
          mode: hideHistory ? 'builder' : 'chat',
        }),
      });

      if (response.status === 429) {
        toast.error('Daily limit reached. Resets at midnight — or upgrade your plan for more requests.');
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `Server error (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response stream');

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
                  window.history.replaceState({}, '', `/app/chat/${data.conversationId}`);
                  // Add new conversation to list immediately with temp title
                  const tempTitle = content.length > 35
                    ? content.substring(0, 35).trimEnd() + '…'
                    : content;
                  const tempConv: Conversation = {
                    id: data.conversationId,
                    title: tempTitle,
                    mode: hideHistory ? 'builder' : 'chat',
                    created_at: new Date().toISOString(),
                  };
                  setConversations(prev => [tempConv, ...prev]);
                  // Refresh to get AI-generated title after bridge finishes
                  refreshTitleAfterDelay(data.conversationId);
                }
              } else if (data.type === 'content') {
                currentResponse += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = currentResponse;
                  return updated;
                });
              } else if (data.type === 'error') {
                throw new Error(data.message || 'AI service error');
              }
            } catch {
              // Ignore JSON parse errors from partial chunks
            }
          }
        }
      }

      if (!currentResponse) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = "I'm having trouble connecting right now. Please try again in a moment.";
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const msg = error?.message || '';
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        toast.error('Could not reach the AI service. The server may be starting up — try again shortly.');
      } else {
        toast.error(msg || 'Something went wrong. Please try again.');
      }
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      router.refresh();
      // Reload conversation list to sync any title updates
      if (!hideHistory) loadConversations();
    }
  };

  const handleDelete = async (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic remove
    setDeletingId(convId);
    setConversations(prev => prev.filter(c => c.id !== convId));

    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      // If we deleted the current conversation, go to new chat
      if (currentConvId === convId || pathname === `/app/chat/${convId}`) {
        router.push('/app/chat');
      }
    } catch {
      // Restore on error
      toast.error('Failed to delete conversation');
      loadConversations();
    } finally {
      setDeletingId(null);
    }
  };

  const isEmpty = messages.length === 0;
  const isWaitingForContent = isLoading && messages[messages.length - 1]?.content === '';

  return (
    <div className="flex h-[calc(100vh-56px)]" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Chat History Sidebar — hidden in builder mode ── */}
      {!hideHistory && (
      <div
        className="flex-shrink-0 w-52 flex flex-col border-r overflow-hidden"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* New chat button */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link
            href="/app/chat"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            <FiPlus size={14} />
            New Chat
          </Link>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {conversations.length === 0 ? (
            <p className="text-xs px-3 py-6 text-center" style={{ color: 'var(--text-tertiary)' }}>
              No conversations yet
            </p>
          ) : (
            conversations.map(conv => {
              const isActive =
                pathname === `/app/chat/${conv.id}` ||
                currentConvId === conv.id;
              const isBuilder = conv.mode === 'builder';

              return (
                <div
                  key={conv.id}
                  className="group relative flex items-start gap-2 px-2 py-2 rounded-lg mb-0.5 transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--card-bg)' : 'transparent',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex-shrink-0 mt-0.5 opacity-50"
                    style={{ color: isBuilder ? 'var(--accent)' : 'var(--text-secondary)' }}
                  >
                    {isBuilder
                      ? <FiCode size={12} />
                      : <FiMessageSquare size={12} />
                    }
                  </div>

                  {/* Title link — takes up remaining space */}
                  <Link
                    href={isBuilder ? `/app/builder` : `/app/chat/${conv.id}`}
                    className="flex-1 min-w-0 text-xs leading-relaxed truncate pr-5"
                    style={{
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                    title={conv.title || 'Untitled'}
                  >
                    {conv.title || 'Untitled'}
                  </Link>

                  {/* Delete button — appears on hover */}
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                    style={{ color: 'var(--text-tertiary)' }}
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center px-6 pb-8">
              <div className="w-full max-w-[600px] mx-auto flex flex-col items-center">
                <div className="mb-5" style={{ color: 'var(--text-primary)' }}>
                  <DigItnLogo size={44} />
                </div>
                <h2
                  className="text-2xl font-semibold mb-2 text-center"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
                >
                  How can I help you today?
                </h2>
                <p
                  className="text-sm text-center mb-10"
                  style={{ color: 'var(--text-secondary)', maxWidth: 400 }}
                >
                  DIGITN AI can answer questions, write code, analyze problems, or help plan your next project.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {QUICK_PROMPTS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q.prompt)}
                      className="text-left px-4 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {q.label}
                      <span className="block text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {q.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages list */
            <div className="max-w-[680px] mx-auto px-4 pt-8 pb-4">
              {messages.map((msg, i) => {
                const isLastMsg = i === messages.length - 1;
                const isStreamingThis = isLoading && isLastMsg && msg.role === 'assistant';

                // Skip empty assistant placeholder — dots row handles the waiting state
                if (msg.role === 'assistant' && msg.content === '' && isStreamingThis) {
                  return null;
                }

                return (
                  <MessageBubble
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    isStreaming={isStreamingThis}
                  />
                );
              })}

              {/* Thinking dots — only while waiting for first content token */}
              {isWaitingForContent && (
                <div className="flex gap-3 mb-8 px-1">
                  <div
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <DigItnLogo size={22} />
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    {[0, 1, 2].map(dot => (
                      <span
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--text-tertiary)',
                          animation: `bounce 1.2s ease-in-out ${dot * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div
          className="px-4 pb-4 pt-2"
          style={{ background: `linear-gradient(to top, var(--bg-primary) 70%, transparent)` }}
        >
          <div className="max-w-[680px] mx-auto">
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
