import { create } from 'zustand'
import type { WorkspaceRole } from '@/types/common'
import type { Workspace } from '@/types/workspace'
import { MOCK_WORKSPACES } from '@/mocks/workspaces'
import { isoNow } from '@/lib/mock-utils'

interface WorkspaceStore {
  workspaces: Workspace[]
  activeWorkspaceId: string
  setActiveWorkspace: (id: string) => void
  inviteMember: (workspaceId: string, userId: string, role: WorkspaceRole) => void
  updateMemberRole: (workspaceId: string, userId: string, role: WorkspaceRole) => void
  removeMember: (workspaceId: string, userId: string) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  workspaces: MOCK_WORKSPACES,
  activeWorkspaceId: 'ws_1',

  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

  inviteMember: (workspaceId, userId, role) => set((s) => ({
    workspaces: s.workspaces.map((w) => w.id === workspaceId
      ? { ...w, members: [...w.members.filter((m) => m.userId !== userId), { userId, role, joinedAt: isoNow() }] }
      : w),
  })),

  updateMemberRole: (workspaceId, userId, role) => set((s) => ({
    workspaces: s.workspaces.map((w) => w.id === workspaceId
      ? { ...w, members: w.members.map((m) => m.userId === userId ? { ...m, role } : m) }
      : w),
  })),

  removeMember: (workspaceId, userId) => set((s) => ({
    workspaces: s.workspaces.map((w) => w.id === workspaceId
      ? { ...w, members: w.members.filter((m) => m.userId !== userId) }
      : w),
  })),
}))
