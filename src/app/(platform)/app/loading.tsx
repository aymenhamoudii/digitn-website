import { SkeletonStat } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div>
      <div className="h-14 border-b border-[var(--border)] bg-[var(--bg-primary)]" />
      <div className="px-16 py-12">
        <div className="mb-10">
          <div className="h-7 w-48 rounded-md skeleton-shimmer mb-3" style={{ backgroundColor: 'var(--skeleton-base)' }} />
          <div className="h-4 w-32 rounded-sm skeleton-shimmer" style={{ backgroundColor: 'var(--skeleton-base)' }} />
        </div>
        <div className="grid grid-cols-3 gap-5 mb-10">
          <SkeletonStat /><SkeletonStat /><SkeletonStat />
        </div>
        <div className="h-5 w-36 rounded skeleton-shimmer mb-4" style={{ backgroundColor: 'var(--skeleton-base)' }} />
        <div className="grid grid-cols-2 gap-5">
          <div className="h-28 rounded-xl skeleton-shimmer" style={{ backgroundColor: 'var(--skeleton-base)' }} />
          <div className="h-28 rounded-xl skeleton-shimmer" style={{ backgroundColor: 'var(--skeleton-base)' }} />
        </div>
      </div>
    </div>
  )
}
