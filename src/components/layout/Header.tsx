'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, Settings, User, Key, LogOut, Search, Command } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Command as CommandPrimitive, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import { usePersonaStore } from '@/store/persona.store'

const typeIcon: Record<string, string> = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' }

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export function Header() {
  const router = useRouter()
  const { activeWorkspaceId } = useWorkspaceStore()
  const { currentUserId } = usePersonaStore()
  const [cmdOpen, setCmdOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { algorithms, notifications, markNotificationsRead } = useMarketplaceStore()

  const myNotifs = notifications.filter((n) => n.userId === currentUserId)
  const unreadCount = myNotifs.filter((n) => !n.read).length

  // Cmd+K 키보드 단축키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex h-10 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4">
        {/* 로고 */}
        <span className="text-[13px] font-bold tracking-tight text-[var(--primary)] select-none whitespace-nowrap">
          양자활용체계
        </span>

        <div className="flex-1" />

        {/* Global 검색 (알림 왼쪽) */}
        <button
          onClick={() => setCmdOpen(true)}
          className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-[12px] text-[var(--muted-foreground)] hover:border-[var(--primary)] transition-colors w-[160px]"
        >
          <Search size={13} />
          <span>검색...</span>
          <span className="ml-auto flex items-center gap-0.5 text-[10px]">
            <kbd className="rounded bg-[var(--border)] px-1">⌘</kbd>
            <kbd className="rounded bg-[var(--border)] px-1">K</kbd>
          </span>
        </button>

        {/* 알림 벨 */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <button className="relative flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--accent)] transition-colors">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0" onOpenAutoFocus={() => { if (unreadCount > 0) markNotificationsRead(currentUserId) }}>
            <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
              <span className="text-[13px] font-semibold">알림</span>
              {unreadCount > 0 && <span className="text-[11px] text-[var(--primary)]">읽지 않음 {unreadCount}</span>}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {myNotifs.length === 0 ? (
                <p className="px-3 py-4 text-center text-[12px] text-[var(--muted-foreground)]">알림이 없습니다.</p>
              ) : myNotifs.map((n) => (
                <div key={n.id} className={`flex gap-2.5 px-3 py-2.5 text-[12px] border-b border-[var(--border)] last:border-0 ${!n.read ? 'bg-[var(--primary)]/5' : ''}`}>
                  <span>{typeIcon[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{relativeTime(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* 아바타 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-white hover:opacity-90 transition-opacity">
              나
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User size={14} /> 내 프로필
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/projects/${activeWorkspaceId}`} className="flex items-center gap-2">
                <ChevronDown size={14} /> 내 프로젝트
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/api-keys" className="flex items-center gap-2">
                <Key size={14} /> 내 API키
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex items-center gap-2">
                <Settings size={14} /> 계정 설정
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Bell size={14} /> 알림 설정
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[var(--destructive)]">
              <LogOut size={14} className="mr-2" /> 로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Cmd+K 팔레트 */}
      <Dialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <DialogContent className="p-0 max-w-lg overflow-hidden">
          <CommandPrimitive>
            <CommandInput placeholder="검색 또는 명령어 입력..." />
            <CommandList className="max-h-80">
              <CommandEmpty>결과가 없습니다.</CommandEmpty>
              <CommandGroup heading="양자 알고리즘">
                {algorithms.filter((a) => a.status === 'published').slice(0, 5).map((a) => (
                  <CommandItem key={a.id} onSelect={() => { router.push(`/marketplace/${a.id}`); setCmdOpen(false) }}>
                    <Search size={13} className="mr-2 text-[var(--muted-foreground)]" />
                    {a.title}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="바로가기">
                {[
                  { label: '양자 작업 목록', href: '/jobs' },
                  { label: '마켓 플레이스', href: '/marketplace' },
                  { label: '내 양자 알고리즘', href: '/marketplace/my' },
                  { label: '프로젝트 정보', href: `/projects/${activeWorkspaceId}` },
                ].map((item) => (
                  <CommandItem key={item.href} onSelect={() => { router.push(item.href); setCmdOpen(false) }}>
                    <Command size={13} className="mr-2 text-[var(--muted-foreground)]" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandPrimitive>
        </DialogContent>
      </Dialog>
    </>
  )
}
