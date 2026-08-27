import type { Algorithm, AlgorithmCategory, AlgorithmTag } from '@/types/algorithm'

const REF = new Date('2026-08-14T00:00:00.000Z').getTime()
const d = (daysAgo: number) => new Date(REF - daysAgo * 86400000).toISOString()

const autoPass = { sdk: 'pass' as const, description: 'pass' as const, category: 'pass' as const, executionType: 'pass' as const, overall: 'pass' as const, checkedAt: d(1) }
const autoWarn = { sdk: 'pass' as const, description: 'warn' as const, category: 'pass' as const, executionType: 'warn' as const, overall: 'warn' as const, checkedAt: d(1) }

// SDK별 대표 코드 스니펫 (published/pending 필수값)
const CODE_QISKIT = `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

def run(n_qubits: int = 4, shots: int = 1024):
    qc = QuantumCircuit(n_qubits, n_qubits)
    qc.h(range(n_qubits))
    qc.barrier()
    qc.measure(range(n_qubits), range(n_qubits))
    sim = AerSimulator()
    job = sim.run(transpile(qc, sim), shots=shots)
    return job.result().get_counts()`

const CODE_PENNYLANE = `import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=4)

@qml.qnode(dev)
def circuit(params):
    for i in range(4):
        qml.RY(params[i], wires=i)
    qml.CNOT(wires=[0, 1])
    qml.CNOT(wires=[2, 3])
    return qml.probs(wires=range(4))

params = np.random.uniform(0, np.pi, 4)
result = circuit(params)`

const CODE_CUDAQ = `import cudaq

@cudaq.kernel
def kernel(n: int):
    qubits = cudaq.qvector(n)
    h(qubits[0])
    for i in range(n - 1):
        cx(qubits[i], qubits[i + 1])
    mz(qubits)

result = cudaq.sample(kernel, 4, shots_count=1000)`

const CODE_CIRQ = `import cirq
import numpy as np

def run(n_qubits: int = 4, repetitions: int = 1000):
    qubits = cirq.LineQubit.range(n_qubits)
    circuit = cirq.Circuit()
    circuit.append(cirq.H(qubits[0]))
    for i in range(n_qubits - 1):
        circuit.append(cirq.CNOT(qubits[i], qubits[i + 1]))
    circuit.append(cirq.measure(*qubits, key='result'))
    simulator = cirq.Simulator()
    return simulator.run(circuit, repetitions=repetitions)`

