import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Persona } from '@/types/common'

interface PersonaStore {
  currentPersona: Persona
  currentUserId: string
  currentWorkspaceId: string
  setPersona: (persona: Persona, userId: string) => void
  setWorkspace: (workspaceId: string) => void
}

export const usePersonaStore = create<PersonaStore>()(
  persist(
    (set) => ({
      currentPersona: 'user',
      currentUserId: 'user_1',
      currentWorkspaceId: 'ws_1',
      setPersona: (persona, userId) => set({ currentPersona: persona, currentUserId: userId }),
      setWorkspace: (workspaceId) => set({ currentWorkspaceId: workspaceId }),
    }),
    { name: 'qs:persona' },
  ),
)
