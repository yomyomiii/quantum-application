'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, List, Search } from 'lucide-react'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { AlgorithmCard } from '@/components/shared/AlgorithmCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/components/ui/utils'
import { getItem, setItem } from '@/lib/storage'
import { MOCK_CATEGORIES } from '@/mocks/algorithms'
import type { Algorithm } from '@/types/algorithm'

const SDK_OPTIONS = ['Qiskit', 'Pennylane', 'CUDA-Q', 'Cirq']

type SortKey = 'popular' | 'rating' | 'newest' | 'runs'

function sortAlgorithms(items: Algorithm[], key: SortKey): Algorithm[] {
  return [...items].sort((a, b) => {
    if (key === 'popular') return b.viewCount - a.viewCount
    if (key === 'rating') return b.rating - a.rating
    if (key === 'newest') return b.createdAt.localeCompare(a.createdAt)
    if (key === 'runs') return b.runCount - a.runCount
    return 0
  })
}

import Link from 'next/link'
import { Eye, Play, Star } from 'lucide-react'

function AlgorithmListRow({ a }: { a: Algorithm }) {
  return (
    <Link
      href={`/marketplace/${a.id}`}
      className="flex items-center gap-4 border-b border-[var(--border)] px-4 py-3 last:border-0 hover:bg-[var(--accent)] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="truncate text-[13px] font-medium hover:text-[var(--primary)]">{a.title}</p>
        <p className="mt-0.5 truncate text-[12px] text-[var(--muted-foreground)]">{a.description}</p>
      </div>
      <span className="shrink-0 text-[12px] text-[var(--muted-foreground)] w-[80px] truncate">{a.authorId}</span>
      <span className="shrink-0 text-[12px] text-[var(--muted-foreground)]">{a.sdk}</span>
      <span className="shrink-0 flex items-center gap-0.5 text-[12px]">
        <Star size={11} className="fill-amber-400 text-amber-400" />
        {a.rating.toFixed(1)}
      </span>
      <span className="shrink-0 flex items-center gap-0.5 text-[12px] text-[var(--muted-foreground)]">
        <Eye size={11} /> {a.viewCount.toLocaleString()}
      </span>
      <span className="shrink-0 flex items-center gap-0.5 text-[12px] text-[var(--muted-foreground)]">
        <Play size={11} /> {a.runCount.toLocaleString()}
      </span>
      <span className="shrink-0 text-[12px] text-[var(--muted-foreground)]">{a.createdAt.slice(0, 10)}</span>
    </Link>
  )
}

export default function MarketplacePage() {
  const { algorithms } = useMarketplaceStore()
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => getItem<'card' | 'list'>('qs:mktViewMode', 'card'))
  const [sortKey, setSortKey] = useState<SortKey>('popular')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedSdks, setSelectedSdks] = useState<Set<string>>(new Set())
  const [authorKeyword, setAuthorKeyword] = useState('')

  const published = useMemo(() => algorithms.filter((a) => a.status === 'published'), [algorithms])

  const filtered = useMemo(() => {
    let result = published
    if (selectedCategories.size > 0)
      result = result.filter((a) => selectedCategories.has(a.category))
    if (selectedSdks.size > 0)
      result = result.filter((a) => selectedSdks.has(a.sdk))
    if (authorKeyword.trim())
      result = result.filter((a) => a.authorId.toLowerCase().includes(authorKeyword.toLowerCase()))
    return sortAlgorithms(result, sortKey)
  }, [published, selectedCategories, selectedSdks, authorKeyword, sortKey])

  function toggleCategory(name: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function toggleSdk(sdk: string) {
    setSelectedSdks((prev) => {
      const next = new Set(prev)
      if (next.has(sdk)) next.delete(sdk)
      else next.add(sdk)
      return next
    })
  }

  function handleViewMode(mode: 'card' | 'list') {
    setViewMode(mode)
    setItem('qs:mktViewMode', mode)
  }

  return (
    <div className="flex h-[calc(100vh-40px)]">
      {/* 좌측 필터 사이드바 (240px) */}
      <aside className="w-[240px] shrink-0 overflow-y-auto border-r border-[var(--border)] p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">카테고리</p>
        <div className="mb-5 space-y-2">
          {MOCK_CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={selectedCategories.has(cat.name)}
                onCheckedChange={() => toggleCategory(cat.name)}
              />
              <span className="text-[13px]">{cat.name}</span>
              <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">
                {published.filter((a) => a.category === cat.name).length}
              </span>
            </label>
          ))}
        </div>

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">SDK</p>
        <div className="mb-5 space-y-2">
          {SDK_OPTIONS.map((sdk) => (
            <label key={sdk} className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={selectedSdks.has(sdk)}
                onCheckedChange={() => toggleSdk(sdk)}
              />
              <span className="text-[13px]">{sdk}</span>
              <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">
                {published.filter((a) => a.sdk === sdk).length}
              </span>
            </label>
          ))}
        </div>

        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">등록자</p>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="등록자 검색"
            value={authorKeyword}
            onChange={(e) => setAuthorKeyword(e.target.value)}
            className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] pl-7 pr-2 text-[12px] outline-none focus:border-[var(--primary)]"
          />
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          {/* 상단 컨트롤 바 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] text-[var(--muted-foreground)]">
              총 <span className="font-semibold text-[var(--foreground)]">{filtered.length}</span>개
            </p>
            <div className="flex items-center gap-2">
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">인기순</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="runs">실행순</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
                <button
                  onClick={() => handleViewMode('card')}
                  className={cn('flex h-8 w-8 items-center justify-center transition-colors', viewMode === 'card' ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--accent)]')}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => handleViewMode('list')}
                  className={cn('flex h-8 w-8 items-center justify-center transition-colors', viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--accent)]')}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 && (
            <EmptyState title="검색 결과가 없습니다" description="필터 조건을 변경해보세요." />
          )}

          {/* 카드 뷰 */}
          {viewMode === 'card' && filtered.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {filtered.map((a) => <AlgorithmCard key={a.id} algorithm={a} />)}
            </div>
          )}

          {/* 리스트 뷰 */}
          {viewMode === 'list' && filtered.length > 0 && (
            <div className="ds-table-wrap">
              {filtered.map((a) => <AlgorithmListRow key={a.id} a={a} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
