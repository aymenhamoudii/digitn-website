'use client';

export function ProcessingIndicator() {
  return (
    <div className="flex gap-3 mb-8 px-1 items-center">
      <span
        className="flex-shrink-0 text-lg font-bold select-none"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <span style={{ color: 'var(--accent)' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>D</span>
      </span>
      <span className="flex gap-[5px] items-center">
        <span className="thinking-dot" style={{ animationDelay: '0ms' }} />
        <span className="thinking-dot" style={{ animationDelay: '160ms' }} />
        <span className="thinking-dot" style={{ animationDelay: '320ms' }} />
      </span>
    </div>
  );
}
