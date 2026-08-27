import type { JobStatus } from './common'

export interface Job {
  id: string
  title: string
  algorithmId: string
  algorithmTitle: string
  algorithmVersion: string
  workspaceId: string
  userId: string
  userName: string
  userEmail: string
  provider: string
  deviceName: string
  status: JobStatus
  priority: 'high' | 'normal' | 'low'
  sdk: string
  params: Record<string, unknown>
  creditUsed: number
  executionTime: number | null
  entrypoint: string
  errorMitigation: string
  gateCount1q: number
  gateCount2q: number
  circuit: string
  startedAt: string | null
  submittedAt: string | null
  completedAt: string | null
  createdAt: string
  resource: JobResource
  result: JobResult | null
  estimate: JobEstimate | null
  logs: JobLog[]
  comments: JobComment[]
  changeHistory: JobChange[]
  validationResult: ValidationResult | null
}

export interface JobEstimate {
  id: string
  status: 'Active' | 'Expired' | 'Cancelled'
  requestedAt: string
  confirmedAt: string
  gateCount1q: number
  gateCount2q: number
  credits: number
  expiresAt: string
}

export interface JobResource {
  qubits: number
  shots: number
  cpuPercent: number[]
  memoryMB: number[]
  gpuPercent: number[]
  vramMB: number[]
  timestamps: string[]
  peakCpu: number
  peakMemoryMB: number
  peakVramMB: number
  thresholdExceeded: boolean
}

export interface JobResultTimings {
  total: number
  compression: number
  sample: number
  apply: number
  parse: number
}

export interface JobResult {
  simulator: string
  version: string
  totalSamples: number
  fidelity: number | null
  measurementCounts: Record<string, number>
  measurementProbabilities: Record<string, number>
  timings: JobResultTimings
  circuitDepth: number
  rawOutput: string
  accuracy?: number
}

export interface JobLog {
  level: 'info' | 'warn' | 'error'
  message: string
  timestamp: string
}

export interface EmojiReaction {
  emoji: string
  userIds: string[]
}

export interface JobComment {
  id: string
  userId: string
  content: string
  reactions: EmojiReaction[]
  createdAt: string
  replyToUserId?: string
  thread: JobComment[]
}

export interface JobChange {
  userId: string
  action: string
  at: string
}

export interface ValidationResult {
  passed: boolean
  errors: { field: string; message: string }[]
  recommendations: string[]
}
