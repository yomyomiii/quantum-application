'use client'

import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { useMarketplaceStore } from '@/store/marketplace.store'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell as PieCell, BarChart, Bar,
} from 'recharts'

const PERIODS = ['이번 달', '최근 3개월', '최근 6개월', '올해'] as const
type Period = typeof PERIODS[number]

const PIE_COLORS = ['#635ADC', '#22c55e', '#f59e0b', '#ef4444', '#6366f1']
const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function kpiMock(period: Period) {
  const mult = period === '이번 달' ? 1 : period === '최근 3개월' ? 3 : period === '최근 6개월' ? 6 : 12
  return {
    total: 142,
    views: Math.round(8432 * mult * (0.9 + Math.random() * 0.2)),
    runs: Math.round(3821 * mult * (0.9 + Math.random() * 0.2)),
    rating: 4.3,
  }
}

function lineDataMock(period: Period) {
  const days = period === '이번 달' ? 30 : period === '최근 3개월' ? 90 : period === '최근 6개월' ? 180 : 365
  return Array.from({ length: Math.min(days, 60) }, (_, i) => {
    const d = new Date(Date.now() - (Math.min(days, 60) - 1 - i) * 86400000)
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      조회수: Math.floor(Math.random() * 400 + 100),
      실행수: Math.floor(Math.random() * 150 + 50),
    }
  })
}

function top10Mock() {
  return [
    { rank: 1, name: 'Grover Algorithm', views: 1234, runs: 892, rating: 4.8 },
    { rank: 2, name: 'VQE Optimizer', views: 987, runs: 741, rating: 4.6 },
    { rank: 3, name: 'Shor Factoring', views: 856, runs: 620, rating: 4.5 },
    { rank: 4, name: 'QAOA Solver', views: 743, runs: 512, rating: 4.4 },
    { rank: 5, name: 'Bernstein-Vazirani', views: 621, runs: 430, rating: 4.3 },
    { rank: 6, name: 'Quantum Teleportation', views: 598, runs: 401, rating: 4.2 },
    { rank: 7, name: 'Bell State Generator', views: 534, runs: 378, rating: 4.1 },
    { rank: 8, name: 'Deutsch-Jozsa', views: 489, runs: 344, rating: 4.0 },
    { rank: 9, name: 'Simon Algorithm', views: 432, runs: 298, rating: 3.9 },
    { rank: 10, name: 'Phase Estimation', views: 387, runs: 267, rating: 3.8 },
  ]
}

function categoryMock() {
  return [
    { name: '최적화', value: 38 },
    { name: '시뮬레이션', value: 27 },
    { name: '암호화', value: 18 },
    { name: 'ML', value: 17 },
  ]
}

function sdkMock() {
  return [
    { sdk: 'Qiskit', count: 68 },
    { sdk: 'Pennylane', count: 42 },
    { sdk: 'CUDA-Q', count: 21 },
    { sdk: '기타', count: 11 },
  ]
}

function heatmapMock() {
  return DAYS.map((day, di) =>
    HOURS.map((h) => ({
      day,
      hour: h,
      value: Math.floor(Math.random() * 100) + (di === 1 && h === 14 ? 200 : 0),
    }))
  ).flat()
}

function leaderboardMock() {
  return [
    { rank: 1, name: '홍길동', algos: 12, runs: 2341, rating: 4.7 },
    { rank: 2, name: '이순신', algos: 9, runs: 1872, rating: 4.5 },
    { rank: 3, name: '강감찬', algos: 7, runs: 1534, rating: 4.3 },
    { rank: 4, name: '세종대왕', algos: 6, runs: 1201, rating: 4.2 },
    { rank: 5, name: '유관순', algos: 5, runs: 987, rating: 4.0 },
  ]
}

function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  const keys = Object.keys(rows[0])
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => r[k]).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = filename
  a.click()
}

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0
  const alpha = 0.1 + intensity * 0.9
  return (
    <div
      style={{ backgroundColor: `rgba(99,90,220,${alpha.toFixed(2)})` }}
      className="h-5 w-5 rounded-sm"
      title={`${value}회`}
    />
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-white">{rank}</span>
  if (rank === 2) return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--border)] text-[11px] font-bold text-[var(--foreground)]">{rank}</span>
  if (rank === 3) return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e] text-[11px] font-bold text-white">{rank}</span>
  return <span className="text-[13px] font-semibold">{rank}</span>
}

