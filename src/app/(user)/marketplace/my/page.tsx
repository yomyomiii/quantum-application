'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, ArrowRight, ChevronRight } from 'lucide-react'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { usePersonaStore } from '@/store/persona.store'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination, paginate } from '@/components/shared/Pagination'
import { RegisterDrawer } from './RegisterDrawer'
import { formatDate, formatNumber } from '@/lib/format'
import type { AlgorithmStatus } from '@/types/common'

const TYPE_COLOR: Record<string, string> = {
  '승인 완료': 'bg-[#22c55e]',
  '실행됨': 'bg-[var(--primary)]',
  '등록 요청': 'bg-amber-500',
  '반려': 'bg-[var(--destructive)]',
}

const STAT_GROUPS: { key: string; label: string; statuses: AlgorithmStatus[]; color: string }[] = [
  { key: 'published', label: '게시 완료', statuses: ['published', 'inactive'], color: 'text-[#22c55e]' },
  { key: 'pending',   label: '승인 요청', statuses: ['pending'],               color: 'text-amber-500' },
  { key: 'rejected',  label: '반려',      statuses: ['rejected'],              color: 'text-[var(--destructive)]' },
  { key: 'draft',     label: '임시저장',  statuses: ['draft'],                 color: 'text-[var(--muted-foreground)]' },
]

export default function MyAlgorithmsPage() {
  const { algorithms, jobs } = useMarketplaceStore()
  const { currentUserId } = usePersonaStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [tabFilter, setTabFilter] = useState<'all' | 'published' | 'pending' | 'draft' | 'rejected'>('all')

  const myAlgos = useMemo(
    () => [...algorithms.filter((a) => a.authorId === currentUserId)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [algorithms, currentUserId],
  )

  const TAB_FILTERS: { key: 'all' | 'published' | 'pending' | 'draft' | 'rejected'; label: string; statuses: AlgorithmStatus[] | null }[] = [
    { key: 'all',       label: '전체',    statuses: null },
    { key: 'published', label: '게시 완료', statuses: ['published', 'inactive'] },
    { key: 'pending',   label: '승인 요청', statuses: ['pending'] },
    { key: 'draft',     label: '임시저장', statuses: ['draft'] },
    { key: 'rejected',  label: '반려',    statuses: ['rejected'] },
  ]

  const filteredAlgos = useMemo(() => {
    const tab = TAB_FILTERS.find((t) => t.key === tabFilter)
    if (!tab?.statuses) return myAlgos
    return myAlgos.filter((a) => tab.statuses!.includes(a.status))
  }, [myAlgos, tabFilter])

  const stats = useMemo(
    () => Object.fromEntries(STAT_GROUPS.map(({ key, statuses }) => [key, myAlgos.filter((a) => statuses.includes(a.status)).length])),
    [myAlgos],
  )

  const recentActivities = useMemo(() => {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString()
    const list: { type: string; date: string; content: string; algorithmTitle: string; algorithmId: string }[] = []
    myAlgos.forEach((a) => {
      if (a.status === 'published' && a.publishedAt && a.publishedAt >= cutoff)
        list.push({ type: '승인 완료', date: a.publishedAt, content: `v${a.version} 게시 완료`, algorithmTitle: a.title, algorithmId: a.id })
      if (a.status === 'pending' && a.createdAt >= cutoff)
        list.push({ type: '등록 요청', date: a.createdAt, content: `v${a.version} 등록 요청`, algorithmTitle: a.title, algorithmId: a.id })
      if (a.status === 'rejected' && a.createdAt >= cutoff)
        list.push({ type: '반려', date: a.createdAt, content: '설명 보완 필요', algorithmTitle: a.title, algorithmId: a.id })
    })
    jobs
      .filter((j) => j.userId !== currentUserId && myAlgos.some((a) => a.id === j.algorithmId) && j.createdAt >= cutoff)
      .forEach((j) => {
        const algo = myAlgos.find((a) => a.id === j.algorithmId)
        if (algo) list.push({ type: '실행됨', date: j.createdAt, content: `${j.workspaceId}에서 실행`, algorithmTitle: algo.title, algorithmId: algo.id })
      })
    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  }, [myAlgos, jobs, currentUserId])

  const paged = useMemo(() => paginate(filteredAlgos, page, pageSize), [filteredAlgos, page, pageSize])
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">내 양자 알고리즘</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> 알고리즘 등록
        </button>
      </div>

      {/* 현황 카드 */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {STAT_GROUPS.map(({ key, label, color }) => (
          <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
            <p className={`text-[28px] font-bold ${color}`}>{stats[key] ?? 0}</p>
            <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">{label}</p>
          </div>
        ))}
      </div>

      {/* 활동 이력 섹션 */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">활동 이력</h2>
          <Link
            href="/marketplace/my/history"
            className="flex items-center gap-0.5 text-[12px] text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            전체 보기 <ChevronRight size={13} />
          </Link>
        </div>
        {recentActivities.length === 0 ? (
          <p className="text-[13px] text-[var(--muted-foreground)]">최근 30일 활동 이력이 없습니다.</p>
        ) : (
          <div className="ds-table-wrap">
            <table className="ds-table w-full">
              <thead>
                <tr>
                  <th className="w-28 whitespace-nowrap">날짜</th>
                  <th className="w-28 whitespace-nowrap">유형</th>
                  <th className="whitespace-nowrap">내용</th>
                  <th className="whitespace-nowrap">알고리즘</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((act, i) => (
                  <tr key={i}>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{act.date.slice(0, 10)}</td>
                    <td>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white ${TYPE_COLOR[act.type]}`}>
                        {act.type}
                      </span>
                    </td>
                    <td className="text-[var(--muted-foreground)]">{act.content}</td>
                    <td>
                      <Link href={`/marketplace/${act.algorithmId}`} className="hover:text-[var(--primary)] transition-colors">
                        {act.algorithmTitle}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 내 양자 알고리즘 목록 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">내 양자 알고리즘 목록</h2>
      </div>

      {/* 탭 필터 */}
      <div className="mb-3 flex gap-1 border-b border-[var(--border)]">
        {TAB_FILTERS.map((tab) => {
          const count = tab.statuses
            ? myAlgos.filter((a) => tab.statuses!.includes(a.status)).length
            : myAlgos.length
          const active = tabFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => { setTabFilter(tab.key); setPage(1) }}
              className={`flex items-center gap-1.5 px-3 py-2 text-[13px] border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-[var(--primary)] text-[var(--primary)] font-medium'
                  : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                active ? 'bg-[var(--primary-10)] text-[var(--primary)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filteredAlgos.length === 0 ? (
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
                  <th className="w-24 whitespace-nowrap">요청일 / 등록일</th>
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
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">
                      {['published', 'inactive'].includes(a.status) && a.publishedAt
                        ? formatDate(a.publishedAt)
                        : formatDate(a.createdAt)}
                    </td>
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
            total={filteredAlgos.length}
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
