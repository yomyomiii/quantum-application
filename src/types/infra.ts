export interface HardwareStatus {
  id: string
  name: string
  status: 'normal' | 'warning' | 'error'
  temperature?: string
  errorRate?: number
  detail: string
  lastCheckedAt: string
}

export interface PerformanceMetric {
  timestamp: string
  qubitCount: number
  quantumVolume: number
  gateFidelity: number
  t1: number
  t2: number
}

export interface ResourceUsageStat {
  date: string
  projectId: string
  userId: string
  cpuHours: number
  gpuHours: number
  memoryGBHours: number
  jobCount: number
}

export interface AnomalyEvent {
  id: string
  severity: 'critical' | 'warning' | 'info'
  component: string
  message: string
  detectedAt: string
  resolvedAt: string | null
  actionTaken: string | null
}

export interface SchedulerConfig {
  pureQuantumQueueEnabled: boolean
  hybridQueueEnabled: boolean
  backfillEnabled: boolean
  priorityRules: PriorityRule[]
  maxConcurrentJobs: number
}

export interface PriorityRule {
  condition: string
  priority: 'high' | 'normal' | 'low'
}

export interface NotificationChannel {
  id: string
  type: 'slack' | 'email'
  name: string
  config: SlackChannelConfig | EmailChannelConfig
  enabledEvents: NotificationEvent[]
  isActive: boolean
}

export type NotificationEvent =
  | 'system_error'
  | 'threshold_exceeded'
  | 'deploy_complete'
  | 'job_failed'
  | 'job_complete'

export interface SlackChannelConfig {
  webhookUrl: string
}

export interface EmailChannelConfig {
  recipients: string[]
}

export interface BetaMetrics {
  activeSessions: number
  dau: number
  wau: number
  dauHistory: { date: string; count: number }[]
  totalAlgorithmRuns: number
}
