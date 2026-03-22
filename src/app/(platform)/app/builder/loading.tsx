export default function BuilderLoading() {
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="h-14 border-b border-[var(--border)] bg-[var(--bg-primary)]" />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading builder...</p>
        </div>
      </div>
    </div>
  )
}
