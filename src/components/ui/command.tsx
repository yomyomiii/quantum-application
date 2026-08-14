'use client'

import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import { cn } from './utils'

const Command = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive
    className={cn('flex h-full w-full flex-col overflow-hidden rounded-xl bg-[var(--card)]', className)}
    {...props}
  />
)

const CommandInput = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) => (
  <div className="flex items-center border-b border-[var(--border)] px-3">
    <Search size={14} className="mr-2 shrink-0 text-[var(--muted-foreground)]" />
    <CommandPrimitive.Input
      className={cn(
        'flex h-10 w-full bg-transparent py-3 text-[13px] outline-none placeholder:text-[var(--muted-foreground)]',
        className,
      )}
      {...props}
    />
  </div>
)

const CommandList = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
)

const CommandEmpty = ({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty className="py-6 text-center text-[13px] text-[var(--muted-foreground)]" {...props} />
)

const CommandGroup = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    className={cn(
      'overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--muted-foreground)]',
      className,
    )}
    {...props}
  />
)

const CommandItem = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-[13px] outline-none transition-colors',
      'aria-selected:bg-[var(--accent)] data-[selected=true]:bg-[var(--accent)]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  />
)

const CommandSeparator = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) => (
  <CommandPrimitive.Separator className={cn('-mx-1 h-px bg-[var(--border)]', className)} {...props} />
)

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
}
