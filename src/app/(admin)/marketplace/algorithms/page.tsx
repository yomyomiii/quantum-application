'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { formatDate, formatNumber } from '@/lib/format'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination, paginate } from '@/components/shared/Pagination'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/components/ui/utils'

export default function AdminAlgorithmsPage() {
  const { algorithms, toggleActive, setRecommended } = useMarketplaceStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const list = useMemo(() => {
    const published = algorithms.filter((a) => a.status === 'published' || a.status === 'inactive')
    const base = search
      ? published.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
      : published
    return [...base].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [algorithms, search])

  const paged = useMemo(() => paginate(list, page, pageSize), [list, page, pageSize])

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">양자 알고리즘 관리</h1>
        <input
          type="text"
          placeholder="알고리즘명 검색"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="h-8 w-56 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] outline-none focus:border-[var(--primary)]"
        />
      </div>

      {list.length === 0 && (
        <EmptyState title="알고리즘이 없습니다" description="검색 조건을 변경해보세요." />
      )}

      {list.length > 0 && (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table w-full">
              <thead>
                <tr className="">
                  <th className="whitespace-nowrap">알고리즘명</th>
                  <th className="w-20 whitespace-nowrap">SDK</th>
                  <th className="text-right w-20 whitespace-nowrap">조회수</th>
                  <th className="text-right w-20 whitespace-nowrap">실행수</th>
                  <th className="w-24 whitespace-nowrap">수정일</th>
                  <th className="text-center w-24 whitespace-nowrap">추천</th>
                  <th className="text-center w-32 whitespace-nowrap">활성</th>
                  <th className="text-right w-16 whitespace-nowrap">액션</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((a) => (
                  <tr key={a.id} className="">
                    <td className="">
                      <p className="font-medium">{a.title}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">v{a.version} · {a.authorId}</p>
                    </td>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{a.sdk}</td>
                    <td className="text-right text-[var(--muted-foreground)] whitespace-nowrap">{formatNumber(a.viewCount)}</td>
                    <td className="text-right text-[var(--muted-foreground)] whitespace-nowrap">{formatNumber(a.runCount)}</td>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap">{formatDate(a.updatedAt)}</td>
                    <td className="text-center">
                      <button
                        onClick={() => {
                          setRecommended(a.id, !a.isRecommended)
                          toast.success(a.isRecommended ? '추천 해제되었습니다.' : '추천 지정되었습니다.')
                        }}
                        className="flex items-center gap-1 text-[12px]"
                      >
                        <Star size={15} className={cn('transition-colors', a.isRecommended ? 'fill-amber-400 text-amber-400' : 'text-[var(--muted-foreground)]')} />
                        <span className={cn('whitespace-nowrap', a.isRecommended ? 'text-amber-500' : 'text-[var(--muted-foreground)]')}>
                          {a.isRecommended ? '추천 중' : '추천 지정'}
                        </span>
                      </button>
                    </td>
                    <td className="">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={a.status === 'published'}
                          onCheckedChange={() => {
                            toggleActive(a.id)
                            toast.success(a.status === 'published' ? '비활성화되었습니다.' : '활성화되었습니다.')
                          }}
                        />
                        <span className={cn('text-[11px] whitespace-nowrap', a.status === 'published' ? 'text-[#22c55e]' : 'text-[var(--muted-foreground)]')}>
                          {a.status === 'published' ? '활성' : '비활성'}
                        </span>
                      </div>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <Link
                        href={`/marketplace/algorithms/${a.id}`}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
                      >
                        상세 <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
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
