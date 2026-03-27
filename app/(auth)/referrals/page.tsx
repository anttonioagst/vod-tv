import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Gift } from 'lucide-react'

const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }

export default function ReferralsPage() {
  return (
    <AppShell isLoggedIn={true} activePath="/referrals" user={mockUser}>
      <div className="p-[16px]">
        <PageHeader
          icon={<Gift size={24} />}
          title="Indicações"
          subtitle="Convide amigos e ganhe recompensas"
        />
        <EmptyState
          icon={<Gift size={48} />}
          title="Nenhuma indicação ainda"
          subtitle="Suas indicações aparecerão aqui"
        />
      </div>
    </AppShell>
  )
}
