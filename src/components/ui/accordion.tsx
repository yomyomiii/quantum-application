'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from './utils'

const Accordion = AccordionPrimitive.Root

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-b border-[var(--border)] last:border-0', className)}
      {...props}
    />
  )
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          'flex w-full items-center justify-between py-3 text-[13px] font-medium transition-colors hover:text-[var(--primary)]',
          '[&[data-state=open]>svg]:rotate-180',
          'focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown size={14} className="shrink-0 transition-transform duration-200 text-[var(--muted-foreground)]" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        'overflow-hidden text-[13px]',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className,
      )}
      {...props}
    >
      <div className="pb-3">{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
