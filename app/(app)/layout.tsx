import BottomNav from '@/components/shared/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Conteúdo com padding-bottom para não ficar atrás do nav */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
