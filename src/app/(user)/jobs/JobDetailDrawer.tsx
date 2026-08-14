'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from '@/components/ui/sheet'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Job } from '@/types/job'
import type { JobStatus } from '@/types/common'

interface Props {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const JOB_STEPS: JobStatus[] = ['initiated', 'estimate', 'submitted', 'running', 'done']
const STEP_LABELS: Record<string, string> = {
  initiated: 'Initiated', estimate: 'Estimate', submitted: 'Submitted', running: 'Running', done: 'Done',
}

function stepIndex(status: JobStatus): number {
  if (status === 'failed' || status === 'cancelled') return -1
  return JOB_STEPS.indexOf(status)
}

function formatTs(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).replace(/\. /g, '-').replace('.', '') + '.' + String(new Date(iso).getMilliseconds()).padStart(3, '0')
}

function formatShort(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).replace(/\. /g, '-').replace('.', '')
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-[var(--muted-foreground)] text-[13px]">{label}</span>
      <span className="text-[13px]">{children}</span>
    </>
  )
}

export function JobDetailDrawer({ job, open, onOpenChange }: Props) {
  const [circuitExpanded, setCircuitExpanded] = useState(false)

  if (!job) return null

  const currentStep = stepIndex(job.status as JobStatus)
  const isFailed = job.status === 'failed' || job.status === 'cancelled'

  const chartData = job.result?.probDistribution
    ? Object.entries(job.result.probDistribution)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([state, prob]) => ({ state, pct: parseFloat((prob * 100).toFixed(1)) }))
    : []

  const circuitLines = job.circuit.split('\n')
  const PREVIEW_LINES = 5
  const showToggle = circuitLines.length > PREVIEW_LINES
  const visibleCircuit = circuitExpanded || !showToggle ? job.circuit : circuitLines.slice(0, PREVIEW_LINES).join('\n')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[620px]">
        <SheetHeader>
          <SheetTitle>양자 작업 상세</SheetTitle>
          <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)] font-mono">{job.id}</p>
        </SheetHeader>
        <SheetBody>
          {/* 상태 스텝퍼 */}
          <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-4">
            <div className="flex items-center gap-0">
              {JOB_STEPS.map((step, i) => {
                const done = !isFailed && currentStep > i
                const active = !isFailed && currentStep === i
                const failed = isFailed && i === Math.max(currentStep, 0)
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={[
                          'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                          done   ? 'bg-[var(--primary)] text-white' : '',
                          active ? 'border-2 border-[var(--primary)] text-[var(--primary)]' : '',
                          failed ? 'border-2 border-[var(--destructive)] text-[var(--destructive)]' : '',
                          !done && !active && !failed ? 'border border-[var(--border)] text-[var(--muted-foreground)]' : '',
                        ].join(' ')}
                      >
                        {done ? <Check size={12} /> : i + 1}
                      </div>
                      <span
                        className={[
                          'whitespace-nowrap text-[11px] font-medium',
                          done || active ? 'text-[var(--primary)]' : '',
                          failed ? 'text-[var(--destructive)]' : '',
                          !done && !active && !failed ? 'text-[var(--muted-foreground)]' : '',
                        ].join(' ')}
                      >
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                    {i < JOB_STEPS.length - 1 && (
                      <div className={`mb-5 h-px flex-1 mx-1 ${done ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 작업 정보 */}
          <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="mb-4 text-[13px] font-semibold">작업 정보</p>
            <div className="grid grid-cols-[140px_1fr] gap-y-2.5">
              <InfoRow label="작업 ID">
                <span className="text-[12px] break-all">{job.id}</span>
              </InfoRow>
              <InfoRow label="상태">
                <StatusBadge status={job.status as JobStatus} />
              </InfoRow>
              <InfoRow label="제공자">{job.provider}</InfoRow>
              <InfoRow label="장비 이름">{job.deviceName}</InfoRow>
              <InfoRow label="사용자">{job.userEmail}</InfoRow>
              <InfoRow label="사용 크레딧">
                {job.creditUsed > 0 ? `${job.creditUsed.toFixed(2)} C` : '-'}
              </InfoRow>
              <InfoRow label="생성 일시"><span className="text-[12px]">{formatTs(job.createdAt)}</span></InfoRow>
              <InfoRow label="제출 일시"><span className="text-[12px]">{formatTs(job.submittedAt)}</span></InfoRow>
              <InfoRow label="시작 일시"><span className="text-[12px]">{formatTs(job.startedAt)}</span></InfoRow>
              <InfoRow label="완료 일시"><span className="text-[12px]">{formatTs(job.completedAt)}</span></InfoRow>
            </div>
          </div>

          {/* 세부 정보 */}
          <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="mb-4 text-[13px] font-semibold">세부 정보</p>
            <div className="mb-5 grid grid-cols-2 gap-x-8 gap-y-2.5">
              <InfoRow label="진입점">{job.entrypoint}</InfoRow>
              <InfoRow label="큐비트">{job.resource.qubits}</InfoRow>
              <InfoRow label="샷">{job.resource.shots}</InfoRow>
              <InfoRow label="Error Mitigation">{job.errorMitigation}</InfoRow>
              <InfoRow label="1q Gate Count">{job.gateCount1q}</InfoRow>
              <InfoRow label="2q Gate Count">{job.gateCount2q}</InfoRow>
            </div>

            {/* 회로 */}
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-medium">회로</span>
                {showToggle && (
                  <button
                    onClick={() => setCircuitExpanded(!circuitExpanded)}
                    className="flex items-center gap-1 text-[12px] text-[var(--primary)] hover:underline"
                  >
                    {circuitExpanded ? <><ChevronUp size={13} /> 접기</> : <><ChevronDown size={13} /> 펼치기</>}
                  </button>
                )}
              </div>
              <div className="relative overflow-hidden rounded-lg bg-[var(--muted)] p-4">
                <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-[var(--foreground)] whitespace-pre">
                  {visibleCircuit}
                </pre>
                {!circuitExpanded && showToggle && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--muted)] to-transparent" />
                )}
              </div>
            </div>

            {/* 결과 */}
            {job.result && chartData.length > 0 && (
              <div>
                <p className="mb-3 text-[13px] font-medium">결과</p>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 20 }}>
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="state" tick={{ fontSize: 12, fontFamily: 'monospace' }} width={28} />
                      <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                      <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill="var(--primary)" opacity={0.8 + i * 0.05} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-[11px] text-[var(--muted-foreground)]">계산 기저 상태</p>
              </div>
            )}
          </div>

          {/* 산출 정보 */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="mb-4 text-[13px] font-semibold">산출 정보</p>
            {job.estimate ? (
              <div className="grid grid-cols-[140px_1fr] gap-y-2.5">
                <InfoRow label="산출 작업 ID">
                  <span className="text-[12px] break-all">{job.estimate.id}</span>
                </InfoRow>
                <InfoRow label="산출 상태">
                  <span className={[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    job.estimate.status === 'Active' ? 'bg-[rgb(240,253,244)] text-[rgb(34,197,94)]' : '',
                    job.estimate.status === 'Expired' ? 'bg-[rgb(242,242,242)] text-[rgb(119,119,119)]' : '',
                    job.estimate.status === 'Cancelled' ? 'bg-[rgb(254,242,242)] text-[rgb(239,68,68)]' : '',
                  ].join(' ')}>
                    {job.estimate.status}
                  </span>
                </InfoRow>
                <InfoRow label="요청 일시"><span className="text-[12px]">{formatShort(job.estimate.requestedAt)}</span></InfoRow>
                <InfoRow label="확정 일시"><span className="text-[12px]">{formatShort(job.estimate.confirmedAt)}</span></InfoRow>
                <InfoRow label="1q Gate Count">{job.estimate.gateCount1q}</InfoRow>
                <InfoRow label="2q Gate Count">{job.estimate.gateCount2q}</InfoRow>
                <InfoRow label="산출 크레딧">{job.estimate.credits.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} C</InfoRow>
                <InfoRow label="유효 기한"><span className="text-[12px]">{formatShort(job.estimate.expiresAt)}</span></InfoRow>
              </div>
            ) : (
              <p className="text-[13px] text-[var(--muted-foreground)]">산출 정보가 없습니다.</p>
            )}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
