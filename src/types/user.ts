export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  workspaceIds: string[]
  apiKeys: ApiKey[]
  notificationSettings: NotificationSettings
  credits: number
  createdAt: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  scopes: string[]
  createdAt: string
  lastUsedAt: string | null
}

export interface NotificationSettings {
  email: boolean
  slack: boolean
  slackWebhook: string
  events: string[]
}
