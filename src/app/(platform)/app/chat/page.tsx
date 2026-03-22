import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function NewChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <Header title="New Chat" />
      <ChatInterface />
    </div>
  );
}
