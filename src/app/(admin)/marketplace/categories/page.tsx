'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/marketplace.store'
import type { AlgorithmCategory } from '@/types/algorithm'
import { ConfirmDialog } from '@/components/ui/dialog-confirm'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { TablePagination } from '@/components/ui/table-pagination'

export default function CategoriesPage() {
  const { algorithms, categories, addCategory, updateCategory, deleteCategory } = useMarketplaceStore()

  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AlgorithmCategory | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  function openAdd() {
    setNameInput('')
    setDescInput('')
    setAddDrawerOpen(true)
  }

  function openEdit(cat: AlgorithmCategory) {
    setNameInput(cat.name)
    setDescInput(cat.description)
    setEditTarget(cat)
  }

  function handleAdd() {
    const name = nameInput.trim()
    if (!name) return
    addCategory(name, descInput.trim())
    toast.success('카테고리가 추가되었습니다.')
    setAddDrawerOpen(false)
  }

  function handleEditSave() {
    if (!editTarget || !nameInput.trim()) return
    updateCategory(editTarget.id, nameInput.trim(), descInput.trim())
    toast.success('카테고리가 수정되었습니다.')
    setEditTarget(null)
  }

  function handleDelete(id: string) {
    deleteCategory(id)
    toast.success('카테고리가 삭제되었습니다.')
    setDeleteTarget(null)
  }

  const drawerFields = (
    <SheetBody className="space-y-4">
      <div>
        <label className="mb-1 block text-[12px] font-medium">카테고리 이름 <span className="text-[var(--destructive)]">*</span></label>
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (editTarget ? handleEditSave() : handleAdd())}
          placeholder="예: 최적화"
          className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-[12px] font-medium">설명</label>
        <textarea
          value={descInput}
          onChange={(e) => setDescInput(e.target.value)}
          rows={3}
          placeholder="카테고리에 대한 간략한 설명"
          className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]"
        />
      </div>
    </SheetBody>
  )

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">양자 알고리즘 카테고리 관리</h1>
        <button
          onClick={openAdd}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> 카테고리 추가
        </button>
      </div>

      <div className="ds-table-wrap">
        <table className="ds-table w-full">
          <thead>
            <tr>
              <th className="whitespace-nowrap">카테고리명</th>
              <th className="text-right w-32 whitespace-nowrap">등록 알고리즘 수</th>
              <th className="w-24 whitespace-nowrap">생성일</th>
              <th className="text-right w-24 whitespace-nowrap">액션</th>
            </tr>
          </thead>
          <tbody>
            {categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((cat) => {
              const count = algorithms.filter((a) => a.category === cat.name).length
              return (
                <tr key={cat.id}>
                  <td>
                    <div>
                      <span className="font-medium">{cat.name}</span>
                      {cat.description && (
                        <p className="mt-0.5 truncate text-[12px] text-[var(--muted-foreground)] max-w-[240px]">{cat.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-right text-[var(--muted-foreground)] whitespace-nowrap">{count}</td>
                  <td className="text-[var(--muted-foreground)] whitespace-nowrap">{cat.createdAt.slice(0, 10)}</td>
                  <td className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(cat)}
                        className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-[12px] hover:bg-[var(--accent)] transition-colors"
                      >
                        <Pencil size={11} /> 편집
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat.id)}
                        className="flex items-center gap-1 rounded-md border border-[var(--destructive)]/40 bg-[var(--card)] px-2 py-1 text-[12px] text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
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
        <TablePagination total={categories.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* 카테고리 추가 드로어 */}
      <Sheet open={addDrawerOpen} onOpenChange={setAddDrawerOpen} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>카테고리 추가</SheetTitle>
          </SheetHeader>
          {drawerFields}
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleAdd}
              disabled={!nameInput.trim()}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              저장
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 카테고리 편집 드로어 */}
      <Sheet open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)} direction="right">
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>카테고리 편집</SheetTitle>
          </SheetHeader>
          {drawerFields}
          <SheetFooter>
            <SheetClose asChild>
              <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">취소</button>
            </SheetClose>
            <button
              onClick={handleEditSave}
              disabled={!nameInput.trim()}
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
        title="카테고리를 삭제하시겠습니까?"
        description="해당 카테고리를 삭제하시겠습니까? (연결된 알고리즘 태그는 해제됩니다)"
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  )
}
