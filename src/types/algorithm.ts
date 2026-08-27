import type { AlgorithmStatus } from './common'

export interface Algorithm {
  id: string
  title: string
  description: string
  version: string
  versions: AlgorithmVersion[]
  sdk: 'Qiskit' | 'Pennylane' | 'CUDA-Q' | 'Cirq'
  category: string
  tags: string[]
  authorId: string
  workspaceId?: string
  status: AlgorithmStatus
  isRecommended: boolean
  viewCount: number
  runCount: number
  rating: number
  ratingCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  executionType: 'simulator' | 'hardware' | 'hybrid'
  inputParams: AlgorithmParam[]
  outputParams: AlgorithmParam[]
  codeAttached: boolean
  notebookId: string | null
  codeSource?: 'file' | 'direct' | 'notebook'
  fileName?: string
  algorithmCode?: string
  exampleCode?: string
  autoCheckResult: AutoCheckResult
  usageHistory: AlgorithmUsage[]
  reviews: AlgorithmReview[]
  changeHistory: AlgorithmChange[]
  rejectReason?: string
  rejectedAt?: string
}

export interface AlgorithmChange {
  userId: string
  action: string
  at: string
}

export interface AlgorithmVersion {
  version: string
  publishedAt: string
  changelog: string
  deprecated?: boolean
}

export interface AlgorithmParam {
  name: string
  type: 'number' | 'string' | 'boolean' | 'array'
  required: boolean
  description: string
  defaultValue?: unknown
}

export interface AutoCheckResult {
  sdk: 'pass' | 'warn' | 'fail'
  description: 'pass' | 'warn' | 'fail'
  category: 'pass' | 'warn' | 'fail'
  executionType: 'pass' | 'warn' | 'fail'
  overall: 'pass' | 'warn' | 'fail'
  checkedAt: string
}

export interface AlgorithmUsage {
  userId: string
  jobId: string
  usedAt: string
  result: 'success' | 'failed'
}

export interface AlgorithmReview {
  id: string
  userId: string
  rating: number
  content: string
  createdAt: string
}

export interface AlgorithmCategory {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface AlgorithmTag {
  id: string
  name: string
  createdAt: string
}
