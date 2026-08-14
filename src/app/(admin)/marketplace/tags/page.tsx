'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/marketplace.store'
import type { AlgorithmTag } from '@/types/algorithm'
import { ConfirmDialog } from '@/components/ui/dialog-confirm'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { TablePagination } from '@/components/ui/table-pagination'

export default function TagsPage() {
  const { algorithms, tags, addTag, updateTag, deleteTag } = useMarketplaceStore()

  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AlgorithmTag | null>(null)
  const [tagNameInput, setTagNameInput] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  function openAdd() {
    setTagNameInput('')
    setAddDrawerOpen(true)
  }

  function openEdit(tag: AlgorithmTag) {
    setTagNameInput(tag.name)
    setEditTarget(tag)
  }

  function handleAdd() {
    const name = tagNameInput.trim()
    if (!name || tags.some((t) => t.name === name)) return
    addTag(name)
    toast.success('태그가 추가되었습니다.')
    setAddDrawerOpen(false)
  }

  function handleEditSave() {
    const name = tagNameInput.trim()
    if (!editTarget || !name) return
    updateTag(editTarget.id, name)
    toast.success('태그가 수정되었습니다.')
    setEditTarget(null)
  }

  function handleDelete(id: string) {
    deleteTag(id)
    toast.success('태그가 삭제되었습니다.')
    setDeleteTarget(null)
  }

  const isDuplicateAdd = tags.some((t) => t.name === tagNameInput.trim()) && !!tagNameInput.trim()
  const isDuplicateEdit = editTarget
    ? tags.some((t) => t.id !== editTarget.id && t.name === tagNameInput.trim())
    : false

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">양자 알고리즘 태그 관리</h1>
        <button
          onClick={openAdd}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> 태그 추가
        </button>
      </div>

      {/* 테이블 뷰 */}
      <div className="ds-table-wrap">
        <table className="ds-table w-full">
          <thead>
            <tr>
              <th className="whitespace-nowrap">태그명</th>
              <th className="text-right w-32 whitespace-nowrap">사용 알고리즘 수</th>
              <th className="w-24 whitespace-nowrap">생성일</th>
              <th className="text-right w-24 whitespace-nowrap">액션</th>
            </tr>
          </thead>
          <tbody>
            {tags.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((tag) => {
              const count = algorithms.filter((a) => a.tags.includes(tag.name)).length
              return (
                <tr key={tag.id}>
                  <td className="font-medium whitespace-nowrap">{tag.name}</td>
                  <td className="text-right text-[var(--muted-foreground)] whitespace-nowrap">{count}</td>
                  <td className="text-[var(--muted-foreground)] whitespace-nowrap">{tag.createdAt.slice(0, 10)}</td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(tag)}
                        className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
                      >
                        <Pencil size={11} /> 편집
                      </button>
                      <button
                        onClick={() => setDeleteTarget(tag.id)}
                        className="flex items-center gap-1 rounded-md border border-[var(--destructive)]/40 bg-[var(--card)] px-2.5 py-1 text-[12px] text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
                      >
                        <Trash2 size={11} /> 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <TablePagination total={tags.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />

      {/* 태그 추가 드로어 */}
      <Sheet open={addDrawerOpen} onOpenChange={setAddDrawerOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>태그 추가</SheetTitle>
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium">태그 이름 <span className="text-[var(--destructive)]">*</span></label>
              <input
                autoFocus
                value={tagNameInput}
                onChange={(e) => setTagNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="예: 그로버"
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              />
              {isDuplicateAdd && (
                <p className="mt-1 text-[11px] text-[var(--destructive)]">이미 존재하는 태그입니다.</p>
              )}
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleAdd}
              disabled={!tagNameInput.trim() || isDuplicateAdd}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              저장
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 태그 편집 드로어 */}
      <Sheet open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>태그 편집</SheetTitle>
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium">태그 이름 <span className="text-[var(--destructive)]">*</span></label>
              <input
                autoFocus
                value={tagNameInput}
                onChange={(e) => setTagNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                placeholder="예: 그로버"
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
              />
              {isDuplicateEdit && (
                <p className="mt-1 text-[11px] text-[var(--destructive)]">이미 존재하는 태그입니다.</p>
              )}
            </div>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleEditSave}
              disabled={!tagNameInput.trim() || isDuplicateEdit}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              저장
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="태그를 삭제하시겠습니까?"
        description="연결된 알고리즘의 태그가 해제됩니다."
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  )
}
