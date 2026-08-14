import { cn } from '@/components/ui/utils'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-3 text-4xl opacity-30">📭</div>
      <p className="text-[14px] font-medium text-[var(--foreground)]">{title}</p>
      {description && (
        <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
