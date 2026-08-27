'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, Play, Star, FileCode } from 'lucide-react'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { MOCK_USERS } from '@/mocks/users'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { RegisterDrawer } from '../RegisterDrawer'
import { MOCK_NOTEBOOKS } from '@/mocks/algorithms'

interface Props { params: Promise<{ id: string }> }

const CHECK_ICON: Record<'pass' | 'warn' | 'fail', string> = { pass: '✅', warn: '⚠️', fail: '❌' }
const CHECK_LABEL: Record<'pass' | 'warn' | 'fail', string> = { pass: '통과', warn: '경고', fail: '실패' }
const CHECK_ITEMS = [
  { key: 'description' as const, label: '설명' },
  { key: 'sdk' as const, label: 'SDK' },
  { key: 'category' as const, label: '카테고리' },
  { key: 'executionType' as const, label: '실행 유형' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-[var(--muted)] text-[var(--muted)]'} />
      ))}
    </span>
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
              <tr><th>이름</th><th>타입</th><th>필수</th><th>설명</th><th>기본값</th></tr>
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

export default function MyAlgorithmDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { algorithms, toggleActive, deprecateVersion, withdrawAlgorithm } = useMarketplaceStore()
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false)

  const algo = algorithms.find((a) => a.id === id)

  if (!algo) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-[15px] font-semibold">알고리즘을 찾을 수 없습니다</p>
        <Link href="/marketplace/my" className="mt-4 text-[13px] text-[var(--primary)] hover:underline">목록으로</Link>
      </div>
    )
  }

  const isPrePublished = ['draft', 'pending', 'rejected'].includes(algo.status)
  const authorName = MOCK_USERS.find((u) => u.id === algo.authorId)?.name ?? algo.authorId
  const overall = algo.autoCheckResult.overall

  function handleToggleActive() {
    if (!algo) return
    toggleActive(algo.id)
    toast.success(algo.status === 'published' ? '알고리즘이 비활성화되었습니다.' : '알고리즘이 활성화되었습니다.')
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
          <Link href="/marketplace/my" className="hover:text-[var(--foreground)] transition-colors">내 양자 알고리즘</Link>
          <ChevronRight size={12} />
          <span className="truncate max-w-[240px]">{algo.title}</span>
        </nav>
      </div>

      {/* Hero 섹션 — 게시 전: 인라인(어드민 등록 요청 상세 동일) / 게시 후: 카드 */}
      {isPrePublished ? (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-[18px] font-semibold">{algo.title}</h1>
            <StatusBadge status={algo.status} />
            <div className="ml-auto flex shrink-0 gap-2">
              {algo.status === 'draft' && (
                <button
                  onClick={() => setVersionDrawerOpen(true)}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
                >
                  이어서 편집
                </button>
              )}
              {algo.status === 'rejected' && (
                <button
                  onClick={() => setVersionDrawerOpen(true)}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
                >
                  수정 후 재요청
                </button>
              )}
              {algo.status === 'pending' && (
                <button
                  onClick={() => { withdrawAlgorithm(algo!.id); toast.success('요청이 취소되었습니다.') }}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
                >
                  요청 취소
                </button>
              )}
            </div>
          </div>
          {['pending', 'rejected'].includes(algo.status) && (
            <div className="-mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted-foreground)]">
              <span>요청자: <strong className="text-[var(--foreground)]">{authorName}</strong></span>
              <span>·</span>
              <span>요청일: <strong className="text-[var(--foreground)]">{algo.createdAt.slice(0, 10)}</strong></span>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-semibold">{algo.title}</h1>
                <StatusBadge status={algo.status} />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted-foreground)]">
                <span>버전: <strong className="text-[var(--foreground)]">v{algo.version}</strong></span>
                <span>·</span>
                <span>SDK: <strong className="text-[var(--foreground)]">{algo.sdk}</strong></span>
                <span>·</span>
                <span>카테고리: <strong className="text-[var(--foreground)]">{algo.category || '—'}</strong></span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {algo.status === 'published' && (
                <>
                  <button onClick={() => setVersionDrawerOpen(true)} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity">새 버전 추가</button>
                  <button onClick={handleToggleActive} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--border)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">비활성화</button>
                </>
              )}
              {algo.status === 'inactive' && (
                <>
                  <button onClick={() => setVersionDrawerOpen(true)} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--border)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">새 버전 추가</button>
                  <button onClick={handleToggleActive} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity">활성화</button>
                </>
              )}
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
      )}

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

      {/* 게시 전: 카드 레이아웃 */}
      {isPrePublished && (
        <>
          {/* 자동 검증 결과 */}
          <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold">자동 검증 결과</p>
              <span className={`ml-auto text-[13px] font-medium ${overall === 'pass' ? 'text-[#22c55e]' : overall === 'warn' ? 'text-amber-500' : 'text-[var(--destructive)]'}`}>
                {CHECK_ICON[overall]} {CHECK_ITEMS.filter(({ key }) => algo.autoCheckResult[key] === 'pass').length}/{CHECK_ITEMS.length} {CHECK_LABEL[overall]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {CHECK_ITEMS.map(({ key, label }) => {
                const r = algo.autoCheckResult[key]
                return (
                  <div key={key} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${r === 'pass' ? 'border-[var(--border)] bg-[var(--muted)]/50' : r === 'warn' ? 'border-amber-500/30 bg-amber-500/10' : 'border-[var(--destructive)]/30 bg-[var(--destructive)]/10'}`}>
                    <span className="text-[11px] text-[var(--muted-foreground)]">{label}</span>
                    <span className="text-[14px]">{CHECK_ICON[r]}</span>
                  </div>
                )
              })}
            </div>
            <div className="my-3 border-t border-[var(--border)]" />
            {overall === 'pass' ? (
              <p className="text-[12px] text-[var(--muted-foreground)]">이상 항목 없음</p>
            ) : (
              <div className="space-y-1.5">
                {CHECK_ITEMS.filter(({ key }) => algo.autoCheckResult[key] !== 'pass').map(({ key, label }) => {
                  const r = algo.autoCheckResult[key]
                  const msg = r === 'warn' && key === 'description' ? '20자 미만 — 보완 권장' : `${label} 미설정`
                  return (
                    <div key={key} className={`flex items-start gap-2 text-[12px] ${r === 'warn' ? 'text-amber-500' : 'text-[var(--destructive)]'}`}>
                      <span className="shrink-0">{CHECK_ICON[r]}</span>
                      <span><span className="font-medium">{label}</span> — {msg}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
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
            </div>
          </div>

          {/* 코드 */}
          <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="mb-3 text-[13px] font-semibold">코드</p>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[12px] font-medium text-[var(--muted-foreground)]">코드 첨부</p>
              <div className="flex items-center gap-2 min-w-0">
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
              <pre className="max-h-60 overflow-auto rounded-md bg-[var(--muted)] px-4 py-3 text-[12px] leading-relaxed">
                <code>{algo.algorithmCode}</code>
              </pre>
            ) : (
              <p className="text-[12px] text-[var(--muted-foreground)]">코드 없음</p>
            )}
          </div>

          {/* 실행 방법 */}
          <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-5">
            <p className="text-[13px] font-semibold">실행 방법</p>
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--muted-foreground)]">입력 파라미터 {algo.inputParams.length}개</p>
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
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--muted-foreground)]">출력 파라미터 {algo.outputParams.length}개</p>
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
        </>
      )}

      {/* 게시 후: 탭 레이아웃 */}
      {!isPrePublished && (
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">개요</TabsTrigger>
            <TabsTrigger value="versions">버전 이력</TabsTrigger>
            <TabsTrigger value="reviews">평가</TabsTrigger>
          </TabsList>

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
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[13px] font-semibold">v{v.version}</span>
                          {i === 0 && (
                            <span className="rounded-full bg-[var(--primary-10)] px-2 py-0.5 text-[10px] text-[var(--primary)]">최신</span>
                          )}
                          {v.deprecated && (
                            <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] text-[var(--muted-foreground)]">비활성화됨</span>
                          )}
                          <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">{v.publishedAt.slice(0, 10)}</span>
                          {i !== 0 && !v.deprecated && (
                            <button
                              onClick={() => {
                                deprecateVersion(algo.id, v.version)
                                toast.success(`v${v.version}이 비활성화되었습니다.`)
                              }}
                              className="rounded border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
                            >
                              비활성화
                            </button>
                          )}
                        </div>
                        <p className="text-[12px] text-[var(--muted-foreground)]">{v.changelog}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="py-4 space-y-5">
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
      )}

      <RegisterDrawer
        open={versionDrawerOpen}
        onOpenChange={setVersionDrawerOpen}
        mode="version"
        algorithmId={algo.id}
        algorithmTitle={algo.title}
        currentVersion={algo.version}
      />
    </div>
  )
}
