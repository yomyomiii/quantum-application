'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Trash2, Pencil, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useWorkspaceStore } from '@/store/workspace.store'
import { usePersonaStore } from '@/store/persona.store'
import { MoreHorizontal } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/ui/dialog-confirm'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import type { WorkspaceRole } from '@/types/common'

interface Props { params: Promise<{ id: string }> }

type InviteRow = { email: string; role: WorkspaceRole }

export default function ProjectDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { workspaces, updateWorkspace, removeWorkspace, updateMemberRole, inviteMember, removeMember } = useWorkspaceStore()
  const { currentUserId } = usePersonaStore()

  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteRows, setInviteRows] = useState<InviteRow[]>([{ email: '', role: 'member' }])

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [kickTarget, setKickTarget] = useState<string | null>(null)

  const ws = workspaces.find((w) => w.id === id)

  if (!ws) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-[15px] font-semibold">프로젝트를 찾을 수 없습니다</p>
        <button onClick={() => router.push('/projects')} className="mt-4 text-[13px] text-[var(--primary)] hover:underline">목록으로</button>
      </div>
    )
  }

  const pct = Math.round((ws.usedCredits / ws.credits) * 100)
  const isOwner = ws.ownerId === currentUserId
  const myRole = ws.members.find((m) => m.userId === currentUserId)?.role
  const canEdit = isOwner || myRole === 'admin'

  function handleEditOpen() {
    setEditName(ws!.name)
    setEditDesc(ws!.description)
    setEditOpen(true)
  }

  function handleEditSave() {
    if (!editName.trim()) return
    updateWorkspace(ws!.id, { name: editName.trim(), description: editDesc.trim() })
    toast.success('프로젝트 정보가 수정되었습니다.')
    setEditOpen(false)
  }

  function handleInviteOpen() {
    setInviteRows([{ email: '', role: 'member' }])
    setInviteOpen(true)
  }

  function handleInviteRowChange(idx: number, patch: Partial<InviteRow>) {
    setInviteRows((rows) => rows.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }

  function handleInviteRowAdd() {
    setInviteRows((rows) => [...rows, { email: '', role: 'member' }])
  }

  function handleInviteRowRemove(idx: number) {
    setInviteRows((rows) => rows.filter((_, i) => i !== idx))
  }

  function handleInvite() {
    const valid = inviteRows.filter((r) => r.email.trim())
    if (valid.length === 0) return
    valid.forEach((r) => {
      inviteMember(ws!.id, `user_invite_${Date.now()}_${r.email}`, r.role)
    })
    toast.success(`${valid.length}명 초대 완료`)
    setInviteOpen(false)
  }

  function handleDelete() {
    removeWorkspace(ws!.id)
    toast.success(`"${ws!.name}" 프로젝트가 삭제되었습니다.`)
    router.push('/projects')
  }

  function handleKickConfirm() {
    if (!kickTarget) return
    removeMember(ws!.id, kickTarget)
    toast.success('멤버를 내보냈습니다.')
    setKickTarget(null)
  }

  const inviteValid = inviteRows.length > 0 && inviteRows.every((r) => r.email.trim())

  return (
    <div className="p-6 max-w-3xl">
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">프로젝트 정보</h1>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={handleEditOpen}
              className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[13px] hover:bg-[var(--accent)] transition-colors"
            >
              <Pencil size={13} /> 편집
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => setDeleteOpen(true)}
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
            onClick={handleInviteOpen}
            className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-[13px] text-white hover:opacity-90 transition-opacity"
          >
            <UserPlus size={13} /> 멤버 초대
          </button>
        </div>

        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
          {/* 컬럼 헤더 */}
          <div className="grid grid-cols-[1fr_110px_100px_32px] items-center gap-3 border-b border-[var(--border)] px-4 py-2 text-[11px] text-[var(--muted-foreground)]">
            <span>이름 / 이메일</span>
            <span>역할</span>
            <span>가입일</span>
            <span />
          </div>
          {ws.members.map((m) => (
            <div
              key={m.userId}
              className="grid grid-cols-[1fr_110px_100px_32px] items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-0 text-[13px]"
            >
              {/* 이름 / 이메일 */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-white">
                  {m.userId.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.userId}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] truncate">{m.userId}@sdt.inc</p>
                </div>
              </div>
              {/* 역할 */}
              {m.role === 'owner' ? (
                <span className="text-[12px] text-[var(--muted-foreground)]">소유자</span>
              ) : (
                <Select
                  value={m.role}
                  onValueChange={(v) => {
                    updateMemberRole(ws.id, m.userId, v as WorkspaceRole)
                    toast.success('역할이 변경되었습니다.')
                  }}
                >
                  <SelectTrigger className="h-7 text-[12px] w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="member">멤버</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {/* 가입일 */}
              <span className="text-[12px] text-[var(--muted-foreground)]">{m.joinedAt.slice(0, 10)}</span>
              {/* 케밥 */}
              {m.role !== 'owner' ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)]">
                      <MoreHorizontal size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-[var(--destructive)] focus:text-[var(--destructive)]"
                      onClick={() => setKickTarget(m.userId)}
                    >
                      내보내기
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 프로젝트 편집 드로어 */}
      <Sheet open={editOpen} onOpenChange={setEditOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>프로젝트 편집</SheetTitle>
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium">이름</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium">설명</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)] resize-none"
              />
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleEditSave}
              disabled={!editName.trim()}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              저장
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 멤버 초대 드로어 */}
      <Sheet open={inviteOpen} onOpenChange={setInviteOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>멤버 초대</SheetTitle>
          </SheetHeader>
          <SheetBody className="space-y-2">
            {inviteRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => handleInviteRowChange(idx, { email: e.target.value })}
                  placeholder="example@sdt.inc"
                  className="h-9 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
                />
                <Select value={row.role} onValueChange={(v) => handleInviteRowChange(idx, { role: v as WorkspaceRole })}>
                  <SelectTrigger className="w-[90px] h-9 text-[12px] shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="member">멤버</SelectItem>
                  </SelectContent>
                </Select>
                {inviteRows.length > 1 && (
                  <button
                    onClick={() => handleInviteRowRemove(idx)}
                    className="shrink-0 rounded-md p-1.5 hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleInviteRowAdd}
              className="flex items-center gap-1 text-[12px] text-[var(--primary)] hover:opacity-80 transition-opacity pt-1"
            >
              <Plus size={12} /> 이메일 추가
            </button>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleInvite}
              disabled={!inviteValid}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              초대 보내기
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 삭제 확인 모달 */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="정말 삭제하시겠습니까?"
        description={`"${ws.name}"을 삭제하면 복구할 수 없습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* 내보내기 확인 모달 */}
      <ConfirmDialog
        open={kickTarget !== null}
        onOpenChange={(open) => { if (!open) setKickTarget(null) }}
        title="정말 내보내시겠습니까?"
        description={`${kickTarget}을 프로젝트에서 내보냅니다.`}
        confirmLabel="내보내기"
        variant="destructive"
        onConfirm={handleKickConfirm}
      />
    </div>
  )
}
