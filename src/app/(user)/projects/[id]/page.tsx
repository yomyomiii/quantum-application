'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useWorkspaceStore } from '@/store/workspace.store'
import { usePersonaStore } from '@/store/persona.store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import type { WorkspaceRole } from '@/types/common'

interface Props { params: Promise<{ id: string }> }

const INVITE_ROLES: { value: WorkspaceRole; label: string; desc: string }[] = [
  { value: 'admin', label: '편집', desc: '셀 실행·편집·댓글 가능' },
  { value: 'viewer', label: '읽기 전용', desc: '조회·댓글만 가능' },
]

export default function ProjectDetailPage({ params }: Props) {
  const { id } = use(params)
  const { workspaces, updateMemberRole, inviteMember } = useWorkspaceStore()
  const { currentUserId } = usePersonaStore()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('admin')

  const ws = workspaces.find((w) => w.id === id)

  if (!ws) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-[15px] font-semibold">프로젝트를 찾을 수 없습니다</p>
        <Link href="/projects" className="mt-4 text-[13px] text-[var(--primary)] hover:underline">목록으로</Link>
      </div>
    )
  }

  const pct = Math.round((ws.usedCredits / ws.credits) * 100)
  const isOwner = ws.ownerId === currentUserId

  function handleInvite() {
    if (!inviteEmail.trim() || !ws) return
    const fakeUserId = `user_invite_${Date.now()}`
    inviteMember(ws.id, fakeUserId, inviteRole)
    toast.success('초대 완료')
    setInviteEmail('')
    setInviteOpen(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">프로젝트 정보</h1>
        <div className="flex gap-2">
          {isOwner && (
            <button
              onClick={() => toast.error('삭제 기능은 준비 중입니다.')}
              className="flex items-center gap-1.5 rounded-md border border-[var(--destructive)]/40 bg-[var(--card)] px-3 py-1.5 text-[13px] text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
            >
              <Trash2 size={13} /> 삭제
            </button>
          )}
        </div>
      </div>

      {/* 기본 정보 카드 */}
      <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="mb-3 text-[13px] font-semibold">기본 정보</p>
        <div className="grid grid-cols-[120px_1fr] gap-y-2.5 text-[13px]">
          <span className="text-[var(--muted-foreground)]">이름</span>
          <span className="font-medium">{ws.name}</span>
          <span className="text-[var(--muted-foreground)]">설명</span>
          <span>{ws.description}</span>
          <span className="text-[var(--muted-foreground)]">소유자</span>
          <span>{ws.ownerId}</span>
          <span className="text-[var(--muted-foreground)]">생성일</span>
          <span>{ws.createdAt.slice(0, 10)}</span>
        </div>
      </div>

      {/* 크레딧 카드 */}
      <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="mb-3 text-[13px] font-semibold">크레딧</p>
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="text-[var(--muted-foreground)]">사용량</span>
          <span>{ws.usedCredits.toLocaleString()} / {ws.credits.toLocaleString()} cr ({pct}%)</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--muted)]">
          <div
            className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-[var(--destructive)]' : 'bg-[var(--primary)]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* 멤버 섹션 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[14px] font-semibold">멤버 ({ws.members.length}명)</p>
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-[13px] text-white hover:opacity-90 transition-opacity"
          >
            <UserPlus size={13} /> 멤버 초대
          </button>
        </div>

        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
          {ws.members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center gap-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 last:border-0 text-[13px]"
            >
              {/* 아바타 */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-white">
                {m.userId.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{m.userId}</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">{m.userId}@sdt.inc</p>
              </div>
              {/* 권한 */}
              {m.role === 'owner' ? (
                <span className="text-[12px] text-[var(--muted-foreground)]">소유자</span>
              ) : (
                <Select
                  value={m.role}
                  onValueChange={(v) => {
                    updateMemberRole(ws.id, m.userId, v as WorkspaceRole)
                    toast.success('권한이 변경되었습니다.')
                  }}
                >
                  <SelectTrigger className="w-[110px] h-7 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">편집</SelectItem>
                    <SelectItem value="viewer">읽기 전용</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <span className="shrink-0 text-[11px] text-[var(--muted-foreground)]">가입: {m.joinedAt.slice(5, 10)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 멤버 초대 드로어 */}
      <Sheet open={inviteOpen} onOpenChange={setInviteOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>멤버 초대</SheetTitle>
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium">이메일 주소</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="example@sdt.inc"
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium">권한</label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as WorkspaceRole)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVITE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label} — {r.desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              초대 보내기
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  )
}
