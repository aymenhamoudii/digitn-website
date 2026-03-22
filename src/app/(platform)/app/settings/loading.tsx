import { SkeletonStat } from '@/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div style={{ padding: '48px 64px', maxWidth: '1100px' }}>
      <div className="mb-10">
        <div className="h-7 w-32 rounded-md skeleton-shimmer mb-2" style={{ backgroundColor: 'var(--skeleton-base)' }} />
        <div className="h-4 w-56 rounded-sm skeleton-shimmer" style={{ backgroundColor: 'var(--skeleton-base)' }} />
      </div>
      <div className="mb-8">
        <SkeletonStat />
      </div>
      <div className="grid grid-cols-3 gap-5">
        <SkeletonStat /><SkeletonStat /><SkeletonStat />
      </div>
    </div>
  )
}
