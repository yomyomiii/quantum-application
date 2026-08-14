'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = '확인', cancelLabel = '취소', variant = 'default', onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onOpenChange(false) }}
            className={`rounded-md px-4 py-2 text-[13px] text-white transition-opacity hover:opacity-90 ${variant === 'destructive' ? 'bg-[var(--destructive)]' : 'bg-[var(--primary)]'}`}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
