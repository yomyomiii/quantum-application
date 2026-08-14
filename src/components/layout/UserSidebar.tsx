'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FolderKanban, Server, Cpu, Layers,
  CreditCard, ClipboardList, Store, BookOpen, ArrowLeftRight, ChevronsUpDown, Lock, Check,
} from 'lucide-react'
import { cn } from '@/components/ui/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useWorkspaceStore } from '@/store/workspace.store'
import { usePersonaStore } from '@/store/persona.store'

type Phase = 'Phase 1' | 'Phase 2' | 'Phase 3'

type ChildItem =
  | { label: string; href: string }
  | { label: string; locked: true; phase?: Phase }

type NavItem =
  | { kind: 'link'; label: string; href: string; icon: React.ElementType }
  | { kind: 'project-link' }
  | { kind: 'group'; label: string; icon: React.ElementType; activePrefixes: string[]; children: ChildItem[] }
  | { kind: 'locked'; label: string; icon: React.ElementType; phase?: Phase; children?: ChildItem[] }
  | { kind: 'divider' }
  | { kind: 'section'; label: string }

const NAV_STATIC: NavItem[] = [
  { kind: 'locked', label: '대시보드', icon: LayoutDashboard, phase: 'Phase 3' },
  { kind: 'project-link' },
  {
    kind: 'locked', label: '양자 서버', icon: Server, phase: 'Phase 2',
    children: [
      { label: '노트북 (개발환경)', locked: true, phase: 'Phase 2' },
      { label: '컴포저', locked: true, phase: 'Phase 2' },
    ],
  },
  { kind: 'link', label: '양자 작업', href: '/jobs', icon: Cpu },
  { kind: 'locked', label: '양자 자원', icon: Layers },
  { kind: 'locked', label: '크레딧 내역', icon: CreditCard, phase: 'Phase 2' },
  {
    kind: 'locked', label: '요청 이력', icon: ClipboardList,
    children: [
      { label: '크레딧 변경 요청 이력', locked: true },
      { label: '자원 변경 요청 이력', locked: true },
    ],
  },
  { kind: 'divider' },
  {
    kind: 'group', label: '마켓 플레이스', icon: Store,
    activePrefixes: ['/marketplace'],
    children: [
      { label: '탐색', href: '/marketplace' },
      { label: '내 양자 알고리즘', href: '/marketplace/my' },
    ],
  },
  { kind: 'locked', label: '튜토리얼', icon: BookOpen, phase: 'Phase 2' },
]

function PhaseBadge({ phase }: { phase?: Phase }) {
  if (phase) {
    return <span className="ml-auto shrink-0 text-[10px] text-[var(--muted-foreground)]">{phase}</span>
  }
  return <Lock size={11} className="ml-auto shrink-0" />
}

function DoneIcon() {
  return (
    <span className="ml-auto shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e]">
      <Check size={9} color="white" strokeWidth={2.5} />
    </span>
  )
}

function LockedChild({ label, phase }: { label: string; phase?: Phase }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] cursor-not-allowed select-none text-[var(--muted-foreground)]">
      <span className="flex-1 truncate">{label}</span>
      <PhaseBadge phase={phase} />
    </div>
  )
}

