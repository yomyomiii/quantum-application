'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { usePersonaStore } from '@/store/persona.store'
import { EmptyState } from '@/components/shared/EmptyState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ActivityType = '전체' | '승인 완료' | '실행됨' | '등록 요청' | '반려'

const TYPE_COLOR: Record<string, string> = {
  '승인 완료': 'bg-[#22c55e]',
  '실행됨': 'bg-[var(--primary)]',
  '등록 요청': 'bg-[var(--primary)]',
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
  const [typeFilter, setTypeFilter] = useState<ActivityType>('전체')
  const [period, setPeriod] = useState('30')

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
        list.push({ type: '등록 요청', date: a.createdAt, content: `v${a.version} 검수 요청 제출`, algorithmTitle: a.title, algorithmId: a.id })
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

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/marketplace/my" className="flex items-center gap-1.5 text-[13px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft size={14} /> 내 양자 알고리즘
          </Link>
          <span className="text-[var(--border)]">/</span>
          <h1 className="text-[18px] font-semibold">활동 이력</h1>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="mb-4 flex gap-2">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActivityType)}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['전체', '승인 완료', '실행됨', '등록 요청', '반려'] as ActivityType[]).map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">최근 7일</SelectItem>
            <SelectItem value="30">최근 30일</SelectItem>
            <SelectItem value="90">최근 90일</SelectItem>
            <SelectItem value="all">전체</SelectItem>
          </SelectContent>
        </Select>
        <span className="flex items-center text-[13px] text-[var(--muted-foreground)]">총 {activities.length}건</span>
      </div>

      {/* 타임라인 목록 */}
      {activities.length === 0 ? (
        <EmptyState title="활동 이력이 없습니다" description="필터 조건을 변경하거나 알고리즘을 등록해보세요." />
      ) : (
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
              {activities.map((act, i) => (
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
      )}
    </div>
  )
}
