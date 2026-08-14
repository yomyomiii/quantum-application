'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Check, X, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { formatDate } from '@/lib/format'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination, paginate } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/ui/dialog-confirm'
import { cn } from '@/components/ui/utils'

type TabStatus = 'all' | 'pending' | 'draft' | 'rejected' | 'published'

const TABS: { value: TabStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '승인 요청' },
  { value: 'draft', label: '임시저장' },
  { value: 'rejected', label: '반려' },
  { value: 'published', label: '게시완료' },
]

const CHECK_ICON: Record<'pass' | 'warn' | 'fail', string> = { pass: '✅', warn: '⚠️', fail: '❌' }
const CHECK_LABEL: Record<'pass' | 'warn' | 'fail', string> = { pass: '통과', warn: '경고', fail: '실패' }

export default function RequestsPage() {
  const { algorithms, approveAlgorithm, rejectAlgorithm } = useMarketplaceStore()
  const [tab, setTab] = useState<TabStatus>('all')
  const [approveTarget, setApproveTarget] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const list = useMemo(() => {
    const base = algorithms.filter((a) => tab === 'all' || a.status === tab)
    return [...base].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [algorithms, tab])

  const paged = useMemo(() => paginate(list, page, pageSize), [list, page, pageSize])

  function handleTabChange(t: TabStatus) {
    setTab(t)
    setPage(1)
  }

  function handleApprove(id: string) {
    approveAlgorithm(id)
    toast.success('승인이 완료되었습니다.')
    setApproveTarget(null)
  }

  function handleRejectOpen(id: string) {
    setRejectTarget(id)
    setRejectReason('')
  }

  function handleRejectConfirm() {
    if (!rejectTarget) return
    rejectAlgorithm(rejectTarget, rejectReason)
    toast.success('반려 처리되었습니다.')
    setRejectTarget(null)
    setRejectReason('')
  }

  return (
    <div className="p-6">
      <h1 className="mb-5 text-[18px] font-semibold">등록 요청 큐</h1>

      {/* 상태 탭 */}
      <div className="mb-4 flex border-b border-[var(--border)]">
        {TABS.map((t) => {
          const count = algorithms.filter((a) => t.value === 'all' || a.status === t.value).length
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
                  <th className="w-24 whitespace-nowrap">등록자</th>
                  <th className="w-24 whitespace-nowrap">SDK</th>
                  <th className="w-24 whitespace-nowrap">제출일</th>
                  <th className="w-24 whitespace-nowrap">자동검증</th>
                  <th className="text-right w-44 whitespace-nowrap">액션</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => {
                  const overall = a.autoCheckResult.overall
                  return (
                    <tr key={a.id} className="">
                      <td className="">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">v{a.version}</p>
                      </td>
                      <td className="text-[var(--muted-foreground)] whitespace-nowrap">{a.authorId}</td>
                      <td className="text-[var(--muted-foreground)] whitespace-nowrap">{a.sdk}</td>
                      <td className="text-[var(--muted-foreground)] whitespace-nowrap">{formatDate(a.createdAt)}</td>
                      <td className="whitespace-nowrap">
                        <span className={cn('text-[12px]', overall === 'pass' ? 'text-[#22c55e]' : overall === 'warn' ? 'text-amber-500' : 'text-[var(--destructive)]')}>
                          {CHECK_ICON[overall]} {CHECK_LABEL[overall]}
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {a.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setApproveTarget(a.id)}
                                className="flex items-center gap-1 rounded-md bg-[#22c55e] px-2.5 py-1 text-[12px] text-white hover:opacity-90 transition-opacity"
                              >
                                <Check size={11} /> 승인
                              </button>
                              <button
                                onClick={() => handleRejectOpen(a.id)}
                                className="flex items-center gap-1 rounded-md bg-[var(--destructive)] px-2.5 py-1 text-[12px] text-white hover:opacity-90 transition-opacity"
                              >
                                <X size={11} /> 반려
                              </button>
                            </>
                          )}
                          <Link
                            href={`/marketplace/requests/${a.id}`}
                            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
                          >
                            <ArrowRight size={11} /> 상세
                          </Link>
                        </div>
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

      {/* 승인 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(v) => !v && setApproveTarget(null)}
        title="알고리즘을 승인하시겠습니까?"
        description="승인하면 마켓플레이스에 즉시 게시됩니다."
        confirmLabel="승인"
        onConfirm={() => approveTarget && handleApprove(approveTarget)}
      />

      {/* 반려 사유 입력 드로어 */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setRejectTarget(null)} />
          <div className="flex w-80 flex-col bg-[var(--card)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span className="text-[14px] font-semibold">반려 사유 입력</span>
              <button onClick={() => setRejectTarget(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <p className="text-[12px] text-[var(--muted-foreground)]">반려 사유를 입력하면 등록자에게 안내됩니다.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="반려 사유를 입력하세요."
                rows={5}
                className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="flex gap-2 border-t border-[var(--border)] px-4 py-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 rounded-md border border-[var(--border)] py-1.5 text-[13px] hover:bg-[var(--accent)] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 rounded-md bg-[var(--destructive)] py-1.5 text-[13px] text-white hover:opacity-90 transition-opacity"
              >
                반려 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
