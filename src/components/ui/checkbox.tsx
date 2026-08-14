'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from './utils'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--border)] bg-[var(--card)] transition-colors',
        'data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check size={11} className="text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
