'use client'

import { usePersonaStore } from '@/store/persona.store'

// X3 Feature Toggle: 헤더 상단 페르소나 전환 바 (개발용)
export function PersonaBar() {
  const { currentPersona, currentUserId, setPersona } = usePersonaStore()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-6 items-center justify-center gap-4 bg-yellow-300 px-4 text-[11px] font-medium text-yellow-900">
      <span>🔧 개발 모드 — 페르소나 전환</span>
      <button
        onClick={() => setPersona('user', 'user_1')}
        className={`rounded px-2 py-0.5 ${currentPersona === 'user' ? 'bg-yellow-700 text-white' : 'hover:bg-yellow-400'}`}
      >
        사용자 (user_1)
      </button>
      <button
        onClick={() => setPersona('admin', 'admin_1')}
        className={`rounded px-2 py-0.5 ${currentPersona === 'admin' ? 'bg-yellow-700 text-white' : 'hover:bg-yellow-400'}`}
      >
        어드민 (admin_1)
      </button>
      <span className="opacity-60">현재: {currentPersona} / {currentUserId}</span>
    </div>
  )
}
