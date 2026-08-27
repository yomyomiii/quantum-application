'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { formatDate } from '@/lib/format'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination, paginate } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/components/ui/utils'
import { MOCK_USERS } from '@/mocks/users'
import type { AlgorithmStatus } from '@/types/common'

type TabStatus = 'all' | 'pending' | 'rejected' | 'published'

const TABS: { value: TabStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '승인 요청' },
  { value: 'rejected', label: '반려' },
  { value: 'published', label: '게시완료' },
]

const CHECK_ICON: Record<'pass' | 'warn' | 'fail', string> = { pass: '✅', warn: '⚠️', fail: '❌' }
const CHECK_LABEL: Record<'pass' | 'warn' | 'fail', string> = { pass: '통과', warn: '경고', fail: '실패' }


export default function RequestsPage() {
  const { algorithms } = useMarketplaceStore()
  const [tab, setTab] = useState<TabStatus>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const list = useMemo(() => {
    const base = algorithms.filter((a) => a.status !== 'draft' && (tab === 'all' || a.status === tab))
    return [...base].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [algorithms, tab])

  const paged = useMemo(() => paginate(list, page, pageSize), [list, page, pageSize])

  function handleTabChange(t: TabStatus) {
    setTab(t)
    setPage(1)
  }

  return (
    <div className="p-6">
      <h1 className="mb-5 text-[18px] font-semibold">등록 요청 큐</h1>

      {/* 상태 탭 */}
      <div className="mb-4 flex border-b border-[var(--border)]">
        {TABS.map((t) => {
          const count = algorithms.filter((a) => a.status !== 'draft' && (t.value === 'all' || a.status === t.value)).length
          return (
            <button
              key={t.value}
              onClick={() => handleTabChange(t.value)}
              className={cn(
                'relative px-4 py-2 text-[13px] font-medium transition-colors',
                tab === t.value
                  ? 'text-[var(--primary)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--primary)] after:content-[""]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
              )}
            >
              {t.label}
              <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px]">{count}</span>
            </button>
          )
        })}
      </div>

      {/* 빈 상태 */}
      {list.length === 0 && (
        <EmptyState title="요청이 없습니다" description="해당 상태의 등록 요청이 없습니다." />
      )}

      {/* 목록 테이블 */}
      {list.length > 0 && (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table w-full">
              <thead>
                <tr className="">
                  <th className="whitespace-nowrap">알고리즘명</th>
                  <th className="w-24 whitespace-nowrap">상태</th>
                  <th className="w-24 whitespace-nowrap">등록자</th>
                  <th className="w-20 whitespace-nowrap">SDK</th>
                  <th className="w-24 whitespace-nowrap">자동검증</th>
                  <th className="w-28 whitespace-nowrap">요청일 / 등록일</th>
                  <th className="w-20 text-right whitespace-nowrap">액션</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => {
                  const overall = a.autoCheckResult.overall
                  const authorName = MOCK_USERS.find((u) => u.id === a.authorId)?.name ?? a.authorId
                  return (
                    <tr key={a.id} className="">
                      <td className="">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">v{a.version}</p>
                      </td>
                      <td className="whitespace-nowrap">
                        <StatusBadge status={a.status as AlgorithmStatus} />
                      </td>
                      <td className="text-[var(--muted-foreground)] whitespace-nowrap">{authorName}</td>
                      <td className="text-[var(--muted-foreground)] whitespace-nowrap">{a.sdk}</td>
                      <td className="whitespace-nowrap">
                        <span className={cn('text-[12px]', overall === 'pass' ? 'text-[#22c55e]' : overall === 'warn' ? 'text-amber-500' : 'text-[var(--destructive)]')}>
                          {CHECK_ICON[overall]} {CHECK_LABEL[overall]}
                        </span>
                      </td>
                      <td className="text-[var(--muted-foreground)] whitespace-nowrap">
                        {['published', 'inactive'].includes(a.status) && a.publishedAt
                          ? formatDate(a.publishedAt)
                          : formatDate(a.createdAt)}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <Link
                          href={`/marketplace/requests/${a.id}`}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
                        >
                          상세 <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            total={list.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="mt-3"
          />
        </>
      )}

    </div>
  )
}
