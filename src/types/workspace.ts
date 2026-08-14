import type { WorkspaceRole } from './common'

export interface Workspace {
  id: string
  name: string
  description: string
  ownerId: string
  members: WorkspaceMember[]
  credits: number
  usedCredits: number
  createdAt: string
  lastAccessedAt: string
}

export interface WorkspaceMember {
  userId: string
  role: WorkspaceRole
  joinedAt: string
}
