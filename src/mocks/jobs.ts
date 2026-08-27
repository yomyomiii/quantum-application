import type { Job, JobResource, JobResult, JobEstimate } from '@/types/job'
import type { JobStatus } from '@/types/common'

const REF = new Date('2026-08-14T00:00:00.000Z').getTime()

function seeded(seed: number) {
  let s = seed >>> 0
  return function () {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0
    return s / 4294967296
  }
}

function makeUuid(seed: number): string {
  const r = seeded(seed + 8000)
  const hex = Array.from({ length: 32 }, () => Math.floor(r() * 16).toString(16)).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}

const d = (daysAgo: number, hour = 12, minSeed = 0, ms = 0) => {
  const minutes = Math.floor((minSeed * 7 + daysAgo * 13) % 60)
  const seconds = Math.floor((minSeed * 3 + daysAgo * 7) % 60)
  const dt = new Date(REF - daysAgo * 86400000)
  dt.setUTCHours(hour, minutes, seconds, ms)
  return dt.toISOString()
}

const userEmails = [
  'yeomyeom.ji@sdt.inc', 'junho.lee@sdt.inc', 'soyeon.park@sdt.inc',
  'minjun.choi@sdt.inc', 'haeun.jung@sdt.inc', 'dohyun.kang@sdt.inc',
  'seohee.yoon@sdt.inc', 'jaewon.im@sdt.inc', 'yejin.song@sdt.inc', 'seungwoo.han@sdt.inc',
]
const userNames = ['염지', '이준혁', '박소연', '최민준', '정하은', '강도현', '윤서희', '임재원', '송예진', '한승우']
const wsIds = ['ws_1', 'ws_2', 'ws_3', 'ws_4', 'ws_5']

const PROVIDERS: { name: string; devices: string[] }[] = [
  { name: 'QPerfect', devices: ['QubeSIM-MIMIQ', 'QubeSIM-IDEAL'] },
  { name: 'IBM', devices: ['ibm_brisbane', 'ibm_torino'] },
  { name: 'IonQ', devices: ['ionq_aria', 'ionq_forte'] },
]

const ENTRYPOINTS = ['Composer', 'Notebook']
const ERROR_MITIGATIONS = ['Debiasing OFF', 'Debiasing ON', 'ZNE', 'None']

const SAMPLE_CIRCUITS = [
  `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\nsdg q[0];\n\n// srndg\nh q[1];\nrz(-pi / 2) q[1];\nry(0) q[1];\nrz(0) q[1];\nh q[1];\n\nx q[0];\n\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];`,
  `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0], q[1];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];`,
  `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[4];\ncreg c[4];\nh q[0];\ncx q[0], q[1];\ncx q[1], q[2];\ncx q[2], q[3];\nmeasure q -> c;`,
]

const algoIds = ['algo_01','algo_02','algo_03','algo_04','algo_05','algo_06','algo_07','algo_08','algo_09','algo_10',
                 'algo_11','algo_12','algo_13','algo_14','algo_15','algo_21','algo_22','algo_23','algo_26']
const algoTitles: Record<string, string> = {
  algo_01: "Grover's Search Algorithm", algo_02: "Shor's Factoring Algorithm",
  algo_03: 'VQE — Variational Quantum Eigensolver', algo_04: 'QAOA',
  algo_05: 'Quantum Phase Estimation', algo_06: 'HHL',
  algo_07: 'Quantum Fourier Transform', algo_08: 'Quantum Teleportation',
  algo_09: 'Deutsch-Jozsa Algorithm', algo_10: "Simon's Algorithm",
  algo_11: 'Quantum SVM', algo_12: 'Quantum Neural Network',
  algo_13: 'Bernstein-Vazirani', algo_14: 'Quantum Transfer Learning',
  algo_15: 'Quantum GAN', algo_21: 'Bell State Preparation',
  algo_22: 'GHZ State Generator', algo_23: 'Quantum Key Distribution (BB84)',
  algo_26: 'Quantum Random Number Generator',
}

