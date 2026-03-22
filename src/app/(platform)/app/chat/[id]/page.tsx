'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { SkeletonMessage, LoadingSpinner } from '@/components/ui/Skeleton'
import { createClient } from '@/lib/supabase/client'

export default function ChatHistoryPage() {
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('Chat')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadChat() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: conv } = await supabase
        .from('conversations')
        .select('title')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single()

      if (!conv) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const { data: msgs } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      setTitle(conv.title || 'Chat')
      setMessages((msgs || []) as { role: 'user' | 'assistant'; content: string }[])
      setLoading(false)
    }
    loadChat()
  }, [id])

  if (notFound) {
    return (
      <div className="h-screen flex flex-col">
        <Header title="Chat" />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'var(--text-secondary)' }}>Conversation not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <Header title={loading ? 'Loading...' : title} />
      {loading ? (
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[800px] mx-auto space-y-4">
            <SkeletonMessage isUser={true} />
            <SkeletonMessage isUser={false} />
            <SkeletonMessage isUser={true} />
            <SkeletonMessage isUser={false} />
          </div>
        </div>
      ) : (
        <ChatInterface
          conversationId={id}
          initialMessages={messages}
        />
      )}
    </div>
  )
}
