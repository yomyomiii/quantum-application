import type { NotebookStatus } from './common'

export interface Notebook {
  id: string
  title: string
  workspaceId: string
  userId: string
  status: NotebookStatus
  cells: NotebookCell[]
  plugins: NotebookPlugin[]
  kernelPool: KernelPoolInfo
  collaborators: string[]
  checkpoints: NotebookCheckpoint[]
  createdAt: string
  updatedAt: string
}

export interface NotebookCell {
  id: string
  type: 'code' | 'markdown'
  source: string
  output: CellOutput[]
  comments: CellComment[]
  executionCount: number | null
  resources: { cpu: number; memoryMB: number; gpuPercent: number }
}

export interface CellOutput {
  type: 'text' | 'image' | 'error'
  data: string
}

export interface CellComment {
  id: string
  userId: string
  content: string
  emoji?: string
  createdAt: string
}

export interface NotebookPlugin {
  name: string
  version: string
  type: 'pennylane' | 'cuda-q' | 'other'
  status: 'connected' | 'error' | 'disconnected'
  driverVersion: string
  errorLog?: string
}

export interface KernelPoolInfo {
  poolSize: number
  idleKernels: number
  startupLatencyMs: number
}

export interface NotebookCheckpoint {
  id: string
  label: string
  snapshot: string
  createdAt: string
}

export interface QuantumCircuit {
  id: string
  notebookId: string
  nodes: CircuitNode[]
  edges: CircuitEdge[]
  checkpoints: CircuitCheckpoint[]
  simulationResult: SimulationResult | null
  queueInfo: QueueInfo | null
}

export interface CircuitNode {
  id: string
  type: 'gate' | 'custom'
  gateType: string
  qubit: number
  position: { x: number; y: number }
  validationError?: string
}

export interface CircuitEdge {
  id: string
  source: string
  target: string
}

export interface CircuitCheckpoint {
  id: string
  label: string
  nodes: CircuitNode[]
  edges: CircuitEdge[]
  createdAt: string
}

export interface SimulationResult {
  stateVector: Array<[number, number]>
  probDistribution: Record<string, number>
  heatmapData: number[][]
  executionTimeMs: number
}

export interface QueueInfo {
  estimatedMs: number
  position: number
  availableResources: string[]
}

export interface Tutorial {
  id: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: TutorialStep[]
  prerequisites: string[]
}

export interface TutorialStep {
  id: string
  order: number
  title: string
  description: string
  circuit?: QuantumCircuit
  quiz?: TutorialQuiz
  recommendedNext?: string[]
}

export interface TutorialQuiz {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface TutorialProgress {
  userId: string
  tutorialId: string
  completedSteps: string[]
  quizResults: Record<string, boolean>
  completedAt: string | null
}