function makeResource(qubits: number, exceeded = false, seed = 0): JobResource {
  const r = seeded(seed + 1000)
  const len = 30
  const cpu = Array.from({ length: len }, () => Math.floor(r() * (exceeded ? 95 : 70) + 5))
  const mem = Array.from({ length: len }, () => Math.floor(r() * (exceeded ? 14000 : 8000) + 2000))
  const gpu = Array.from({ length: len }, () => Math.floor(r() * 60 + 10))
  const vram = Array.from({ length: len }, () => Math.floor(r() * (exceeded ? 12000 : 6000) + 1000))
  const base = REF - len * 2000
  const timestamps = Array.from({ length: len }, (_, i) => new Date(base + i * 2000).toISOString())
  return {
    qubits, shots: 1024,
    cpuPercent: cpu, memoryMB: mem, gpuPercent: gpu, vramMB: vram, timestamps,
    peakCpu: Math.max(...cpu), peakMemoryMB: Math.max(...mem), peakVramMB: Math.max(...vram),
    thresholdExceeded: exceeded,
  }
}

function makeResult(status: JobStatus, seed = 0): JobResult | null {
  if (status !== 'done') return null
  const r = seeded(seed + 2000)
  const p00 = parseFloat((0.48 + r() * 0.04).toFixed(6))
  const p11 = parseFloat((0.48 + r() * 0.04).toFixed(6))
  const measurementCounts = {
    '00': Math.round(p00 * 1024),
    '11': Math.round(p11 * 1024),
    '01': Math.round(0.01 * 1024),
    '10': Math.round(0.01 * 1024),
  }
  const measurementProbabilities = { '00': p00, '11': p11, '01': 0.01, '10': 0.01 }
  const timings = {
    total: parseFloat((r() * 0.001 + 0.0002).toFixed(6)),
    compression: parseFloat((r() * 0.0001).toFixed(6)),
    sample: parseFloat((r() * 0.00001).toFixed(6)),
    apply: parseFloat((r() * 0.00003).toFixed(6)),
    parse: parseFloat((r() * 0.0005).toFixed(6)),
  }
  const fidelity = parseFloat((0.92 + r() * 0.08).toFixed(6))
  const circuitDepth = Math.floor(r() * 25) + 5
  const rawOutput = JSON.stringify({
    simulator: 'MIMIQ-StateVector',
    version: '0.26.0',
    totalSamples: 1024,
    fidelity,
    measurementCounts,
    measurementProbabilities,
    timings,
    circuitDepth,
  })
  return {
    simulator: 'MIMIQ-StateVector',
    version: '0.26.0',
    totalSamples: 1024,
    fidelity,
    measurementCounts,
    measurementProbabilities,
    timings,
    circuitDepth,
    rawOutput,
    accuracy: parseFloat((0.96 + r() * 0.04).toFixed(6)),
  }
}

function makeEstimate(status: JobStatus, seed = 0, daysAgo: number): JobEstimate | null {
  if (status !== 'done' && status !== 'failed') return null
  const r = seeded(seed + 7000)
  const estStatuses: Array<'Active' | 'Expired' | 'Cancelled'> = ['Expired', 'Active', 'Cancelled']
  return {
    id: makeUuid(seed + 100),
    status: estStatuses[seed % 3],
    requestedAt: d(daysAgo, 14, seed, 2),
    confirmedAt: d(daysAgo, 14, seed + 2, 40000),
    gateCount1q: Math.floor(r() * 5),
    gateCount2q: Math.floor(r() * 3),
    credits: parseFloat((r() * 5000 + 100).toFixed(2)),
    expiresAt: d(daysAgo - 0.02, 15, seed, 40000),
  }
}

const successDays = Array.from({ length: 120 }, (_, i) => Math.floor(seeded(i + 3000)() * 90) + 1)
const failedDays  = Array.from({ length: 20 },  (_, i) => Math.floor(seeded(i + 4000)() * 60) + 1)
const cancelDays  = Array.from({ length: 10 },  (_, i) => Math.floor(seeded(i + 5000)() * 30) + 1)

