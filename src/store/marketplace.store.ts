import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Algorithm, AlgorithmCategory, AlgorithmReview, AlgorithmTag } from '@/types/algorithm'
import type { AlgorithmStatus, JobStatus, ServiceNotification } from '@/types/common'
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
  submitNewVersion: (algorithmId: string, draft: Pick<Algorithm, 'version' | 'description' | 'sdk' | 'category' | 'tags' | 'executionType' | 'inputParams' | 'outputParams' | 'exampleCode' | 'codeAttached' | 'notebookId' | 'codeSource' | 'fileName' | 'algorithmCode'>) => void
  updateAlgorithmMeta: (algorithmId: string, meta: Pick<Algorithm, 'title' | 'description' | 'sdk' | 'category' | 'tags' | 'executionType'>) => void
  saveDraftAlgorithm: (draft: Partial<Algorithm>) => void
  saveDraftVersion: (algorithmId: string, draft: Pick<Algorithm, 'version' | 'description' | 'sdk' | 'category' | 'tags' | 'executionType' | 'inputParams' | 'outputParams' | 'exampleCode' | 'codeAttached' | 'notebookId' | 'codeSource' | 'fileName' | 'algorithmCode'>) => void
  approveAlgorithm: (id: string) => void
  rejectAlgorithm: (id: string, reason: string) => void
  toggleActive: (id: string) => void
  withdrawAlgorithm: (id: string) => void
  deprecateVersion: (algorithmId: string, version: string) => void
  rollbackVersion: (algorithmId: string, version: string) => void
  setRecommended: (id: string, value: boolean) => void
  addReview: (algorithmId: string, review: Omit<AlgorithmReview, 'id'>) => void
  removeReview: (algorithmId: string, reviewId: string) => void
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
  addComment: (jobId: string, comment: Omit<JobComment, 'id' | 'thread' | 'reactions'>) => void
  addReply: (jobId: string, commentId: string, reply: Omit<JobComment, 'id' | 'thread' | 'reactions'>) => void
  toggleEmoji: (jobId: string, commentId: string, emoji: string, userId: string) => void
  toggleReplyEmoji: (jobId: string, commentId: string, replyId: string, emoji: string, userId: string) => void

  // 서비스 알림 (요구 251)
  notifications: ServiceNotification[]
  addNotification: (n: Omit<ServiceNotification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationsRead: (userId: string) => void
}

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      algorithms: MOCK_ALGORITHMS,
      categories: MOCK_CATEGORIES,
      tags: MOCK_TAGS,
      algorithmFilter: { category: '', sdk: '', authorId: '', sortBy: 'popular', keyword: '', status: 'all' },
      algorithmViewMode: 'card',
      notifications: [],

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
          updatedAt: isoNow(),
          publishedAt: null,
          executionType: draft.executionType ?? 'simulator',
          inputParams: draft.inputParams ?? [],
          outputParams: draft.outputParams ?? [],
          codeAttached: draft.codeAttached ?? false,
          notebookId: draft.notebookId ?? null,
          codeSource: draft.codeSource,
          fileName: draft.fileName,
          algorithmCode: draft.algorithmCode ?? '',
          exampleCode: draft.exampleCode,
          autoCheckResult,
          usageHistory: [],
          reviews: [],
          changeHistory: [{ userId: draft.authorId ?? '', action: '등록 요청 접수', at: isoNow() }],
        }
        set((s) => ({ algorithms: [...s.algorithms, newAlgo] }))
      },

      saveDraftAlgorithm: (draft) => {
        const autoCheckResult = autoCheckAlgorithm(draft)
        const newAlgo: Algorithm = {
          id: `algo_${randomId()}`,
          title: draft.title ?? '제목 없음',
          description: draft.description ?? '',
          version: draft.version ?? '0.1.0',
          versions: [{ version: draft.version ?? '0.1.0', publishedAt: isoNow(), changelog: '임시저장' }],
          sdk: draft.sdk ?? 'Qiskit',
          category: draft.category ?? '',
          tags: draft.tags ?? [],
          authorId: draft.authorId ?? '',
          status: 'draft',
          isRecommended: false,
          viewCount: 0,
          runCount: 0,
          rating: 0,
          ratingCount: 0,
          createdAt: isoNow(),
          updatedAt: isoNow(),
          publishedAt: null,
          executionType: draft.executionType ?? 'simulator',
          inputParams: draft.inputParams ?? [],
          outputParams: draft.outputParams ?? [],
          codeAttached: draft.codeAttached ?? false,
          notebookId: draft.notebookId ?? null,
          codeSource: draft.codeSource,
          fileName: draft.fileName,
          algorithmCode: draft.algorithmCode ?? '',
          exampleCode: draft.exampleCode,
          autoCheckResult,
          usageHistory: [],
          reviews: [],
          changeHistory: [{ userId: draft.authorId ?? '', action: '임시저장', at: isoNow() }],
        }
        set((s) => ({ algorithms: [...s.algorithms, newAlgo] }))
      },

      saveDraftVersion: (algorithmId, draft) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== algorithmId) return a
          return {
            ...a,
            updatedAt: isoNow(),
            changeHistory: [{ userId: a.authorId, action: `v${draft.version} 임시저장`, at: isoNow() }, ...a.changeHistory],
            version: draft.version,
            description: draft.description,
            sdk: draft.sdk,
            category: draft.category,
            tags: draft.tags,
            executionType: draft.executionType,
            inputParams: draft.inputParams,
            outputParams: draft.outputParams,
            exampleCode: draft.exampleCode,
            codeAttached: draft.codeAttached,
            notebookId: draft.notebookId,
            codeSource: draft.codeSource,
            fileName: draft.fileName,
            algorithmCode: draft.algorithmCode ?? '',
            status: 'draft' as const,
            rejectReason: undefined,
            rejectedAt: undefined,
            autoCheckResult: autoCheckAlgorithm(draft),
          }
        }),
      })),

      submitNewVersion: (algorithmId, draft) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== algorithmId) return a
          const newVersionEntry = { version: draft.version, publishedAt: isoNow(), changelog: `v${draft.version} 업데이트` }
          return {
            ...a,
            updatedAt: isoNow(),
            changeHistory: [{ userId: a.authorId, action: `v${draft.version} 새 버전 등록 요청`, at: isoNow() }, ...a.changeHistory],
            version: draft.version,
            description: draft.description,
            sdk: draft.sdk,
            category: draft.category,
            tags: draft.tags,
            executionType: draft.executionType,
            inputParams: draft.inputParams,
            outputParams: draft.outputParams,
            exampleCode: draft.exampleCode,
            codeAttached: draft.codeAttached,
            notebookId: draft.notebookId,
            codeSource: draft.codeSource,
            fileName: draft.fileName,
            algorithmCode: draft.algorithmCode ?? '',
            status: 'pending' as const,
            rejectReason: undefined,
            rejectedAt: undefined,
            versions: [newVersionEntry, ...a.versions],
            autoCheckResult: autoCheckAlgorithm(draft),
          }
        }),
      })),

      updateAlgorithmMeta: (algorithmId, meta) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== algorithmId) return a
          const updated = { ...a, ...meta, updatedAt: isoNow(), changeHistory: [{ userId: 'system', action: '메타데이터 편집', at: isoNow() }, ...a.changeHistory] }
          return { ...updated, autoCheckResult: autoCheckAlgorithm(updated) }
        }),
      })),

      approveAlgorithm: (id) => set((s) => {
        const algo = s.algorithms.find((a) => a.id === id)
        const newNotif: ServiceNotification = {
          id: `noti_${randomId()}`,
          userId: algo?.authorId ?? '',
          type: 'success',
          message: `${algo?.title ?? id} 승인 완료`,
          createdAt: isoNow(),
          read: false,
        }
        return {
          algorithms: s.algorithms.map((a) => a.id === id ? { ...a, status: 'published' as AlgorithmStatus, publishedAt: isoNow(), updatedAt: isoNow(), changeHistory: [{ userId: 'system', action: '승인 처리', at: isoNow() }, ...a.changeHistory] } : a),
          notifications: algo?.authorId ? [newNotif, ...s.notifications] : s.notifications,
        }
      }),

      rejectAlgorithm: (id, reason) => set((s) => {
        const algo = s.algorithms.find((a) => a.id === id)
        const shortReason = reason.length > 20 ? reason.slice(0, 20) + '…' : reason
        const newNotif: ServiceNotification = {
          id: `noti_${randomId()}`,
          userId: algo?.authorId ?? '',
          type: 'error',
          message: `${algo?.title ?? id} 반려 — ${shortReason}`,
          createdAt: isoNow(),
          read: false,
        }
        return {
          algorithms: s.algorithms.map((a) => a.id === id ? { ...a, status: 'rejected' as AlgorithmStatus, rejectReason: reason, rejectedAt: isoNow(), updatedAt: isoNow(), changeHistory: [{ userId: 'system', action: '반려 처리', at: isoNow() }, ...a.changeHistory] } : a),
          notifications: algo?.authorId ? [newNotif, ...s.notifications] : s.notifications,
        }
      }),

      withdrawAlgorithm: (id) => set((s) => ({
        algorithms: s.algorithms.map((a) =>
          a.id === id && a.status === 'pending'
            ? { ...a, status: 'draft' as AlgorithmStatus, updatedAt: isoNow(), changeHistory: [{ userId: 'system', action: '요청 취소', at: isoNow() }, ...a.changeHistory] }
            : a
        ),
      })),

      toggleActive: (id) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== id) return a
          const next: AlgorithmStatus = a.status === 'published' ? 'inactive' : 'published'
          const action = next === 'published' ? '활성화' : '비활성화'
          return { ...a, status: next, updatedAt: isoNow(), changeHistory: [{ userId: 'system', action, at: isoNow() }, ...a.changeHistory] }
        }),
      })),

      deprecateVersion: (algorithmId, version) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== algorithmId) return a
          return {
            ...a,
            versions: a.versions.map((v) =>
              v.version === version ? { ...v, deprecated: true } : v
            ),
          }
        }),
      })),

      rollbackVersion: (algorithmId, version) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== algorithmId) return a
          return { ...a, version, updatedAt: isoNow(), changeHistory: [{ userId: 'system', action: `v${version}으로 롤백`, at: isoNow() }, ...a.changeHistory] }
        }),
      })),

      setRecommended: (id, value) => set((s) => ({
        algorithms: s.algorithms.map((a) => a.id === id ? { ...a, isRecommended: value, updatedAt: isoNow(), changeHistory: [{ userId: 'system', action: value ? '추천 지정' : '추천 해제', at: isoNow() }, ...a.changeHistory] } : a),
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

      removeReview: (algorithmId, reviewId) => set((s) => ({
        algorithms: s.algorithms.map((a) => {
          if (a.id !== algorithmId) return a
          const reviews = a.reviews.filter((r) => r.id !== reviewId)
          const rating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
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
            cpuPercent: [], memoryMB: [], gpuPercent: [], vramMB: [], timestamps: [],
            peakCpu: 0, peakMemoryMB: 0, peakVramMB: 0, thresholdExceeded: false,
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
          ? { ...j, comments: [...j.comments, { ...comment, id: `cmt_${randomId()}`, reactions: [], thread: [] }] }
          : j),
      })),

      addReply: (jobId, commentId, reply) => set((s) => ({
        jobs: s.jobs.map((j) => j.id === jobId
          ? { ...j, comments: j.comments.map((c) => c.id === commentId
              ? { ...c, thread: [...c.thread, { ...reply, id: `cmt_${randomId()}`, reactions: [], thread: [] }] }
              : c) }
          : j),
      })),

      toggleEmoji: (jobId, commentId, emoji, userId) => set((s) => ({
        jobs: s.jobs.map((j) => j.id === jobId
          ? { ...j, comments: j.comments.map((c) => {
              if (c.id !== commentId) return c
              const existing = c.reactions.find((r) => r.emoji === emoji)
              let reactions
              if (!existing) {
                reactions = [...c.reactions, { emoji, userIds: [userId] }]
              } else if (existing.userIds.includes(userId)) {
                const updated = existing.userIds.filter((id) => id !== userId)
                reactions = updated.length === 0
                  ? c.reactions.filter((r) => r.emoji !== emoji)
                  : c.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: updated } : r)
              } else {
                reactions = c.reactions.map((r) => r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r)
              }
              return { ...c, reactions }
            })}
          : j),
      })),

      toggleReplyEmoji: (jobId, commentId, replyId, emoji, userId) => set((s) => ({
        jobs: s.jobs.map((j) => j.id === jobId
          ? { ...j, comments: j.comments.map((c) => {
              if (c.id !== commentId) return c
              return { ...c, thread: c.thread.map((r) => {
                if (r.id !== replyId) return r
                const existing = r.reactions.find((rx) => rx.emoji === emoji)
                let reactions
                if (!existing) {
                  reactions = [...r.reactions, { emoji, userIds: [userId] }]
                } else if (existing.userIds.includes(userId)) {
                  const updated = existing.userIds.filter((id) => id !== userId)
                  reactions = updated.length === 0
                    ? r.reactions.filter((rx) => rx.emoji !== emoji)
                    : r.reactions.map((rx) => rx.emoji === emoji ? { ...rx, userIds: updated } : rx)
                } else {
                  reactions = r.reactions.map((rx) => rx.emoji === emoji ? { ...rx, userIds: [...rx.userIds, userId] } : rx)
                }
                return { ...r, reactions }
              })}
            })
          }
          : j),
      })),

      addNotification: (n) => set((s) => ({
        notifications: [{ ...n, id: `noti_${randomId()}`, createdAt: isoNow(), read: false }, ...s.notifications],
      })),

      markNotificationsRead: (userId) => set((s) => ({
        notifications: s.notifications.map((n) => n.userId === userId ? { ...n, read: true } : n),
      })),

    }),
    {
      name: 'qs:marketplace-v3',
      partialize: (s) => ({
        algorithms: s.algorithms,
        categories: s.categories,
        tags: s.tags,
        algorithmFilter: s.algorithmFilter,
        algorithmViewMode: s.algorithmViewMode,
        jobFilter: s.jobFilter,
        jobViewMode: s.jobViewMode,
        jobSortBy: s.jobSortBy,
        notifications: s.notifications,
      }),
    },
  ),
)
