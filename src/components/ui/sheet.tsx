'use client'

import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { cn } from './utils'

function Sheet({ direction = 'right', ...props }: React.ComponentProps<typeof Drawer.Root>) {
  return <Drawer.Root direction={direction} {...props} />
}
const SheetTrigger = Drawer.Trigger
const SheetClose = Drawer.Close
const SheetPortal = Drawer.Portal

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof Drawer.Overlay>) {
  return (
    <Drawer.Overlay
      className={cn('fixed inset-0 z-50 bg-black/40', className)}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof Drawer.Content> & { side?: 'right' | 'left' }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <Drawer.Content
        className={cn(
          'fixed z-50 flex flex-col bg-[var(--card)] shadow-xl',
          side === 'right' && 'inset-y-0 right-0 w-[480px] border-l border-[var(--border)]',
          side === 'left' && 'inset-y-0 left-0 w-[480px] border-r border-[var(--border)]',
          className,
        )}
        {...props}
      >
        {children}
        <Drawer.Close className="absolute right-4 top-4 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity">
          <X size={16} />
        </Drawer.Close>
      </Drawer.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-[var(--border)] px-6 py-4', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-[15px] font-semibold', className)} {...props} />
}

function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto px-6 py-5', className)} {...props} />
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-t border-[var(--border)] px-6 py-4 flex justify-end gap-2', className)} {...props} />
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter }
