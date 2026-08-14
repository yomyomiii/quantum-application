import type { User } from '@/types/user'

const REF = new Date('2026-08-14T00:00:00.000Z').getTime()
const d = (daysAgo: number) => new Date(REF - daysAgo * 86400000).toISOString()

export const MOCK_USERS: User[] = [
  {
    id: 'user_1', name: '김지원', email: 'jiwon.kim@example.com', role: 'user',
    workspaceIds: ['ws_1', 'ws_3'], credits: 4200,
    apiKeys: [{ id: 'key_1', name: 'Production Key', key: 'qs_••••••••••••••••1a2b', scopes: ['read', 'write', 'execute'], createdAt: d(30), lastUsedAt: d(1) }],
    notificationSettings: { email: true, slack: false, slackWebhook: '', events: ['job_complete', 'job_failed', 'algo_review'] },
    createdAt: d(120),
  },
  {
    id: 'user_2', name: '이준혁', email: 'junhyuk.lee@example.com', role: 'user',
    workspaceIds: ['ws_1', 'ws_2'], credits: 8750,
    apiKeys: [],
    notificationSettings: { email: true, slack: true, slackWebhook: 'https://hooks.slack.com/xxx', events: ['job_complete', 'job_failed'] },
    createdAt: d(110),
  },
  {
    id: 'user_3', name: '박소연', email: 'soyeon.park@example.com', role: 'user',
    workspaceIds: ['ws_2'], credits: 2100,
    apiKeys: [],
    notificationSettings: { email: false, slack: false, slackWebhook: '', events: [] },
    createdAt: d(95),
  },
  {
    id: 'user_4', name: '최민준', email: 'minjun.choi@example.com', role: 'user',
    workspaceIds: ['ws_3'], credits: 5600,
    apiKeys: [{ id: 'key_4', name: 'Dev Key', key: 'qs_••••••••••••••••4c5d', scopes: ['read', 'execute'], createdAt: d(15), lastUsedAt: d(3) }],
    notificationSettings: { email: true, slack: false, slackWebhook: '', events: ['job_complete'] },
    createdAt: d(88),
  },
  {
    id: 'user_5', name: '정하은', email: 'haeun.jung@example.com', role: 'user',
    workspaceIds: ['ws_4'], credits: 3300,
    apiKeys: [],
    notificationSettings: { email: true, slack: false, slackWebhook: '', events: ['job_failed', 'algo_review'] },
    createdAt: d(76),
  },
  {
    id: 'user_6', name: '강도현', email: 'dohyun.kang@example.com', role: 'user',
    workspaceIds: ['ws_4', 'ws_5'], credits: 7200,
    apiKeys: [],
    notificationSettings: { email: false, slack: true, slackWebhook: 'https://hooks.slack.com/yyy', events: ['job_complete', 'job_failed', 'algo_review'] },
    createdAt: d(65),
  },
  {
    id: 'user_7', name: '윤서희', email: 'seohee.yun@example.com', role: 'user',
    workspaceIds: ['ws_5'], credits: 1800,
    apiKeys: [],
    notificationSettings: { email: true, slack: false, slackWebhook: '', events: ['job_complete'] },
    createdAt: d(54),
  },
  {
    id: 'user_8', name: '임재원', email: 'jaewon.lim@example.com', role: 'user',
    workspaceIds: ['ws_2', 'ws_5'], credits: 9100,
    apiKeys: [{ id: 'key_8', name: 'Research Key', key: 'qs_••••••••••••••••8e9f', scopes: ['read', 'write', 'execute', 'admin'], createdAt: d(45), lastUsedAt: d(0) }],
    notificationSettings: { email: true, slack: true, slackWebhook: 'https://hooks.slack.com/zzz', events: ['job_complete', 'job_failed', 'algo_review'] },
    createdAt: d(43),
  },
  {
    id: 'user_9', name: '송예진', email: 'yejin.song@example.com', role: 'user',
    workspaceIds: ['ws_3'], credits: 600,
    apiKeys: [],
    notificationSettings: { email: false, slack: false, slackWebhook: '', events: [] },
    createdAt: d(30),
  },
  {
    id: 'user_10', name: '한승우', email: 'seungwoo.han@example.com', role: 'user',
    workspaceIds: ['ws_1', 'ws_4'], credits: 4500,
    apiKeys: [],
    notificationSettings: { email: true, slack: false, slackWebhook: '', events: ['job_complete', 'job_failed'] },
    createdAt: d(20),
  },
  {
    id: 'admin_1', name: '오관리자', email: 'admin@quantum-studio.kr', role: 'admin',
    workspaceIds: [], credits: 0,
    apiKeys: [{ id: 'key_admin1', name: 'Admin Key', key: 'qs_admin_••••••••••••a1b2', scopes: ['read', 'write', 'execute', 'admin'], createdAt: d(180), lastUsedAt: d(0) }],
    notificationSettings: { email: true, slack: true, slackWebhook: 'https://hooks.slack.com/admin', events: ['system_error', 'threshold_exceeded', 'job_failed'] },
    createdAt: d(180),
  },
  {
    id: 'admin_2', name: '이운영자', email: 'ops@quantum-studio.kr', role: 'admin',
    workspaceIds: [], credits: 0,
    apiKeys: [],
    notificationSettings: { email: true, slack: false, slackWebhook: '', events: ['system_error'] },
    createdAt: d(150),
  },
]
