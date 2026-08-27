'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Check, ChevronDown, ChevronUp, AlertTriangle, Download, MessageSquare, SmilePlus, CornerDownRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend, ReferenceArea, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from '@/components/ui/sheet'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { usePersonaStore } from '@/store/persona.store'
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
const COMP_COLORS = ['var(--primary)', '#f59e0b', '#10b981', '#6366f1', '#ec4899']

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

function SectionTab({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="mb-4 flex gap-1 border-b border-[var(--border)]">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={[
            'px-3 py-1.5 text-[12px] font-medium border-b-2 -mb-px transition-colors',
            active === t
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
          ].join(' ')}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

function downloadCsv(rows: Record<string, string | number>[], filename: string) {
  const header = Object.keys(rows[0]).join(',')
  const body = rows.map((r) => Object.values(r).join(',')).join('\n')
  const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// 모든 hooks를 포함하는 내부 컴포넌트 (job 항상 non-null)
const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '😮', '😢']

function DrawerContent({ job: jobProp }: { job: Job }) {
  const { jobs, addComment, addReply, toggleEmoji, toggleReplyEmoji } = useMarketplaceStore()
  const { currentUserId } = usePersonaStore()
  const job = jobs.find((j) => j.id === jobProp.id) ?? jobProp
  const [activeTab, setActiveTab] = useState<'개요' | '리소스' | '비교' | '코멘트'>('개요')
  const [circuitExpanded, setCircuitExpanded] = useState(false)
  const [timingsExpanded, setTimingsExpanded] = useState(false)
  const [resourceTab, setResourceTab] = useState('CPU')
  const [chartView, setChartView] = useState<'timeline' | 'histogram'>('timeline')
  const [compSortKey, setCompSortKey] = useState<'time' | 'accuracy' | 'cpu' | 'mem' | 'gpu' | 'vram' | null>(null)
  const [compSortDir, setCompSortDir] = useState<'asc' | 'desc'>('asc')
  const [compView, setCompView] = useState<'chart' | 'table'>('chart')
  const [selectedCompIds, setSelectedCompIds] = useState<string[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTarget, setReplyTarget] = useState<string | null>(null)   // 부모 commentId
  const [replyToUserId, setReplyToUserId] = useState<string | null>(null) // @멘션 대상 (대댓글→답글 시)
  const [replyContent, setReplyContent] = useState('')
  // emojiTarget: { commentId, replyId? } — replyId 없으면 댓글, 있으면 대댓글
  const [emojiTarget, setEmojiTarget] = useState<{ commentId: string; replyId?: string } | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!emojiTarget) return
    function handleClick(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setEmojiTarget(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [emojiTarget])

  const THRESHOLDS = { CPU: 80, GPU: 80, MEM: 10, VRAM: 8 }

  const currentStep = stepIndex(job.status as JobStatus)
  const isFailed = job.status === 'failed' || job.status === 'cancelled'

  const chartData = useMemo(() =>
    job.result?.measurementProbabilities
      ? Object.entries(job.result.measurementProbabilities)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([state, prob]) => ({ state, pct: parseFloat((prob * 100).toFixed(1)) }))
      : [],
    [job.result]
  )

  const circuitLines = job.circuit.split('\n')
  const PREVIEW_LINES = 5
  const showToggle = circuitLines.length > PREVIEW_LINES
  const visibleCircuit = circuitExpanded || !showToggle
    ? job.circuit
    : circuitLines.slice(0, PREVIEW_LINES).join('\n')

  const resourceSeries = useMemo(() => {
    const { timestamps, cpuPercent, memoryMB, gpuPercent, vramMB } = job.resource
    return timestamps.map((ts, i) => ({
      t: new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu: cpuPercent[i] ?? 0,
      mem: Math.round((memoryMB[i] ?? 0) / 100) / 10,
      gpu: gpuPercent[i] ?? 0,
      vram: Math.round((vramMB[i] ?? 0) / 100) / 10,
    }))
  }, [job.resource])

  const histogramData = useMemo(() => {
    const BUCKETS = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
    const bucket = (v: number) => Math.min(4, Math.floor(v / 20))
    const peakMem = job.resource.peakMemoryMB || 1
    const peakVram = job.resource.peakVramMB || 1
    const cpuCounts = [0, 0, 0, 0, 0]
    const memCounts = [0, 0, 0, 0, 0]
    const gpuCounts = [0, 0, 0, 0, 0]
    const vramCounts = [0, 0, 0, 0, 0]
    job.resource.cpuPercent.forEach((v) => { cpuCounts[bucket(v)]++ })
    job.resource.memoryMB.forEach((v) => { memCounts[bucket((v / peakMem) * 100)]++ })
    job.resource.gpuPercent.forEach((v) => { gpuCounts[bucket(v)]++ })
    job.resource.vramMB.forEach((v) => { vramCounts[bucket((v / peakVram) * 100)]++ })
    return BUCKETS.map((range, i) => ({ range, cpu: cpuCounts[i], mem: memCounts[i], gpu: gpuCounts[i], vram: vramCounts[i] }))
  }, [job.resource])

  const compCandidates = useMemo(() => {
    const base = jobs
      .filter((j) => j.algorithmId === job.algorithmId && j.id !== job.id && j.status === 'done')
    const dir = compSortDir === 'asc' ? 1 : -1
    const sorted = compSortKey === 'time'
      ? [...base].sort((a, b) => ((a.executionTime ?? 0) - (b.executionTime ?? 0)) * dir)
      : compSortKey === 'accuracy'
      ? [...base].sort((a, b) => ((a.result?.accuracy ?? 0) - (b.result?.accuracy ?? 0)) * dir)
      : compSortKey === 'cpu'
      ? [...base].sort((a, b) => (a.resource.peakCpu - b.resource.peakCpu) * dir)
      : compSortKey === 'mem'
      ? [...base].sort((a, b) => (a.resource.peakMemoryMB - b.resource.peakMemoryMB) * dir)
      : compSortKey === 'gpu'
      ? [...base].sort((a, b) => ((a.resource.gpuPercent.length ? Math.max(...a.resource.gpuPercent) : 0) - (b.resource.gpuPercent.length ? Math.max(...b.resource.gpuPercent) : 0)) * dir)
      : compSortKey === 'vram'
      ? [...base].sort((a, b) => (a.resource.peakVramMB - b.resource.peakVramMB) * dir)
      : base
    return sorted.slice(0, 4)
  }, [jobs, job.algorithmId, job.id, compSortKey, compSortDir])

  const compJobs = useMemo(() =>
    compCandidates.filter((j) => selectedCompIds.includes(j.id)),
    [compCandidates, selectedCompIds]
  )

  const compData = useMemo(() => {
    const all = [job, ...compJobs]
    const maxTime = Math.max(...all.map((j) => j.executionTime ?? 0), 1)
    const maxMem  = Math.max(...all.map((j) => j.resource.peakMemoryMB), 1)
    const maxVram = Math.max(...all.map((j) => j.resource.peakVramMB), 1)
    return all.map((j) => ({
      label:    j.id === job.id ? '현재' : j.id.slice(0, 6),
      credit:   j.creditUsed,
      time:     j.executionTime ?? 0,
      timeNorm: Math.round((j.executionTime ?? 0) / maxTime * 100),
      cpu:      j.resource.peakCpu,
      mem:      Math.round(j.resource.peakMemoryMB / 1024 * 10) / 10,
      memNorm:  Math.round(j.resource.peakMemoryMB / maxMem * 100),
      gpu:      j.resource.gpuPercent.length ? Math.max(...j.resource.gpuPercent) : 0,
      vram:     Math.round(j.resource.peakVramMB / 1024 * 10) / 10,
      vramNorm: Math.round(j.resource.peakVramMB / maxVram * 100),
      accuracy: Math.round((j.result?.accuracy ?? 0) * 100),
    }))
  }, [job, compJobs])

  const radarData = useMemo(() => [
    { metric: '실행시간', ...Object.fromEntries(compData.map((d) => [d.label, d.timeNorm])) },
    { metric: '정확도',   ...Object.fromEntries(compData.map((d) => [d.label, d.accuracy])) },
    { metric: 'CPU',     ...Object.fromEntries(compData.map((d) => [d.label, d.cpu])) },
    { metric: '메모리',  ...Object.fromEntries(compData.map((d) => [d.label, d.memNorm])) },
    { metric: 'GPU',     ...Object.fromEntries(compData.map((d) => [d.label, d.gpu])) },
    { metric: 'VRAM',    ...Object.fromEntries(compData.map((d) => [d.label, d.vramNorm])) },
  ], [compData])

  function toggleCompJob(id: string) {
    setSelectedCompIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleCsvDownload() {
    const allJobs = [job, ...compJobs]
    const rows = compData.map((d, i) => ({
      작업: d.label, SDK: allJobs[i]?.sdk ?? '-', 제공자: allJobs[i]?.provider ?? '-',
      파라미터: JSON.stringify(allJobs[i]?.params ?? {}),
      크레딧: d.credit, 실행시간: `${d.time}ms`,
      CPU: `${d.cpu}%`, 메모리: `${d.mem}GB`, GPU: `${d.gpu}%`, VRAM: `${d.vram}GB`,
      출력정확도: `${d.accuracy}%`,
    }))
    downloadCsv(rows, `job-compare-${job.id.slice(0, 8)}.csv`)
  }

function downloadResultJson() {
    if (!job.result?.rawOutput) return
    const blob = new Blob([job.result.rawOutput], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `job-result-${job.id.slice(0, 8)}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const resultCompData = useMemo(() => {
    const allJobs = [job, ...compJobs].filter((j) => j.result != null)
    const states = ['00', '01', '10', '11']
    return states.map((state) => ({
      state,
      ...Object.fromEntries(
        allJobs.map((j) => [
          j.id === job.id ? '현재' : j.id.slice(0, 6),
          parseFloat(((j.result?.measurementProbabilities[state] ?? 0) * 100).toFixed(1)),
        ])
      ),
    }))
  }, [job, compJobs])

  return (
    <>
      <SheetHeader>
        <SheetTitle>양자 작업 상세</SheetTitle>
        <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)] font-mono">{job.id}</p>
      </SheetHeader>
      <SheetBody>
        {/* 상태 스텝퍼 — 탭 위 고정 */}
        <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-4">
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

        {/* 탭 바 */}
        <SectionTab
          tabs={['개요', '리소스', '비교', `코멘트 ${job.comments.length}`]}
          active={activeTab === '코멘트' ? `코멘트 ${job.comments.length}` : activeTab}
          onChange={(t) => setActiveTab(t.startsWith('코멘트') ? '코멘트' : t as typeof activeTab)}
        />

        {/* 개요 탭 */}
        {activeTab === '개요' && <>

        {/* 작업 정보 */}
        <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-4 text-[13px] font-semibold">작업 정보</p>
          <div className="grid grid-cols-[140px_1fr] gap-y-2.5">
            <InfoRow label="작업 ID"><span className="text-[12px] break-all">{job.id}</span></InfoRow>
            <InfoRow label="상태"><StatusBadge status={job.status as JobStatus} /></InfoRow>
            <InfoRow label="제공자">{job.provider}</InfoRow>
            <InfoRow label="장비 이름">{job.deviceName}</InfoRow>
            <InfoRow label="사용자">{job.userEmail}</InfoRow>
            <InfoRow label="사용 크레딧">{job.creditUsed > 0 ? `${job.creditUsed.toFixed(2)} cr` : '-'}</InfoRow>
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
          {job.result && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-medium">결과</span>
                <button
                  onClick={downloadResultJson}
                  className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[11px] hover:bg-[var(--accent)] transition-colors"
                >
                  <Download size={11} /> 결과 다운로드
                </button>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2">
                <InfoRow label="시뮬레이터">{job.result.simulator}</InfoRow>
                <InfoRow label="버전">{job.result.version}</InfoRow>
                <InfoRow label="샘플 수">{job.result.totalSamples.toLocaleString()}</InfoRow>
                <InfoRow label="충실도">{job.result.fidelity != null ? job.result.fidelity.toFixed(4) : '-'}</InfoRow>
              </div>
              {chartData.length > 0 && (
                <>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 20 }}>
                        <XAxis dataKey="state" tick={{ fontSize: 12, fontFamily: 'monospace' }} />
                        <YAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                        <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill="var(--primary)" opacity={0.8 + i * 0.05} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mb-4 text-center text-[11px] text-[var(--muted-foreground)]">계산 기저 상태</p>
                </>
              )}
              <div>
                <button
                  onClick={() => setTimingsExpanded(!timingsExpanded)}
                  className="flex items-center gap-1 text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {timingsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  타이밍 세부
                </button>
                {timingsExpanded && (
                  <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1.5 rounded-lg bg-[var(--muted)] p-3">
                    {Object.entries(job.result.timings).map(([key, val]) => (
                      <InfoRow key={key} label={key}>{val.toFixed(6)} s</InfoRow>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 산출 정보 */}
        <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-4 text-[13px] font-semibold">산출 정보</p>
          {job.estimate ? (
            <div className="grid grid-cols-[140px_1fr] gap-y-2.5">
              <InfoRow label="산출 작업 ID"><span className="text-[12px] break-all">{job.estimate.id}</span></InfoRow>
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
              <InfoRow label="산출 크레딧">{job.estimate.credits.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cr</InfoRow>
              <InfoRow label="유효 기한"><span className="text-[12px]">{formatShort(job.estimate.expiresAt)}</span></InfoRow>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--muted-foreground)]">산출 정보가 없습니다.</p>
          )}
        </div>

        </> /* 개요 탭 끝 */}

        {/* 리소스 탭 */}
        {activeTab === '리소스' && <>

        {/* ⑤ 리소스 시각화 (요구 219·220) */}
        <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold">리소스 사용</p>
            {job.resource.thresholdExceeded && (
              <span className="flex items-center gap-1 rounded-full bg-[rgb(254,242,242)] px-2 py-0.5 text-[11px] font-semibold text-[rgb(239,68,68)]">
                <AlertTriangle size={11} /> 임계값 초과
              </span>
            )}
          </div>
          <div className="mb-2 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-[var(--muted)] px-3 py-2">
              <p className="text-[11px] text-[var(--muted-foreground)]">피크 CPU</p>
              <p className="text-[16px] font-semibold">{job.resource.peakCpu}%</p>
            </div>
            <div className="rounded-lg bg-[var(--muted)] px-3 py-2">
              <p className="text-[11px] text-[var(--muted-foreground)]">피크 메모리</p>
              <p className="text-[16px] font-semibold">{(job.resource.peakMemoryMB / 1024).toFixed(1)} GB</p>
            </div>
            <div className="rounded-lg bg-[var(--muted)] px-3 py-2">
              <p className="text-[11px] text-[var(--muted-foreground)]">샘플 수</p>
              <p className="text-[16px] font-semibold">{resourceSeries.length}</p>
            </div>
          </div>
          <div className="mb-2 flex gap-1">
            {(['timeline', 'histogram'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setChartView(v)}
                className={[
                  'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                  chartView === v
                    ? 'bg-[var(--primary)] text-white'
                    : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]',
                ].join(' ')}
              >
                {v === 'timeline' ? '타임라인' : '히스토그램'}
              </button>
            ))}
          </div>
          <div className="mb-4 flex gap-1 border-b border-[var(--border)]">
            {(['CPU', '메모리', 'GPU', 'VRAM'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setResourceTab(m)}
                className={[
                  'px-3 py-1.5 text-[12px] font-medium border-b-2 -mb-px transition-colors',
                  resourceTab === m
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'timeline' ? (
                <LineChart data={resourceSeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="t" tick={{ fontSize: 9 }} interval={Math.floor(resourceSeries.length / 4)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      const isAbnormal = job.status === 'failed' || job.status === 'cancelled'
                      const anomalyLogs = job.logs.filter((l) => l.level === 'error' || l.level === 'warn')
                      return (
                        <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-2 text-[12px] shadow-sm max-w-[220px]">
                          <p className="mb-1 text-[var(--muted-foreground)]">{label}</p>
                          {isAbnormal && anomalyLogs.length > 0 && (
                            <div className="mb-1.5 space-y-0.5 border-b border-[var(--border)] pb-1.5">
                              {anomalyLogs.map((l, i) => (
                                <p key={i} className="font-medium text-[rgb(239,68,68)]">
                                  {l.level === 'error' ? '❌' : '⚠️'} {l.message}
                                </p>
                              ))}
                            </div>
                          )}
                          {payload.map((p) => (
                            <p key={String(p.name)}>{p.name}: {p.value}</p>
                          ))}
                        </div>
                      )
                    }}
                  />
                  {(job.status === 'failed' || job.status === 'cancelled') && resourceSeries.length > 0 && (
                    <ReferenceArea
                      x1={resourceSeries[0].t}
                      x2={resourceSeries[resourceSeries.length - 1].t}
                      fill="#ef4444"
                      fillOpacity={0.08}
                    />
                  )}
                  <ReferenceLine
                    y={resourceTab === 'CPU' ? THRESHOLDS.CPU : resourceTab === '메모리' ? THRESHOLDS.MEM : resourceTab === 'GPU' ? THRESHOLDS.GPU : THRESHOLDS.VRAM}
                    stroke="#ef4444"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                    label={{ value: resourceTab === 'CPU' || resourceTab === 'GPU' ? `${resourceTab === 'CPU' ? THRESHOLDS.CPU : THRESHOLDS.GPU}%` : `${resourceTab === '메모리' ? THRESHOLDS.MEM : THRESHOLDS.VRAM}GB`, position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }}
                  />
                  {resourceTab === 'CPU' && (
                    <Line type="monotone" dataKey="cpu" name="CPU %" stroke="var(--primary)" strokeWidth={1.5} dot={false} />
                  )}
                  {resourceTab === '메모리' && (
                    <Line type="monotone" dataKey="mem" name="메모리 GB" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  )}
                  {resourceTab === 'GPU' && (
                    <Line type="monotone" dataKey="gpu" name="GPU %" stroke="#10b981" strokeWidth={1.5} dot={false} />
                  )}
                  {resourceTab === 'VRAM' && (
                    <Line type="monotone" dataKey="vram" name="VRAM GB" stroke="#ec4899" strokeWidth={1.5} dot={false} />
                  )}
                </LineChart>
              ) : (
                <BarChart data={histogramData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="range" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [v, '빈도']} />
                  <Bar
                    dataKey={resourceTab === 'CPU' ? 'cpu' : resourceTab === '메모리' ? 'mem' : resourceTab === 'GPU' ? 'gpu' : 'vram'}
                    name={resourceTab === 'CPU' ? 'CPU %' : resourceTab === '메모리' ? '메모리' : resourceTab === 'GPU' ? 'GPU %' : 'VRAM'}
                    fill={resourceTab === 'CPU' ? 'var(--primary)' : resourceTab === '메모리' ? '#f59e0b' : resourceTab === 'GPU' ? '#10b981' : '#ec4899'}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        </> /* 리소스 탭 끝 */}

        {/* 비교 탭 */}
        {activeTab === '비교' && <>

        {/* ⑥ 비교 (요구 222·223) */}
        <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-4">
            <p className="text-[13px] font-semibold">작업 비교 — {job.algorithmTitle}</p>
          </div>

          {compCandidates.length === 0 ? (
            <p className="text-[13px] text-[var(--muted-foreground)]">동일 알고리즘의 완료된 작업이 없습니다.</p>
          ) : (
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <label className="text-[11px] text-[var(--muted-foreground)] shrink-0">정렬 기준</label>
                <select
                  value={compSortKey ?? ''}
                  onChange={(e) => setCompSortKey((e.target.value as typeof compSortKey) || null)}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[11px] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
                >
                  <option value="">기본 (등록 순)</option>
                  <option value="time">실행시간</option>
                  <option value="accuracy">정확도</option>
                  <option value="cpu">CPU</option>
                  <option value="mem">메모리</option>
                  <option value="gpu">GPU</option>
                  <option value="vram">VRAM</option>
                </select>
                <div className="flex gap-0.5">
                  {(['asc', 'desc'] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setCompSortDir(dir)}
                      disabled={compSortKey === null}
                      className={[
                        'rounded px-2 py-1 text-[11px] font-medium transition-colors border',
                        compSortKey === null
                          ? 'opacity-40 cursor-not-allowed border-[var(--border)] text-[var(--muted-foreground)]'
                          : compSortDir === dir
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                          : 'border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]',
                      ].join(' ')}
                    >
                      {dir === 'asc' ? '오름차순' : '내림차순'}
                    </button>
                  ))}
                </div>
              </div>
              {/* 카드 목록 */}
              <div className="space-y-1.5">
                {[{ j: job, fixed: true }, ...compCandidates.map((j) => ({ j, fixed: false }))].map(({ j, fixed }) => {
                  const selected = fixed || selectedCompIds.includes(j.id)
                  const peakGpu = j.resource.gpuPercent.length ? Math.max(...j.resource.gpuPercent) : 0
                  const memGb = Math.round(j.resource.peakMemoryMB / 1024 * 10) / 10
                  const vramGb = Math.round(j.resource.peakVramMB / 1024 * 10) / 10
                  const resources = [
                    { sortKey: 'cpu' as const,  name: 'CPU',    value: `${j.resource.peakCpu}%` },
                    { sortKey: 'mem' as const,  name: '메모리', value: `${memGb}GB` },
                    { sortKey: 'gpu' as const,  name: 'GPU',    value: `${peakGpu}%` },
                    { sortKey: 'vram' as const, name: 'VRAM',   value: `${vramGb}GB` },
                  ]
                  return (
                    <div
                      key={j.id}
                      onClick={fixed ? undefined : () => toggleCompJob(j.id)}
                      className={[
                        'rounded-md border-l-2 px-3 py-2.5 transition-colors',
                        fixed
                          ? 'border-l-[var(--primary)] bg-[var(--muted)]'
                          : selected
                          ? 'border-l-[var(--primary)] bg-[var(--primary)]/5 cursor-pointer'
                          : 'border-l-transparent hover:border-l-[var(--border)] hover:bg-[var(--muted)] cursor-pointer',
                      ].join(' ')}
                    >
                      {/* 1depth: 라벨 + 실행시간·정확도 */}
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={fixed}
                          onChange={fixed ? undefined : () => toggleCompJob(j.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-[var(--primary)]"
                        />
                        <span className="text-[12px] font-medium flex-1">
                          {fixed ? '현재 작업' : <span className="font-mono font-normal">{j.id.slice(0, 8)}…</span>}
                        </span>
                        <span className={['text-[11px] tabular-nums', compSortKey === 'time' ? 'text-[var(--primary)] font-medium' : 'text-[var(--muted-foreground)]'].join(' ')}>
                          {(j.executionTime ?? 0).toLocaleString()}ms
                        </span>
                        <span className="text-[var(--border)] text-[10px]">·</span>
                        <span className={['text-[11px] tabular-nums', compSortKey === 'accuracy' ? 'text-[var(--primary)] font-medium' : 'text-[var(--muted-foreground)]'].join(' ')}>
                          정확도 {Math.round((j.result?.accuracy ?? 0) * 100)}%
                        </span>
                      </div>
                      {/* 2depth: 조건 + 자원 그리드 */}
                      <p className="pl-5 text-[11px] text-[var(--muted-foreground)] mb-1.5">
                        {[...Object.entries(j.params).map(([k, v]) => `${k}=${v}`), j.sdk, j.provider].join(' · ')}
                      </p>
                      <div className="pl-5 grid grid-cols-4 gap-x-3">
                        {resources.map((m) => (
                          <div key={m.name} className="flex items-baseline gap-1">
                            <span className="text-[9px] uppercase tracking-wide text-[var(--muted-foreground)] opacity-60">{m.name}</span>
                            <span className={['text-[11px] tabular-nums font-medium', m.sortKey && compSortKey === m.sortKey ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'].join(' ')}>
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {compData.length > 1 && (
            <div>
              {/* 비교 결과 영역 타이틀 행: [시각화/표] 좌 | 비교 결과 중 | [CSV][PDF] 우 */}
              <div className="mb-2 flex items-center gap-2">
                <p className="text-[12px] font-semibold text-[var(--foreground)]">비교 결과</p>
                <div className="flex gap-1">
                  {(['chart', 'table'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setCompView(v)}
                      className={[
                        'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border',
                        compView === v
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                          : 'border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]',
                      ].join(' ')}
                    >
                      {v === 'chart' ? '시각화' : '표'}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex gap-1.5">
                  <button
                    onClick={handleCsvDownload}
                    className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[11px] hover:bg-[var(--accent)] transition-colors"
                  >
                    <Download size={11} /> CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[11px] hover:bg-[var(--accent)] transition-colors"
                  >
                    <Download size={11} /> PDF
                  </button>
                </div>
              </div>

              {compView === 'chart' ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* 좌: 성능 비교 */}
                  <div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">성능 비교</p>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} margin={{ top: 4, right: 20, left: 20, bottom: 0 }}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis domain={[0, 100]} tick={false} tickCount={3} />
                          {compData.map((d, i) => (
                            <Radar
                              key={d.label}
                              name={d.label}
                              dataKey={d.label}
                              stroke={COMP_COLORS[i] ?? '#94a3b8'}
                              fill={COMP_COLORS[i] ?? '#94a3b8'}
                              fillOpacity={0.15}
                            />
                          ))}
                          <Legend iconSize={9} wrapperStyle={{ fontSize: 10 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* 우: 결과 비교 */}
                  <div>
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">결과 비교</p>
                    {resultCompData.length === 0 ? (
                      <p className="text-[12px] text-[var(--muted-foreground)]">비교할 결과 데이터가 없습니다.</p>
                    ) : (
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={resultCompData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="state" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                            <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                            <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ fontSize: 11 }} />
                            <Legend iconSize={9} wrapperStyle={{ fontSize: 10 }} />
                            {[job, ...compJobs].filter((j) => j.result != null).map((j, i) => (
                              <Bar
                                key={j.id}
                                dataKey={j.id === job.id ? '현재' : j.id.slice(0, 6)}
                                fill={COMP_COLORS[i] ?? '#94a3b8'}
                                radius={[3, 3, 0, 0]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* 표 모드 — 단일 통합 테이블 */
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      {/* 열 그룹 헤더 */}
                      <tr className="border-b border-[var(--border)]">
                        <th className="py-1 pr-3 text-left font-medium text-[var(--muted-foreground)]">작업</th>
                        <th colSpan={6} className="py-1 px-1 text-left font-medium text-[var(--muted-foreground)]">성능 비교</th>
                        <th colSpan={4} className="py-1 pl-3 text-left font-medium text-[var(--muted-foreground)] border-l border-[var(--border)]">결과 비교</th>
                      </tr>
                      {/* 열 헤더 */}
                      <tr className="border-b border-[var(--border)]">
                        <th className="py-1 pr-3 text-left text-[var(--muted-foreground)] opacity-70"></th>
                        {['실행시간', '정확도', 'CPU', '메모리', 'GPU', 'VRAM'].map((h) => (
                          <th key={h} className="py-1 px-1 text-right text-[var(--muted-foreground)] opacity-70">{h}</th>
                        ))}
                        {['00', '01', '10', '11'].map((s) => (
                          <th key={s} className={['py-1 px-1 text-right font-mono text-[var(--muted-foreground)] opacity-70', s === '00' ? 'pl-3 border-l border-[var(--border)]' : ''].join(' ')}>{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {compData.map((d, i) => {
                        const j = i === 0 ? job : compJobs[i - 1]
                        const probs = j?.result?.measurementProbabilities ?? {}
                        return (
                          <tr key={d.label} className={['border-b border-[var(--border)]', i === 0 ? 'bg-[var(--primary)]/5' : ''].join(' ')}>
                            <td className="py-1.5 pr-3 font-mono">{d.label}</td>
                            <td className="py-1.5 px-1 text-right tabular-nums">{d.time.toLocaleString()}ms</td>
                            <td className="py-1.5 px-1 text-right tabular-nums">{d.accuracy}%</td>
                            <td className="py-1.5 px-1 text-right tabular-nums">{d.cpu}%</td>
                            <td className="py-1.5 px-1 text-right tabular-nums">{d.mem}GB</td>
                            <td className="py-1.5 px-1 text-right tabular-nums">{d.gpu}%</td>
                            <td className="py-1.5 px-1 text-right tabular-nums">{d.vram}GB</td>
                            {['00', '01', '10', '11'].map((s) => (
                              <td key={s} className={['py-1.5 px-1 text-right tabular-nums', s === '00' ? 'pl-3 border-l border-[var(--border)]' : ''].join(' ')}>
                                {probs[s] != null ? `${(probs[s] * 100).toFixed(1)}%` : '-'}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        </> /* 비교 탭 끝 */}

        {/* 코멘트 탭 */}
        {activeTab === '코멘트' && <>

        {/* ⑦ 코멘트 (요구 226) — YouTube Community 패턴 */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="mb-4 text-[13px] font-semibold">
            코멘트 <span className="text-[var(--muted-foreground)] font-normal">({job.comments.length})</span>
          </p>

          {/* 댓글 목록 */}
          <div className="mb-4 space-y-3">
            {job.comments.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-[var(--muted-foreground)]">
                <MessageSquare size={28} className="mb-2 opacity-40" />
                <p className="text-[13px]">첫 댓글을 남겨보세요.</p>
              </div>
            ) : (
              job.comments.map((c) => (
                <div key={c.id} className="rounded-lg border border-[var(--border)] p-3">
                  {/* 댓글 작성자 */}
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">
                      {c.userId.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-[12px] font-medium">{c.userId}</span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">{formatShort(c.createdAt)}</span>
                  </div>
                  <p className="mb-2 pl-8 text-[13px] text-[var(--foreground)]">{c.content}</p>

                  {/* 댓글 이모지 + 답글 */}
                  <div className="relative flex flex-wrap items-center gap-1 pl-8">
                    {c.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => toggleEmoji(job.id, c.id, r.emoji, currentUserId)}
                        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] transition-colors ${r.userIds.includes(currentUserId) ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] hover:bg-[var(--accent)]'}`}
                      >
                        {r.emoji} <span>{r.userIds.length}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setEmojiTarget(
                        emojiTarget?.commentId === c.id && !emojiTarget.replyId ? null : { commentId: c.id }
                      )}
                      className="flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
                    >
                      <SmilePlus size={12} />
                    </button>
                    {emojiTarget?.commentId === c.id && !emojiTarget.replyId && (
                      <div ref={emojiPickerRef} className="absolute left-8 top-7 z-10 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-md">
                        {EMOJI_OPTIONS.map((e) => (
                          <button key={e} onClick={() => { toggleEmoji(job.id, c.id, e, currentUserId); setEmojiTarget(null) }} className="rounded p-1 text-[18px] hover:bg-[var(--accent)] transition-colors">{e}</button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (replyTarget === c.id && !replyToUserId) { setReplyTarget(null) }
                        else { setReplyTarget(c.id); setReplyToUserId(null); setReplyContent('') }
                      }}
                      className="ml-auto flex items-center gap-1 text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <CornerDownRight size={11} /> 답글
                    </button>
                  </div>

                  {/* 대댓글 (flat thread) */}
                  {c.thread.length > 0 && (
                    <div className="mt-3 ml-8 space-y-3 border-l-2 border-[var(--border)] pl-3">
                      {c.thread.map((r) => (
                        <div key={r.id}>
                          <div className="mb-0.5 flex items-center gap-1.5">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/70 text-[9px] font-bold text-white">
                              {r.userId.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="text-[11px] font-medium">{r.userId}</span>
                            <span className="text-[10px] text-[var(--muted-foreground)]">{formatShort(r.createdAt)}</span>
                          </div>
                          <p className="pl-6 text-[12px]">
                            {r.replyToUserId && (
                              <span className="mr-1 font-medium text-[var(--primary)]">@{r.replyToUserId}</span>
                            )}
                            {r.content}
                          </p>

                          {/* 대댓글 이모지 + 답글 */}
                          <div className="relative mt-1 flex flex-wrap items-center gap-1 pl-6">
                            {r.reactions.map((rx) => (
                              <button
                                key={rx.emoji}
                                onClick={() => toggleReplyEmoji(job.id, c.id, r.id, rx.emoji, currentUserId)}
                                className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] transition-colors ${rx.userIds.includes(currentUserId) ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] hover:bg-[var(--accent)]'}`}
                              >
                                {rx.emoji} <span>{rx.userIds.length}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => setEmojiTarget(
                                emojiTarget?.commentId === c.id && emojiTarget.replyId === r.id ? null : { commentId: c.id, replyId: r.id }
                              )}
                              className="flex items-center gap-1 rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
                            >
                              <SmilePlus size={11} />
                            </button>
                            {emojiTarget?.commentId === c.id && emojiTarget.replyId === r.id && (
                              <div ref={emojiPickerRef} className="absolute left-6 top-6 z-10 flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-md">
                                {EMOJI_OPTIONS.map((e) => (
                                  <button key={e} onClick={() => { toggleReplyEmoji(job.id, c.id, r.id, e, currentUserId); setEmojiTarget(null) }} className="rounded p-1 text-[18px] hover:bg-[var(--accent)] transition-colors">{e}</button>
                                ))}
                              </div>
                            )}
                            <button
                              onClick={() => {
                                if (replyTarget === c.id && replyToUserId === r.userId) { setReplyTarget(null); setReplyToUserId(null) }
                                else { setReplyTarget(c.id); setReplyToUserId(r.userId); setReplyContent(`@${r.userId} `) }
                              }}
                              className="ml-auto flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                            >
                              <CornerDownRight size={10} /> 답글
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 답글 입력창 (댓글 or 대댓글 모두 동일 위치 — flat thread 하단) */}
                  {replyTarget === c.id && (
                    <div className="mt-3 ml-8 flex items-start gap-2">
                      <textarea
                        autoFocus
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }}
                        placeholder={replyToUserId ? `@${replyToUserId}에게 답글...` : '답글을 입력하세요...'}
                        rows={1}
                        className="flex-1 resize-none overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-[12px] outline-none focus:border-[var(--primary)]"
                      />
                      <button
                        disabled={!replyContent.trim() || replyContent.trim() === `@${replyToUserId}`}
                        onClick={() => {
                          const content = replyToUserId
                            ? replyContent.trim().startsWith(`@${replyToUserId}`)
                              ? replyContent.trim().slice(`@${replyToUserId}`.length).trim()
                              : replyContent.trim()
                            : replyContent.trim()
                          if (!content) return
                          addReply(job.id, c.id, {
                            userId: currentUserId,
                            content,
                            createdAt: new Date().toISOString(),
                            ...(replyToUserId ? { replyToUserId } : {}),
                          })
                          setReplyContent('')
                          setReplyTarget(null)
                          setReplyToUserId(null)
                        }}
                        className="shrink-0 rounded-md bg-[var(--primary)] px-3 py-1.5 text-[12px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        등록
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 새 댓글 입력창 */}
          <div className="flex items-start gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }}
              placeholder="댓글을 입력하세요..."
              rows={1}
              className="flex-1 resize-none overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
            />
            <button
              disabled={!newComment.trim()}
              onClick={() => {
                addComment(job.id, { userId: currentUserId, content: newComment.trim(), createdAt: new Date().toISOString() })
                setNewComment('')
              }}
              className="shrink-0 rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              등록
            </button>
          </div>
        </div>

        </> /* 코멘트 탭 끝 */}

      </SheetBody>
    </>
  )
}

// 외부 컴포넌트: Sheet 래핑 + null 가드
export function JobDetailDrawer({ job, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[620px]">
        {job && <DrawerContent job={job} />}
      </SheetContent>
    </Sheet>
  )
}
