'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { Job } from '@/types/job'

interface Props {
  jobs: Job[]
}

const METRIC_COLOR: Record<string, string> = {
  CPU: 'var(--primary)',
  메모리: '#f59e0b',
  GPU: '#10b981',
  VRAM: '#ec4899',
}

const METRIC_LABEL_TIMELINE: Record<string, string> = {
  CPU: '피크 CPU (%)',
  메모리: '피크 메모리 (GB)',
  GPU: '피크 GPU (%)',
  VRAM: '피크 VRAM (GB)',
}

const METRIC_LABEL_HISTOGRAM: Record<string, string> = {
  CPU: '피크 CPU (%)',
  메모리: '피크 메모리 (%)',
  GPU: '피크 GPU (%)',
  VRAM: '피크 VRAM (%)',
}

const METRIC_UNIT: Record<string, string> = {
  CPU: '%',
  메모리: 'GB',
  GPU: '%',
  VRAM: 'GB',
}

const THRESHOLDS = { CPU: 80, GPU: 80, MEM: 10, VRAM: 8 }

const BUCKETS = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']

function bucket(v: number) { return Math.min(4, Math.floor(v / 20)) }

export function JobResourceChart({ jobs }: Props) {
  const [chartView, setChartView] = useState<'timeline' | 'histogram'>('timeline')
  const [metricTab, setMetricTab] = useState<'CPU' | '메모리' | 'GPU' | 'VRAM'>('CPU')

  const timelineData = useMemo(() =>
    jobs.map((j) => ({
      date: j.createdAt.slice(0, 10),
      cpu: j.resource.peakCpu,
      mem: Math.round(j.resource.peakMemoryMB / 1024 * 10) / 10,
      gpu: j.resource.gpuPercent.length ? Math.max(...j.resource.gpuPercent) : 0,
      vram: Math.round(j.resource.peakVramMB / 1024 * 10) / 10,
    })),
    [jobs],
  )

  const histogramData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    const maxMem = Math.max(...jobs.map((j) => j.resource.peakMemoryMB), 1)
    const maxVram = Math.max(...jobs.map((j) => j.resource.peakVramMB), 1)
    jobs.forEach((j) => {
      const v =
        metricTab === 'CPU' ? j.resource.peakCpu :
        metricTab === 'GPU' ? (j.resource.gpuPercent.length ? Math.max(...j.resource.gpuPercent) : 0) :
        metricTab === 'VRAM' ? (j.resource.peakVramMB / maxVram) * 100 :
        (j.resource.peakMemoryMB / maxMem) * 100
      counts[bucket(v)]++
    })
    return BUCKETS.map((range, i) => ({ range, count: counts[i] }))
  }, [jobs, metricTab])

  if (jobs.length === 0) return null

  const dataKey = metricTab === 'CPU' ? 'cpu' : metricTab === '메모리' ? 'mem' : metricTab === 'GPU' ? 'gpu' : 'vram'
  const color = METRIC_COLOR[metricTab]
  const unit = METRIC_UNIT[metricTab]
  const label = chartView === 'histogram' ? METRIC_LABEL_HISTOGRAM[metricTab] : METRIC_LABEL_TIMELINE[metricTab]

  return (
    <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex gap-1">
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
        <div className="ml-auto flex gap-1">
          {(['CPU', '메모리', 'GPU', 'VRAM'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetricTab(m)}
              className={[
                'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                metricTab === m
                  ? 'bg-[var(--primary)] text-white'
                  : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]',
              ].join(' ')}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'timeline' ? (
            <BarChart data={timelineData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={Math.max(0, Math.floor(timelineData.length / 6) - 1)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}${unit}`} width={44} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v) => [`${v} ${unit}`, label]}
              />
              <ReferenceLine
                y={metricTab === 'CPU' ? THRESHOLDS.CPU : metricTab === '메모리' ? THRESHOLDS.MEM : metricTab === 'GPU' ? THRESHOLDS.GPU : THRESHOLDS.VRAM}
                stroke="#ef4444"
                strokeDasharray="4 3"
                strokeWidth={1}
                label={{ value: metricTab === 'CPU' || metricTab === 'GPU' ? `${metricTab === 'CPU' ? THRESHOLDS.CPU : THRESHOLDS.GPU}%` : `${metricTab === '메모리' ? THRESHOLDS.MEM : THRESHOLDS.VRAM}GB`, position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }}
              />
              <Bar dataKey={dataKey} name={label} fill={color} radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={histogramData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="range" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} tickFormatter={(v) => `${v}건`} width={40} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v) => [`${v}건`, label]}
              />
              <Bar dataKey="count" name={label} fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