export default function AdminAlgorithmStatsPage() {
  const { algorithms, categories } = useMarketplaceStore()
  const [period, setPeriod] = useState<Period>('이번 달')

  const kpi = useMemo(() => kpiMock(period), [period])
  const lineData = useMemo(() => lineDataMock(period), [period])
  const top10 = useMemo(() => top10Mock(), [])
  const catData = useMemo(() => categoryMock(), [])
  const sdkData = useMemo(() => sdkMock(), [])
  const heatmap = useMemo(() => heatmapMock(), [])
  const leaders = useMemo(() => leaderboardMock(), [])
  const heatmapMax = useMemo(() => Math.max(...heatmap.map((d) => d.value)), [heatmap])

  void algorithms; void categories

  const tooltipStyle = { fontSize: 12, borderColor: 'var(--border)', background: 'var(--card)' }

  return (
    <div className="p-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">통계 — 양자 알고리즘</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="h-8 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[12px] outline-none focus:border-[var(--primary)]"
        >
          {PERIODS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '총 알고리즘', value: kpi.total.toLocaleString(), unit: '개' },
          { label: `${period} 조회`, value: kpi.views.toLocaleString(), unit: '회' },
          { label: `${period} 실행`, value: kpi.runs.toLocaleString(), unit: '회' },
          { label: '평균 평점', value: kpi.rating.toFixed(1), unit: '★' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
            <p className="text-[11px] text-[var(--muted-foreground)]">{label}</p>
            <p className="mt-1 text-[22px] font-semibold">
              {value} <span className="text-[14px] font-normal text-[var(--muted-foreground)]">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 라인차트 + 히트맵 (2열) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="mb-3 text-[13px] font-semibold">일별 조회수·실행수 추이</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={Math.floor(lineData.length / 10)} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="조회수" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="실행수" stroke="#635ADC" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="mb-3 text-[13px] font-semibold">요일 × 시간대별 실행 빈도</p>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-max">
              <div className="mb-1 flex gap-1 pl-8">
                {HOURS.map((h) => (
                  <div key={h} className="w-5 text-center text-[9px] text-[var(--muted-foreground)]">
                    {h % 3 === 0 ? h : ''}
                  </div>
                ))}
              </div>
              {DAYS.map((day) => (
                <div key={day} className="mb-1 flex items-center gap-1">
                  <div className="w-7 text-right text-[11px] text-[var(--muted-foreground)]">{day}</div>
                  {HOURS.map((h) => {
                    const cell = heatmap.find((d) => d.day === day && d.hour === h)!
                    return <HeatmapCell key={h} value={cell.value} max={heatmapMax} />
                  })}
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2 pl-8 text-[11px] text-[var(--muted-foreground)]">
                <span>낮음</span>
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((a) => (
                  <div key={a} className="h-4 w-4 rounded-sm" style={{ backgroundColor: `rgba(99,90,220,${a})` }} />
                ))}
                <span>높음</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[var(--muted-foreground)]">가장 많은 실행: 화요일 14:00</p>
        </div>
      </div>

      {/* 카테고리 + SDK 분포 (2열) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="mb-3 text-[13px] font-semibold">카테고리별 알고리즘 비율</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {catData.map((_, i) => <PieCell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {catData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-[13px]">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span>{d.name}</span>
                  <span className="text-[var(--muted-foreground)]">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="mb-3 text-[13px] font-semibold">SDK별 등록 알고리즘 수</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sdkData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="sdk" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="알고리즘 수" fill="#635ADC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 + 리더보드 (2열) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold">실행수 기준 Top 10</p>
            <button
              onClick={() => downloadCSV(top10.map((r) => ({ 순위: r.rank, 알고리즘명: r.name, 조회수: r.views, 실행수: r.runs, 평점: r.rating })), 'top10.csv')}
              className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
            >
              <Download size={11} /> CSV
            </button>
          </div>
          <div className="ds-table-wrap">
            <table className="ds-table w-full">
              <thead>
                <tr>
                  <th className="text-center w-10">순위</th>
                  <th>알고리즘명</th>
                  <th className="text-right w-20">실행수</th>
                  <th className="text-right w-16">평점</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((row) => (
                  <tr key={row.rank}>
                    <td className="text-center"><RankBadge rank={row.rank} /></td>
                    <td className="font-medium text-[12px]">{row.name}</td>
                    <td className="text-right text-[var(--muted-foreground)]">{row.runs.toLocaleString()}</td>
                    <td className="text-right text-[12px]">⭐ {row.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="mb-3 text-[13px] font-semibold">상위 등록자 랭킹</p>
          <div className="ds-table-wrap">
            <table className="ds-table w-full">
              <thead>
                <tr>
                  <th className="text-center w-10">순위</th>
                  <th>사용자명</th>
                  <th className="text-right w-20">알고리즘</th>
                  <th className="text-right w-20">총 실행</th>
                  <th className="text-right w-16">평점</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((row) => (
                  <tr key={row.rank}>
                    <td className="text-center"><RankBadge rank={row.rank} /></td>
                    <td className="font-medium">{row.name}</td>
                    <td className="text-right text-[var(--muted-foreground)]">{row.algos}</td>
                    <td className="text-right text-[var(--muted-foreground)]">{row.runs.toLocaleString()}</td>
                    <td className="text-right text-[12px]">⭐ {row.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
