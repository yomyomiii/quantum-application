'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import { sortBy } from '@/lib/mock-utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination, paginate } from '@/components/shared/Pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { JobDetailDrawer } from './JobDetailDrawer'
import type { Job } from '@/types/job'
import type { JobStatus } from '@/types/common'

const JOB_STATUSES: { label: string; value: string }[] = [
  { label: '전체 상태', value: 'all' },
  { label: 'Initiated', value: 'initiated' },
  { label: 'Estimate', value: 'estimate' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Running', value: 'running' },
  { label: 'Done', value: 'done' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const PROVIDER_OPTIONS = [
  { label: '전체 제공자', value: 'all' },
  { label: 'QPerfect', value: 'QPerfect' },
  { label: 'IBM', value: 'IBM' },
  { label: 'IonQ', value: 'IonQ' },
]

function formatJobDate(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).replace(/\. /g, '-').replace('.', '')
}

export default function JobsPage() {
  const { jobs } = useMarketplaceStore()
  const { workspaces } = useWorkspaceStore()

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('all')
  const [provider, setProvider] = useState('all')
  const [wsFilter, setWsFilter] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const wsOptions = [
    { label: '전체 프로젝트', value: 'all' },
    ...workspaces.map((ws) => ({ label: ws.name, value: ws.id })),
  ]

  function handleChange<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setPage(1) }
  }

  const filtered = useMemo(() => {
    const result = jobs.filter((job) => {
      if (status !== 'all' && job.status !== status) return false
      if (provider !== 'all' && job.provider !== provider) return false
      if (wsFilter !== 'all' && job.workspaceId !== wsFilter) return false
      if (keyword) {
        const kw = keyword.toLowerCase()
        if (!job.deviceName.toLowerCase().includes(kw) && !job.id.includes(kw) && !job.userEmail.toLowerCase().includes(kw)) return false
      }
      if (dateFrom && job.createdAt < dateFrom) return false
      if (dateTo && job.createdAt > dateTo + 'T23:59:59') return false
      return true
    })
    return sortBy(result, 'createdAt', sortDir)
  }, [jobs, status, provider, wsFilter, keyword, dateFrom, dateTo, sortDir])

  const paged = useMemo(() => paginate(filtered, page, pageSize), [filtered, page, pageSize])

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-[18px] font-semibold">양자 작업</h1>
      </div>

      {/* 필터 바 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleChange(setDateFrom)(e.target.value)}
          className="h-8 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[12px] outline-none focus:border-[var(--primary)]"
        />
        <span className="text-[12px] text-[var(--muted-foreground)]">~</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleChange(setDateTo)(e.target.value)}
          className="h-8 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-[12px] outline-none focus:border-[var(--primary)]"
        />

        <Select value={status} onValueChange={handleChange(setStatus)}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {JOB_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={provider} onValueChange={handleChange(setProvider)}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PROVIDER_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={wsFilter} onValueChange={handleChange(setWsFilter)}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {wsOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="relative min-w-[160px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="장비명·작업ID 검색"
            value={keyword}
            onChange={(e) => handleChange(setKeyword)(e.target.value)}
            className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--card)] pl-7 pr-3 text-[12px] outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="ml-auto">
          <Select value={sortDir} onValueChange={(v) => setSortDir(v as 'asc' | 'desc')}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">최신순</SelectItem>
              <SelectItem value="asc">오래된순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="양자 작업이 없습니다" description="필터 조건을 변경해보세요." />
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table w-full">
              <thead>
                <tr>
                  <th className="w-44 whitespace-nowrap">작업 ID</th>
                  <th className="w-24 whitespace-nowrap">제공자</th>
                  <th className="whitespace-nowrap">장비 이름</th>
                  <th className="w-48 whitespace-nowrap">사용자</th>
                  <th className="w-24 whitespace-nowrap">상태</th>
                  <th className="w-28 text-right whitespace-nowrap">사용 크레딧</th>
                  <th className="w-36 whitespace-nowrap">생성 일시</th>
                  <th className="w-16 text-right whitespace-nowrap">액션</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((job) => (
                  <tr key={job.id}>
                    <td className="text-[12px] whitespace-nowrap text-[var(--muted-foreground)]">
                      {job.id.slice(0, 10)}...{job.id.slice(-10)}
                    </td>
                    <td className="whitespace-nowrap text-[var(--muted-foreground)]">{job.provider}</td>
                    <td className="whitespace-nowrap font-medium">{job.deviceName}</td>
                    <td className="whitespace-nowrap text-[var(--muted-foreground)] text-[12px]">{job.userEmail}</td>
                    <td className="whitespace-nowrap"><StatusBadge status={job.status as JobStatus} /></td>
                    <td className="text-right whitespace-nowrap tabular-nums">
                      {job.creditUsed > 0 ? `${job.creditUsed.toFixed(2)} C` : '-'}
                    </td>
                    <td className="text-[var(--muted-foreground)] whitespace-nowrap text-[12px]">{formatJobDate(job.createdAt)}</td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
                      >
                        <ArrowRight size={11} /> 상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={() => {}}
            className="mt-3"
          />
        </>
      )}

      <JobDetailDrawer
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(v) => { if (!v) setSelectedJob(null) }}
      />
    </div>
  )
}