export const MOCK_ALGORITHMS: Algorithm[] = [
  // ─── Qiskit / 최적화 / published ────────────────────────────────────────────
  {
    id: 'algo_01', title: "Grover's Search Algorithm",
    description: "양자 데이터베이스에서 O(√N) 복잡도로 항목을 탐색하는 그로버 알고리즘 구현. 고전 알고리즘 대비 제곱근 속도 향상을 제공합니다.",
    version: '1.2.0',
    versions: [
      { version: '1.2.0', publishedAt: d(10), changelog: '회로 최적화 — 게이트 수 23% 감소' },
      { version: '1.1.0', publishedAt: d(40), changelog: '파라미터 범위 확장 (큐비트 2→10)' },
      { version: '1.0.0', publishedAt: d(60), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['검색', '그로버', '기초'],
    authorId: 'user_1', status: 'published', isRecommended: true,
    viewCount: 1240, runCount: 389, rating: 4.8, ratingCount: 52,
    createdAt: d(65), updatedAt: d(10), publishedAt: d(60),
    inputParams: [
      { name: 'n_qubits', type: 'number', required: true, description: '큐비트 수 (2~10)', defaultValue: 4 },
      { name: 'target', type: 'string', required: true, description: '탐색 대상 비트 문자열' },
    ],
    outputParams: [{ name: 'result', type: 'string', required: true, description: '탐색 결과 비트 문자열' }],
    exampleCode: `from algorithm import run\nresult = run(n_qubits=4, target="1010")\nprint("탐색 결과:", result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [{ userId: 'user_2', jobId: 'job_01', usedAt: d(5), result: 'success' }],
    reviews: [{ id: 'rev_01', userId: 'user_2', rating: 5, content: '그로버 알고리즘 완벽 구현입니다.', createdAt: d(5) }],
    changeHistory: [
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(10) },
      { userId: 'admin_1', action: '메타데이터 편집', at: d(35) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(40) },
      { userId: 'system', action: '승인 처리', at: d(60) },
      { userId: 'system', action: '등록 요청 접수', at: d(65) },
    ],
  },
  {
    id: 'algo_02', title: "Shor's Factoring Algorithm",
    description: "정수 인수분해를 다항시간에 해결하는 쇼어 알고리즘. RSA 암호화 분석에 활용되며 양자 우위를 가장 명확히 보여주는 알고리즘입니다.",
    version: '2.0.1',
    versions: [
      { version: '2.0.1', publishedAt: d(7),  changelog: '위상 추정 정밀도 버그 수정' },
      { version: '2.0.0', publishedAt: d(25), changelog: 'RSA-4096 지원, 회로 재설계' },
      { version: '1.1.0', publishedAt: d(55), changelog: '중간 측정 제거 — 성능 40% 향상' },
      { version: '1.0.0', publishedAt: d(80), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['암호', '인수분해', '고급'],
    authorId: 'user_2', status: 'published', isRecommended: true,
    viewCount: 980, runCount: 210, rating: 4.6, ratingCount: 34,
    createdAt: d(85), updatedAt: d(7), publishedAt: d(80),
    inputParams: [{ name: 'N', type: 'number', required: true, description: '인수분해할 정수', defaultValue: 15 }],
    outputParams: [{ name: 'factors', type: 'array', required: true, description: '인수 목록' }],
    exampleCode: `from algorithm import run
result = run(n=21)  # 21 = 3 × 7 인수분해
print('인수:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [],
    reviews: [
      { id: 'rev_02a', userId: 'user_5', rating: 4, content: '구현이 깔끔하고 예제 코드가 도움이 많이 됐습니다.', createdAt: d(10) },
      { id: 'rev_02b', userId: 'user_8', rating: 3, content: '설명이 조금 더 자세하면 좋겠어요.', createdAt: d(20) },
      { id: 'rev_02c', userId: 'user_3', rating: 5, content: '실제 양자 컴퓨터에서도 잘 동작합니다!', createdAt: d(30) },
    ],
    changeHistory: [
      { userId: 'system', action: 'v2.0.1 새 버전 승인', at: d(7) },
      { userId: 'system', action: 'v2.0.0 새 버전 승인', at: d(25) },
      { userId: 'admin_1', action: '메타데이터 편집', at: d(48) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(55) },
      { userId: 'system', action: '승인 처리', at: d(80) },
      { userId: 'system', action: '등록 요청 접수', at: d(85) },
    ],
  },
  {
    id: 'algo_03', title: 'VQE — Variational Quantum Eigensolver',
    description: "변분 양자 고유값 솔버. 분자의 기저 상태 에너지를 계산하는 하이브리드 양자-고전 알고리즘입니다.",
    version: '1.5.0',
    versions: [
      { version: '1.5.0', publishedAt: d(14), changelog: '앤사츠 자동 선택 기능 추가' },
      { version: '1.4.0', publishedAt: d(28), changelog: 'COBYLA 옵티마이저 지원' },
      { version: '1.3.0', publishedAt: d(42), changelog: '수렴 속도 30% 개선' },
      { version: '1.2.0', publishedAt: d(55), changelog: '분자 데이터베이스 H2·LiH·BeH2 추가' },
      { version: '1.0.0', publishedAt: d(75), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['화학', '변분', '하이브리드'],
    authorId: 'user_3', status: 'published', isRecommended: false,
    viewCount: 756, runCount: 145, rating: 4.5, ratingCount: 28,
    createdAt: d(78), updatedAt: d(14), publishedAt: d(75),
    inputParams: [
      { name: 'molecule', type: 'string', required: true, description: '분자 식 (예: H2, LiH)', defaultValue: 'H2' },
      { name: 'shots', type: 'number', required: false, description: '측정 횟수', defaultValue: 1024 },
    ],
    outputParams: [{ name: 'energy', type: 'number', required: true, description: '기저 상태 에너지 (Hartree)' }],
    exampleCode: `from algorithm import run
result = run(molecule='H2', n_qubits=4)
print('기저 에너지(Ha):', result)`,
    executionType: 'hybrid', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [],
    reviews: [
      { id: 'rev_03a', userId: 'user_4', rating: 5, content: '화학 계산에 바로 쓸 수 있어서 좋았습니다.', createdAt: d(15) },
      { id: 'rev_03b', userId: 'user_7', rating: 2, content: '수렴이 잘 안 될 때가 있어요. 초기값에 민감합니다.', createdAt: d(25) },
    ],
    changeHistory: [
      { userId: 'system', action: 'v1.5.0 새 버전 승인', at: d(14) },
      { userId: 'system', action: 'v1.4.0 새 버전 승인', at: d(28) },
      { userId: 'system', action: 'v1.3.0 새 버전 승인', at: d(42) },
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(55) },
      { userId: 'system', action: '승인 처리', at: d(75) },
      { userId: 'system', action: '등록 요청 접수', at: d(78) },
    ],
  },
  {
    id: 'algo_04', title: 'QAOA — Quantum Approximate Optimization',
    description: "근사 최적화 알고리즘. 조합 최적화 문제(MaxCut, TSP 등)를 양자 회로로 근사 해결합니다.",
    version: '1.3.0',
    versions: [
      { version: '1.3.0', publishedAt: d(20), changelog: '레이어 수 동적 조정 기능 추가' },
      { version: '1.2.0', publishedAt: d(38), changelog: 'TSP 문제 그래프 포맷 지원' },
      { version: '1.1.0', publishedAt: d(55), changelog: 'COBYLA → SPSA 옵티마이저 전환' },
      { version: '1.0.0', publishedAt: d(72), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['조합최적화', 'MaxCut', 'QAOA'],
    authorId: 'user_1', status: 'published', isRecommended: true,
    viewCount: 621, runCount: 98, rating: 4.3, ratingCount: 19,
    createdAt: d(75), updatedAt: d(20), publishedAt: d(72),
    inputParams: [
      { name: 'p', type: 'number', required: true, description: 'QAOA 레이어 수', defaultValue: 2 },
      { name: 'graph', type: 'string', required: true, description: '인접 행렬 JSON' },
    ],
    outputParams: [{ name: 'solution', type: 'array', required: true, description: '최적화 결과' }],
    exampleCode: `from algorithm import run
result = run(graph_edges=[[0,1],[1,2],[2,3]], p=2)
print('MaxCut 값:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [],
    reviews: [
      { id: 'rev_04a', userId: 'user_2', rating: 4, content: 'MaxCut 문제에 적용해봤는데 결과가 좋았습니다.', createdAt: d(22) },
      { id: 'rev_04b', userId: 'user_6', rating: 5, content: '파라미터 조정이 직관적이에요.', createdAt: d(28) },
      { id: 'rev_04c', userId: 'user_9', rating: 4, content: 'TSP 포맷 지원 추가되고 훨씬 편해졌습니다.', createdAt: d(35) },
      { id: 'rev_04d', userId: 'user_1', rating: 3, content: '레이어 수가 많아지면 실행 시간이 급격히 늘어납니다.', createdAt: d(40) },
    ],
    changeHistory: [
      { userId: 'system', action: 'v1.3.0 새 버전 승인', at: d(20) },
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(38) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(55) },
      { userId: 'system', action: '승인 처리', at: d(72) },
      { userId: 'system', action: '등록 요청 접수', at: d(75) },
    ],
  },

  // ─── 상태별 대표 샘플 ────────────────────────────────────────────────────────
  {
    id: 'algo_s1', title: 'Quantum Walk Sampler (비활성화됨)',
    description: '이산 양자 워크 기반 샘플링 알고리즘. 현재 유지보수 중단으로 비활성화 상태.',
    version: '2.0.0',
    versions: [
      { version: '2.0.0', publishedAt: d(30), changelog: 'v2 회로 재설계 — 연속 시간 모드 추가' },
      { version: '1.1.0', publishedAt: d(60), changelog: '스텝 수 상한 제거' },
      { version: '1.0.0', publishedAt: d(88), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['양자워크', '샘플링'],
    authorId: 'user_1', status: 'inactive', isRecommended: false,
    viewCount: 342, runCount: 56, rating: 4.1, ratingCount: 12,
    createdAt: d(90), updatedAt: d(20), publishedAt: d(88),
    inputParams: [{ name: 'n_steps', type: 'number', required: true, description: '워크 스텝 수', defaultValue: 10 }],
    outputParams: [{ name: 'distribution', type: 'array', required: true, description: '확률 분포' }],
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [],
    reviews: [
      { id: 'rev_s1a', userId: 'user_3', rating: 4, content: '비활성화 전까지는 잘 썼습니다. 복원 예정인가요?', createdAt: d(25) },
      { id: 'rev_s1b', userId: 'user_6', rating: 5, content: '샘플링 정확도가 높아서 좋았습니다.', createdAt: d(45) },
    ],
    changeHistory: [
      { userId: 'system', action: '비활성화', at: d(20) },
      { userId: 'system', action: 'v2.0.0 새 버전 승인', at: d(30) },
      { userId: 'admin_1', action: '메타데이터 편집', at: d(50) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(60) },
      { userId: 'system', action: '승인 처리', at: d(88) },
      { userId: 'system', action: '등록 요청 접수', at: d(90) },
    ],
  },
  {
    id: 'algo_s2', title: 'Quantum Amplitude Amplification (검수 중)',
    description: '진폭 증폭 일반화 알고리즘. 그로버 검색의 일반화 버전으로 다양한 오라클에 적용 가능.',
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(1), changelog: '초기 등록 요청' }],
    sdk: 'Qiskit', category: '최적화', tags: ['진폭증폭', '오라클'],
    authorId: 'user_1', status: 'pending', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(1), updatedAt: d(1), publishedAt: null,
    inputParams: [{ name: 'oracle', type: 'string', required: true, description: '오라클 회로 QASM' }],
    outputParams: [{ name: 'result', type: 'string', required: true, description: '증폭된 상태' }],
    executionType: 'simulator', codeAttached: true, notebookId: 'nb_amplitude_amp_01',
    codeSource: 'notebook',
    algorithmCode: `# [Cell 1]\nfrom qiskit import QuantumCircuit\n\n# [Cell 2]\ndef amplitude_amplification(oracle_qasm: str, n_qubits: int) -> QuantumCircuit:\n    qc = QuantumCircuit(n_qubits)\n    qc.h(range(n_qubits))\n    oracle = QuantumCircuit.from_qasm_str(oracle_qasm)\n    qc.compose(oracle, inplace=True)\n    qc.h(range(n_qubits))\n    qc.x(range(n_qubits))\n    qc.h(n_qubits - 1)\n    qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)\n    qc.h(n_qubits - 1)\n    qc.x(range(n_qubits))\n    qc.h(range(n_qubits))\n    qc.measure_all()\n    return qc\n\n# [Cell 3]\nresult = amplitude_amplification(oracle_qasm='...', n_qubits=4)\nprint(result.draw())`,
    autoCheckResult: autoWarn,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '등록 요청 접수', at: d(1) },
    ],
  },
  {
    id: 'algo_s2b', title: 'CUDA-Q Bell State Sampler (검수 중)',
    description: 'NVIDIA CUDA-Q 기반 벨 상태 준비 및 측정 알고리즘. 다양한 2큐비트 얽힘 상태를 생성합니다.',
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(2), changelog: '초기 등록 요청' }],
    sdk: 'CUDA-Q', category: '양자 통신', tags: [],
    authorId: 'user_3', status: 'pending', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(2), updatedAt: d(2), publishedAt: null,
    inputParams: [],
    outputParams: [],
    executionType: 'hardware', codeAttached: true, notebookId: null,
    codeSource: 'direct',
    algorithmCode: `import cudaq\n\n@cudaq.kernel\ndef bell_state():\n    q = cudaq.qvector(2)\n    h(q[0])\n    cx(q[0], q[1])\n\nresult = cudaq.sample(bell_state, shots_count=1000)\nprint(result.most_probable())\nprint(result.probability('00'), result.probability('11'))`,
    autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '등록 요청 접수', at: d(2) },
    ],
  },
  {
    id: 'algo_s3', title: 'Quantum Fourier Transform v2 (임시저장)',
    description: '개선된 QFT 구현. 현재 파라미터 설정 작업 중.',
    version: '0.1.0', versions: [],
    sdk: 'Qiskit', category: '최적화', tags: ['QFT', '기초'],
    authorId: 'user_1', status: 'draft', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(0), updatedAt: d(0), publishedAt: null,
    executionType: 'simulator', inputParams: [], outputParams: [], codeAttached: false, notebookId: null,
    autoCheckResult: { sdk: 'pass', description: 'fail', category: 'pass', executionType: 'fail', overall: 'fail', checkedAt: d(0) },
    usageHistory: [], reviews: [], changeHistory: [],
  },
  {
    id: 'algo_s4', title: 'Variational Ansatz Explorer (반려됨)',
    description: '다양한 변분 앤사츠 탐색 도구. 설명 불충분으로 반려.',
    version: '0.1.0', versions: [],
    sdk: 'Qiskit', category: '최적화', tags: ['변분', '앤사츠'],
    authorId: 'user_1', status: 'rejected', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(5), updatedAt: d(3), publishedAt: null,
    executionType: 'simulator', inputParams: [], outputParams: [], codeAttached: true, notebookId: null, codeSource: 'direct',
    algorithmCode: 'from qiskit import QuantumCircuit\n\ndef variational_ansatz(n_qubits=4):\n    qc = QuantumCircuit(n_qubits)\n    for i in range(n_qubits):\n        qc.ry(0.5, i)\n    return qc',
    autoCheckResult: { sdk: 'pass', description: 'fail', category: 'pass', executionType: 'warn', overall: 'fail', checkedAt: d(4) },
    rejectReason: '알고리즘 설명이 20자 미만으로 불충분합니다. 목적, 사용 사례, 입출력 구조를 구체적으로 기술해 주세요.',
    rejectedAt: d(3),
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '반려 처리', at: d(3) },
      { userId: 'system', action: '등록 요청 접수', at: d(5) },
    ],
  },

  {
    id: 'algo_05', title: 'Quantum Phase Estimation',
    description: "양자 위상 추정 알고리즘. 유니터리 연산자의 고유값을 추정하며 쇼어·HHL 알고리즘의 핵심 서브루틴입니다.",
    version: '1.2.0',
    versions: [
      { version: '1.2.0', publishedAt: d(18), changelog: '보조 큐비트 재사용으로 메모리 절감' },
      { version: '1.1.0', publishedAt: d(40), changelog: '카운팅 큐비트 상한 8→16 확장' },
      { version: '1.0.0', publishedAt: d(65), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['위상추정', '서브루틴'],
    authorId: 'user_4', status: 'published', isRecommended: false,
    viewCount: 445, runCount: 67, rating: 4.2, ratingCount: 14,
    createdAt: d(68), updatedAt: d(18), publishedAt: d(65),
    inputParams: [{ name: 'n_counting', type: 'number', required: true, description: '카운팅 큐비트 수', defaultValue: 4 }],
    outputParams: [{ name: 'phase', type: 'number', required: true, description: '추정 위상 값' }],
    exampleCode: `from algorithm import run
result = run(n_counting=4)
print('추정 위상:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(18) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(40) },
      { userId: 'system', action: '승인 처리', at: d(65) },
      { userId: 'system', action: '등록 요청 접수', at: d(68) },
    ],
  },
  {
    id: 'algo_06', title: 'HHL — Linear Systems Solver',
    description: "선형 방정식 시스템 HHL 알고리즘. Ax=b를 지수적으로 빠르게 풀어냅니다.",
    version: '1.1.0',
    versions: [
      { version: '1.1.0', publishedAt: d(30), changelog: '조건수 사전 검사 추가' },
      { version: '1.0.0', publishedAt: d(62), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['선형대수', 'HHL', '고급'],
    authorId: 'user_5', status: 'published', isRecommended: false,
    viewCount: 312, runCount: 43, rating: 4.1, ratingCount: 9,
    createdAt: d(65), updatedAt: d(30), publishedAt: d(62),
    inputParams: [
      { name: 'matrix_json', type: 'string', required: true, description: '행렬 A (JSON)' },
      { name: 'vector_json', type: 'string', required: true, description: '벡터 b (JSON)' },
    ],
    outputParams: [{ name: 'solution', type: 'array', required: true, description: '해벡터 x' }],
    exampleCode: `from algorithm import run
result = run(A=[[1,0],[0,2]], b=[1,0])
print('해 벡터 x:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(30) },
      { userId: 'system', action: '승인 처리', at: d(62) },
      { userId: 'system', action: '등록 요청 접수', at: d(65) },
    ],
  },
  {
    id: 'algo_07', title: 'Quantum Fourier Transform',
    description: "양자 푸리에 변환. 고전 FFT의 양자 버전으로 위상 추정, 쇼어 알고리즘 등 핵심 서브루틴.",
    version: '1.4.0',
    versions: [
      { version: '1.4.0', publishedAt: d(12), changelog: '게이트 최소화 — SWAP 생략 옵션 추가' },
      { version: '1.3.0', publishedAt: d(25), changelog: '근사 QFT 모드 추가 (approximation_degree)' },
      { version: '1.2.0', publishedAt: d(38), changelog: '역 QFT 지원' },
      { version: '1.1.0', publishedAt: d(48), changelog: '큐비트 순서 옵션 추가' },
      { version: '1.0.0', publishedAt: d(55), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['QFT', '서브루틴', '기초'],
    authorId: 'user_2', status: 'published', isRecommended: false,
    viewCount: 890, runCount: 234, rating: 4.7, ratingCount: 41,
    createdAt: d(58), updatedAt: d(12), publishedAt: d(55),
    inputParams: [{ name: 'n_qubits', type: 'number', required: true, description: '큐비트 수', defaultValue: 4 }],
    outputParams: [{ name: 'qft_circuit', type: 'string', required: true, description: 'QFT 회로 QASM' }],
    exampleCode: `from algorithm import run
result = run(n_qubits=4)
print('QFT 출력 상태:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.4.0 새 버전 승인', at: d(12) },
      { userId: 'system', action: 'v1.3.0 새 버전 승인', at: d(25) },
      { userId: 'admin_1', action: '메타데이터 편집', at: d(32) },
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(38) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(48) },
      { userId: 'system', action: '승인 처리', at: d(55) },
      { userId: 'system', action: '등록 요청 접수', at: d(58) },
    ],
  },
  {
    id: 'algo_08', title: 'Quantum Teleportation Protocol',
    description: "양자 순간이동 프로토콜. 얽힘과 고전 통신을 이용해 양자 상태를 전송합니다.",
    version: '1.0.2',
    versions: [
      { version: '1.0.2', publishedAt: d(20), changelog: '교정 회로 위상 오류 수정' },
      { version: '1.0.1', publishedAt: d(35), changelog: '측정 기저 명세 문서화' },
      { version: '1.0.0', publishedAt: d(50), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['순간이동', '얽힘', '기초'],
    authorId: 'user_3', status: 'published', isRecommended: false,
    viewCount: 567, runCount: 178, rating: 4.4, ratingCount: 23,
    createdAt: d(52), updatedAt: d(20), publishedAt: d(50),
    inputParams: [{ name: 'state', type: 'string', required: true, description: '전송할 양자 상태 (|0>, |1>, |+>)' }],
    outputParams: [{ name: 'received_state', type: 'string', required: true, description: '수신된 양자 상태' }],
    exampleCode: `from algorithm import run
result = run(message='01')
print('전송된 큐비트:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.0.2 새 버전 승인', at: d(20) },
      { userId: 'system', action: 'v1.0.1 새 버전 승인', at: d(35) },
      { userId: 'system', action: '승인 처리', at: d(50) },
      { userId: 'system', action: '등록 요청 접수', at: d(52) },
    ],
  },
  {
    id: 'algo_09', title: 'Deutsch-Jozsa Algorithm',
    description: "도이치-조자 알고리즘. 함수가 상수인지 균형인지를 단 한 번의 양자 쿼리로 결정합니다.",
    version: '1.0.0',
    versions: [
      { version: '1.0.0', publishedAt: d(50), changelog: '초기 출시' },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['오라클', '기초', '교육'],
    authorId: 'user_4', status: 'published', isRecommended: false,
    viewCount: 723, runCount: 321, rating: 4.9, ratingCount: 67,
    createdAt: d(53), updatedAt: d(50), publishedAt: d(50),
    inputParams: [
      { name: 'n', type: 'number', required: true, description: '입력 비트 수', defaultValue: 3 },
      { name: 'oracle_type', type: 'string', required: true, description: 'constant 또는 balanced' },
    ],
    outputParams: [{ name: 'result', type: 'string', required: true, description: 'constant 또는 balanced 판정' }],
    exampleCode: `from algorithm import run
result = run(oracle_type='constant')  # 'constant' or 'balanced'
print('판정:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(50) },
      { userId: 'system', action: '등록 요청 접수', at: d(53) },
    ],
  },
  {
    id: 'algo_10', title: "Simon's Algorithm",
    description: "사이몬 알고리즘. 숨겨진 부분군 문제를 지수적으로 빠르게 해결합니다.",
    version: '1.1.0',
    versions: [
      { version: '1.1.0', publishedAt: d(30), changelog: '포스트프로세싱 가우스 소거 내장' },
      { version: '1.0.0', publishedAt: d(72), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Qiskit', category: '최적화', tags: ['부분군', '기초', '교육'],
    authorId: 'user_5', status: 'published', isRecommended: false,
    viewCount: 389, runCount: 89, rating: 4.2, ratingCount: 15,
    createdAt: d(75), updatedAt: d(30), publishedAt: d(72),
    inputParams: [{ name: 'n', type: 'number', required: true, description: '비트 수', defaultValue: 3 }],
    outputParams: [{ name: 'hidden_string', type: 'string', required: true, description: '숨겨진 문자열 s' }],
    exampleCode: `from algorithm import run
result = run(secret='1101')
print('복원된 비트열:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_QISKIT, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(30) },
      { userId: 'system', action: '승인 처리', at: d(72) },
      { userId: 'system', action: '등록 요청 접수', at: d(75) },
    ],
  },

  // ─── Pennylane / 양자 머신러닝 / published ───────────────────────────────────
  {
    id: 'algo_11', title: 'Quantum Support Vector Machine',
    description: "양자 커널을 사용한 SVM. 고전 SVM보다 높은 차원의 특징 공간을 효율적으로 탐색합니다.",
    version: '1.2.0',
    versions: [
      { version: '1.2.0', publishedAt: d(10), changelog: '커널 캐싱으로 추론 속도 2× 향상' },
      { version: '1.1.0', publishedAt: d(30), changelog: '다중 클래스 분류 지원' },
      { version: '1.0.0', publishedAt: d(68), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['SVM', '분류', '머신러닝'],
    authorId: 'user_6', status: 'published', isRecommended: true,
    viewCount: 645, runCount: 187, rating: 4.5, ratingCount: 31,
    createdAt: d(70), updatedAt: d(10), publishedAt: d(68),
    inputParams: [
      { name: 'train_data', type: 'array', required: true, description: '훈련 데이터 (JSON)' },
      { name: 'kernel_type', type: 'string', required: false, description: '커널 유형', defaultValue: 'rbf' },
    ],
    outputParams: [{ name: 'predictions', type: 'array', required: true, description: '분류 결과' }],
    exampleCode: `from algorithm import run\nimport json\ntrain_data = json.dumps([[0.1, 0.2], [0.5, 0.8]])\nresult = run(train_data=train_data, kernel_type="rbf")\nprint("예측 결과:", result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(10) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(30) },
      { userId: 'system', action: '승인 처리', at: d(68) },
      { userId: 'system', action: '등록 요청 접수', at: d(70) },
    ],
  },
  {
    id: 'algo_12', title: 'Quantum Neural Network',
    description: "변분 양자 회로 기반 신경망. 이미지 분류, 패턴 인식에 활용 가능한 QNN 구현입니다.",
    version: '2.1.0',
    versions: [
      { version: '2.1.0', publishedAt: d(8),  changelog: 'Dropout 레이어 추가' },
      { version: '2.0.0', publishedAt: d(22), changelog: 'v2 재설계 — 자동 미분 지원' },
      { version: '1.2.0', publishedAt: d(38), changelog: 'Batch 학습 지원' },
      { version: '1.1.0', publishedAt: d(50), changelog: '활성화 함수 선택 옵션 추가' },
      { version: '1.0.0', publishedAt: d(63), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['QNN', '신경망', '딥러닝'],
    authorId: 'user_7', status: 'published', isRecommended: true,
    viewCount: 821, runCount: 243, rating: 4.6, ratingCount: 45,
    createdAt: d(65), updatedAt: d(8), publishedAt: d(63),
    inputParams: [
      { name: 'n_layers', type: 'number', required: true, description: '레이어 수', defaultValue: 3 },
      { name: 'n_qubits', type: 'number', required: true, description: '큐비트 수', defaultValue: 4 },
    ],
    outputParams: [{ name: 'output', type: 'array', required: true, description: '출력 확률 분포' }],
    exampleCode: `from algorithm import run
result = run(n_layers=3, n_qubits=4)
print('QNN 출력:', result)`,
    executionType: 'hybrid', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v2.1.0 새 버전 승인', at: d(8) },
      { userId: 'system', action: 'v2.0.0 새 버전 승인', at: d(22) },
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(38) },
      { userId: 'admin_1', action: '메타데이터 편집', at: d(45) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(50) },
      { userId: 'system', action: '승인 처리', at: d(63) },
      { userId: 'system', action: '등록 요청 접수', at: d(65) },
    ],
  },
  {
    id: 'algo_13', title: 'Bernstein-Vazirani Algorithm',
    description: "버른스타인-바지라니 알고리즘. 숨겨진 비트 문자열을 단 한 번의 양자 쿼리로 찾아냅니다.",
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(40), changelog: '초기 출시' }],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['오라클', '기초'],
    authorId: 'user_6', status: 'published', isRecommended: false,
    viewCount: 412, runCount: 134, rating: 4.3, ratingCount: 18,
    createdAt: d(42), updatedAt: d(40), publishedAt: d(40),
    inputParams: [{ name: 'secret', type: 'string', required: true, description: '숨겨진 비트 문자열' }],
    outputParams: [{ name: 'found', type: 'string', required: true, description: '발견된 비트 문자열' }],
    exampleCode: `from algorithm import run
result = run(secret_string='101')
print('복원된 비밀 문자열:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(40) },
      { userId: 'system', action: '등록 요청 접수', at: d(42) },
    ],
  },
  {
    id: 'algo_14', title: 'Quantum Transfer Learning',
    description: "사전훈련된 고전 모델의 특징을 양자 회로와 결합한 전이 학습 알고리즘.",
    version: '1.3.0',
    versions: [
      { version: '1.3.0', publishedAt: d(15), changelog: 'ResNet-50 사전훈련 모델 지원' },
      { version: '1.2.0', publishedAt: d(30), changelog: '데이터 임베딩 레이어 개선' },
      { version: '1.1.0', publishedAt: d(45), changelog: 'PyTorch 2.x 호환성 업데이트' },
      { version: '1.0.0', publishedAt: d(58), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['전이학습', '하이브리드', '딥러닝'],
    authorId: 'user_8', status: 'published', isRecommended: false,
    viewCount: 534, runCount: 112, rating: 4.1, ratingCount: 22,
    createdAt: d(60), updatedAt: d(15), publishedAt: d(58),
    inputParams: [{ name: 'pretrained_model', type: 'string', required: true, description: '사전훈련 모델 경로' }],
    outputParams: [{ name: 'accuracy', type: 'number', required: true, description: '검증 정확도' }],
    exampleCode: `from algorithm import run
result = run(pretrained_weights='resnet18', n_qubits=4)
print('분류 확률:', result)`,
    executionType: 'hybrid', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.3.0 새 버전 승인', at: d(15) },
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(30) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(45) },
      { userId: 'system', action: '승인 처리', at: d(58) },
      { userId: 'system', action: '등록 요청 접수', at: d(60) },
    ],
  },
  {
    id: 'algo_15', title: 'Quantum Generative Adversarial Network',
    description: "양자 GAN. 양자 생성자와 고전 판별자로 구성된 QGAN 구현입니다.",
    version: '1.1.0',
    versions: [
      { version: '1.1.0', publishedAt: d(22), changelog: '학습 안정성 개선 — 그래디언트 클리핑 추가' },
      { version: '1.0.0', publishedAt: d(53), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['GAN', '생성모델'],
    authorId: 'user_7', status: 'published', isRecommended: false,
    viewCount: 378, runCount: 76, rating: 3.9, ratingCount: 12,
    createdAt: d(55), updatedAt: d(22), publishedAt: d(53),
    inputParams: [{ name: 'n_epochs', type: 'number', required: true, description: '학습 에폭', defaultValue: 100 }],
    outputParams: [{ name: 'generated_samples', type: 'array', required: true, description: '생성된 샘플' }],
    exampleCode: `from algorithm import run
result = run(n_qubits=4, n_epochs=50)
print('생성된 샘플:', result)`,
    executionType: 'hybrid', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(22) },
      { userId: 'system', action: '승인 처리', at: d(53) },
      { userId: 'system', action: '등록 요청 접수', at: d(55) },
    ],
  },
  {
    id: 'algo_16', title: 'Quantum Reinforcement Learning',
    description: "양자 강화학습. Variational Quantum Circuit을 정책 함수로 사용합니다.",
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(55), changelog: '초기 출시' }],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['강화학습', 'RL', '고급'],
    authorId: 'user_6', status: 'published', isRecommended: false,
    viewCount: 289, runCount: 45, rating: 4.0, ratingCount: 8,
    createdAt: d(58), updatedAt: d(55), publishedAt: d(55),
    inputParams: [{ name: 'env_name', type: 'string', required: true, description: 'Gym 환경 이름', defaultValue: 'CartPole-v1' }],
    outputParams: [{ name: 'reward', type: 'number', required: true, description: '평균 보상' }],
    exampleCode: `from algorithm import run
result = run(env='CartPole-v1', n_episodes=100)
print('평균 보상:', result)`,
    executionType: 'hybrid', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(55) },
      { userId: 'system', action: '등록 요청 접수', at: d(58) },
    ],
  },
  {
    id: 'algo_17', title: 'Amplitude Estimation',
    description: "진폭 추정 알고리즘. 양자 몬테카를로 시뮬레이션의 핵심 서브루틴.",
    version: '1.2.0',
    versions: [
      { version: '1.2.0', publishedAt: d(20), changelog: '분산 감소 — MLQAE 방식 채택' },
      { version: '1.1.0', publishedAt: d(40), changelog: '정밀도 파라미터 추가' },
      { version: '1.0.0', publishedAt: d(63), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['진폭추정', '몬테카를로'],
    authorId: 'user_8', status: 'published', isRecommended: false,
    viewCount: 334, runCount: 89, rating: 4.2, ratingCount: 16,
    createdAt: d(65), updatedAt: d(20), publishedAt: d(63),
    inputParams: [
      { name: 'oracle', type: 'string', required: true, description: '오라클 함수' },
      { name: 'precision', type: 'number', required: false, description: '정밀도', defaultValue: 4 },
    ],
    outputParams: [{ name: 'amplitude', type: 'number', required: true, description: '추정 진폭' }],
    exampleCode: `from algorithm import run
result = run(epsilon=0.01, n_qubits=4)
print('진폭 추정값:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(20) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(40) },
      { userId: 'system', action: '승인 처리', at: d(63) },
      { userId: 'system', action: '등록 요청 접수', at: d(65) },
    ],
  },
  {
    id: 'algo_18', title: 'Quantum Natural Language Processing',
    description: "DisCoCat 모델 기반 양자 자연어 처리. 문장 의미를 양자 회로로 표현합니다.",
    version: '0.9.0',
    versions: [{ version: '0.9.0', publishedAt: d(32), changelog: '베타 출시 — 기본 문법 구조 지원' }],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['NLP', '언어처리', '베타'],
    authorId: 'user_7', status: 'published', isRecommended: false,
    viewCount: 456, runCount: 67, rating: 3.8, ratingCount: 11,
    createdAt: d(35), updatedAt: d(32), publishedAt: d(32),
    inputParams: [{ name: 'sentence', type: 'string', required: true, description: '분석할 문장' }],
    outputParams: [{ name: 'embedding', type: 'array', required: true, description: '양자 임베딩 벡터' }],
    exampleCode: `from algorithm import run
result = run(sentence='양자 컴퓨팅은 미래다')
print('문장 분류:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(32) },
      { userId: 'system', action: '등록 요청 접수', at: d(35) },
    ],
  },
  {
    id: 'algo_19', title: 'Data Re-uploading Classifier',
    description: "데이터 재업로드 기법을 활용한 양자 분류기. 단일 큐비트로도 높은 분류 성능을 달성합니다.",
    version: '1.1.0',
    versions: [
      { version: '1.1.0', publishedAt: d(18), changelog: '멀티 큐비트 확장 모드 추가' },
      { version: '1.0.0', publishedAt: d(43), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['분류', '재업로드', '효율'],
    authorId: 'user_6', status: 'published', isRecommended: false,
    viewCount: 278, runCount: 56, rating: 4.1, ratingCount: 13,
    createdAt: d(45), updatedAt: d(18), publishedAt: d(43),
    inputParams: [
      { name: 'data', type: 'array', required: true, description: '입력 데이터' },
      { name: 'layers', type: 'number', required: false, description: '재업로드 레이어 수', defaultValue: 3 },
    ],
    outputParams: [{ name: 'class_probs', type: 'array', required: true, description: '클래스별 확률' }],
    exampleCode: `from algorithm import run
result = run(data_point=[0.3, 0.7], n_layers=5)
print('분류 결과:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(18) },
      { userId: 'system', action: '승인 처리', at: d(43) },
      { userId: 'system', action: '등록 요청 접수', at: d(45) },
    ],
  },
  {
    id: 'algo_20', title: 'Quantum Kernel Trainer',
    description: "양자 커널 함수 훈련 알고리즘. 양자 특징 맵을 최적화하여 분류 성능을 향상시킵니다.",
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(38), changelog: '초기 출시' }],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['커널', '최적화', '분류'],
    authorId: 'user_8', status: 'published', isRecommended: false,
    viewCount: 312, runCount: 78, rating: 4.2, ratingCount: 17,
    createdAt: d(40), updatedAt: d(38), publishedAt: d(38),
    inputParams: [
      { name: 'train_X', type: 'array', required: true, description: '훈련 특징 행렬' },
      { name: 'train_y', type: 'array', required: true, description: '레이블' },
    ],
    outputParams: [{ name: 'kernel_matrix', type: 'array', required: true, description: '최적화된 커널 행렬' }],
    exampleCode: `from algorithm import run
result = run(X_train=[[0,0],[1,1]], y_train=[0,1])
print('커널 행렬:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_PENNYLANE, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(38) },
      { userId: 'system', action: '등록 요청 접수', at: d(40) },
    ],
  },

  // ─── CUDA-Q / 양자 통신 / published ─────────────────────────────────────────
  {
    id: 'algo_21', title: 'Bell State Preparation',
    description: "벨 상태 생성 알고리즘. 최대 얽힘 상태의 4가지 벨 기저를 생성합니다.",
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(60), changelog: '초기 출시' }],
    sdk: 'CUDA-Q', category: '양자 통신', tags: ['얽힘', '벨상태', '기초'],
    authorId: 'user_9', status: 'published', isRecommended: false,
    viewCount: 934, runCount: 412, rating: 4.7, ratingCount: 89,
    createdAt: d(62), updatedAt: d(60), publishedAt: d(60),
    inputParams: [{ name: 'bell_type', type: 'string', required: true, description: 'Phi+, Phi-, Psi+, Psi-', defaultValue: 'Phi+' }],
    outputParams: [{ name: 'state', type: 'string', required: true, description: '생성된 벨 상태' }],
    exampleCode: `from algorithm import run\nresult = run(shots_count=1000)\nprint("벨 상태 측정:", result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CUDAQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(60) },
      { userId: 'system', action: '등록 요청 접수', at: d(62) },
    ],
  },
  {
    id: 'algo_22', title: 'GHZ State Generator',
    description: "GHZ(Greenberger-Horne-Zeilinger) 상태 생성. 다자 얽힘 상태 생성 및 검증.",
    version: '1.1.0',
    versions: [
      { version: '1.1.0', publishedAt: d(40), changelog: '충실도 검증 회로 추가' },
      { version: '1.0.0', publishedAt: d(78), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'CUDA-Q', category: '양자 통신', tags: ['GHZ', '다자얽힘', '기초'],
    authorId: 'user_9', status: 'published', isRecommended: false,
    viewCount: 678, runCount: 234, rating: 4.5, ratingCount: 42,
    createdAt: d(80), updatedAt: d(40), publishedAt: d(78),
    inputParams: [{ name: 'n_qubits', type: 'number', required: true, description: '큐비트 수 (3~10)', defaultValue: 3 }],
    outputParams: [{ name: 'ghz_state', type: 'string', required: true, description: 'GHZ 상태 측정 결과' }],
    exampleCode: `from algorithm import run
result = run(n_qubits=3)
print('GHZ 상태 측정:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CUDAQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(40) },
      { userId: 'system', action: '승인 처리', at: d(78) },
      { userId: 'system', action: '등록 요청 접수', at: d(80) },
    ],
  },
  {
    id: 'algo_23', title: 'Quantum Key Distribution (BB84)',
    description: "BB84 프로토콜 기반 양자 키 분배. 양자역학 원리를 이용한 정보이론적 안전 키 교환.",
    version: '2.0.0',
    versions: [
      { version: '2.0.0', publishedAt: d(18), changelog: '도청 탐지 정확도 99.9% 달성 — 완전 재설계' },
      { version: '1.2.0', publishedAt: d(38), changelog: '오류율 보정 알고리즘 추가' },
      { version: '1.1.0', publishedAt: d(55), changelog: '키 길이 2048→4096 비트 지원' },
      { version: '1.0.0', publishedAt: d(68), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'CUDA-Q', category: '양자 통신', tags: ['QKD', 'BB84', '암호'],
    authorId: 'user_10', status: 'published', isRecommended: true,
    viewCount: 756, runCount: 198, rating: 4.6, ratingCount: 37,
    createdAt: d(70), updatedAt: d(18), publishedAt: d(68),
    inputParams: [{ name: 'key_length', type: 'number', required: true, description: '원하는 키 길이 (비트)', defaultValue: 256 }],
    outputParams: [{ name: 'shared_key', type: 'string', required: true, description: '공유된 비밀 키' }],
    exampleCode: `from algorithm import run
result = run(key_length=128)
print('공유 키:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CUDAQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v2.0.0 새 버전 승인', at: d(18) },
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(38) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(55) },
      { userId: 'system', action: '승인 처리', at: d(68) },
      { userId: 'system', action: '등록 요청 접수', at: d(70) },
    ],
  },
  {
    id: 'algo_24', title: 'Quantum Error Correction (Surface Code)',
    description: "표면 코드 기반 양자 오류 정정. 실용적 양자 컴퓨팅 구현의 핵심 기술.",
    version: '1.3.0',
    versions: [
      { version: '1.3.0', publishedAt: d(25), changelog: 'MWPM 디코더 속도 3× 향상' },
      { version: '1.2.0', publishedAt: d(40), changelog: 'distance=5 지원 추가' },
      { version: '1.1.0', publishedAt: d(52), changelog: '논리 게이트 연산 지원' },
      { version: '1.0.0', publishedAt: d(63), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'CUDA-Q', category: '양자 통신', tags: ['오류정정', '표면코드', '고급'],
    authorId: 'user_9', status: 'published', isRecommended: false,
    viewCount: 423, runCount: 87, rating: 4.3, ratingCount: 19,
    createdAt: d(65), updatedAt: d(25), publishedAt: d(63),
    inputParams: [{ name: 'distance', type: 'number', required: true, description: '코드 거리 (홀수)', defaultValue: 3 }],
    outputParams: [{ name: 'logical_error_rate', type: 'number', required: true, description: '논리 오류율' }],
    exampleCode: `from algorithm import run
result = run(n_data=7, n_check=3)
print('오류 정정 결과:', result)`,
    executionType: 'hardware', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CUDAQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.3.0 새 버전 승인', at: d(25) },
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(40) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(52) },
      { userId: 'system', action: '승인 처리', at: d(63) },
      { userId: 'system', action: '등록 요청 접수', at: d(65) },
    ],
  },
  {
    id: 'algo_25', title: 'Quantum Entanglement Distillation',
    description: "얽힘 증류 프로토콜. 잡음이 있는 얽힘 쌍에서 최대 얽힘 상태를 정제합니다.",
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(50), changelog: '초기 출시' }],
    sdk: 'CUDA-Q', category: '양자 통신', tags: ['얽힘증류', '양자중계'],
    authorId: 'user_10', status: 'published', isRecommended: false,
    viewCount: 287, runCount: 54, rating: 4.0, ratingCount: 10,
    createdAt: d(52), updatedAt: d(50), publishedAt: d(50),
    inputParams: [{ name: 'fidelity', type: 'number', required: true, description: '초기 얽힘 충실도', defaultValue: 0.85 }],
    outputParams: [{ name: 'distilled_pairs', type: 'number', required: true, description: '증류된 쌍 수' }],
    exampleCode: `from algorithm import run
result = run(n_pairs=4, fidelity_threshold=0.9)
print('증류된 얽힘 쌍:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CUDAQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(50) },
      { userId: 'system', action: '등록 요청 접수', at: d(52) },
    ],
  },
  {
    id: 'algo_26', title: 'Quantum Random Number Generator',
    description: "진성 양자 난수 생성기. 양자 측정의 근본적 불확정성을 이용한 암호학적으로 안전한 난수 생성.",
    version: '1.2.0',
    versions: [
      { version: '1.2.0', publishedAt: d(12), changelog: '편향 보정 폰 노이만 추출기 내장' },
      { version: '1.1.0', publishedAt: d(30), changelog: '출력 포맷 hex/binary/int 지원' },
      { version: '1.0.0', publishedAt: d(58), changelog: '초기 출시', deprecated: true },
    ],
    sdk: 'CUDA-Q', category: '양자 통신', tags: ['난수', 'QRNG', '암호'],
    authorId: 'user_9', status: 'published', isRecommended: false,
    viewCount: 1123, runCount: 567, rating: 4.8, ratingCount: 98,
    createdAt: d(60), updatedAt: d(12), publishedAt: d(58),
    inputParams: [{ name: 'n_bits', type: 'number', required: true, description: '생성할 비트 수', defaultValue: 256 }],
    outputParams: [{ name: 'random_bits', type: 'string', required: true, description: '생성된 난수 비트 문자열' }],
    exampleCode: `from algorithm import run
result = run(n_bits=256)
print('난수:', result)`,
    executionType: 'hardware', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CUDAQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: 'v1.2.0 새 버전 승인', at: d(12) },
      { userId: 'system', action: 'v1.1.0 새 버전 승인', at: d(30) },
      { userId: 'admin_1', action: '메타데이터 편집', at: d(45) },
      { userId: 'system', action: '승인 처리', at: d(58) },
      { userId: 'system', action: '등록 요청 접수', at: d(60) },
    ],
  },
  {
    id: 'algo_27', title: 'Quantum Superdense Coding',
    description: "초밀집 코딩 프로토콜. 1큐비트 전송으로 2비트 고전 정보를 전달합니다.",
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(55), changelog: '초기 출시' }],
    sdk: 'CUDA-Q', category: '양자 통신', tags: ['초밀집코딩', '얽힘', '기초'],
    authorId: 'user_10', status: 'published', isRecommended: false,
    viewCount: 445, runCount: 178, rating: 4.4, ratingCount: 28,
    createdAt: d(57), updatedAt: d(55), publishedAt: d(55),
    inputParams: [{ name: 'message_bits', type: 'string', required: true, description: '전송할 2비트 메시지 (00/01/10/11)' }],
    outputParams: [{ name: 'received', type: 'string', required: true, description: '수신된 메시지' }],
    exampleCode: `from algorithm import run
result = run(classical_bits='10')
print('전송 결과:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CUDAQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(55) },
      { userId: 'system', action: '등록 요청 접수', at: d(57) },
    ],
  },
  {
    id: 'algo_28', title: 'Quantum Secret Sharing',
    description: "양자 비밀 공유 프로토콜. (k, n)-임계값 방식으로 비밀을 n명에게 분산합니다.",
    version: '1.0.0',
    versions: [{ version: '1.0.0', publishedAt: d(40), changelog: '초기 출시' }],
    sdk: 'CUDA-Q', category: '양자 통신', tags: ['비밀공유', '다자', '암호'],
    authorId: 'user_9', status: 'published', isRecommended: false,
    viewCount: 234, runCount: 43, rating: 4.1, ratingCount: 9,
    createdAt: d(42), updatedAt: d(40), publishedAt: d(40),
    inputParams: [
      { name: 'secret', type: 'string', required: true, description: '공유할 비밀 비트' },
      { name: 'n_parties', type: 'number', required: true, description: '참여자 수', defaultValue: 3 },
    ],
    outputParams: [{ name: 'shares', type: 'array', required: true, description: '분산된 공유값 목록' }],
    exampleCode: `from algorithm import run
result = run(secret='퀀텀시크릿', n_parties=3)
print('복원된 비밀:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CUDAQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '승인 처리', at: d(40) },
      { userId: 'system', action: '등록 요청 접수', at: d(42) },
    ],
  },

  // ─── Cirq / 시뮬레이션 / pending ─────────────────────────────────────────────
  {
    id: 'algo_29', title: 'Variational Circuit Ansatz Library',
    description: "다양한 앤사츠 회로 구조를 제공하는 라이브러리. HEA, RealAmplitudes, EfficientSU2 등 포함.",
    version: '0.1.0',
    versions: [{ version: '0.1.0', publishedAt: d(2), changelog: '초기 등록 요청' }],
    sdk: 'Cirq', category: '시뮬레이션', tags: ['앤사츠', '변분', '라이브러리'],
    authorId: 'user_1', status: 'pending', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(2), updatedAt: d(2), publishedAt: null,
    inputParams: [{ name: 'ansatz_type', type: 'string', required: true, description: '앤사츠 유형' }],
    outputParams: [{ name: 'circuit', type: 'string', required: true, description: 'Cirq 회로' }],
    exampleCode: `from algorithm import run\ncircuit = run(n_qubits=4, depth=2)\nprint("생성된 앤사츠:\n", circuit)`,
    executionType: 'simulator', codeAttached: true, notebookId: null,
    codeSource: 'file', fileName: 'variational_ansatz.py',
    algorithmCode: `import cirq\nimport numpy as np\n\ndef hea_ansatz(n_qubits: int, depth: int, params: np.ndarray) -> cirq.Circuit:\n    qubits = cirq.LineQubit.range(n_qubits)\n    circuit = cirq.Circuit()\n    idx = 0\n    for _ in range(depth):\n        circuit.append(cirq.Ry(rads=params[idx + i])(qubits[i]) for i in range(n_qubits))\n        idx += n_qubits\n        circuit.append(cirq.Rz(rads=params[idx + i])(qubits[i]) for i in range(n_qubits))\n        idx += n_qubits\n        circuit.append(cirq.CZ(qubits[i], qubits[i + 1]) for i in range(n_qubits - 1))\n    return circuit`,
    autoCheckResult: autoWarn, usageHistory: [], reviews: [],
    changeHistory: [{ userId: 'system', action: '등록 요청 접수', at: d(2) }],
  },
  {
    id: 'algo_30', title: 'Quantum Chemistry Simulation',
    description: "분자 해밀토니안 시뮬레이션. OpenFermion + Cirq를 활용한 양자화학 계산.",
    version: '0.2.0',
    versions: [{ version: '0.2.0', publishedAt: d(1), changelog: '분자 데이터베이스 확장' }],
    sdk: 'Cirq', category: '시뮬레이션', tags: ['화학', '해밀토니안', '시뮬레이션'],
    authorId: 'user_2', status: 'pending', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(1), updatedAt: d(1), publishedAt: null,
    inputParams: [{ name: 'molecule', type: 'string', required: true, description: '분자 식' }],
    outputParams: [{ name: 'energy', type: 'number', required: true, description: '에너지 (Hartree)' }],
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct',
    exampleCode: `from algorithm import run
result = run(molecule='LiH', basis='sto-3g')
print('해밀토니안 에너지:', result)`,
    algorithmCode: `import cirq\nimport openfermion`,
    autoCheckResult: autoWarn, usageHistory: [], reviews: [],
    changeHistory: [{ userId: 'system', action: '등록 요청 접수', at: d(1) }],
  },
  {
    id: 'algo_31', title: 'Quantum Monte Carlo Simulation',
    description: "양자 몬테카를로 시뮬레이션. 확률 분포 샘플링을 통한 적분 계산.",
    version: '0.1.0',
    versions: [{ version: '0.1.0', publishedAt: d(3), changelog: '초기 등록 요청' }],
    sdk: 'Cirq', category: '시뮬레이션', tags: ['몬테카를로', '확률', '적분'],
    authorId: 'user_3', status: 'pending', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(3), updatedAt: d(3), publishedAt: null,
    inputParams: [{ name: 'n_samples', type: 'number', required: true, description: '샘플 수', defaultValue: 1000 }],
    outputParams: [{ name: 'estimate', type: 'number', required: true, description: '추정값' }],
    exampleCode: `from algorithm import run
result = run(n_samples=10000, dimension=3)
print('몬테카를로 적분값:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CIRQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [{ userId: 'system', action: '등록 요청 접수', at: d(3) }],
  },
  {
    id: 'algo_32', title: 'Quantum Noise Simulation',
    description: "양자 잡음 채널 시뮬레이션. 비트 플립, 위상 플립, 탈편광 등 다양한 잡음 모델 구현.",
    version: '0.1.0',
    versions: [{ version: '0.1.0', publishedAt: d(4), changelog: '초기 등록 요청' }],
    sdk: 'Cirq', category: '시뮬레이션', tags: ['잡음', '채널', '오류모델'],
    authorId: 'user_4', status: 'pending', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(4), updatedAt: d(4), publishedAt: null,
    inputParams: [
      { name: 'noise_type', type: 'string', required: true, description: '잡음 유형' },
      { name: 'error_rate', type: 'number', required: true, description: '오류율', defaultValue: 0.01 },
    ],
    outputParams: [{ name: 'fidelity', type: 'number', required: true, description: '결과 충실도' }],
    exampleCode: `from algorithm import run
result = run(noise_model='depolarizing', error_rate=0.01)
print('잡음 시뮬레이션 결과:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CIRQ, autoCheckResult: autoPass,
    usageHistory: [], reviews: [],
    changeHistory: [{ userId: 'system', action: '등록 요청 접수', at: d(4) }],
  },
  {
    id: 'algo_33', title: 'Tensor Network Quantum Simulator',
    description: "텐서 네트워크 기반 양자 시뮬레이터. 대규모 양자 회로를 효율적으로 시뮬레이션합니다.",
    version: '0.1.0',
    versions: [{ version: '0.1.0', publishedAt: d(5), changelog: '초기 등록 요청' }],
    sdk: 'Cirq', category: '시뮬레이션', tags: ['텐서네트워크', '대규모', '시뮬레이션'],
    authorId: 'user_5', status: 'pending', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(5), updatedAt: d(5), publishedAt: null,
    inputParams: [
      { name: 'circuit_qasm', type: 'string', required: true, description: 'QASM 회로' },
      { name: 'bond_dim', type: 'number', required: false, description: '결합 차원', defaultValue: 64 },
    ],
    outputParams: [{ name: 'state_vector', type: 'array', required: true, description: '상태 벡터' }],
    exampleCode: `from algorithm import run
result = run(n_qubits=20, bond_dim=64)
print('상태 벡터 근사:', result)`,
    executionType: 'simulator', codeAttached: true, notebookId: null, codeSource: 'direct', algorithmCode: CODE_CIRQ, autoCheckResult: autoWarn,
    usageHistory: [], reviews: [],
    changeHistory: [{ userId: 'system', action: '등록 요청 접수', at: d(5) }],
  },

  // ─── Qiskit / draft ──────────────────────────────────────────────────────────
  {
    id: 'algo_34', title: 'Test Algorithm Alpha', description: '테스트 알고리즘 초안.',
    version: '0.0.1', versions: [],
    sdk: 'Qiskit', category: '', tags: [],
    authorId: 'user_1', status: 'draft', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(1), updatedAt: d(1), publishedAt: null,
    executionType: 'simulator', inputParams: [], outputParams: [], codeAttached: false, notebookId: null,
    autoCheckResult: { sdk: 'pass', description: 'fail', category: 'fail', executionType: 'fail', overall: 'fail', checkedAt: d(1) },
    usageHistory: [], reviews: [], changeHistory: [],
  },
  {
    id: 'algo_35', title: 'Test Algorithm Beta', description: '베타 테스트 알고리즘.',
    version: '0.0.1', versions: [],
    sdk: 'Qiskit', category: '', tags: [],
    authorId: 'user_1', status: 'draft', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(2), updatedAt: d(2), publishedAt: null,
    executionType: 'simulator', inputParams: [], outputParams: [], codeAttached: false, notebookId: null,
    autoCheckResult: { sdk: 'pass', description: 'fail', category: 'fail', executionType: 'fail', overall: 'fail', checkedAt: d(1) },
    usageHistory: [], reviews: [], changeHistory: [],
  },
  {
    id: 'algo_36', title: 'WIP Quantum Algorithm', description: '작업 중인 알고리즘입니다.',
    version: '0.0.1', versions: [],
    sdk: 'Qiskit', category: '최적화', tags: ['WIP'],
    authorId: 'user_2', status: 'draft', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(3), updatedAt: d(3), publishedAt: null,
    executionType: 'simulator', inputParams: [{ name: 'n', type: 'number', required: true, description: '입력' }], outputParams: [], codeAttached: false, notebookId: null,
    autoCheckResult: { sdk: 'pass', description: 'warn', category: 'pass', executionType: 'fail', overall: 'warn', checkedAt: d(1) },
    usageHistory: [], reviews: [], changeHistory: [],
  },
  {
    id: 'algo_37', title: 'Experimental Circuit', description: '실험적 회로 구현.',
    version: '0.0.2', versions: [],
    sdk: 'Qiskit', category: '시뮬레이션', tags: ['실험'],
    authorId: 'user_3', status: 'draft', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(1), updatedAt: d(1), publishedAt: null,
    executionType: 'simulator', inputParams: [], outputParams: [], codeAttached: false, notebookId: null,
    autoCheckResult: { sdk: 'pass', description: 'fail', category: 'pass', executionType: 'warn', overall: 'fail', checkedAt: d(1) },
    usageHistory: [], reviews: [], changeHistory: [],
  },

  // ─── Pennylane / rejected ────────────────────────────────────────────────────
  {
    id: 'algo_38', title: 'Rejected Algorithm A', description: '반려된 알고리즘 — 카테고리 미지정.',
    version: '0.1.0', versions: [],
    sdk: 'Pennylane', category: '', tags: [],
    authorId: 'user_6', status: 'rejected', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(10), updatedAt: d(8), publishedAt: null,
    executionType: 'simulator', inputParams: [], outputParams: [], codeAttached: true, notebookId: null, codeSource: 'direct',
    algorithmCode: 'import pennylane as qml\n\ndev = qml.device("default.qubit", wires=2)\n\n@qml.qnode(dev)\ndef circuit():\n    qml.Hadamard(wires=0)\n    qml.CNOT(wires=[0, 1])\n    return qml.state()',
    autoCheckResult: { sdk: 'pass', description: 'fail', category: 'fail', executionType: 'fail', overall: 'fail', checkedAt: d(9) },
    rejectReason: '카테고리가 지정되지 않았고 실행 유형이 선택되지 않았습니다. 메타데이터를 보완 후 재요청해 주세요.',
    rejectedAt: d(8),
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '반려 처리', at: d(8) },
      { userId: 'system', action: '등록 요청 접수', at: d(10) },
    ],
  },
  {
    id: 'algo_39', title: 'Rejected Algorithm B', description: '반려된 알고리즘 — 설명 불충분.',
    version: '0.1.0', versions: [],
    sdk: 'Pennylane', category: '최적화', tags: [],
    authorId: 'user_7', status: 'rejected', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(15), updatedAt: d(13), publishedAt: null,
    executionType: 'simulator', inputParams: [], outputParams: [], codeAttached: true, notebookId: null, codeSource: 'direct',
    algorithmCode: 'import pennylane as qml\nimport numpy as np\n\ndef optimize(steps=100):\n    dev = qml.device("default.qubit", wires=1)\n    @qml.qnode(dev)\n    def circuit(params):\n        qml.RY(params[0], wires=0)\n        return qml.expval(qml.PauliZ(0))\n    params = np.array([0.1])\n    opt = qml.GradientDescentOptimizer(0.4)\n    for _ in range(steps):\n        params = opt.step(circuit, params)\n    return params',
    autoCheckResult: { sdk: 'pass', description: 'fail', category: 'pass', executionType: 'fail', overall: 'fail', checkedAt: d(14) },
    rejectReason: '설명이 구체적이지 않습니다. 알고리즘의 동작 원리와 활용 예시를 추가해 주세요.',
    rejectedAt: d(13),
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '반려 처리', at: d(13) },
      { userId: 'system', action: '등록 요청 접수', at: d(15) },
    ],
  },
  {
    id: 'algo_40', title: 'Rejected Algorithm C', description: '반려된 알고리즘 — 중복 요청.',
    version: '0.1.0', versions: [],
    sdk: 'Pennylane', category: '양자 머신러닝', tags: ['중복'],
    authorId: 'user_8', status: 'rejected', isRecommended: false,
    viewCount: 0, runCount: 0, rating: 0, ratingCount: 0,
    createdAt: d(20), updatedAt: d(18), publishedAt: null,
    executionType: 'simulator', inputParams: [], outputParams: [], codeAttached: true, notebookId: null, codeSource: 'direct',
    algorithmCode: 'import pennylane as qml\n\ndev = qml.device("default.qubit", wires=4)\n\n@qml.qnode(dev)\ndef qml_circuit(weights):\n    qml.templates.StronglyEntanglingLayers(weights, wires=range(4))\n    return qml.probs(wires=range(4))',
    autoCheckResult: { sdk: 'pass', description: 'warn', category: 'pass', executionType: 'pass', overall: 'warn', checkedAt: d(19) },
    rejectReason: '동일한 알고리즘이 이미 등록되어 있습니다. 기존 알고리즘과의 차별점을 명시하거나 버전 업데이트로 요청해 주세요.',
    rejectedAt: d(18),
    usageHistory: [], reviews: [],
    changeHistory: [
      { userId: 'system', action: '반려 처리', at: d(18) },
      { userId: 'system', action: '등록 요청 접수', at: d(20) },
    ],
  },
]

