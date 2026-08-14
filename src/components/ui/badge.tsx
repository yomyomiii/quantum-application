import { cn } from './utils'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        variant === 'default' && 'bg-[var(--primary)] text-white',
        variant === 'secondary' && 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        variant === 'outline' && 'border border-[var(--border)] text-[var(--foreground)]',
        variant === 'destructive' && 'bg-[var(--destructive)] text-white',
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
