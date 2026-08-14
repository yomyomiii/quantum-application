import { Header } from '@/components/layout/Header'
import { UserSidebar } from '@/components/layout/UserSidebar'
import { Toaster } from 'sonner'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <UserSidebar />
      <main className="ml-[240px] pt-10 min-h-screen bg-[var(--background)]">
        {children}
      </main>
      <Toaster position="bottom-right" richColors toastOptions={{ duration: 2000, classNames: { error: 'duration-[4000ms]' } }} />
    </>
  )
}
