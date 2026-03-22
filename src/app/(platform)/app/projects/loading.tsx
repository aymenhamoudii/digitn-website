import { SkeletonProjectCard } from '@/components/ui/Skeleton'

export default function ProjectsLoading() {
  return (
    <div>
      <div className="h-14 border-b border-[var(--border)] bg-[var(--bg-primary)]" />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
