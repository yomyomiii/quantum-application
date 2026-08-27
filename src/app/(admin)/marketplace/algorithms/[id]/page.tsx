'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Star, RotateCcw, Trash2, FileCode, Eye, Play } from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { MOCK_USERS } from '@/mocks/users'
import { MOCK_NOTEBOOKS } from '@/mocks/algorithms'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ui/dialog-confirm'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/components/ui/utils'
import { useState } from 'react'
import type { AlgorithmStatus } from '@/types/common'

interface Props { params: Promise<{ id: string }> }

const RATING_DIST = [5, 4, 3, 2, 1]

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

export default function AdminAlgorithmDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { algorithms, toggleActive, setRecommended, rollbackVersion, removeReview } = useMarketplaceStore()
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null)
  const [deleteReviewTarget, setDeleteReviewTarget] = useState<string | null>(null)

  const algo = algorithms.find((a) => a.id === id)

  if (!algo) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-[15px] font-semibold">알고리즘을 찾을 수 없습니다</p>
        <Link href="/marketplace/algorithms" className="mt-4 text-[13px] text-[var(--primary)] hover:underline">목록으로</Link>
      </div>
    )
  }

  const authorName = MOCK_USERS.find((u) => u.id === algo.authorId)?.name ?? algo.authorId

  const statData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000)
    const label = `${date.getMonth() + 1}/${date.getDate()}`
    const views = Math.floor(Math.random() * 60 + 10)
    const runs = Math.floor(Math.random() * 40 + 5)
    return { date: label, 조회수: views, 실행수: runs }
  })

  const ratingDist = RATING_DIST.map((star) => ({
    star,
    count: algo.reviews.filter((r) => r.rating === star).length,
  }))
  const maxCount = Math.max(...ratingDist.map((r) => r.count), 1)

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
          <Link href="/marketplace/algorithms" className="hover:text-[var(--foreground)] transition-colors">양자 알고리즘 관리</Link>
          <ChevronRight size={12} />
          <span className="truncate max-w-[240px]">{algo.title}</span>
        </nav>
      </div>

      {/* Hero 섹션 */}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-semibold">{algo.title}</h1>
              <StatusBadge status={algo.status as AlgorithmStatus} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted-foreground)]">
              <span>버전: <strong className="text-[var(--foreground)]">v{algo.version}</strong></span>
              <span>·</span>
              <span>SDK: <strong className="text-[var(--foreground)]">{algo.sdk}</strong></span>
              <span>·</span>
              <span>카테고리: <strong className="text-[var(--foreground)]">{algo.category || '—'}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setRecommended(algo.id, !algo.isRecommended); toast.success(algo.isRecommended ? '추천 해제되었습니다.' : '추천 지정되었습니다.') }}
              className="flex items-center gap-1 text-[12px]"
            >
              <Star size={16} className={cn(algo.isRecommended ? 'fill-amber-400 text-amber-400' : 'text-[var(--muted-foreground)]')} />
              {algo.isRecommended ? '추천 중' : '추천 지정'}
            </button>
            <div className="flex items-center gap-2">
              <Switch
                checked={algo.status === 'published'}
                onCheckedChange={() => { toggleActive(algo.id); toast.success(algo.status === 'published' ? '비활성화되었습니다.' : '활성화되었습니다.') }}
              />
              <span className={cn('text-[12px]', algo.status === 'published' ? 'text-[#22c55e]' : 'text-[var(--muted-foreground)]')}>
                {algo.status === 'published' ? '활성' : '비활성'}
              </span>
            </div>
          </div>
        </div>
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

      {/* 반려 사유 배너 */}
      {algo.status === 'rejected' && algo.rejectReason && (
        <div className="mb-5 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 px-4 py-3">
          <p className="mb-0.5 text-[12px] font-semibold text-[var(--destructive)]">반려 사유</p>
          <p className="text-[13px] text-[var(--foreground)]">{algo.rejectReason}</p>
          {algo.rejectedAt && (
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{algo.rejectedAt.slice(0, 10)}</p>
          )}
        </div>
      )}

      {/* 탭 */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">개요</TabsTrigger>
          <TabsTrigger value="versions">버전 이력</TabsTrigger>
          <TabsTrigger value="changes">수정 이력</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
          <TabsTrigger value="reviews">평가</TabsTrigger>
        </TabsList>

        {/* 정보 */}
        <TabsContent value="info">
          <div className="py-4 space-y-4">
            {/* 정보 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="mb-3 text-[13px] font-semibold">정보</p>
              <div className="grid grid-cols-[120px_1fr] gap-y-3 text-[13px]">
                <span className="text-[var(--muted-foreground)]">알고리즘명</span><span className="font-medium">{algo.title}</span>
                <span className="text-[var(--muted-foreground)]">버전</span><span className="font-mono">v{algo.version}</span>
                <span className="text-[var(--muted-foreground)]">설명</span><span className="leading-relaxed">{algo.description}</span>
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
                <span className="text-[var(--muted-foreground)]">등록일</span><span>{algo.createdAt.slice(0, 10)}</span>
              </div>
            </div>

            {/* 코드 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold">코드</p>
                <div className="flex items-center gap-2">
                  {algo.codeSource === 'file' ? (
                    <>
                      <span className="shrink-0 rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-[11px] font-medium">파일 업로드</span>
                      {algo.fileName && (
                        <span className="flex min-w-0 items-center gap-1 text-[12px] text-[var(--muted-foreground)]">
                          <FileCode size={12} className="shrink-0" />
                          <span className="truncate">{algo.fileName}</span>
                        </span>
                      )}
                    </>
                  ) : algo.codeSource === 'notebook' ? (
                    <>
                      <span className="shrink-0 rounded-full bg-[var(--primary-10)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--primary)]">노트북 연결</span>
                      {algo.notebookId && (
                        <span className="min-w-0 truncate text-[12px] text-[var(--muted-foreground)]">
                          {MOCK_NOTEBOOKS.find((n) => n.id === algo.notebookId)?.name ?? algo.notebookId}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="shrink-0 rounded-full bg-[#22c55e]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#22c55e]">직접 입력</span>
                  )}
                </div>
              </div>
              {algo.algorithmCode ? (
                <pre className="max-h-48 overflow-auto rounded-md bg-[var(--muted)] px-4 py-3 text-[12px] leading-relaxed">
                  <code>{algo.algorithmCode}</code>
                </pre>
              ) : (
                <p className="text-[12px] text-[var(--muted-foreground)]">코드 없음</p>
              )}
            </div>

            {/* 실행 방법 */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 text-[13px]">
              <p className="text-[13px] font-semibold">실행 방법</p>

              {/* 입력 파라미터 */}
              <div>
                <p className="mb-2 font-medium">입력 파라미터 <span className="ml-1 text-[12px] text-[var(--muted-foreground)] font-normal">{algo.inputParams.length}개</span></p>
                {algo.inputParams.length === 0 ? (
                  <p className="text-[12px] text-[var(--muted-foreground)]">입력 파라미터 없음</p>
                ) : (
                  <div className="ds-table-wrap">
                    <table className="ds-table w-full">
                      <thead>
                        <tr>
                          <th className="whitespace-nowrap">파라미터명</th>
                          <th className="w-20 whitespace-nowrap">타입</th>
                          <th className="w-12 text-center whitespace-nowrap">필수</th>
                          <th className="whitespace-nowrap">설명</th>
                        </tr>
                      </thead>
                      <tbody>
                        {algo.inputParams.map((p) => (
                          <tr key={p.name}>
                            <td className="font-mono text-[12px]">{p.name}</td>
                            <td className="text-[var(--muted-foreground)]">{p.type}</td>
                            <td className="text-center">{p.required ? '✅' : ''}</td>
                            <td className="text-[var(--muted-foreground)]">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 출력 파라미터 */}
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="mb-2 font-medium">출력 파라미터 <span className="ml-1 text-[12px] text-[var(--muted-foreground)] font-normal">{algo.outputParams.length}개</span></p>
                {algo.outputParams.length === 0 ? (
                  <p className="text-[12px] text-[var(--muted-foreground)]">출력 파라미터 없음</p>
                ) : (
                  <div className="ds-table-wrap">
                    <table className="ds-table w-full">
                      <thead>
                        <tr>
                          <th className="whitespace-nowrap">파라미터명</th>
                          <th className="w-20 whitespace-nowrap">타입</th>
                          <th className="whitespace-nowrap">설명</th>
                        </tr>
                      </thead>
                      <tbody>
                        {algo.outputParams.map((p) => (
                          <tr key={p.name}>
                            <td className="font-mono text-[12px]">{p.name}</td>
                            <td className="text-[var(--muted-foreground)]">{p.type}</td>
                            <td className="text-[var(--muted-foreground)]">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 실행 예시 코드 */}
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="mb-2 font-medium">실행 예시 코드</p>
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

        {/* 버전 이력 */}
        <TabsContent value="versions">
          <div className="py-4 space-y-2">
            {algo.versions.length === 0 && <p className="text-[13px] text-[var(--muted-foreground)]">버전 이력 없음</p>}
            {algo.versions.map((v, i) => (
              <div key={v.version} className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[13px]">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">v{v.version}</span>
                    {i === 0 && <span className="rounded-full bg-[var(--primary-10)] px-1.5 py-0.5 text-[10px] text-[var(--primary)]">현재 게시</span>}
                  </div>
                  <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">{v.publishedAt.slice(0, 10)} · {v.changelog}</p>
                </div>
                <div className="flex gap-2">
                  {i > 0 && (
                    <button
                      onClick={() => setRollbackTarget(v.version)}
                      className="flex items-center gap-1 rounded-md border border-[var(--destructive)]/40 bg-[var(--card)] px-2.5 py-1 text-[12px] text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
                    >
                      <RotateCcw size={11} /> 롤백
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 수정 이력 */}
        <TabsContent value="changes">
          <div className="py-4 space-y-2">
            {algo.changeHistory.length === 0 && (
              <p className="text-[13px] text-[var(--muted-foreground)]">수정 이력 없음</p>
            )}
            {algo.changeHistory.map((c, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[13px]">
                <span className="text-[12px] text-[var(--muted-foreground)] w-36 shrink-0">{c.at.slice(0, 16).replace('T', ' ')}</span>
                <span className="flex-1">{c.action}</span>
                <span className="text-[12px] text-[var(--muted-foreground)] shrink-0">{c.userId}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 통계 */}
        <TabsContent value="stats">
          <div className="py-4 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '조회수', value: algo.viewCount.toLocaleString() },
                { label: '실행수', value: algo.runCount.toLocaleString() },
                { label: '평균 평점', value: `⭐ ${algo.rating.toFixed(1)} (${algo.ratingCount}개)` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center">
                  <p className="text-[11px] text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 text-[16px] font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-3 text-[13px] font-semibold">최근 30일 추이</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={statData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderColor: 'var(--border)', background: 'var(--card)' }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="조회수" stroke="#635ADC" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="실행수" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* 후기 */}
        <TabsContent value="reviews">
          <div className="py-4 space-y-4">
            {/* 평점 분포 */}
            {algo.reviews.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <p className="text-[13px] font-medium">평점 분포</p>
                  <span className="text-[12px] text-[var(--muted-foreground)]">⭐ {algo.rating.toFixed(1)} · {algo.reviews.length}개 후기</span>
                </div>
                <div className="space-y-1.5">
                  {ratingDist.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-2 text-[12px]">
                      <span className="w-4 shrink-0 text-right text-[var(--muted-foreground)]">{star}</span>
                      <span className="text-[11px]">★</span>
                      <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-4 shrink-0 text-[var(--muted-foreground)]">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 후기 목록 */}
            {algo.reviews.length === 0 && <p className="text-[13px] text-[var(--muted-foreground)]">후기 없음</p>}
            {algo.reviews.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2 text-[12px]">
                    <span className="font-medium">{r.userId}</span>
                    <span>{'⭐'.repeat(r.rating)}</span>
                    <span className="text-[var(--muted-foreground)]">{r.createdAt.slice(0, 10)}</span>
                  </div>
                  <p className="text-[13px]">{r.content}</p>
                </div>
                <button
                  onClick={() => setDeleteReviewTarget(r.id)}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-[var(--destructive)]/40 bg-[var(--card)] px-2.5 py-1 text-[12px] text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
                >
                  <Trash2 size={11} /> 삭제
                </button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 후기 삭제 확인 Dialog */}
      <ConfirmDialog
        open={!!deleteReviewTarget}
        onOpenChange={(v) => !v && setDeleteReviewTarget(null)}
        title="후기를 삭제하시겠습니까?"
        description="삭제된 후기는 복구할 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={() => { removeReview(algo.id, deleteReviewTarget!); toast.success('후기가 삭제되었습니다.'); setDeleteReviewTarget(null) }}
      />

      {/* 롤백 확인 Dialog */}
      <ConfirmDialog
        open={!!rollbackTarget}
        onOpenChange={(v) => !v && setRollbackTarget(null)}
        title={`v${rollbackTarget}으로 롤백하시겠습니까?`}
        description="현재 게시 버전이 변경됩니다."
        confirmLabel="롤백"
        variant="destructive"
        onConfirm={() => { rollbackVersion(id, rollbackTarget!); toast.success(`v${rollbackTarget}으로 롤백되었습니다.`); setRollbackTarget(null) }}
      />
    </div>
  )
}
