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
          {t('disclaimer')}
        </span>
      </div>
    </form>
  );
}