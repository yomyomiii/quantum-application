'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TablePaginationProps {
  total: number
  page: number
  pageSize?: number
  onChange: (page: number) => void
}

export function TablePagination({ total, page, pageSize = 10, onChange }: TablePaginationProps) {
  if (total <= pageSize) return null

  const totalPages = Math.ceil(total / pageSize)
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="mt-3 flex items-center justify-between text-[13px] text-[var(--muted-foreground)]">
      <span>{from}-{to} / 전체 {total}건</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={13} /> 이전
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          다음 <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
