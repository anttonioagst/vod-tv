import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { Heart } from 'lucide-react'

const mockUser = { name: 'Antonio', avatar: 'https://picsum.photos/seed/user1/32/32' }

export default function FollowingPage() {
  return (
    <AppShell isLoggedIn={true} activePath="/following" user={mockUser}>
      <div className="p-[16px]">
        <PageHeader
          icon={<Heart size={24} />}
          title="Seguindo"
          subtitle="Canais que você segue"
        />
        <EmptyState
          icon={<Heart size={48} />}
          title="Você não segue nenhum canal"
          subtitle="Canais que você segue aparecerão aqui"
        />
      </div>
    </AppShell>
  )
}
