'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/components/ui/utils'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

interface PaginationProps {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  className?: string
}

export function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pages = buildPageList(page, totalPages)

  return (
    <div className={cn('flex items-center justify-between pt-3', className)}>
      <span className="pl-4 text-[12px] text-[var(--muted-foreground)]">
        총 <span className="font-medium text-[var(--foreground)]">{total.toLocaleString('ko-KR')}</span>건
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--accent)] transition-colors"
        >
          <ChevronLeft size={13} />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="flex h-7 w-7 items-center justify-center text-[12px] text-[var(--muted-foreground)]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'flex h-7 min-w-[28px] items-center justify-center rounded-md border px-1.5 text-[12px] transition-colors',
                p === page
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--border)] hover:bg-[var(--accent)]',
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] disabled:opacity-30 hover:bg-[var(--accent)] transition-colors"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      <Select value={String(pageSize)} onValueChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1) }}>
        <SelectTrigger className="h-7 w-[80px] text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((s) => (
            <SelectItem key={s} value={String(s)}>{s}건</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = []
  pages.push(1)
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

// 페이지 슬라이싱 헬퍼
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize)
}
