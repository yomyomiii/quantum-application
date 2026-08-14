'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, ClipboardList, Monitor, Activity,
  Server, Store, BarChart3, FileText, History, Settings, ArrowLeftRight, Lock, Check,
} from 'lucide-react'
import { cn } from '@/components/ui/utils'

type Phase = 'Phase 1' | 'Phase 2' | 'Phase 3'

type ChildItem =
  | { label: string; href: string }
  | { label: string; locked: true; phase?: Phase }

type NavItem =
  | { kind: 'group'; label: string; icon: React.ElementType; activePrefixes: string[]; children: ChildItem[] }
  | { kind: 'locked'; label: string; icon: React.ElementType; phase?: Phase; children?: ChildItem[] }

const NAV: NavItem[] = [
  { kind: 'locked', label: '대시보드', icon: LayoutDashboard, phase: 'Phase 3' },
  {
    kind: 'locked', label: '조직 관리', icon: Users,
    children: [
      { label: '사용자 관리', locked: true },
      { label: '프로젝트(워크스페이스) 관리', locked: true, phase: 'Phase 2' },
    ],
  },
  {
    kind: 'group', label: '요청 관리', icon: ClipboardList,
    activePrefixes: ['/marketplace/requests'],
    children: [
      { label: '프로젝트 생성 요청', locked: true },
      { label: '크레딧 변경 요청', locked: true },
      { label: '자원 변경 요청', locked: true },
      { label: '양자 알고리즘 등록 요청', href: '/marketplace/requests' },
    ],
  },
  {
    kind: 'locked', label: '노트북 관리', icon: Monitor, phase: 'Phase 2',
    children: [
      { label: '노트북 (개발환경) 관리', locked: true, phase: 'Phase 2' },
      { label: '노트북 이미지 관리', locked: true, phase: 'Phase 2' },
      { label: '노트북 유형 관리', locked: true },
    ],
  },
  { kind: 'locked', label: '작업 관리', icon: Activity, phase: 'Phase 3' },
  {
    kind: 'locked', label: '자원 관리', icon: Server,
    children: [
      { label: '통합 모니터링', locked: true, phase: 'Phase 3' },
      { label: '시스템 상태', locked: true, phase: 'Phase 3' },
      { label: '양자 자원 이상 탐지', locked: true, phase: 'Phase 3' },
    ],
  },
  {
    kind: 'group', label: '마켓 플레이스 관리', icon: Store,
    activePrefixes: ['/marketplace/algorithms', '/marketplace/categories', '/marketplace/tags'],
    children: [
      { label: '양자 알고리즘 관리', href: '/marketplace/algorithms' },
      { label: '양자 알고리즘 카테고리 관리', href: '/marketplace/categories' },
      { label: '양자 알고리즘 태그 관리', href: '/marketplace/tags' },
    ],
  },
  {
    kind: 'group', label: '통계', icon: BarChart3,
    activePrefixes: ['/stats'],
    children: [
      { label: '양자 자원', locked: true, phase: 'Phase 3' },
      { label: '양자 알고리즘', href: '/stats/algorithms' },
    ],
  },
  {
    kind: 'locked', label: '콘텐츠 관리', icon: FileText,
    children: [
      { label: '게시판 관리', locked: true },
      { label: '게시글 관리', locked: true },
      { label: '문서 관리', locked: true, phase: 'Phase 2' },
      { label: '약관 관리', locked: true },
    ],
  },
  {
    kind: 'locked', label: '시스템 이력 조회', icon: History,
    children: [
      { label: '크레딧 내역', locked: true },
      { label: '양자 자원 장애 이력', locked: true },
      { label: '사용자 로그인 이력', locked: true },
      { label: '서비스 알림 이력', locked: true },
      { label: '메일 알림 이력', locked: true },
      { label: '양자 알고리즘 사용 이력', locked: true, phase: 'Phase 1' },
    ],
  },
  {
    kind: 'locked', label: '기본 설정', icon: Settings,
    children: [
      { label: '회원가입 및 로그인 관리', locked: true },
      { label: '비밀번호 관리', locked: true },
      { label: '계정 잠금 관리', locked: true },
      { label: '노트북 (개발환경) 정책 관리', locked: true },
      { label: '크레딧 정책 관리', locked: true },
      { label: '메시지 템플릿 관리', locked: true, phase: 'Phase 2' },
      { label: '서버 주소 관리', locked: true },
      { label: '라이선스 정책 관리', locked: true, phase: 'Phase 1' },
    ],
  },
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

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="fixed left-0 top-10 flex h-[calc(100vh-40px)] w-[240px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map((item) => {
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

          // kind === 'group'
          const Icon = item.icon
          const active = item.activePrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
          const implementedChildren = item.children.filter((c): c is { label: string; href: string } => !('locked' in c))
          // 형제 중 가장 구체적으로 매칭되는 href만 활성화 (prefix 중복 방지)
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
                    return (
                      <div key={child.label} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] cursor-not-allowed select-none opacity-40">
                        <span className="flex-1 truncate">{child.label}</span>
                        <PhaseBadge phase={child.phase} />
                      </div>
                    )
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
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-2">
        <button
          onClick={() => router.push('/jobs')}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[12px] font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeftRight size={14} className="shrink-0" />
          사용자 콘솔로 전환
        </button>
      </div>
    </aside>
  )
}
