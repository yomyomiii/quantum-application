'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, X, Upload, FileCode } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMarketplaceStore } from '@/store/marketplace.store'
import { usePersonaStore } from '@/store/persona.store'
import { MOCK_CATEGORIES } from '@/mocks/algorithms'
import type { AlgorithmParam } from '@/types/algorithm'

interface Props { open: boolean; onOpenChange: (v: boolean) => void }

type Step = 1 | 2 | 3 | 4 | 5
type ExecutionType = 'simulator' | 'hardware' | 'hybrid'
type CodeTab = 'upload' | 'paas'

const CHECK_ICONS: Record<'pass' | 'warn' | 'fail', string> = { pass: '✅', warn: '⚠️', fail: '❌' }

const MOCK_NOTEBOOKS = [
  { id: 'nb_01', name: 'Grover Search — 실험.ipynb', updatedAt: '2026-08-13' },
  { id: 'nb_02', name: 'QAOA Optimization v2.ipynb', updatedAt: '2026-08-12' },
  { id: 'nb_03', name: 'QFT Circuit Draft.ipynb', updatedAt: '2026-08-10' },
  { id: 'nb_04', name: 'VQE Hydrogen Molecule.ipynb', updatedAt: '2026-08-08' },
]

const EXECUTION_TYPES: { value: ExecutionType; label: string; desc: string }[] = [
  { value: 'simulator', label: '시뮬레이터', desc: '고전 컴퓨터 기반 양자 시뮬레이션' },
  { value: 'hardware', label: '실제 양자 하드웨어', desc: '실 QPU에서 직접 실행' },
  { value: 'hybrid', label: '하이브리드', desc: '시뮬레이터 + 실 QPU 병행' },
]

