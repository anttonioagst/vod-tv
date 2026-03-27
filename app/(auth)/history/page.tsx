import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { History } from 'lucide-react'

const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }

export default function HistoryPage() {
  return (
    <AppShell isLoggedIn={true} activePath="/history" user={mockUser}>
      <div className="p-[16px]">
        <PageHeader
          icon={<History size={24} />}
          title="Histórico"
          subtitle="Vídeos que você assistiu"
        />
        <EmptyState
          icon={<History size={48} />}
          title="Histórico vazio"
          subtitle="Seu histórico aparecerá aqui"
        />
      </div>
    </AppShell>
  )
}