function makeJob(idx: number, status: JobStatus, daysAgo: number, exceededOverride?: boolean): Job {
  const r = seeded(idx + 6000)
  const ui = idx % userEmails.length
  const ai = idx % algoIds.length
  const algoId = algoIds[ai]
  const providerEntry = PROVIDERS[idx % PROVIDERS.length]
  const qubits = [2, 4, 5, 8, 10, 20][idx % 6]
  const exceeded = exceededOverride ?? (idx % 10 === 0)
  const submittedAt = status !== 'initiated' ? d(daysAgo, 9, idx + 1, 751) : null
  const startedAt = (status === 'running' || status === 'done' || status === 'failed') ? d(daysAgo, 9, idx + 3, 33) : null
  const completedAt = (status === 'done' || status === 'failed' || status === 'cancelled') ? d(daysAgo, 9, idx + 5, 65) : null

  return {
    id: makeUuid(idx + 9000),
    title: `${algoTitles[algoId]} #${idx + 1}`,
    algorithmId: algoId,
    algorithmTitle: algoTitles[algoId],
    algorithmVersion: '1.0.0',
    workspaceId: wsIds[idx % wsIds.length],
    userId: `user_${ui + 1}`,
    userName: userNames[ui],
    userEmail: userEmails[ui],
    provider: providerEntry.name,
    deviceName: providerEntry.devices[idx % providerEntry.devices.length],
    status,
    priority: (['high', 'normal', 'low'] as const)[idx % 3],
    sdk: ['Qiskit', 'Pennylane', 'CUDA-Q', 'Cirq'][ai % 4],
    params: { n_qubits: qubits, shots: 1024 },
    creditUsed: status === 'done' ? parseFloat((r() * 100 + 5).toFixed(2)) : 0,
    executionTime: status === 'done' ? Math.floor(r() * 5000) + 500 : null,
    entrypoint: ENTRYPOINTS[idx % ENTRYPOINTS.length],
    errorMitigation: ERROR_MITIGATIONS[idx % ERROR_MITIGATIONS.length],
    gateCount1q: Math.floor(r() * 8),
    gateCount2q: Math.floor(r() * 4),
    circuit: SAMPLE_CIRCUITS[idx % SAMPLE_CIRCUITS.length],
    createdAt: d(daysAgo, 9, idx + 2, 751),
    submittedAt,
    startedAt,
    completedAt,
    resource: makeResource(qubits, exceeded, idx),
    result: makeResult(status, idx),
    estimate: makeEstimate(status, idx, daysAgo),
    logs: [
      { level: 'info', message: `작업 초기화 완료`, timestamp: d(daysAgo, 9, idx) },
      { level: 'info', message: `큐비트 ${qubits}개 할당`, timestamp: d(daysAgo, 9, idx + 3) },
      ...(status === 'failed' ? [{ level: 'error' as const, message: '양자 결맞음 오류 발생', timestamp: d(daysAgo, 10, idx) }] : []),
      ...(exceeded ? [{ level: 'warn' as const, message: 'CPU 임계치(80%) 초과', timestamp: d(daysAgo, 10, idx + 4) }] : []),
    ],
    comments: idx % 7 === 0 ? [{
      id: `cmt_${idx}`, userId: `user_${(ui + 1) % userEmails.length + 1}`,
      content: '결과 확인했습니다.', reactions: [{ emoji: '👍', userIds: ['user_2'] }],
      createdAt: d(daysAgo - 0.2, 12, idx), thread: [],
    }] : [],
    changeHistory: [
      { userId: `user_${ui + 1}`, action: '작업 제출', at: d(daysAgo, 9, idx) },
      ...(startedAt ? [{ userId: 'system', action: '실행 시작', at: startedAt }] : []),
      ...(completedAt ? [{ userId: 'system', action: status === 'done' ? '완료' : status === 'cancelled' ? '취소' : '실패', at: completedAt }] : []),
    ],
    validationResult: { passed: true, errors: [], recommendations: [] },
  }
}

export const MOCK_JOBS: Job[] = [
  ...Array.from({ length: 120 }, (_, i) => makeJob(i, 'done', successDays[i])),
  ...Array.from({ length: 20 },  (_, i) => makeJob(120 + i, 'failed', failedDays[i])),
  ...Array.from({ length: 10 },  (_, i) => makeJob(140 + i, 'cancelled', cancelDays[i])),
  // 첫 페이지 경우의 수 showcase (daysAgo=0, 최신 → 정렬 후 상위 노출 보장)
  makeJob(150, 'running',   0),
  makeJob(151, 'submitted', 0),
  makeJob(152, 'estimate',  0),
  makeJob(153, 'initiated', 0),
  makeJob(154, 'done',      0, false), // done + 정상
  makeJob(155, 'done',      0, true),  // done + thresholdExceeded
  makeJob(156, 'failed',    0, false), // failed + 정상
  makeJob(157, 'failed',    0, true),  // failed + thresholdExceeded (3가지 동시)
  makeJob(158, 'cancelled', 0),
]
