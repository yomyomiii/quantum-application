'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Star, GitCompare, RotateCcw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ui/dialog-confirm'
import { cn } from '@/components/ui/utils'
import { useState } from 'react'

interface Props { params: Promise<{ id: string }> }

const CHECK_ICON: Record<'pass' | 'warn' | 'fail', string> = { pass: '✅', warn: '⚠️', fail: '❌' }

export default function AdminAlgorithmDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { algorithms, toggleActive, setRecommended } = useMarketplaceStore()
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null)

  const algo = algorithms.find((a) => a.id === id)

  if (!algo) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-[15px] font-semibold">알고리즘을 찾을 수 없습니다</p>
        <Link href="/marketplace/algorithms" className="mt-4 text-[13px] text-[var(--primary)] hover:underline">목록으로</Link>
      </div>
    )
  }

  // 최근 30일 mock 통계 데이터 (usageHistory 기반)
  const statData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000)
    const label = `${date.getMonth() + 1}/${date.getDate()}`
    const views = Math.floor(Math.random() * 60 + 10)
    const runs = Math.floor(Math.random() * 40 + 5)
    return { date: label, 조회수: views, 실행수: runs }
  })

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
            <h1 className="text-[18px] font-semibold">{algo.title}</h1>
            <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">
              {algo.sdk} · {algo.category} · v{algo.version} · {algo.authorId}
              {algo.publishedAt && ` · 게시: ${algo.publishedAt.slice(0, 10)}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={algo.status === 'published'}
                onCheckedChange={() => { toggleActive(algo.id); toast.success(algo.status === 'published' ? '비활성화되었습니다.' : '활성화되었습니다.') }}
              />
              <span className={cn('text-[12px]', algo.status === 'published' ? 'text-[#22c55e]' : 'text-[var(--muted-foreground)]')}>
                {algo.status === 'published' ? '활성' : '비활성'}
              </span>
            </div>
            <button
              onClick={() => { setRecommended(algo.id, !algo.isRecommended); toast.success(algo.isRecommended ? '추천 해제되었습니다.' : '추천 지정되었습니다.') }}
              className="flex items-center gap-1 text-[12px]"
            >
              <Star size={16} className={cn(algo.isRecommended ? 'fill-amber-400 text-amber-400' : 'text-[var(--muted-foreground)]')} />
              {algo.isRecommended ? '추천 중' : '추천 지정'}
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="versions">버전 이력</TabsTrigger>
          <TabsTrigger value="stats">통계</TabsTrigger>
          <TabsTrigger value="reviews">후기</TabsTrigger>
        </TabsList>

        {/* 기본 정보 */}
        <TabsContent value="info">
          <div className="py-4 space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3 text-[13px]">
              <p className="leading-relaxed text-[var(--muted-foreground)]">{algo.description}</p>
              <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">SDK</span><span>{algo.sdk}</span>
                <span className="text-[var(--muted-foreground)]">카테고리</span><span>{algo.category}</span>
                <span className="text-[var(--muted-foreground)]">태그</span>
                <div className="flex flex-wrap gap-1">
                  {algo.tags.map((t) => <span key={t} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px]">{t}</span>)}
                </div>
                <span className="text-[var(--muted-foreground)]">등록일</span><span>{algo.createdAt.slice(0, 10)}</span>
              </div>
            </div>

            {/* 자동 검증 */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="mb-3 text-[13px] font-semibold">자동 검증 결과</p>
              <div className="flex flex-wrap gap-3 text-[13px]">
                {(['sdk', 'description', 'category', 'executionType'] as const).map((key) => (
                  <span key={key}>{CHECK_ICON[algo.autoCheckResult[key]]} {key}</span>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-[var(--muted-foreground)]">
                전체: {CHECK_ICON[algo.autoCheckResult.overall]} · 검증일: {algo.autoCheckResult.checkedAt.slice(0, 10)}
              </p>
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
                  <button className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"><GitCompare size={11} /> 비교</button>
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
          <div className="py-4 space-y-3">
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
                  onClick={() => toast.success('후기가 삭제되었습니다.')}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-[var(--destructive)]/40 bg-[var(--card)] px-2.5 py-1 text-[12px] text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
                >
                  <Trash2 size={11} /> 삭제
                </button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 롤백 확인 Dialog */}
      <ConfirmDialog
        open={!!rollbackTarget}
        onOpenChange={(v) => !v && setRollbackTarget(null)}
        title={`v${rollbackTarget}으로 롤백하시겠습니까?`}
        description="현재 게시 버전이 변경됩니다."
        confirmLabel="롤백"
        variant="destructive"
        onConfirm={() => { toast.success(`v${rollbackTarget}으로 롤백되었습니다.`); setRollbackTarget(null) }}
      />
    </div>
  )
}
