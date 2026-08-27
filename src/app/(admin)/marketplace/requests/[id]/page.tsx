'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, FileCode, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { MOCK_NOTEBOOKS } from '@/mocks/algorithms'
import { MOCK_USERS } from '@/mocks/users'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import type { AlgorithmStatus } from '@/types/common'
import type { Algorithm } from '@/types/algorithm'

interface Props { params: Promise<{ id: string }> }

function AlgoSummary({ algo, overall, checkIcon, checkLabel }: {
  algo: Algorithm
  overall: 'pass' | 'warn' | 'fail'
  checkIcon: Record<'pass' | 'warn' | 'fail', string>
  checkLabel: Record<'pass' | 'warn' | 'fail', string>
}) {
  return (
    <div className="mb-5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-3 text-[13px]">
      <div className="grid grid-cols-[72px_1fr] gap-y-2">
        <span className="text-[var(--muted-foreground)]">알고리즘명</span>
        <span className="font-medium truncate">{algo.title}</span>
        <span className="text-[var(--muted-foreground)]">상태</span>
        <span><StatusBadge status={algo.status as AlgorithmStatus} /></span>
        <span className="text-[var(--muted-foreground)]">SDK</span>
        <span>{algo.sdk}</span>
        <span className="text-[var(--muted-foreground)]">자동검증</span>
        <span className={overall === 'pass' ? 'text-[#22c55e]' : overall === 'warn' ? 'text-amber-500' : 'text-[var(--destructive)]'}>
          {checkIcon[overall]} {checkLabel[overall]}
        </span>
      </div>
    </div>
  )
}

const CHECK_ICON: Record<'pass' | 'warn' | 'fail', string> = { pass: '✅', warn: '⚠️', fail: '❌' }
const CHECK_LABEL: Record<'pass' | 'warn' | 'fail', string> = { pass: '통과', warn: '경고', fail: '실패' }
const CHECK_ITEMS = [
  { key: 'description' as const, label: '설명' },
  { key: 'sdk' as const, label: 'SDK' },
  { key: 'category' as const, label: '카테고리' },
  { key: 'executionType' as const, label: '실행 유형' },
]

const SDK_OPTIONS: Algorithm['sdk'][] = ['Qiskit', 'Pennylane', 'CUDA-Q', 'Cirq']
const EXECUTION_OPTIONS: Algorithm['executionType'][] = ['simulator', 'hardware', 'hybrid']

