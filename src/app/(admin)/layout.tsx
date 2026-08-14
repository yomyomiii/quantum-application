import { Header } from '@/components/layout/Header'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Toaster } from 'sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <AdminSidebar />
      <main className="ml-[240px] pt-10 min-h-screen bg-[var(--background)]">
        {children}
      </main>
      <Toaster position="bottom-right" richColors toastOptions={{ duration: 2000, classNames: { error: 'duration-[4000ms]' } }} />
    </>
  )
}
