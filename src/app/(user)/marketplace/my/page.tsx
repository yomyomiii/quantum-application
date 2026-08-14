'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, ArrowRight } from 'lucide-react'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { usePersonaStore } from '@/store/persona.store'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination, paginate } from '@/components/shared/Pagination'
import { RegisterDrawer } from './RegisterDrawer'
import { formatDate, formatNumber } from '@/lib/format'
import type { AlgorithmStatus } from '@/types/common'

const STATUS_STAT: { key: AlgorithmStatus; label: string; color: string }[] = [
  { key: 'published', label: '게시 중', color: 'text-[#22c55e]' },
  { key: 'pending', label: '검토 중', color: 'text-amber-500' },
  { key: 'rejected', label: '반려', color: 'text-[var(--destructive)]' },
  { key: 'draft', label: '임시저장', color: 'text-[var(--muted-foreground)]' },
]

export default function MyAlgorithmsPage() {
  const { algorithms } = useMarketplaceStore()
  const { currentUserId } = usePersonaStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const myAlgos = useMemo(
    () => [...algorithms.filter((a) => a.authorId === currentUserId)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [algorithms, currentUserId],
  )

  const stats = useMemo(
    () => Object.fromEntries(STATUS_STAT.map(({ key }) => [key, myAlgos.filter((a) => a.status === key).length])),
    [myAlgos],
  )

  const paged = useMemo(() => paginate(myAlgos, page, pageSize), [myAlgos, page, pageSize])
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">양자 알고리즘</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> 새 버전 게시
        </button>
      </div>

      {/* 현황 카드 */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {STATUS_STAT.map(({ key, label, color }) => (
          <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
            <p className={`text-[28px] font-bold ${color}`}>{stats[key] ?? 0}</p>
            <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">{label}</p>
          </div>
        ))}
      </div>

      {/* 알고리즘 테이블 */}
      {myAlgos.length === 0 ? (
        <EmptyState title="등록한 알고리즘이 없습니다" description="새 버전 게시 버튼으로 첫 알고리즘을 등록하세요." />
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table w-full">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">알고리즘명</th>
                  <th className="w-24 whitespace-nowrap">상태</th>
                  <th className="w-20 whitespace-nowrap">SDK</th>
                  <th className="w-24 whitespace-nowrap">카테고리</th>
                  <th className="w-20 whitespace-nowrap">조회</th>
                  <th className="w-20 whitespace-nowrap">실행</th>
                  <th className="w-24 whitespace-nowrap">등록일</th>
                  <th className="w-16 whitespace-nowrap">액션</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer hover:bg-[var(--accent)] transition-colors"
                    onClick={() => router.push(`/marketplace/my/${a.id}`)}
                  >
                    <td>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">v{a.version}</p>
                    </td>
                    <td><StatusBadge status={a.status as AlgorithmStatus} /></td>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{a.sdk}</td>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{a.category || '—'}</td>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{formatNumber(a.viewCount)}</td>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{formatNumber(a.runCount)}</td>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{formatDate(a.createdAt)}</td>
                    <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/marketplace/my/${a.id}`}
                        className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
                      >
                        <ArrowRight size={11} /> 상세
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            total={myAlgos.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="mt-3"
          />
        </>
      )}

      <RegisterDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
