import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Algorithm, AlgorithmCategory, AlgorithmReview, AlgorithmTag } from '@/types/algorithm'
import type { AlgorithmStatus, JobStatus } from '@/types/common'
import type { Job, JobComment, ValidationResult } from '@/types/job'
import { MOCK_ALGORITHMS, MOCK_CATEGORIES, MOCK_TAGS } from '@/mocks/algorithms'
import { MOCK_JOBS } from '@/mocks/jobs'
import { randomId, isoNow } from '@/lib/mock-utils'
import { validateJobParams, simulateJobRun, canTransition, autoCheckAlgorithm } from '@/lib/rule-engine'

interface AlgorithmFilter {
  category: string
  sdk: string
  authorId: string
  sortBy: 'popular' | 'latest' | 'rating'
  keyword: string
  status: AlgorithmStatus | 'all'
}

interface JobFilter {
  dateRange: [string, string] | null
  status: JobStatus | 'all'
  sdk: string
  workspaceId: string
  keyword: string
}

interface MarketplaceStore {
  // 양자 알고리즘
  algorithms: Algorithm[]
  categories: AlgorithmCategory[]
  tags: AlgorithmTag[]
  algorithmFilter: AlgorithmFilter
  algorithmViewMode: 'card' | 'list'
  setAlgorithmFilter: (filter: Partial<AlgorithmFilter>) => void
  setAlgorithmViewMode: (mode: 'card' | 'list') => void
  submitAlgorithm: (draft: Partial<Algorithm>) => void
  approveAlgorithm: (id: string) => void
  rejectAlgorithm: (id: string, reason: string) => void
  toggleActive: (id: string) => void
  setRecommended: (id: string, value: boolean) => void
  addReview: (algorithmId: string, review: Omit<AlgorithmReview, 'id'>) => void
  incrementViewCount: (id: string) => void
  addCategory: (name: string, description: string) => void
  updateCategory: (id: string, name: string, description: string) => void
  deleteCategory: (id: string) => void
  addTag: (name: string) => void
  updateTag: (id: string, name: string) => void
  deleteTag: (id: string) => void

