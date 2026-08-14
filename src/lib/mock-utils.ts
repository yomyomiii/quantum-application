export function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; totalPages: number } {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const data = items.slice((page - 1) * pageSize, page * pageSize)
  return { data, total, totalPages }
}

export function sortBy<T>(items: T[], key: keyof T, dir: 'asc' | 'desc' = 'desc'): T[] {
  return [...items].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av === bv) return 0
    const cmp = av < bv ? -1 : 1
    return dir === 'asc' ? cmp : -cmp
  })
}

export function filterBy<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate)
}

export function isoNow(): string {
  return new Date().toISOString()
}

export function randomId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export interface JobFilter {
  dateFrom?: string
  dateTo?: string
  status?: string
  sdk?: string
  workspaceId?: string
  keyword?: string
  sortDir?: 'asc' | 'desc'
}

export function filterJobs<T extends { status: string; sdk: string; workspaceId: string; algorithmTitle: string; createdAt: string; startedAt: string | null }>(
  jobs: T[],
  filter: JobFilter,
): T[] {
  return jobs.filter((job) => {
    if (filter.status && filter.status !== 'all' && job.status !== filter.status) return false
    if (filter.sdk && filter.sdk !== 'all' && job.sdk !== filter.sdk) return false
    if (filter.workspaceId && filter.workspaceId !== 'all' && job.workspaceId !== filter.workspaceId) return false
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase()
      if (!job.algorithmTitle.toLowerCase().includes(kw)) return false
    }
    const dateRef = job.startedAt ?? job.createdAt
    if (filter.dateFrom && dateRef < filter.dateFrom) return false
    if (filter.dateTo && dateRef > filter.dateTo + 'T23:59:59') return false
    return true
  })
}
