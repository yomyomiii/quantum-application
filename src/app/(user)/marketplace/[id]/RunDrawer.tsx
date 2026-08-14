'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import { usePersonaStore } from '@/store/persona.store'
import type { Algorithm } from '@/types/algorithm'

interface Props {
  algorithm: Algorithm
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RunDrawer({ algorithm, open, onOpenChange }: Props) {
  const router = useRouter()
  const { submitJob, validateJobParams } = useMarketplaceStore()
  const { workspaces } = useWorkspaceStore()
  const { currentUserId, currentWorkspaceId } = usePersonaStore()

  const [params, setParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      algorithm.inputParams.map((p) => [p.name, p.defaultValue != null ? String(p.defaultValue) : ''])
    )
  )
  const [submitting, setSubmitting] = useState(false)

  const ws = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0]
  const parsedParams = Object.fromEntries(
    algorithm.inputParams.map((p) => {
      const raw = params[p.name] ?? ''
      if (p.type === 'number') return [p.name, Number(raw)]
      if (p.type === 'boolean') return [p.name, raw === 'true']
      return [p.name, raw]
    })
  )
  const validation = validateJobParams(algorithm.id, parsedParams)

  function handleRun() {
    if (!validation.passed) return
    setSubmitting(true)
    const userName = currentUserId
    const job = submitJob(algorithm.id, parsedParams, ws?.id ?? 'ws_1', currentUserId, userName)
    setSubmitting(false)
    onOpenChange(false)
    toast.success('양자 작업이 생성되었습니다.')
    router.push(`/jobs/${job.id}`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} direction="right">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>노트북에서 실행</SheetTitle>
          <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">{algorithm.title} v{algorithm.version}</p>
        </SheetHeader>

        <SheetBody className="space-y-5">
          {/* 프로젝트 정보 */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3">
            <p className="text-[11px] text-[var(--muted-foreground)]">실행 프로젝트</p>
            <p className="mt-0.5 text-[13px] font-medium">{ws?.name ?? '-'}</p>
          </div>

          {/* 파라미터 입력 */}
          {algorithm.inputParams.length === 0 ? (
            <p className="text-[13px] text-[var(--muted-foreground)]">이 알고리즘은 입력 파라미터가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] font-semibold">입력 파라미터</p>
              {algorithm.inputParams.map((param) => (
                <div key={param.name}>
                  <label className="mb-1 flex items-center gap-1.5 text-[12px] font-medium">
                    {param.name}
                    {param.required && <span className="text-[var(--destructive)]">*</span>}
                    <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">{param.type}</span>
                  </label>
                  <p className="mb-1.5 text-[11px] text-[var(--muted-foreground)]">{param.description}</p>
                  {param.type === 'boolean' ? (
                    <select
                      value={params[param.name]}
                      onChange={(e) => setParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                      className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[13px] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={params[param.name]}
                      onChange={(e) => setParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                      className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 자동 검증 결과 */}
          {validation.errors.length > 0 && (
            <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-3 space-y-1">
              {validation.errors.map((e, i) => (
                <p key={i} className="text-[12px] text-[var(--destructive)]">• {e.field}: {e.message}</p>
              ))}
            </div>
          )}
          {validation.recommendations.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 space-y-1">
              <p className="text-[11px] font-semibold text-[var(--muted-foreground)]">권장 사항</p>
              {validation.recommendations.map((r, i) => (
                <p key={i} className="text-[12px]">• {r}</p>
              ))}
            </div>
          )}

          {/* X4 OFF 안내 */}
          <p className="text-[11px] text-[var(--muted-foreground)]">
            실행 후 작업 목록에서 상태를 직접 확인하세요. 자동 상태 전이는 비활성화되어 있습니다.
          </p>
        </SheetBody>

        <SheetFooter>
          <SheetClose asChild>
            <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">
              취소
            </button>
          </SheetClose>
          <button
            onClick={handleRun}
            disabled={!validation.passed || submitting}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? '실행 중...' : '실행'}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
