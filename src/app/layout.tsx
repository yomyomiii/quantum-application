import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quantum Studio Marketplace',
  description: '양자 알고리즘 마켓플레이스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