  // 양자 작업
  jobs: Job[]
  jobFilter: JobFilter
  jobViewMode: 'card' | 'list'
  jobSortBy: 'latest' | 'name' | 'status'
  setJobFilter: (filter: Partial<JobFilter>) => void
  setJobViewMode: (mode: 'card' | 'list') => void
  setJobSortBy: (sort: 'latest' | 'name' | 'status') => void
  submitJob: (algorithmId: string, params: Record<string, unknown>, workspaceId: string, userId: string, userName: string) => Job
  transitionJob: (jobId: string, toStatus: JobStatus) => void
  validateJobParams: (algorithmId: string, params: Record<string, unknown>) => ValidationResult
  addComment: (jobId: string, comment: Omit<JobComment, 'id' | 'thread'>) => void
  addEmoji: (jobId: string, commentId: string, emoji: string) => void

}

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      algorithms: MOCK_ALGORITHMS,
      categories: MOCK_CATEGORIES,
      tags: MOCK_TAGS,
      algorithmFilter: { category: '', sdk: '', authorId: '', sortBy: 'popular', keyword: '', status: 'all' },
      algorithmViewMode: 'card',

      setAlgorithmFilter: (filter) => set((s) => ({ algorithmFilter: { ...s.algorithmFilter, ...filter } })),
      setAlgorithmViewMode: (mode) => set({ algorithmViewMode: mode }),

      submitAlgorithm: (draft) => {
        const autoCheckResult = autoCheckAlgorithm(draft)
        const newAlgo: Algorithm = {
          id: `algo_${randomId()}`,
          title: draft.title ?? '제목 없음',
          description: draft.description ?? '',
          version: draft.version ?? '0.1.0',
          versions: [{ version: draft.version ?? '0.1.0', publishedAt: isoNow(), changelog: '초기 등록' }],
          sdk: draft.sdk ?? 'Qiskit',
          category: draft.category ?? '',
          tags: draft.tags ?? [],
          authorId: draft.authorId ?? '',
          status: 'pending',
          isRecommended: false,
          viewCount: 0,
          runCount: 0,
          rating: 0,
          ratingCount: 0,
          createdAt: isoNow(),
          publishedAt: null,
          executionType: draft.executionType ?? 'simulator',
          inputParams: draft.inputParams ?? [],
          outputParams: draft.outputParams ?? [],
          exampleCode: draft.exampleCode ?? '',
          codeAttached: draft.codeAttached ?? false,
          notebookId: draft.notebookId ?? null,
          autoCheckResult,
          usageHistory: [],
          reviews: [],
        }
        set((s) => ({ algorithms: [...s.algorithms, newAlgo] }))
      },

      approveAlgorithm: (id) => set((s) => ({
        algorithms: s.algorithms.map((a) => a.id === id ? { ...a, status: 'published' as AlgorithmStatus, publishedAt: isoNow() } : a),
      })),

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rejectAlgorithm: (id, _reason) => set((s) => ({
        algorithms: s.algorithms.map((a) => a.id === id ? { ...a, status: 'rejected' as AlgorithmStatus } : a),
      })),

      toggleActive: (id) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== id) return a
          const next: AlgorithmStatus = a.status === 'published' ? 'inactive' : 'published'
          return { ...a, status: next }
        }),
      })),

      setRecommended: (id, value) => set((s) => ({
        algorithms: s.algorithms.map((a) => a.id === id ? { ...a, isRecommended: value } : a),
      })),

      addReview: (algorithmId, review) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== algorithmId) return a
          const newReview = { ...review, id: `rev_${randomId()}` }
          const reviews = [...a.reviews, newReview]
          const rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          return { ...a, reviews, rating: Math.round(rating * 10) / 10, ratingCount: reviews.length }
        }),
      })),

      incrementViewCount: (id) => set((s) => ({
        algorithms: s.algorithms.map((a) => a.id === id ? { ...a, viewCount: a.viewCount + 1 } : a),
      })),

      addCategory: (name, description) => set((s) => ({
        categories: [...s.categories, { id: `cat_${randomId()}`, name, description, createdAt: isoNow() }],
      })),

      updateCategory: (id, name, description) => set((s) => ({
        categories: s.categories.map((c) => c.id === id ? { ...c, name, description } : c),
      })),

      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addTag: (name) => set((s) => ({
        tags: [...s.tags, { id: `tag_${randomId()}`, name, createdAt: isoNow() }],
      })),

      updateTag: (id, name) => set((s) => ({
        tags: s.tags.map((t) => t.id === id ? { ...t, name } : t),
      })),

      deleteTag: (id) => set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),

      // 작업
      jobs: MOCK_JOBS,
      jobFilter: { dateRange: null, status: 'all', sdk: '', workspaceId: '', keyword: '' },
      jobViewMode: 'list',
      jobSortBy: 'latest',

      setJobFilter: (filter) => set((s) => ({ jobFilter: { ...s.jobFilter, ...filter } })),
      setJobViewMode: (mode) => set({ jobViewMode: mode }),
      setJobSortBy: (sort) => set({ jobSortBy: sort }),

      submitJob: (algorithmId, params, workspaceId, userId, userName) => {
        const algo = get().algorithms.find((a) => a.id === algorithmId)
        const newJob: Job = {
          id: `job_${randomId()}`,
          title: `${algo?.title ?? algorithmId} — ${new Date().toLocaleDateString('ko-KR')}`,
          algorithmId,
          algorithmTitle: algo?.title ?? algorithmId,
          algorithmVersion: algo?.version ?? '1.0.0',
          workspaceId,
          userId,
          userName,
          userEmail: '',
          status: 'submitted',
          priority: 'normal',
          sdk: algo?.sdk ?? 'Qiskit',
          params,
          creditUsed: 0,
          executionTime: null,
          entrypoint: 'Composer',
          errorMitigation: 'None',
          gateCount1q: 0,
          gateCount2q: 0,
          circuit: '',
          provider: 'IBM',
          deviceName: 'ibm_brisbane',
          startedAt: null,
          submittedAt: isoNow(),
          completedAt: null,
          createdAt: isoNow(),
          resource: {
            qubits: (params['n_qubits'] as number) ?? 4,
            shots: (params['shots'] as number) ?? 1024,
            cpuPercent: [], memoryMB: [], gpuPercent: [], timestamps: [],
            peakCpu: 0, peakMemoryMB: 0, thresholdExceeded: false,
          },
          result: null,
          estimate: null,
          logs: [{ level: 'info', message: '작업이 큐에 추가되었습니다.', timestamp: isoNow() }],
          comments: [],
          changeHistory: [{ userId, action: '작업 제출', at: isoNow() }],
          validationResult: algo ? validateJobParams(algo, params) : null,
        }
        set((s) => ({ jobs: [newJob, ...s.jobs] }))
        return newJob
      },

      transitionJob: (jobId, toStatus) => set((s) => ({
        jobs: s.jobs.map((j) => {
          if (j.id !== jobId || !canTransition(j.status, toStatus)) return j
          const result = toStatus === 'done' ? simulateJobRun(j) : null
          return {
            ...j,
            status: toStatus,
            startedAt: toStatus === 'running' ? isoNow() : j.startedAt,
            completedAt: ['success', 'failed', 'cancelled'].includes(toStatus) ? isoNow() : j.completedAt,
            result: result ?? j.result,
            creditUsed: toStatus === 'done' ? Math.floor(Math.random() * 100) + 10 : j.creditUsed,
            changeHistory: [...j.changeHistory, { userId: 'system', action: toStatus, at: isoNow() }],
          }
        }),
      })),

      validateJobParams: (algorithmId, params) => {
        const algo = get().algorithms.find((a) => a.id === algorithmId)
        if (!algo) return { passed: false, errors: [{ field: 'algorithmId', message: '알고리즘을 찾을 수 없습니다.' }], recommendations: [] }
        return validateJobParams(algo, params)
      },

      addComment: (jobId, comment) => set((s) => ({
        jobs: s.jobs.map((j) => j.id === jobId
          ? { ...j, comments: [...j.comments, { ...comment, id: `cmt_${randomId()}`, thread: [] }] }
          : j),
      })),

      addEmoji: (jobId, commentId, emoji) => set((s) => ({
        jobs: s.jobs.map((j) => j.id === jobId
          ? { ...j, comments: j.comments.map((c) => c.id === commentId ? { ...c, emoji } : c) }
          : j),
      })),

    }),
    {
      name: 'qs:marketplace-v2',
      partialize: (s) => ({
        algorithms: s.algorithms,
        categories: s.categories,
        tags: s.tags,
        algorithmFilter: s.algorithmFilter,
        algorithmViewMode: s.algorithmViewMode,
        jobFilter: s.jobFilter,
        jobViewMode: s.jobViewMode,
        jobSortBy: s.jobSortBy,
      }),
    },
  ),
)
