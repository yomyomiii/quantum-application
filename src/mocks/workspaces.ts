import type { Workspace } from '@/types/workspace'

const REF = new Date('2026-08-14T00:00:00.000Z').getTime()
const d = (daysAgo: number) => new Date(REF - daysAgo * 86400000).toISOString()

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws_1',
    name: 'Alpha 양자 연구팀',
    description: 'VQE 및 QAOA 최적화 알고리즘 연구 프로젝트',
    ownerId: 'user_1',
    members: [
      { userId: 'user_1', role: 'owner', joinedAt: d(120) },
      { userId: 'user_2', role: 'admin', joinedAt: d(115) },
      { userId: 'user_10', role: 'viewer', joinedAt: d(20) },
    ],
    credits: 15000,
    usedCredits: 6800,
    createdAt: d(120),
    lastAccessedAt: d(0),
  },
  {
    id: 'ws_2',
    name: 'QML 실험실',
    description: '양자 머신러닝 모델 개발 및 벤치마크',
    ownerId: 'user_2',
    members: [
      { userId: 'user_2', role: 'owner', joinedAt: d(110) },
      { userId: 'user_3', role: 'viewer', joinedAt: d(100) },
      { userId: 'user_8', role: 'admin', joinedAt: d(43) },
    ],
    credits: 25000,
    usedCredits: 12300,
    createdAt: d(110),
    lastAccessedAt: d(1),
  },
  {
    id: 'ws_3',
    name: '양자 통신 프로토타입',
    description: 'QKD 및 얽힘 기반 통신 프로토콜 구현',
    ownerId: 'user_1',
    members: [
      { userId: 'user_1', role: 'owner', joinedAt: d(88) },
      { userId: 'user_4', role: 'viewer', joinedAt: d(85) },
      { userId: 'user_9', role: 'viewer', joinedAt: d(30) },
    ],
    credits: 10000,
    usedCredits: 4200,
    createdAt: d(88),
    lastAccessedAt: d(2),
  },
  {
    id: 'ws_4',
    name: '시뮬레이션 허브',
    description: '대규모 양자 시뮬레이션 작업 실행 환경',
    ownerId: 'user_5',
    members: [
      { userId: 'user_5', role: 'owner', joinedAt: d(76) },
      { userId: 'user_6', role: 'admin', joinedAt: d(65) },
      { userId: 'user_10', role: 'viewer', joinedAt: d(20) },
    ],
    credits: 50000,
    usedCredits: 31500,
    createdAt: d(76),
    lastAccessedAt: d(0),
  },
  {
    id: 'ws_5',
    name: '교육 샌드박스',
    description: '신규 연구원 온보딩 및 알고리즘 학습 환경',
    ownerId: 'user_6',
    members: [
      { userId: 'user_6', role: 'owner', joinedAt: d(54) },
      { userId: 'user_7', role: 'viewer', joinedAt: d(54) },
      { userId: 'user_8', role: 'viewer', joinedAt: d(43) },
    ],
    credits: 5000,
    usedCredits: 1200,
    createdAt: d(54),
    lastAccessedAt: d(3),
  },
]
