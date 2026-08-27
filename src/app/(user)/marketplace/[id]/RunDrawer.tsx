'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { useMarketplaceStore } from '@/store/marketplace.store'
import type { Algorithm } from '@/types/algorithm'

interface Props {
  algorithm: Algorithm
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RunDrawer({ algorithm, open, onOpenChange }: Props) {
  const { validateJobParams } = useMarketplaceStore()

  const [params, setParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      algorithm.inputParams.map((p) => [p.name, p.defaultValue != null ? String(p.defaultValue) : ''])
    )
  )
  const [opening, setOpening] = useState(false)

  const parsedParams = Object.fromEntries(
    algorithm.inputParams.map((p) => {
      const raw = params[p.name] ?? ''
      if (p.type === 'number') return [p.name, Number(raw)]
      if (p.type === 'boolean') return [p.name, raw === 'true']
      return [p.name, raw]
    })
  )
  const validation = validateJobParams(algorithm.id, parsedParams)
  const errorFields = new Set(validation.errors.map((e) => e.field))

  function applyRecommendation(rec: string) {
    const match = rec.match(/(\w+)\s*[=:]\s*(\S+)/)
    if (match) setParams((prev) => ({ ...prev, [match[1]]: match[2] }))
  }

  function handleOpen() {
    setOpening(true)
    onOpenChange(false)
    toast.info('노트북 연동 기능은 준비 중입니다.')
    setOpening(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} direction="right">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>노트북에서 열기</SheetTitle>
          <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">
            {algorithm.title} · v{algorithm.version}
          </p>
        </SheetHeader>

        <SheetBody className="space-y-4">

          {/* 알고리즘 요약 */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-[12px] space-y-1">
            <div className="flex gap-4">
              <span className="text-[var(--muted-foreground)]">SDK</span>
              <span className="font-medium">{algorithm.sdk}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-[var(--muted-foreground)]">카테고리</span>
              <span className="font-medium">{algorithm.category || '—'}</span>
            </div>
          </div>

          {/* 실행 환경 + 파라미터 설정 — 같은 뎁스 */}
          <div className="space-y-4">

            {/* 실행 환경 */}
            <div className="space-y-3">
              <p className="text-[13px] font-semibold">실행 환경</p>
              <div>
                <label className="mb-1 block text-[12px] font-medium">노트북</label>
                <select
                  disabled
                  className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[13px] text-[var(--muted-foreground)] outline-none opacity-50 cursor-not-allowed"
                >
                  <option>노트북을 선택하세요</option>
                </select>
                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">노트북 연동 기능은 준비 중입니다.</p>
              </div>
            </div>

            {/* 파라미터 입력 */}
            {algorithm.inputParams.length === 0 ? (
              <p className="text-[13px] text-[var(--muted-foreground)]">이 알고리즘은 입력 파라미터가 없습니다.</p>
            ) : (
              <>
                <div>
                  <p className="text-[13px] font-semibold">파라미터 설정</p>
                  <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">입력한 값은 노트북 실행 시 전달됩니다.</p>
                </div>
                {algorithm.inputParams.map((param) => {
                  const hasError = errorFields.has(param.name)
                  return (
                    <div key={param.name}>
                      <label className="mb-1 flex items-center gap-1.5 text-[12px] font-medium">
                        {param.name}
                        {param.required && <span className="text-[var(--destructive)]">*</span>}
                        <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">{param.type}</span>
                      </label>
                      {param.type === 'boolean' ? (
                        <select
                          value={params[param.name]}
                          onChange={(e) => setParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                          className={`h-9 w-full rounded-md border bg-[var(--card)] px-2 text-[13px] outline-none focus:border-[var(--primary)] ${hasError ? 'border-[var(--destructive)]' : 'border-[var(--border)]'}`}
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={params[param.name]}
                          onChange={(e) => setParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                          className={`h-9 w-full rounded-md border bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)] ${hasError ? 'border-[var(--destructive)]' : 'border-[var(--border)]'}`}
                        />
                      )}
                      {hasError && (
                        <p className="mt-0.5 text-[11px] text-[var(--destructive)]">
                          {validation.errors.find((e) => e.field === param.name)?.message}
                        </p>
                      )}
                      {param.description && !hasError && (
                        <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{param.description}</p>
                      )}
                    </div>
                  )
                })}
              </>
            )}

          </div>

          {/* 권고사항 */}
          {validation.recommendations.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 space-y-1.5">
              <p className="text-[11px] font-semibold text-[var(--muted-foreground)]">💡 최적화 권고</p>
              {validation.recommendations.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <p className="text-[12px]">• {r}</p>
                  <button
                    onClick={() => applyRecommendation(r)}
                    className="shrink-0 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[11px] hover:bg-[var(--accent)] transition-colors"
                  >
                    적용
                  </button>
                </div>
              ))}
            </div>
          )}

        </SheetBody>

        <SheetFooter>
          <SheetClose asChild>
            <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">
              취소
            </button>
          </SheetClose>
          <button
            onClick={handleOpen}
            disabled={opening}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {opening ? '여는 중...' : '노트북에서 열기'}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
