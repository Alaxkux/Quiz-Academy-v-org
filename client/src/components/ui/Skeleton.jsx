export function Skeleton({ className = '', style }) {
  return (
    <div
      className={`rounded-xl shimmer-bg ${className}`}
      style={{ minHeight: 16, ...style }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-1/2 h-3" />
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col gap-2">
        <Skeleton className="w-48 h-7" />
        <Skeleton className="w-72 h-4" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}