export interface MockNotebook {
  id: string
  name: string
  updatedAt: string
  codeCells: string
  workspaceId?: string
}

export const MOCK_NOTEBOOKS: MockNotebook[] = [
  {
    id: 'nb_01',
    name: 'Grover Search — 실험.ipynb',
    updatedAt: '2026-08-13',
    workspaceId: 'ws_1',
    codeCells: `# [Cell 1]\nfrom qiskit import QuantumCircuit\nfrom qiskit.circuit.library import GroverOperator\n\n# [Cell 2]\ndef build_grover(n_qubits: int, target: str) -> QuantumCircuit:\n    qc = QuantumCircuit(n_qubits)\n    qc.h(range(n_qubits))\n    oracle = QuantumCircuit(n_qubits)\n    for i, bit in enumerate(target[::-1]):\n        if bit == '0':\n            oracle.x(i)\n    oracle.h(n_qubits - 1)\n    oracle.mcx(list(range(n_qubits - 1)), n_qubits - 1)\n    oracle.h(n_qubits - 1)\n    for i, bit in enumerate(target[::-1]):\n        if bit == '0':\n            oracle.x(i)\n    qc.compose(oracle, inplace=True)\n    return qc\n\n# [Cell 3]\nqc = build_grover(4, '1010')\nprint(qc.draw())`,
  },
  {
    id: 'nb_02',
    name: 'QAOA Optimization v2.ipynb',
    updatedAt: '2026-08-12',
    workspaceId: 'ws_1',
    codeCells: `# [Cell 1]\nfrom qiskit import QuantumCircuit\nimport numpy as np\n\n# [Cell 2]\ndef qaoa_circuit(n: int, p: int, gamma: list, beta: list) -> QuantumCircuit:\n    qc = QuantumCircuit(n)\n    qc.h(range(n))\n    for layer in range(p):\n        for i in range(n - 1):\n            qc.cx(i, i + 1)\n            qc.rz(2 * gamma[layer], i + 1)\n            qc.cx(i, i + 1)\n        qc.rx(2 * beta[layer], range(n))\n    qc.measure_all()\n    return qc`,
  },
  {
    id: 'nb_03',
    name: 'QFT Circuit Draft.ipynb',
    updatedAt: '2026-08-10',
    workspaceId: 'ws_2',
    codeCells: `# [Cell 1]\nfrom qiskit import QuantumCircuit\nimport numpy as np\n\n# [Cell 2]\ndef qft(n: int) -> QuantumCircuit:\n    qc = QuantumCircuit(n)\n    for i in range(n):\n        qc.h(i)\n        for j in range(i + 1, n):\n            qc.cp(np.pi / 2 ** (j - i), j, i)\n    for i in range(n // 2):\n        qc.swap(i, n - i - 1)\n    return qc`,
  },
  {
    id: 'nb_04',
    name: 'VQE Hydrogen Molecule.ipynb',
    updatedAt: '2026-08-08',
    workspaceId: 'ws_2',
    codeCells: `# [Cell 1]\nfrom qiskit import QuantumCircuit\nfrom qiskit.circuit.library import TwoLocal\n\n# [Cell 2]\ndef vqe_ansatz(n_qubits: int, reps: int = 2) -> QuantumCircuit:\n    return TwoLocal(n_qubits, ['ry', 'rz'], 'cx', reps=reps)`,
  },
  {
    id: 'nb_amplitude_amp_01',
    name: 'Amplitude Amplification.ipynb',
    updatedAt: '2026-08-11',
    workspaceId: 'ws_3',
    codeCells: `# [Cell 1]\nfrom qiskit import QuantumCircuit\n\n# [Cell 2]\ndef amplitude_amplification(oracle_qasm: str, n_qubits: int) -> QuantumCircuit:\n    qc = QuantumCircuit(n_qubits)\n    qc.h(range(n_qubits))\n    oracle = QuantumCircuit.from_qasm_str(oracle_qasm)\n    qc.compose(oracle, inplace=True)\n    qc.h(range(n_qubits))\n    qc.x(range(n_qubits))\n    qc.h(n_qubits - 1)\n    qc.mcx(list(range(n_qubits - 1)), n_qubits - 1)\n    qc.h(n_qubits - 1)\n    qc.x(range(n_qubits))\n    qc.h(range(n_qubits))\n    qc.measure_all()\n    return qc\n\n# [Cell 3]\nresult = amplitude_amplification(oracle_qasm='...', n_qubits=4)\nprint(result.draw())`,
  },
]

