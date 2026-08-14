'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/ui/dialog-confirm'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import type { AlgorithmStatus } from '@/types/common'

interface Props { params: Promise<{ id: string }> }

const CHECK_ICON: Record<'pass' | 'warn' | 'fail', string> = { pass: '✅', warn: '⚠️', fail: '❌' }
const CHECK_LABEL: Record<'pass' | 'warn' | 'fail', string> = { pass: '통과', warn: '경고', fail: '실패' }
const CHECK_ITEMS = [
  { key: 'sdk' as const, label: 'SDK' },
  { key: 'description' as const, label: '설명' },
  { key: 'category' as const, label: '카테고리' },
  { key: 'executionType' as const, label: '실행 유형' },
]

export default function RequestDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { algorithms, approveAlgorithm, rejectAlgorithm } = useMarketplaceStore()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const algo = algorithms.find((a) => a.id === id)

  if (!algo) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-[15px] font-semibold">요청을 찾을 수 없습니다</p>
        <Link href="/marketplace/requests" className="mt-4 text-[13px] text-[var(--primary)] hover:underline">목록으로</Link>
      </div>
    )
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

      {/* 헤더 */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[18px] font-semibold">{algo.title}</h1>
          <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">v{algo.version} · {algo.sdk} · {algo.authorId}</p>
        </div>
        <StatusBadge status={algo.status as AlgorithmStatus} />
      </div>

      {/* 자동 검증 결과 */}
      <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="mb-3 text-[13px] font-semibold">자동 검증 결과</p>
        <div className="grid grid-cols-2 gap-3">
          {CHECK_ITEMS.map(({ key, label }) => {
            const result = algo.autoCheckResult[key]
            return (
              <div key={key} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[13px] ${result === 'pass' ? 'border-[#22c55e]/30 bg-[#22c55e]/5' : result === 'warn' ? 'border-amber-300/30 bg-amber-50/30 dark:bg-amber-900/10' : 'border-[var(--destructive)]/30 bg-[var(--destructive)]/5'}`}>
                <span className="text-[var(--muted-foreground)]">{label}</span>
                <span>{CHECK_ICON[result]} {CHECK_LABEL[result]}</span>
              </div>
            )
          })}
        </div>
        <div className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium ${overall === 'pass' ? 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]' : overall === 'warn' ? 'border-amber-300/30 bg-amber-50/30 text-amber-600' : 'border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-[var(--destructive)]'}`}>
          {CHECK_ICON[overall]} 전체 결과: {CHECK_LABEL[overall]}
          <span className="ml-auto text-[11px] font-normal text-[var(--muted-foreground)]">검증일: {algo.autoCheckResult.checkedAt.slice(0, 10)}</span>
        </div>
      </div>

      {/* 메타데이터 검토 */}
      <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="mb-3 text-[13px] font-semibold">메타데이터 검토</p>
        <div className="grid grid-cols-[120px_1fr] gap-y-3 text-[13px]">
          <span className="text-[var(--muted-foreground)]">알고리즘명</span><span className="font-medium">{algo.title}</span>
          <span className="text-[var(--muted-foreground)]">설명</span><span className="leading-relaxed">{algo.description}</span>
          <span className="text-[var(--muted-foreground)]">SDK</span><span>{algo.sdk}</span>
          <span className="text-[var(--muted-foreground)]">카테고리</span><span>{algo.category}</span>
          <span className="text-[var(--muted-foreground)]">태그</span>
          <div className="flex flex-wrap gap-1">
            {algo.tags.map((t) => (
              <span key={t} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px]">{t}</span>
            ))}
          </div>
          <span className="text-[var(--muted-foreground)]">입력 파라미터</span><span>{algo.inputParams.length}개</span>
          <span className="text-[var(--muted-foreground)]">제출일</span><span>{algo.createdAt.slice(0, 10)}</span>
        </div>
      </div>

      {/* 액션 버튼 */}
      {algo.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => setApproveOpen(true)}
            className="flex-1 rounded-lg bg-[#22c55e] py-2.5 text-[14px] font-medium text-white hover:opacity-90 transition-opacity"
          >
            승인
          </button>
          <button
            onClick={() => setRejectOpen(true)}
            className="flex-1 rounded-lg bg-[var(--destructive)] py-2.5 text-[14px] font-medium text-white hover:opacity-90 transition-opacity"
          >
            반려
          </button>
        </div>
      )}

      {/* 승인 확인 Dialog */}
      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="알고리즘을 승인하시겠습니까?"
        description="승인하면 마켓플레이스에 즉시 게시됩니다."
        confirmLabel="승인"
        onConfirm={handleApprove}
      />

      {/* 반려 사유 Sheet */}
      <Sheet open={rejectOpen} onOpenChange={setRejectOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>반려 사유 입력</SheetTitle>
            <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">{algo.title}</p>
          </SheetHeader>
          <SheetBody>
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
    </div>
  )
}
