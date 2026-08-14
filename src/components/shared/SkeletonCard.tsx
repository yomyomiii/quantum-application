import { cn } from '@/components/ui/utils'

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 animate-pulse', className)}>
      <div className="mb-3 h-4 w-3/4 rounded bg-[var(--muted)]" />
      <div className="mb-2 h-3 w-full rounded bg-[var(--muted)]" />
      <div className="mb-4 h-3 w-2/3 rounded bg-[var(--muted)]" />
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded-full bg-[var(--muted)]" />
        <div className="h-5 w-14 rounded-full bg-[var(--muted)]" />
      </div>
    </div>
  )
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 border-b border-[var(--border)] px-4 py-3 animate-pulse', className)}>
      <div className="h-4 w-8 rounded bg-[var(--muted)]" />
      <div className="h-4 flex-1 rounded bg-[var(--muted)]" />
      <div className="h-4 w-16 rounded bg-[var(--muted)]" />
      <div className="h-4 w-16 rounded bg-[var(--muted)]" />
    </div>
  )
}
