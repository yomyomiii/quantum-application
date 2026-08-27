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
  const shots = job.resource.shots
  const p00 = parseFloat((0.49 + (Math.random() - 0.5) * 0.05).toFixed(6))
  const p11 = parseFloat((1 - p00 - 0.02).toFixed(6))
  const measurementCounts = {
    '00': Math.round(p00 * shots),
    '11': Math.round(p11 * shots),
    '01': Math.round(0.01 * shots),
    '10': Math.round(0.01 * shots),
  }
  const measurementProbabilities = { '00': p00, '11': p11, '01': 0.01, '10': 0.01 }
  const timings = {
    total: parseFloat((Math.random() * 0.001 + 0.0002).toFixed(6)),
    compression: parseFloat((Math.random() * 0.0001).toFixed(6)),
    sample: parseFloat((Math.random() * 0.00001).toFixed(6)),
    apply: parseFloat((Math.random() * 0.00003).toFixed(6)),
    parse: parseFloat((Math.random() * 0.0005).toFixed(6)),
  }
  const fidelity = parseFloat((0.95 + Math.random() * 0.05).toFixed(6))
  const circuitDepth = Math.floor(Math.random() * 20) + 5
  return {
    simulator: 'MIMIQ-StateVector',
    version: '0.26.0',
    totalSamples: shots,
    fidelity,
    measurementCounts,
    measurementProbabilities,
    timings,
    circuitDepth,
    rawOutput: JSON.stringify({ simulator: 'MIMIQ-StateVector', version: '0.26.0', totalSamples: shots, fidelity, measurementCounts, measurementProbabilities, timings, circuitDepth }),
    accuracy: parseFloat((0.98 + Math.random() * 0.02).toFixed(6)),
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