export default function RequestDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { algorithms, categories, approveAlgorithm, rejectAlgorithm, updateAlgorithmMeta } = useMarketplaceStore()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  const algo = algorithms.find((a) => a.id === id)

  // 편집 폼 상태
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editSdk, setEditSdk] = useState<Algorithm['sdk']>('Qiskit')
  const [editCategory, setEditCategory] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editExecType, setEditExecType] = useState<Algorithm['executionType']>('simulator')

  const authorName = algo ? (MOCK_USERS.find((u) => u.id === algo.authorId)?.name ?? algo.authorId) : ''

  if (!algo) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-[15px] font-semibold">요청을 찾을 수 없습니다</p>
        <Link href="/marketplace/requests" className="mt-4 text-[13px] text-[var(--primary)] hover:underline">목록으로</Link>
      </div>
    )
  }

  function openEdit() {
    setEditTitle(algo!.title)
    setEditDesc(algo!.description)
    setEditSdk(algo!.sdk)
    setEditCategory(algo!.category)
    setEditTags(algo!.tags.join(', '))
    setEditExecType(algo!.executionType)
    setEditOpen(true)
  }

  function handleEditSave() {
    updateAlgorithmMeta(algo!.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      sdk: editSdk,
      category: editCategory,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      executionType: editExecType,
    })
    toast.success('메타데이터가 수정되었습니다.')
    setEditOpen(false)
  }

  function handleApprove() {
    approveAlgorithm(algo!.id)
    toast.success('승인이 완료되었습니다.')
    router.push('/marketplace/requests')
  }

  function handleReject() {
    if (!rejectReason.trim()) return
    rejectAlgorithm(algo!.id, rejectReason)
    toast.success('반려 처리되었습니다.')
    setRejectOpen(false)
    router.push('/marketplace/requests')
  }

  const overall = algo.autoCheckResult.overall

  return (
    <div className="p-6 max-w-3xl">
      {/* 뒤로가기 + 브레드크럼 */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronLeft size={13} /> 뒤로
        </button>
        <nav className="flex items-center gap-1 text-[12px] text-[var(--muted-foreground)]">
          <Link href="/marketplace/requests" className="hover:text-[var(--foreground)] transition-colors">등록 요청 큐</Link>
          <ChevronRight size={12} />
          <span className="truncate max-w-[240px]">{algo.title}</span>
        </nav>
      </div>

      {/* 헤더 — 타이틀 + 상태 배지 + 승인/반려 */}
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-[18px] font-semibold">{algo.title}</h1>
        <StatusBadge status={algo.status as AlgorithmStatus} />
        {algo.status === 'pending' && (
          <div className="ml-auto flex shrink-0 gap-2">
            <button
              onClick={() => setApproveOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#22c55e] px-4 py-1.5 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Check size={14} /> 승인
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--destructive)] px-4 py-1.5 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
            >
              <X size={14} /> 반려
            </button>
          </div>
        )}
      </div>
      <div className="-mt-4 mb-5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted-foreground)]">
        <span>요청자: <strong className="text-[var(--foreground)]">{authorName}</strong></span>
        <span>·</span>
        <span>요청일: <strong className="text-[var(--foreground)]">{algo.createdAt.slice(0, 10)}</strong></span>
      </div>

      {/* 반려 사유 배너 (rejected 상태 이력 확인용) */}
      {algo.status === 'rejected' && algo.rejectReason && (
        <div className="mb-5 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 px-4 py-3">
          <p className="mb-0.5 text-[12px] font-semibold text-[var(--destructive)]">반려 사유</p>
          <p className="text-[13px] text-[var(--foreground)]">{algo.rejectReason}</p>
          {algo.rejectedAt && (
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{algo.rejectedAt.slice(0, 10)}</p>
          )}
        </div>
      )}

      {/* 자동 검증 결과 — 컴팩트 레이아웃 */}
      <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4">
        {/* 헤더: 타이틀(좌) + overall·검증일(우) */}
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold">자동 검증 결과</p>
          <span className={`ml-auto text-[13px] font-medium ${overall === 'pass' ? 'text-[#22c55e]' : overall === 'warn' ? 'text-amber-500' : 'text-[var(--destructive)]'}`}>
            {CHECK_ICON[overall]} {CHECK_ITEMS.filter(({ key }) => algo.autoCheckResult[key] === 'pass').length}/{CHECK_ITEMS.length} {CHECK_LABEL[overall]}
          </span>
        </div>
        {/* 4카드 */}
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
        {/* 구분선 + 이슈 or 이상 항목 없음 */}
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
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold">정보</p>
          <button
            onClick={openEdit}
            className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
          >
            <Pencil size={11} /> 편집
          </button>
        </div>
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

        {/* 입력 파라미터 */}
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

        {/* 출력 파라미터 */}
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

        {/* 실행 예시 코드 */}
        <div>
          <p className="mb-1.5 text-[12px] font-medium text-[var(--muted-foreground)]">실행 예시 코드</p>
          {algo.exampleCode ? (
            <pre className="max-h-48 overflow-auto rounded-md bg-[var(--muted)] px-4 py-3 text-[12px] leading-relaxed">
              <code>{algo.exampleCode}</code>
            </pre>
          ) : (
            <p className="text-[12px] text-[var(--muted-foreground)]">실행 예시 코드 없음</p>
          )}
        </div>
      </div>

      {/* 승인 Sheet */}
      <Sheet open={approveOpen} onOpenChange={setApproveOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>승인 처리</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <AlgoSummary algo={algo} overall={overall} checkIcon={CHECK_ICON} checkLabel={CHECK_LABEL} />
            <p className="text-[13px] text-[var(--muted-foreground)]">이 알고리즘을 마켓플레이스에 게시합니다. 게시 후 모든 사용자에게 즉시 노출됩니다.</p>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button onClick={handleApprove} className="rounded-md bg-[#22c55e] px-4 py-2 text-[13px] text-white hover:opacity-90 transition-opacity">
              승인 처리
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 반려 Sheet */}
      <Sheet open={rejectOpen} onOpenChange={setRejectOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>반려 처리</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <AlgoSummary algo={algo} overall={overall} checkIcon={CHECK_ICON} checkLabel={CHECK_LABEL} />
            <label className="mb-1.5 block text-[12px] font-medium">반려 사유 <span className="text-[var(--destructive)]">*</span></label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={5}
              placeholder="등록자에게 전달할 반려 사유를 입력하세요..."
              className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
            />
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="rounded-md bg-[var(--destructive)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              반려 처리
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 메타데이터 편집 Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>메타데이터 편집</SheetTitle>
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium">알고리즘명 <span className="text-[var(--destructive)]">*</span></label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium">설명</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium">SDK <span className="text-[var(--destructive)]">*</span></label>
              <select
                value={editSdk}
                onChange={(e) => setEditSdk(e.target.value as Algorithm['sdk'])}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              >
                {SDK_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium">카테고리</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              >
                <option value="">선택 안 함</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium">태그 <span className="text-[11px] font-normal text-[var(--muted-foreground)]">(쉼표로 구분)</span></label>
              <input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="grover, search, optimization"
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium">실행 유형 <span className="text-[var(--destructive)]">*</span></label>
              <select
                value={editExecType}
                onChange={(e) => setEditExecType(e.target.value as Algorithm['executionType'])}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              >
                {EXECUTION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleEditSave}
              disabled={!editTitle.trim()}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              저장
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
