'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { usePersonaStore } from '@/store/persona.store'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination, paginate } from '@/components/shared/Pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ActivityType = '전체' | '승인 완료' | '실행됨' | '등록 요청' | '반려'

const TYPE_COLOR: Record<string, string> = {
  '승인 완료': 'bg-[#22c55e]',
  '실행됨': 'bg-[var(--primary)]',
  '등록 요청': 'bg-amber-500',
  '반려': 'bg-[var(--destructive)]',
}

const PERIOD_DAYS: Record<string, number> = {
  '7': 7,
  '30': 30,
  '90': 90,
  'all': Infinity,
}

export default function ActivityHistoryPage() {
  const { algorithms, jobs } = useMarketplaceStore()
  const { currentUserId } = usePersonaStore()
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState<ActivityType>('전체')
  const [period, setPeriod] = useState('30')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const myAlgos = useMemo(
    () => algorithms.filter((a) => a.authorId === currentUserId),
    [algorithms, currentUserId],
  )

  const activities = useMemo(() => {
    const list: { type: string; date: string; content: string; algorithmTitle: string; algorithmId: string }[] = []
    const cutoff = new Date(Date.now() - PERIOD_DAYS[period] * 86400000).toISOString()

    myAlgos.forEach((a) => {
      if (a.status === 'published' && a.publishedAt && a.publishedAt >= cutoff)
        list.push({ type: '승인 완료', date: a.publishedAt, content: `v${a.version} 게시 완료`, algorithmTitle: a.title, algorithmId: a.id })
      if (a.status === 'pending' && a.createdAt >= cutoff)
        list.push({ type: '등록 요청', date: a.createdAt, content: `v${a.version} 등록 요청`, algorithmTitle: a.title, algorithmId: a.id })
      if (a.status === 'rejected' && a.createdAt >= cutoff)
        list.push({ type: '반려', date: a.createdAt, content: '설명 보완 필요 (검수 코멘트 있음)', algorithmTitle: a.title, algorithmId: a.id })
    })
    jobs
      .filter((j) => j.userId !== currentUserId && myAlgos.some((a) => a.id === j.algorithmId) && j.createdAt >= cutoff)
      .forEach((j) => {
        const algo = myAlgos.find((a) => a.id === j.algorithmId)
        if (algo)
          list.push({ type: '실행됨', date: j.createdAt, content: `${j.workspaceId}에서 실행`, algorithmTitle: algo.title, algorithmId: algo.id })
      })

    return list
      .filter((a) => typeFilter === '전체' || a.type === typeFilter)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [myAlgos, jobs, currentUserId, typeFilter, period])

  const paged = useMemo(() => paginate(activities, page, pageSize), [activities, page, pageSize])

  return (
    <div className="p-6 max-w-4xl">
      {/* 뒤로가기 + 브레드크럼 */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft size={13} /> 뒤로
        </button>
        <nav className="flex items-center gap-1 text-[12px] text-[var(--muted-foreground)]">
          <Link href="/marketplace/my" className="hover:text-[var(--foreground)] transition-colors">내 양자 알고리즘</Link>
          <ChevronRight size={12} />
          <span>활동 이력</span>
        </nav>
      </div>

      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-[18px] font-semibold">활동 이력</h1>
      </div>

      {/* 필터 바 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={period} onValueChange={(v) => { setPeriod(v); setPage(1) }}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">최근 7일</SelectItem>
            <SelectItem value="30">최근 30일</SelectItem>
            <SelectItem value="90">최근 90일</SelectItem>
            <SelectItem value="all">전체 기간</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as ActivityType); setPage(1) }}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체 유형</SelectItem>
            {(['승인 완료', '실행됨', '등록 요청', '반려'] as ActivityType[]).map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 타임라인 목록 */}
      {activities.length === 0 ? (
        <EmptyState title="활동 이력이 없습니다" description="필터 조건을 변경하거나 알고리즘을 등록해보세요." />
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table w-full">
              <thead>
                <tr className="">
                  <th className="w-28 whitespace-nowrap">날짜</th>
                  <th className="w-28 whitespace-nowrap">유형</th>
                  <th className="whitespace-nowrap">내용</th>
                  <th className="whitespace-nowrap">알고리즘</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((act, i) => (
                  <tr key={i} className="">
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{act.date.slice(0, 10)}</td>
                    <td className="">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white ${TYPE_COLOR[act.type]}`}>
                        {act.type}
                      </span>
                    </td>
                    <td className="text-[var(--muted-foreground)]">{act.content}</td>
                    <td className="">
                      <Link href={`/marketplace/${act.algorithmId}`} className="hover:text-[var(--primary)] transition-colors">
                        {act.algorithmTitle}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            total={activities.length}
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
