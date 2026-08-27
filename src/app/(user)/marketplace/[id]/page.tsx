'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, Play, Star, BookmarkPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { usePersonaStore } from '@/store/persona.store'
import { MOCK_USERS } from '@/mocks/users'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RunDrawer } from './RunDrawer'

interface Props { params: Promise<{ id: string }> }

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-[var(--muted)] text-[var(--muted)]'}
        />
      ))}
    </span>
  )
}

export default function AlgorithmDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { algorithms, incrementViewCount, addReview } = useMarketplaceStore()
  const { currentUserId } = usePersonaStore()
  const [runOpen, setRunOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)

  const algo = algorithms.find((a) => a.id === id)
  const authorName = MOCK_USERS.find((u) => u.id === algo?.authorId)?.name ?? algo?.authorId ?? '—'

  useEffect(() => {
    if (algo) incrementViewCount(algo.id)
  }, [algo?.id])

  if (!algo) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-[15px] font-semibold">알고리즘을 찾을 수 없습니다</p>
        <Link href="/marketplace" className="mt-4 text-[13px] text-[var(--primary)] hover:underline">목록으로</Link>
      </div>
    )
  }

  function handleRunOpen() {
    setRunOpen(true)
  }

  function handleAddReview() {
    if (!reviewText.trim()) return
    addReview(algo!.id, { userId: currentUserId, rating: reviewRating, content: reviewText.trim(), createdAt: new Date().toISOString() })
    setReviewText('')
    toast.success('후기가 등록되었습니다.')
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* 뒤로가기 + 브레드크럼 */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronLeft size={13} /> 뒤로
        </button>
        <nav className="flex items-center gap-1 text-[12px] text-[var(--muted-foreground)]">
          <Link href="/marketplace" className="hover:text-[var(--foreground)] transition-colors">마켓 플레이스</Link>
          <ChevronRight size={12} />
          <span className="truncate max-w-[240px]">{algo.title}</span>
        </nav>
      </div>

      {/* Hero 섹션 */}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-bold leading-snug">{algo.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted-foreground)]">
              <span>버전: <strong className="text-[var(--foreground)]">v{algo.version}</strong></span>
              <span>·</span>
              <span>SDK: <strong className="text-[var(--foreground)]">{algo.sdk}</strong></span>
              <span>·</span>
              <span>카테고리: <strong className="text-[var(--foreground)]">{algo.category}</strong></span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={handleRunOpen}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Play size={13} /> 노트북에서 열기 →
            </button>
            <button
              onClick={() => toast.success('내 양자 알고리즘에 추가되었습니다.')}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors"
            >
              <BookmarkPlus size={13} /> 추가
            </button>
          </div>
        </div>

        {/* 통계 */}
        <div className="flex flex-wrap items-center gap-4 text-[13px]">
          <span className="flex items-center gap-1.5">
            <StarRating rating={algo.rating} />
            <strong>{algo.rating.toFixed(1)}</strong>
            <span className="text-[var(--muted-foreground)]">({algo.ratingCount}개 평점)</span>
          </span>
          <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
            <Eye size={13} /> {algo.viewCount.toLocaleString()} 조회
          </span>
          <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
            <Play size={13} /> {algo.runCount.toLocaleString()} 실행
          </span>
        </div>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">개요</TabsTrigger>
          <TabsTrigger value="versions">버전 이력</TabsTrigger>
          <TabsTrigger value="reviews">평가</TabsTrigger>
        </TabsList>

        {/* 정보 탭 */}
        <TabsContent value="info">
          <div className="py-4 space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="mb-3 text-[13px] font-semibold">정보</p>
              <div className="grid grid-cols-[120px_1fr] gap-y-3 text-[13px]">
                <span className="text-[var(--muted-foreground)]">알고리즘명</span><span className="font-medium">{algo.title}</span>
                <span className="text-[var(--muted-foreground)]">버전</span><span className="font-mono">v{algo.version}</span>
                <span className="text-[var(--muted-foreground)]">설명</span><span className="leading-relaxed">{algo.description || '—'}</span>
                <span className="text-[var(--muted-foreground)]">SDK</span><span>{algo.sdk}</span>
                <span className="text-[var(--muted-foreground)]">카테고리</span><span>{algo.category || '—'}</span>
                <span className="text-[var(--muted-foreground)]">태그</span>
                <div className="flex flex-wrap gap-1">
                  {algo.tags.length > 0
                    ? algo.tags.map((t) => <span key={t} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px]">{t}</span>)
                    : <span className="text-[var(--muted-foreground)]">—</span>}
                </div>
                <span className="text-[var(--muted-foreground)]">실행 유형</span><span>{algo.executionType}</span>
                <span className="text-[var(--muted-foreground)]">등록자</span><span>{authorName}</span>
                <span className="text-[var(--muted-foreground)]">등록일</span><span>{algo.publishedAt ? algo.publishedAt.slice(0, 10) : '—'}</span>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-5">
              <p className="text-[13px] font-semibold">실행 방법</p>
              <ParamTable title="입력 파라미터" params={algo.inputParams} />
              <ParamTable title="출력 파라미터" params={algo.outputParams} />
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="mb-2 text-[13px] font-semibold">실행 예시 코드</p>
                {algo.exampleCode ? (
                  <pre className="max-h-40 overflow-auto rounded-md bg-[var(--muted)] px-4 py-3 text-[12px] leading-relaxed">
                    <code>{algo.exampleCode}</code>
                  </pre>
                ) : (
                  <p className="text-[12px] text-[var(--muted-foreground)]">실행 예시 코드 없음</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 버전 이력 탭 */}
        <TabsContent value="versions">
          <div className="py-4">
            {algo.versions.length === 0 ? (
              <p className="text-[13px] text-[var(--muted-foreground)]">버전 이력이 없습니다.</p>
            ) : (
              <div className="relative space-y-0 pl-4 before:absolute before:left-1.5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[var(--border)]">
                {algo.versions.map((v, i) => (
                  <div key={v.version} className="relative pb-5">
                    <div className="absolute -left-[11px] top-1 h-3 w-3 rounded-full border-2 border-[var(--primary)] bg-[var(--card)]" />
                    <div className="ml-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[13px] font-semibold">v{v.version}</span>
                        {i === 0 && <span className="rounded-full bg-[var(--primary-10)] px-2 py-0.5 text-[10px] text-[var(--primary)]">최신</span>}
                        <span className="text-[11px] text-[var(--muted-foreground)]">{v.publishedAt.slice(0, 10)}</span>
                      </div>
                      <p className="text-[12px] text-[var(--muted-foreground)]">{v.changelog}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* 평가 탭 */}
        <TabsContent value="reviews">
          <div className="py-4 space-y-5">
            {/* 평균 평점 게이지 */}
            <div className="flex items-center gap-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="text-center">
                <p className="text-[40px] font-bold leading-none">{algo.rating.toFixed(1)}</p>
                <StarRating rating={algo.rating} />
                <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{algo.ratingCount}개 평점</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = algo.reviews.filter((r) => Math.round(r.rating) === star).length
                  const pct = algo.ratingCount > 0 ? (count / algo.ratingCount) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-[12px]">
                      <span className="w-3 text-right">{star}</span>
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-[var(--muted-foreground)]">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 후기 작성 */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="mb-3 text-[13px] font-semibold">후기 작성</p>
              <div className="mb-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setReviewRating(n)}>
                    <Star size={20} className={n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'fill-[var(--muted)] text-[var(--muted)]'} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="이 알고리즘에 대한 후기를 남겨주세요..."
                rows={3}
                className="mb-2 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
              />
              <button
                onClick={handleAddReview}
                disabled={!reviewText.trim()}
                className="rounded-md bg-[var(--primary)] px-4 py-1.5 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                등록
              </button>
            </div>

            {/* 후기 목록 */}
            {algo.reviews.length === 0 ? (
              <p className="text-[13px] text-[var(--muted-foreground)]">아직 후기가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {algo.reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <StarRating rating={r.rating} />
                      <span className="text-[12px] font-medium">{r.userId}</span>
                      <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">{r.createdAt.slice(0, 10)}</span>
                    </div>
                    <p className="text-[13px]">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 실행 드로어 */}
      <RunDrawer algorithm={algo} open={runOpen} onOpenChange={setRunOpen} />
    </div>
  )
}

function ParamTable({ title, params }: { title: string; params: { name: string; type: string; required: boolean; description: string; defaultValue?: unknown }[] }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold">{title}</p>
      {params.length === 0 ? (
        <p className="text-[13px] text-[var(--muted-foreground)]">없음</p>
      ) : (
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>타입</th>
                <th>필수</th>
                <th>설명</th>
                <th>기본값</th>
              </tr>
            </thead>
            <tbody>
              {params.map((p) => (
                <tr key={p.name}>
                  <td className="font-mono font-medium">{p.name}</td>
                  <td className="text-[var(--muted-foreground)]">{p.type}</td>
                  <td>{p.required ? '✅' : '-'}</td>
                  <td className="text-[var(--muted-foreground)]">{p.description}</td>
                  <td className="font-mono text-[11px] text-[var(--muted-foreground)]">{p.defaultValue != null ? String(p.defaultValue) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