export function RegisterDrawer({ open, onOpenChange }: Props) {
  const { submitAlgorithm } = useMarketplaceStore()
  const { currentUserId } = usePersonaStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>(1)

  // Step 1: 기본 정보
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [version, setVersion] = useState('1.0.0')

  // Step 2: 메타데이터 및 실행 유형
  const [sdk, setSdk] = useState<'Qiskit' | 'Pennylane' | 'CUDA-Q' | 'Cirq'>('Qiskit')
  const [category, setCategory] = useState(MOCK_CATEGORIES[0].name)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [executionType, setExecutionType] = useState<ExecutionType>('simulator')

  // Step 3: 코드 첨부
  const [codeTab, setCodeTab] = useState<CodeTab>('upload')
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null)
  const [codeText, setCodeText] = useState('')
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)

  // Step 4: 파라미터 설정
  const [inputParams, setInputParams] = useState<AlgorithmParam[]>([])
  const [outputParams, setOutputParams] = useState<AlgorithmParam[]>([])
  const [exampleCode, setExampleCode] = useState('')

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  function addParam(type: 'input' | 'output') {
    const setter = type === 'input' ? setInputParams : setOutputParams
    setter((prev) => [...prev, { name: '', type: 'number', required: true, description: '', defaultValue: undefined }])
  }

  function updateParam(type: 'input' | 'output', i: number, field: keyof AlgorithmParam, value: unknown) {
    const setter = type === 'input' ? setInputParams : setOutputParams
    setter((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function removeParam(type: 'input' | 'output', i: number) {
    const setter = type === 'input' ? setInputParams : setOutputParams
    setter((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['.py', '.ipynb']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!allowed.includes(ext)) {
      toast.error('.py 또는 .ipynb 파일만 업로드 가능합니다.')
      return
    }
    setUploadedFile({ name: file.name, size: file.size })
  }

  const codeAttached =
    codeTab === 'upload' ? (uploadedFile !== null || codeText.trim().length > 0) :
    selectedNotebookId !== null

  const notebookId = codeTab === 'paas' ? selectedNotebookId : null

  // 자동 검증 (Step 5)
  const checks = {
    sdk: (sdk ? 'pass' : 'fail') as 'pass' | 'warn' | 'fail',
    description: (description.length >= 20 ? 'pass' : description.length > 0 ? 'warn' : 'fail') as 'pass' | 'warn' | 'fail',
    category: (category ? 'pass' : 'fail') as 'pass' | 'warn' | 'fail',
    executionType: (executionType ? 'pass' : 'fail') as 'pass' | 'warn' | 'fail',
    code: (codeAttached ? 'pass' : 'warn') as 'pass' | 'warn' | 'fail',
  }
  const allPass = !Object.values(checks).includes('fail')

  function handleSubmit() {
    submitAlgorithm({
      title, description, version, sdk, category, tags,
      executionType,
      authorId: currentUserId,
      inputParams,
      outputParams,
      exampleCode,
      codeAttached,
      notebookId,
    })
    toast.success('등록 요청이 접수되었습니다.')
    onOpenChange(false)
    setStep(1); setTitle(''); setDescription(''); setVersion('1.0.0')
    setSdk('Qiskit'); setCategory(MOCK_CATEGORIES[0].name); setTags([])
    setExecutionType('simulator')
    setCodeTab('upload'); setUploadedFile(null); setCodeText(''); setSelectedNotebookId(null)
    setInputParams([]); setOutputParams([]); setExampleCode('')
  }

  const canNext =
    step === 1 ? title.trim().length > 0 && description.trim().length > 0 :
    step === 2 ? true :
    step === 3 ? true :
    step === 4 ? true : allPass

  return (
    <Sheet open={open} onOpenChange={onOpenChange} direction="right">
      <SheetContent className="w-[480px]">
        <SheetHeader>
          <SheetTitle>새 버전 게시</SheetTitle>
          <div className="mt-2 flex gap-1">
            {([1, 2, 3, 4, 5] as Step[]).map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full transition-colors ${n <= step ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
              />
            ))}
          </div>
          <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
            {step === 1 && 'Step 1/5 — 기본 정보'}
            {step === 2 && 'Step 2/5 — 메타데이터 및 실행 유형'}
            {step === 3 && 'Step 3/5 — 코드 첨부'}
            {step === 4 && 'Step 4/5 — 파라미터 설정'}
            {step === 5 && 'Step 5/5 — 미리보기 및 제출'}
          </p>
        </SheetHeader>

        <SheetBody className="space-y-4">
          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-[13px] font-semibold">기본 정보</p>
              <div>
                <label className="mb-1 block text-[12px] font-medium">알고리즘명 <span className="text-[var(--destructive)]">*</span></label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: My Quantum Algorithm" className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium">설명 <span className="text-[var(--destructive)]">*</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="알고리즘에 대한 상세 설명을 입력하세요 (20자 이상)" className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] outline-none focus:border-[var(--primary)]" />
                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{description.length}자</p>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium">버전 번호</label>
                <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]" />
              </div>
            </div>
          )}

          {/* Step 2: 메타데이터 및 실행 유형 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[13px] font-semibold">메타데이터 및 실행 유형</p>
              <div>
                <label className="mb-1 block text-[12px] font-medium">SDK</label>
                <Select value={sdk} onValueChange={(v) => setSdk(v as typeof sdk)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['Qiskit', 'Pennylane', 'CUDA-Q', 'Cirq'] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium">카테고리</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOCK_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium">실행 유형 <span className="text-[var(--destructive)]">*</span></label>
                <div className="space-y-2">
                  {EXECUTION_TYPES.map((et) => (
                    <label key={et.value} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${executionType === et.value ? 'border-[var(--primary)] bg-[var(--primary-10)]' : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]'}`}>
                      <input type="radio" name="executionType" value={et.value} checked={executionType === et.value} onChange={() => setExecutionType(et.value)} className="mt-0.5 accent-[var(--primary)]" />
                      <div>
                        <p className="text-[13px] font-medium">{et.label}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">{et.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium">태그</label>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    placeholder="태그 입력 후 Enter"
                    className="h-9 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-[13px] outline-none focus:border-[var(--primary)]"
                  />
                  <button onClick={addTag} className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]">
                    <Plus size={14} />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span key={t} className="flex items-center gap-1 rounded-full bg-[var(--primary-10)] px-2.5 py-0.5 text-[12px] text-[var(--primary)]">
                        {t}
                        <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: 코드 첨부 */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-[13px] font-semibold">코드 첨부</p>
              {/* 탭 */}
              <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
                <button
                  onClick={() => setCodeTab('upload')}
                  className={`flex-1 py-2 text-[12px] font-medium transition-colors ${codeTab === 'upload' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'}`}
                >
                  파일 업로드 / 코드 입력
                </button>
                <button
                  onClick={() => setCodeTab('paas')}
                  className={`flex-1 py-2 text-[12px] font-medium transition-colors ${codeTab === 'paas' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'}`}
                >
                  PaaS 노트북 선택
                </button>
              </div>

              {codeTab === 'upload' && (
                <div className="space-y-3">
                  {/* 파일 업로드 */}
                  <div>
                    <label className="mb-1 block text-[12px] font-medium">파일 업로드 (.py / .ipynb)</label>
                    <input ref={fileInputRef} type="file" accept=".py,.ipynb" className="hidden" onChange={handleFileChange} />
                    {uploadedFile ? (
                      <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
                        <FileCode size={14} className="shrink-0 text-[var(--primary)]" />
                        <span className="flex-1 truncate text-[13px]">{uploadedFile.name}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                        <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><X size={13} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border)] bg-[var(--card)] py-4 text-[13px] text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
                      >
                        <Upload size={14} /> 파일 선택 또는 드롭
                      </button>
                    )}
                  </div>
                  {/* 코드 직접 입력 */}
                  <div>
                    <label className="mb-1 block text-[12px] font-medium">또는 코드 직접 입력</label>
                    <textarea
                      value={codeText}
                      onChange={(e) => setCodeText(e.target.value)}
                      rows={8}
                      placeholder={'# 알고리즘 코드를 여기에 붙여넣기하세요\nfrom qiskit import QuantumCircuit\n...'}
                      className="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 font-mono text-[12px] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              )}

              {codeTab === 'paas' && (
                <div className="space-y-2">
                  <p className="text-[12px] text-[var(--muted-foreground)]">현재 프로젝트의 노트북 목록에서 선택합니다.</p>
                  {MOCK_NOTEBOOKS.map((nb) => (
                    <label key={nb.id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${selectedNotebookId === nb.id ? 'border-[var(--primary)] bg-[var(--primary-10)]' : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)]'}`}>
                      <input type="radio" name="notebook" value={nb.id} checked={selectedNotebookId === nb.id} onChange={() => setSelectedNotebookId(nb.id)} className="accent-[var(--primary)]" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-medium">{nb.name}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">최종 수정: {nb.updatedAt}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: 파라미터 설정 */}
          {step === 4 && (
            <div className="space-y-5">
              <p className="text-[13px] font-semibold">파라미터 설정</p>

              {/* 입력 파라미터 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-[var(--muted-foreground)]">입력 파라미터</p>
                  <button onClick={() => addParam('input')} className="flex items-center gap-1 text-[12px] text-[var(--primary)] hover:underline">
                    <Plus size={13} /> 추가
                  </button>
                </div>
                {inputParams.length === 0 && <p className="text-[12px] text-[var(--muted-foreground)]">파라미터가 없습니다.</p>}
                {inputParams.map((p, i) => (
                  <div key={i} className="rounded-lg border border-[var(--border)] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[var(--muted-foreground)]">파라미터 #{i + 1}</span>
                      <button onClick={() => removeParam('input', i)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><X size={13} /></button>
                    </div>
                    <input value={p.name} onChange={(e) => updateParam('input', i, 'name', e.target.value)} placeholder="이름 (예: n_qubits)" className="h-8 w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 text-[12px] outline-none focus:border-[var(--primary)]" />
                    <div className="flex gap-2">
                      <Select value={p.type} onValueChange={(v) => updateParam('input', i, 'type', v)}>
                        <SelectTrigger className="h-8 flex-1 text-[12px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['number', 'string', 'boolean', 'array'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-1.5 text-[12px]">
                        <input type="checkbox" checked={p.required} onChange={(e) => updateParam('input', i, 'required', e.target.checked)} className="accent-[var(--primary)]" />
                        필수
                      </label>
                    </div>
                    <input value={p.description} onChange={(e) => updateParam('input', i, 'description', e.target.value)} placeholder="설명" className="h-8 w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 text-[12px] outline-none focus:border-[var(--primary)]" />
                  </div>
                ))}
              </div>

              {/* 출력 파라미터 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-[var(--muted-foreground)]">출력 파라미터</p>
                  <button onClick={() => addParam('output')} className="flex items-center gap-1 text-[12px] text-[var(--primary)] hover:underline">
                    <Plus size={13} /> 추가
                  </button>
                </div>
                {outputParams.length === 0 && <p className="text-[12px] text-[var(--muted-foreground)]">파라미터가 없습니다.</p>}
                {outputParams.map((p, i) => (
                  <div key={i} className="rounded-lg border border-[var(--border)] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[var(--muted-foreground)]">출력 #{i + 1}</span>
                      <button onClick={() => removeParam('output', i)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"><X size={13} /></button>
                    </div>
                    <input value={p.name} onChange={(e) => updateParam('output', i, 'name', e.target.value)} placeholder="이름 (예: result)" className="h-8 w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 text-[12px] outline-none focus:border-[var(--primary)]" />
                    <div className="flex gap-2">
                      <Select value={p.type} onValueChange={(v) => updateParam('output', i, 'type', v)}>
                        <SelectTrigger className="h-8 flex-1 text-[12px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['number', 'string', 'boolean', 'array'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <label className="flex items-center gap-1.5 text-[12px]">
                        <input type="checkbox" checked={p.required} onChange={(e) => updateParam('output', i, 'required', e.target.checked)} className="accent-[var(--primary)]" />
                        필수
                      </label>
                    </div>
                    <input value={p.description} onChange={(e) => updateParam('output', i, 'description', e.target.value)} placeholder="설명" className="h-8 w-full rounded border border-[var(--border)] bg-[var(--card)] px-2 text-[12px] outline-none focus:border-[var(--primary)]" />
                  </div>
                ))}
              </div>

              {/* 실행 예시 코드 */}
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[var(--muted-foreground)]">실행 예시 코드</label>
                <textarea
                  value={exampleCode}
                  onChange={(e) => setExampleCode(e.target.value)}
                  rows={5}
                  placeholder={'# 사용 예시\nresult = run_algorithm(n_qubits=4, target="1010")\nprint(result)'}
                  className="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 font-mono text-[12px] outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          )}

          {/* Step 5: 미리보기 및 제출 */}
          {step === 5 && (
            <div className="space-y-5">
              <p className="text-[13px] font-semibold">미리보기 및 제출</p>

              {/* 자동 검증 */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
                <p className="text-[12px] font-semibold text-[var(--muted-foreground)]">자동 검증 결과</p>
                {[
                  { label: 'SDK', key: 'sdk' as const },
                  { label: '설명 (20자 이상)', key: 'description' as const },
                  { label: '카테고리', key: 'category' as const },
                  { label: '실행 유형', key: 'executionType' as const },
                  { label: '코드 첨부', key: 'code' as const },
                ].map(({ label, key }) => (
                  <div key={key} className="flex items-center justify-between text-[13px]">
                    <span>{label}</span>
                    <span>{CHECK_ICONS[checks[key]]} {checks[key] === 'pass' ? '통과' : checks[key] === 'warn' ? '경고' : '실패'}</span>
                  </div>
                ))}
              </div>

              {/* 요약 */}
              <div className="rounded-lg border border-[var(--border)] p-4 space-y-1.5 text-[13px]">
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">알고리즘명</span><span className="flex-1 font-medium">{title}</span></div>
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">버전</span><span>v{version}</span></div>
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">SDK</span><span>{sdk}</span></div>
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">카테고리</span><span>{category}</span></div>
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">실행 유형</span><span>{EXECUTION_TYPES.find((e) => e.value === executionType)?.label}</span></div>
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">태그</span><span>{tags.join(', ') || '-'}</span></div>
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">코드 출처</span><span>{codeTab === 'paas' ? `PaaS 노트북: ${MOCK_NOTEBOOKS.find((n) => n.id === selectedNotebookId)?.name ?? '-'}` : uploadedFile ? `파일: ${uploadedFile.name}` : codeText.trim() ? '코드 직접 입력' : '미첨부'}</span></div>
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">입력 파라미터</span><span>{inputParams.length}개</span></div>
                <div className="flex gap-2"><span className="w-24 shrink-0 text-[var(--muted-foreground)]">출력 파라미터</span><span>{outputParams.length}개</span></div>
              </div>

              {!allPass && (
                <p className="text-[12px] text-[var(--destructive)]">검증 실패 항목이 있습니다. 이전 단계로 돌아가 수정해주세요.</p>
              )}
            </div>
          )}
        </SheetBody>

        <SheetFooter>
          {step > 1 && (
            <button onClick={() => setStep((s) => (s - 1) as Step)} className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">
              이전
            </button>
          )}
          <SheetClose asChild>
            <button className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[13px] hover:bg-[var(--accent)] transition-colors">
              취소
            </button>
          </SheetClose>
          {step < 5 ? (
            <button onClick={() => setStep((s) => (s + 1) as Step)} disabled={!canNext} className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity">
              다음
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!allPass} className="rounded-md bg-[var(--primary)] px-4 py-2 text-[13px] text-white hover:opacity-90 disabled:opacity-40 transition-opacity">
              제출
            </button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
