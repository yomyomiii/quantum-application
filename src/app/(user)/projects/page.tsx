'use client'

import Link from 'next/link'
import { useWorkspaceStore } from '@/store/workspace.store'
import { usePersonaStore } from '@/store/persona.store'

export default function ProjectsPage() {
  const { workspaces } = useWorkspaceStore()
  const { currentUserId } = usePersonaStore()

  const myWorkspaces = workspaces.filter((ws) =>
    ws.ownerId === currentUserId || ws.members.some((m) => m.userId === currentUserId)
  )

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="mb-5 text-[18px] font-semibold">프로젝트</h1>
      <div className="space-y-3">
        {myWorkspaces.map((ws) => {
          const pct = Math.round((ws.usedCredits / ws.credits) * 100)
          return (
            <Link
              key={ws.id}
              href={`/projects/${ws.id}`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/40 hover:shadow-md transition-all"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-[14px] font-semibold">{ws.name}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">{ws.description}</p>
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)]">{ws.members.length}명</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[var(--muted-foreground)]">
                <span>{ws.usedCredits.toLocaleString()} / {ws.credits.toLocaleString()} cr</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--muted)]">
                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
                </div>
                <span>{pct}%</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
