// 날짜·숫자 포맷 (ux-policy.md §7)

export function formatDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, '.')
}

export function formatDateTime(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ').replace(/-/g, '.')
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return formatDate(iso)
}

export function formatCredit(n: number): string {
  return `${n.toLocaleString('ko-KR')} cr`
}

export function formatQubits(n: number): string {
  return `${n}큐비트`
}

export function formatShots(n: number): string {
  return `${n.toLocaleString('ko-KR')}회`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ko-KR')
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