export const MOCK_CATEGORIES: AlgorithmCategory[] = [
  { id: 'cat_01', name: '최적화', description: '최적화 문제를 양자 알고리즘으로 해결', createdAt: d(90) },
  { id: 'cat_02', name: '양자 머신러닝', description: '양자 회로 기반 머신러닝 알고리즘', createdAt: d(90) },
  { id: 'cat_03', name: '양자 통신', description: '양자 통신·암호·네트워크 프로토콜', createdAt: d(90) },
  { id: 'cat_04', name: '시뮬레이션', description: '양자 시스템 시뮬레이션 알고리즘', createdAt: d(90) },
  { id: 'cat_05', name: '오류 정정', description: '양자 오류 정정 코드 및 프로토콜', createdAt: d(80) },
  { id: 'cat_06', name: '화학', description: '양자화학 및 분자 시뮬레이션', createdAt: d(80) },
]

export const MOCK_TAGS: AlgorithmTag[] = [
  { id: 'tag_01', name: '기초', createdAt: d(90) },
  { id: 'tag_02', name: '고급', createdAt: d(90) },
  { id: 'tag_03', name: '교육', createdAt: d(90) },
  { id: 'tag_04', name: '하이브리드', createdAt: d(85) },
  { id: 'tag_05', name: '얽힘', createdAt: d(85) },
  { id: 'tag_06', name: '암호', createdAt: d(80) },
  { id: 'tag_07', name: '머신러닝', createdAt: d(80) },
  { id: 'tag_08', name: '최적화', createdAt: d(80) },
  { id: 'tag_09', name: '시뮬레이션', createdAt: d(75) },
  { id: 'tag_10', name: '오류정정', createdAt: d(75) },
]
