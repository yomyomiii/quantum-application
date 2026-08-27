export type Phase = 'phase1' | 'phase2' | 'phase3'

export interface ServiceNotification {
  id: string
  userId: string
  type: 'success' | 'info' | 'warning' | 'error'
  message: string
  createdAt: string
  read: boolean
}
export type AlgorithmStatus = 'draft' | 'pending' | 'rejected' | 'published' | 'inactive'
export type JobStatus = 'initiated' | 'estimate' | 'submitted' | 'running' | 'done' | 'failed' | 'cancelled'
export type WorkspaceRole = 'owner' | 'admin' | 'member'
export type NotebookStatus = 'idle' | 'running' | 'error' | 'stopped'
export type RequestType = 'project_create' | 'credit_change' | 'resource_change' | 'algo_register' | 'algo_report'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type Persona = 'user' | 'admin'
