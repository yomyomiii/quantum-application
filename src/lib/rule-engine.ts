import type { Job, JobResult, ValidationResult } from '@/types/job'
import type { JobStatus } from '@/types/common'
import type { Algorithm, AutoCheckResult } from '@/types/algorithm'

// X4 OFF: 상태 전이는 사용자 클릭으로만
export const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  initiated:  ['estimate', 'cancelled'],
  estimate:   ['submitted', 'cancelled'],
  submitted:  ['running', 'cancelled'],
  running:    ['done', 'failed', 'cancelled'],
  done:       [],
  failed:     [],
  cancelled:  [],
}

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return JOB_TRANSITIONS[from].includes(to)
}

export function simulateJobRun(job: Job): JobResult {
  const success = Math.random() > 0.2
  if (!success) {
    return {
      counts: {},
      circuitDepth: 0,
      fidelity: null,
      executionTimeMs: Math.floor(Math.random() * 500) + 100,
      rawOutput: 'Error: Quantum decoherence detected',
    }
  }
  const shots = job.resource.shots
  const p00 = 0.49 + (Math.random() - 0.5) * 0.05
  const p11 = 1 - p00 - 0.02
  const probDistribution: Record<string, number> = {
    '00': Math.round(p00 * shots),
    '11': Math.round(p11 * shots),
    '01': Math.round(0.01 * shots),
    '10': Math.round(0.01 * shots),
  }
  return {
    counts: probDistribution,
    circuitDepth: Math.floor(Math.random() * 20) + 5,
    fidelity: 0.95 + Math.random() * 0.05,
    executionTimeMs: Math.floor(Math.random() * 2000) + 500,
    stateVector: [[0.707, 0], [0, 0], [0, 0], [0.707, 0]],
    probDistribution,
    rawOutput: `Counts: ${JSON.stringify(probDistribution)}`,
    accuracy: 0.98 + Math.random() * 0.02,
  }
}

export function autoCheckAlgorithm(algo: Partial<Algorithm>): AutoCheckResult {
  const sdkResult: 'pass' | 'fail' = algo.sdk ? 'pass' : 'fail'
  const descResult: 'pass' | 'warn' = (algo.description?.length ?? 0) > 50 ? 'pass' : 'warn'
  const catResult: 'pass' | 'fail' = algo.category ? 'pass' : 'fail'
  const execResult: 'pass' | 'fail' = algo.executionType ? 'pass' : 'fail'

  const results = [sdkResult, descResult, catResult, execResult]
  const overall: 'pass' | 'warn' | 'fail' = results.includes('fail') ? 'fail'
    : results.includes('warn') ? 'warn'
    : 'pass'

  return { sdk: sdkResult, description: descResult, category: catResult, executionType: execResult, overall, checkedAt: new Date().toISOString() }
}

export function validateJobParams(algo: Algorithm, params: Record<string, unknown>): ValidationResult {
  const errors: { field: string; message: string }[] = []
  const recommendations: string[] = []

  for (const param of algo.inputParams) {
    if (param.required && params[param.name] === undefined) {
      errors.push({ field: param.name, message: `${param.name} 은(는) 필수 파라미터입니다.` })
    }
  }
  if (algo.sdk === 'Qiskit') {
    recommendations.push('shots 값을 1024 이상으로 설정하면 더 정확한 결과를 얻을 수 있습니다.')
  }

  return { passed: errors.length === 0, errors, recommendations }
}

export function getRecommendedAlgorithms(userId: string, algorithms: Algorithm[], jobs: Job[]): Algorithm[] {
  const userJobs = jobs.filter(j => j.userId === userId)
  const usedSdks = [...new Set(userJobs.map(j => j.sdk))]
  const usedCategories = [...new Set(
    userJobs.map(j => algorithms.find(a => a.id === j.algorithmId)?.category).filter(Boolean)
  )]

  return algorithms
    .filter(a => a.status === 'published')
    .map(a => ({
      algo: a,
      score: (usedSdks.includes(a.sdk) ? 3 : 0)
           + (usedCategories.includes(a.category) ? 2 : 0)
           + (a.isRecommended ? 1 : 0)
           + a.rating * 0.5,
    }))
    .sort((x, y) => y.score - x.score)
    .slice(0, 6)
    .map(x => x.algo)
}
