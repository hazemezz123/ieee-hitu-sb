export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-surface-container-high ${className}`} />
}

export function EventCardSkeleton() {
  return (
    <article className="overflow-hidden bg-surface-container-lowest">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </article>
  )
}