export function UserSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore()
  const { setWorkspace } = usePersonaStore()

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0]
  const projectHref = `/projects/${activeWorkspaceId}`

  return (
    <aside className="fixed left-0 top-10 flex h-[calc(100vh-40px)] w-[240px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      {/* 프로젝트 전환 (최상단) */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex w-full items-center gap-2 border-b border-[var(--border)] px-3 py-2.5 text-[13px] font-medium hover:bg-[var(--accent)] transition-colors">
            <FolderKanban size={14} className="shrink-0 text-[var(--primary)]" />
            <span className="flex-1 truncate text-left">{activeWs?.name ?? '프로젝트 선택'}</span>
            <ChevronsUpDown size={12} className="shrink-0 text-[var(--muted-foreground)]" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={0} className="w-[204px] p-1">
          <div className="mb-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            내 프로젝트
          </div>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => { setActiveWorkspace(ws.id); setWorkspace(ws.id) }}
              className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-left hover:bg-[var(--accent)] transition-colors ${ws.id === activeWorkspaceId ? 'font-semibold text-[var(--primary)]' : ''}`}
            >
              <span className="flex-1 truncate">{ws.name}</span>
              {ws.id === activeWorkspaceId && <span className="text-[10px] text-[var(--primary)]">●</span>}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV_STATIC.map((item, i) => {
          if (item.kind === 'project-link') {
            const active = pathname === projectHref || pathname.startsWith(projectHref + '/')
            return (
              <Link
                key="project-link"
                href={projectHref}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-[var(--primary-10)] text-[var(--primary)]'
                    : 'text-[var(--sidebar-foreground)] hover:bg-[var(--accent)]',
                )}
              >
                <FolderKanban size={15} className="shrink-0" />
                <span className="flex-1 truncate">프로젝트(워크스페이스)</span>
                <DoneIcon />
              </Link>
            )
          }

          if (item.kind === 'divider') {
            return <div key={i} className="my-2 border-t border-[var(--border)]" />
          }

          if (item.kind === 'section') {
            return (
              <div key={i} className="px-3 pt-1.5 pb-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] opacity-50">
                {item.label}
              </div>
            )
          }

          if (item.kind === 'locked') {
            const Icon = item.icon
            return (
              <div key={item.label} className="opacity-40 cursor-not-allowed select-none">
                <div className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px]">
                  <Icon size={15} className="shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <PhaseBadge phase={item.phase} />
                </div>
                {item.children && (
                  <div className="ml-3 pl-4 border-l border-[var(--border)]">
                    {item.children.map((child) => (
                      <LockedChild key={child.label} label={child.label} phase={'locked' in child ? child.phase : undefined} />
                    ))}
                  </div>
                )}
              </div>
            )
          }

          if (item.kind === 'group') {
            const Icon = item.icon
            const active = item.activePrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
            const implementedChildren = item.children.filter((c): c is { label: string; href: string } => !('locked' in c))
            const bestMatchHref = implementedChildren
              .filter((c) => pathname === c.href || pathname.startsWith(c.href + '/'))
              .sort((a, b) => b.href.length - a.href.length)[0]?.href
            return (
              <div key={item.label}>
                <div className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium',
                  active ? 'text-[var(--primary)]' : 'text-[var(--sidebar-foreground)]',
                )}>
                  <Icon size={15} className="shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {implementedChildren.length > 0 && <DoneIcon />}
                </div>
                <div className="ml-3 pl-4 border-l border-[var(--border)]">
                  {item.children.map((child) => {
                    if ('locked' in child && child.locked) {
                      return <LockedChild key={child.label} label={child.label} phase={child.phase} />
                    }
                    const href = (child as { href: string }).href
                    const childActive = href === bestMatchHref
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          'flex items-center rounded-md px-3 py-1.5 text-[12px] transition-colors',
                          childActive
                            ? 'font-semibold text-[var(--primary)] bg-[var(--primary-10)]'
                            : 'text-[var(--foreground)] opacity-60 hover:opacity-100 hover:bg-[var(--accent)]',
                        )}
                      >
                        <span className="flex-1 truncate">{child.label}</span>
                        <DoneIcon />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          }

          // kind === 'link'
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                active
                  ? 'bg-[var(--primary-10)] text-[var(--primary)]'
                  : 'text-[var(--sidebar-foreground)] hover:bg-[var(--accent)]',
              )}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              <DoneIcon />
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-2">
        <button
          onClick={() => router.push('/marketplace/requests')}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[12px] font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeftRight size={14} className="shrink-0" />
          어드민 콘솔로 전환
        </button>
      </div>
    </aside>
  )
}
